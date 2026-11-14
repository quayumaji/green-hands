"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

const LABELS: Record<GalleryCategory, string> = { interior: "Our space", dishes: "Dishes", events: "Events", customers: "Community" };

export function GalleryGrid({ images, categories }: { images: GalleryImage[]; categories: readonly GalleryCategory[] }) {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [open, setOpen] = useState<GalleryImage | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const present = categories.filter((c) => images.some((i) => i.category === c));
  const visible = filter === "all" ? images : images.filter((i) => i.category === filter);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {present.length > 1 ? (
        <div className="filter-chips" role="group" aria-label="Filter photos">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All
          </button>
          {present.map((c) => (
            <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {LABELS[c]}
            </button>
          ))}
        </div>
      ) : null}
      {visible.length === 0 ? (
        <p className="notice">Photos are on their way. Check back soon.</p>
      ) : (
        <ul className="gallery-grid" aria-label="Green Hands photo gallery">
          {visible.map((img, i) => (
            <Reveal as="li" key={img.id} index={i % 4}>
              <button className="gallery-tile" type="button" onClick={() => setOpen(img)} aria-label={`Open photo: ${img.caption || img.alt}`}>
                <Photo src={img.url} alt={img.alt} ratio={i === 0 ? "landscape" : "dish"} sizes="(min-width: 680px) 33vw, 50vw" />
                <span className="gallery-tile-label">
                  {img.caption || img.alt}
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      )}
      <div
        className={`lightbox${open ? " lightbox-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
      >
        <button ref={closeRef} className="icon-button lightbox-close" type="button" aria-label="Close photo" onClick={() => setOpen(null)}>
          ×
        </button>
        <div className="lightbox-content">{open ? <Photo className="lightbox-photo" src={open.url} alt={open.alt} label={open.caption || undefined} ratio="landscape" sizes="90vw" /> : null}</div>
      </div>
    </>
  );
}
