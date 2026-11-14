"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Empty, Modal } from "@/components/admin/shared";
import { GALLERY_CATEGORIES, createGalleryImage, deleteGalleryImage, errorMessage, listGallery, updateGalleryImage, type AdminGalleryImage, type GalleryImageInput } from "@/lib/adminApi";
import { imageSrc } from "@/lib/api";
import type { GalleryCategory } from "@/lib/types";

const EMPTY: GalleryImageInput = { url: "", alt: "", caption: "", category: "dishes", sortOrder: 0, isActive: true };

export default function GalleryAdminPage() {
  const { guard } = useAdmin();
  const [images, setImages] = useState<AdminGalleryImage[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id?: string; input: GalleryImageInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(() => guard(listGallery()).then(setImages).catch((err) => setError(errorMessage(err))), [guard]);
  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError("");
    try {
      if (editing.id) await guard(updateGalleryImage(editing.id, editing.input));
      else await guard(createGalleryImage(editing.input));
      setEditing(null);
      void load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  async function toggle(img: AdminGalleryImage) {
    try {
      const updated = await guard(updateGalleryImage(img.id, { isActive: !img.isActive }));
      setImages((cur) => (cur ?? []).map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  async function remove(img: AdminGalleryImage) {
    if (!window.confirm(`Remove "${img.caption || img.alt}" from the gallery?`)) return;
    try {
      await guard(deleteGalleryImage(img.id));
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const set = (patch: Partial<GalleryImageInput>) => setEditing((e) => (e ? { ...e, input: { ...e.input, ...patch } } : e));

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Gallery</h1>
          <p>Photos shown on the public gallery page. Paste an image URL or a path under /images.</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="button button-gold" onClick={() => setEditing({ input: { ...EMPTY, sortOrder: images?.length ?? 0 } })}>
            Add photo
          </button>
        </div>
      </div>
      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}
      {!images ? (
        <span className="spinner" aria-label="Loading gallery" />
      ) : images.length === 0 ? (
        <Empty title="No photos yet." />
      ) : (
        <div className="gallery-admin-grid">
          {images.map((img) => (
            <article key={img.id} className={`gallery-admin-card${img.isActive ? "" : " is-off"}`}>
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(img.url)} alt={img.alt} loading="lazy" />
              </div>
              <b>{img.caption || img.alt}</b>
              <span style={{ color: "var(--muted)" }}>
                {img.category} · #{img.sortOrder}
              </span>
              <label className="switch">
                <input type="checkbox" checked={img.isActive} onChange={() => toggle(img)} />
                <span className="track" />
                {img.isActive ? "Visible" : "Hidden"}
              </label>
              <div className="row-actions">
                <button type="button" className="button button-ghost mini" onClick={() => setEditing({ id: img.id, input: { url: img.url, alt: img.alt, caption: img.caption, category: img.category, sortOrder: img.sortOrder, isActive: img.isActive } })}>
                  Edit
                </button>
                <button type="button" className="button button-danger mini" onClick={() => remove(img)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing ? (
        <Modal title={editing.id ? "Edit photo" : "Add photo"} onClose={() => setEditing(null)}>
          <form className="form-grid" onSubmit={save}>
            <label className="form-field">
              Image URL or /images path
              <input value={editing.input.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://… or /images/photo.jpg" required />
            </label>
            {editing.input.url ? (
              <div className="thumb" style={{ maxWidth: 240, aspectRatio: "4/3", overflow: "hidden", borderRadius: 8, background: "var(--cream)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(editing.input.url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : null}
            <label className="form-field">
              Alt text (describe the photo for screen readers)
              <input value={editing.input.alt} onChange={(e) => set({ alt: e.target.value })} maxLength={200} required />
            </label>
            <label className="form-field">
              Caption <span className="optional">(optional)</span>
              <input value={editing.input.caption} onChange={(e) => set({ caption: e.target.value })} maxLength={300} />
            </label>
            <div className="field-row">
              <label className="form-field">
                Category
                <select value={editing.input.category} onChange={(e) => set({ category: e.target.value as GalleryCategory })}>
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Sort order
                <input type="number" value={editing.input.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} />
              </label>
            </div>
            <label className="switch">
              <input type="checkbox" checked={editing.input.isActive} onChange={(e) => set({ isActive: e.target.checked })} />
              <span className="track" />
              Visible on the site
            </label>
            <p className="form-feedback is-error" role="alert">
              {formError}
            </p>
            <div className="modal-foot">
              <button type="button" className="button button-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="button button-green" disabled={saving}>
                {saving ? "Saving…" : "Save photo"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
