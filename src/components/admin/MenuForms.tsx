"use client";

import { useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Modal } from "@/components/admin/shared";
import {
  DIETARY_LABELS,
  createCategory,
  createItem,
  errorMessage,
  itemToInput,
  updateCategory,
  updateItem,
  type AdminCategory,
  type AdminMenuItem,
  type CategoryInput,
  type MenuItemInput,
  type OptionGroupInput,
} from "@/lib/adminApi";
import type { DietaryLabel } from "@/lib/types";

const centsToDollars = (c: number) => (c / 100).toFixed(2);
const dollarsToCents = (s: string) => Math.round(Number(s || 0) * 100);

/* ---------------- Category ---------------- */

export function CategoryForm({ category, nextSortOrder, onClose, onSaved }: { category?: AdminCategory; nextSortOrder: number; onClose: () => void; onSaved: () => void }) {
  const { guard } = useAdmin();
  const [input, setInput] = useState<CategoryInput>(
    category ? { name: category.name, slug: category.slug, description: category.description, sortOrder: category.sortOrder, isActive: category.isActive } : { name: "", description: "", sortOrder: nextSortOrder, isActive: true },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<CategoryInput>) => setInput((i) => ({ ...i, ...patch }));

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...input, slug: input.slug || undefined };
      if (category) await guard(updateCategory(category.id, body));
      else await guard(createCategory(body));
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={category ? `Edit ${category.name}` : "New category"} onClose={onClose}>
      <form className="form-grid" onSubmit={save}>
        <label className="form-field">
          Name
          <input value={input.name} onChange={(e) => set({ name: e.target.value })} maxLength={80} required />
        </label>
        <label className="form-field">
          Slug <span className="optional">(URL anchor, leave blank to generate)</span>
          <input value={input.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} maxLength={80} placeholder="rice" />
        </label>
        <label className="form-field">
          Description <span className="optional">(shown under the heading)</span>
          <input value={input.description} onChange={(e) => set({ description: e.target.value })} maxLength={500} />
        </label>
        <div className="field-row">
          <label className="form-field">
            Sort order
            <input type="number" value={input.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} />
          </label>
        </div>
        <label className="switch">
          <input type="checkbox" checked={input.isActive} onChange={(e) => set({ isActive: e.target.checked })} />
          <span className="track" />
          Visible on the menu
        </label>
        <p className="form-feedback is-error" role="alert">
          {error}
        </p>
        <div className="modal-foot">
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-green" disabled={saving}>
            {saving ? "Saving…" : "Save category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Item ---------------- */

const EMPTY_GROUP = (): OptionGroupInput => ({ name: "", required: true, minSelect: 1, maxSelect: 1, sortOrder: 0, options: [{ name: "", priceDeltaCents: 0, isAvailable: true, sortOrder: 0 }] });

export function ItemForm({ item, categories, defaultCategoryId, onClose, onSaved }: { item?: AdminMenuItem; categories: AdminCategory[]; defaultCategoryId?: string; onClose: () => void; onSaved: () => void }) {
  const { guard } = useAdmin();
  const [input, setInput] = useState<MenuItemInput>(
    item
      ? itemToInput(item)
      : {
          categoryId: defaultCategoryId || categories[0]?.id || "",
          name: "",
          description: "",
          priceCents: 0,
          isPriceConfirmed: true,
          imageUrl: "",
          imageAlt: "",
          dietaryLabels: [],
          isAvailable: true,
          isFeatured: false,
          sortOrder: 0,
          optionGroups: [],
        },
  );
  const [price, setPrice] = useState(centsToDollars(input.priceCents));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<MenuItemInput>) => setInput((i) => ({ ...i, ...patch }));

  const setGroup = (gi: number, patch: Partial<OptionGroupInput>) =>
    set({ optionGroups: input.optionGroups.map((g, i) => (i === gi ? { ...g, ...patch } : g)) });
  const setOption = (gi: number, oi: number, patch: Partial<OptionGroupInput["options"][number]>) =>
    setGroup(gi, { options: input.optionGroups[gi].options.map((o, i) => (i === oi ? { ...o, ...patch } : o)) });

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body: MenuItemInput = {
      ...input,
      slug: input.slug || undefined,
      priceCents: dollarsToCents(price),
      optionGroups: input.optionGroups
        .filter((g) => g.name.trim())
        .map((g, gi) => ({
          ...g,
          name: g.name.trim(),
          sortOrder: gi,
          minSelect: g.required ? Math.max(1, g.minSelect) : g.minSelect,
          options: g.options.filter((o) => o.name.trim()).map((o, oi) => ({ ...o, name: o.name.trim(), sortOrder: oi })),
        })),
    };
    if (body.optionGroups.some((g) => g.options.length === 0)) {
      setError("Every option group needs at least one option.");
      setSaving(false);
      return;
    }
    try {
      if (item) await guard(updateItem(item.id, body));
      else await guard(createItem(body));
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={item ? `Edit ${item.name}` : "New dish"} onClose={onClose}>
      <form className="form-grid" onSubmit={save}>
        <div className="field-row">
          <label className="form-field" style={{ gridColumn: "1 / -1" }}>
            Name
            <input value={input.name} onChange={(e) => set({ name: e.target.value })} maxLength={120} required />
          </label>
          <label className="form-field">
            Category
            <select value={input.categoryId} onChange={(e) => set({ categoryId: e.target.value })} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Price ($)
            <input type="number" step="0.01" min="0" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label className="form-field">
            Sort order
            <input type="number" value={input.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} />
          </label>
        </div>
        <label className="form-field">
          Description
          <textarea rows={3} value={input.description} onChange={(e) => set({ description: e.target.value })} maxLength={1000} />
        </label>
        <div className="field-row">
          <label className="form-field">
            Image URL or /images path
            <input value={input.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="/images/image-8.jpeg" />
          </label>
          <label className="form-field">
            Image alt text
            <input value={input.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} maxLength={200} />
          </label>
        </div>
        <label className="form-field">
          Slug <span className="optional">(URL, leave blank to generate)</span>
          <input value={input.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} maxLength={120} />
        </label>
        <div>
          <span className="form-field" style={{ display: "block", marginBottom: 6 }}>
            Dietary labels
          </span>
          <div className="check-row">
            {DIETARY_LABELS.map((label) => (
              <label key={label}>
                <input
                  type="checkbox"
                  checked={input.dietaryLabels.includes(label)}
                  onChange={(e) => set({ dietaryLabels: e.target.checked ? [...input.dietaryLabels, label] : input.dietaryLabels.filter((l) => l !== label) })}
                />
                {label as DietaryLabel}
              </label>
            ))}
          </div>
        </div>
        <div className="check-row">
          <label className="switch">
            <input type="checkbox" checked={input.isAvailable} onChange={(e) => set({ isAvailable: e.target.checked })} />
            <span className="track" />
            Available
          </label>
          <label className="switch">
            <input type="checkbox" checked={input.isPriceConfirmed} onChange={(e) => set({ isPriceConfirmed: e.target.checked })} />
            <span className="track" />
            Price confirmed (orderable)
          </label>
          <label className="switch">
            <input type="checkbox" checked={input.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
            <span className="track" />
            Featured
          </label>
        </div>

        <div>
          <div className="admin-page-head" style={{ marginBottom: 8 }}>
            <span className="form-field">Options (protein, swallow, sauce…)</span>
            <button type="button" className="button button-ghost mini" onClick={() => set({ optionGroups: [...input.optionGroups, EMPTY_GROUP()] })}>
              Add option group
            </button>
          </div>
          {input.optionGroups.map((g, gi) => (
            <div className="group-card" key={gi}>
              <div className="field-row">
                <label className="form-field">
                  Group name
                  <input value={g.name} onChange={(e) => setGroup(gi, { name: e.target.value })} placeholder="Protein" />
                </label>
                <label className="form-field">
                  Max choices
                  <input type="number" min={1} value={g.maxSelect} onChange={(e) => setGroup(gi, { maxSelect: Math.max(1, Number(e.target.value)) })} />
                </label>
                <label className="switch" style={{ alignSelf: "end" }}>
                  <input type="checkbox" checked={g.required} onChange={(e) => setGroup(gi, { required: e.target.checked, minSelect: e.target.checked ? Math.max(1, g.minSelect) : 0 })} />
                  <span className="track" />
                  Required
                </label>
              </div>
              {g.options.map((o, oi) => (
                <div className="option-row" key={oi}>
                  <input type="text" value={o.name} onChange={(e) => setOption(gi, oi, { name: e.target.value })} placeholder="Option name" aria-label="Option name" />
                  <input type="number" step="0.01" min="0" value={centsToDollars(o.priceDeltaCents)} onChange={(e) => setOption(gi, oi, { priceDeltaCents: dollarsToCents(e.target.value) })} aria-label="Extra charge in dollars" title="Extra charge ($)" />
                  <label className="switch" title="Available">
                    <input type="checkbox" checked={o.isAvailable} onChange={(e) => setOption(gi, oi, { isAvailable: e.target.checked })} />
                    <span className="track" />
                  </label>
                  <button type="button" className="button button-danger mini" onClick={() => setGroup(gi, { options: g.options.filter((_, i) => i !== oi) })} aria-label="Remove option">
                    ✕
                  </button>
                </div>
              ))}
              <div className="row-actions">
                <button type="button" className="button button-ghost mini" onClick={() => setGroup(gi, { options: [...g.options, { name: "", priceDeltaCents: 0, isAvailable: true, sortOrder: g.options.length }] })}>
                  Add option
                </button>
                <button type="button" className="button button-danger mini" onClick={() => set({ optionGroups: input.optionGroups.filter((_, i) => i !== gi) })}>
                  Remove group
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="form-feedback is-error" role="alert">
          {error}
        </p>
        <div className="modal-foot">
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-green" disabled={saving}>
            {saving ? "Saving…" : item ? "Save changes" : "Create dish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
