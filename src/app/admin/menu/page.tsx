"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { CategoryForm, ItemForm } from "@/components/admin/MenuForms";
import { Empty } from "@/components/admin/shared";
import { deleteCategory, deleteItem, errorMessage, listCategories, listItems, setItemAvailability, type AdminCategory, type AdminMenuItem } from "@/lib/adminApi";
import { imageSrc } from "@/lib/api";
import { money } from "@/lib/format";

export default function MenuAdminPage() {
  const { guard } = useAdmin();
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [items, setItems] = useState<AdminMenuItem[] | null>(null);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState<{ item?: AdminMenuItem; categoryId?: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ category?: AdminCategory } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([guard(listCategories()), guard(listItems())]);
      setCategories(c);
      setItems(i);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [guard]);
  useEffect(() => {
    void load();
  }, [load]);

  const byCategory = useMemo(() => {
    const map = new Map<string, AdminMenuItem[]>();
    for (const it of items ?? []) {
      if (!map.has(it.categoryId)) map.set(it.categoryId, []);
      map.get(it.categoryId)!.push(it);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    return map;
  }, [items]);

  async function toggle(item: AdminMenuItem) {
    setBusyId(item.id);
    try {
      const updated = await guard(setItemAvailability(item.id, !item.isAvailable));
      setItems((cur) => (cur ?? []).map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }
  async function removeItem(item: AdminMenuItem) {
    if (!window.confirm(`Delete "${item.name}" from the menu? Past orders keep their copy. This cannot be undone.`)) return;
    try {
      await guard(deleteItem(item.id));
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  async function removeCategory(c: AdminCategory) {
    if (!window.confirm(`Delete the "${c.name}" category?`)) return;
    try {
      await guard(deleteCategory(c.id));
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Menu</h1>
          <p>Flip the switch to mark a dish sold out. Changes reach the website within a minute.</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="button button-ghost" onClick={() => setEditingCategory({})}>
            New category
          </button>
          <button type="button" className="button button-gold" onClick={() => setEditingItem({ categoryId: categories?.[0]?.id })} disabled={!categories?.length}>
            New dish
          </button>
        </div>
      </div>
      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}
      {!categories || !items ? (
        <span className="spinner" aria-label="Loading menu" />
      ) : categories.length === 0 ? (
        <Empty title="No categories yet.">Create a category, then add dishes to it.</Empty>
      ) : (
        categories.map((c) => {
          const list = byCategory.get(c.id) ?? [];
          return (
            <section key={c.id} className="admin-panel" aria-labelledby={`cat-${c.id}`}>
              <div className="admin-page-head" style={{ marginBottom: 6 }}>
                <div>
                  <h2 id={`cat-${c.id}`} style={{ marginBottom: 2 }}>
                    {c.name}{" "}
                    {!c.isActive ? (
                      <span className="status-badge s-cancelled" style={{ verticalAlign: "middle" }}>
                        hidden
                      </span>
                    ) : null}
                  </h2>
                  <p>
                    /{c.slug} · {list.length} dish{list.length === 1 ? "" : "es"}
                    {c.description ? ` · ${c.description}` : ""}
                  </p>
                </div>
                <div className="row-actions">
                  <button type="button" className="button button-ghost mini" onClick={() => setEditingItem({ categoryId: c.id })}>
                    Add dish
                  </button>
                  <button type="button" className="button button-ghost mini" onClick={() => setEditingCategory({ category: c })}>
                    Edit
                  </button>
                  {list.length === 0 ? (
                    <button type="button" className="button button-danger mini" onClick={() => removeCategory(c)}>
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
              {list.length === 0 ? (
                <p className="checkout-caption">No dishes in this category yet.</p>
              ) : (
                list.map((item) => (
                  <div key={item.id} className={`item-row${item.isAvailable ? "" : " is-off"}`}>
                    <div className="item-thumb">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageSrc(item.imageUrl)} alt="" loading="lazy" />
                      ) : null}
                    </div>
                    <div>
                      <b>{item.name}</b>{" "}
                      <span style={{ color: "var(--gold-text)", fontWeight: 700 }}>{item.isPriceConfirmed ? money(item.priceCents) : "price TBC"}</span>
                      {item.isFeatured ? <span className="status-badge s-paid" style={{ marginLeft: 6, padding: "2px 8px" }}>featured</span> : null}
                      <small>
                        {item.optionGroups.length ? `${item.optionGroups.map((g) => `${g.name} (${g.options.length})`).join(", ")} · ` : ""}
                        {item.dietaryLabels.join(", ") || "no labels"}
                      </small>
                    </div>
                    <div className="row-actions">
                      <label className="switch">
                        <input type="checkbox" checked={item.isAvailable} disabled={busyId === item.id} onChange={() => toggle(item)} aria-label={`${item.name} available`} />
                        <span className="track" />
                        <span className="sr-only">{item.isAvailable ? "Available" : "Sold out"}</span>
                      </label>
                      <button type="button" className="button button-ghost mini" onClick={() => setEditingItem({ item })}>
                        Edit
                      </button>
                      <button type="button" className="button button-danger mini" onClick={() => removeItem(item)} aria-label={`Delete ${item.name}`}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          );
        })
      )}

      {editingItem && categories ? (
        <ItemForm
          item={editingItem.item}
          categories={categories}
          defaultCategoryId={editingItem.categoryId}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            void load();
          }}
        />
      ) : null}
      {editingCategory ? (
        <CategoryForm
          category={editingCategory.category}
          nextSortOrder={categories?.length ?? 0}
          onClose={() => setEditingCategory(null)}
          onSaved={() => {
            setEditingCategory(null);
            void load();
          }}
        />
      ) : null}
    </>
  );
}
