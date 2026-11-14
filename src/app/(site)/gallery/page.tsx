import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Reveal } from "@/components/Reveal";
import { getGallery, withFallback } from "@/lib/api";
import { FALLBACK_GALLERY } from "@/data/fallback";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look inside Green Hands African Restaurant: our food, our space, and the community around our table.",
};

export default async function GalleryPage() {
  const { data } = await withFallback(() => getGallery(), FALLBACK_GALLERY, "gallery");
  const gallery = data.images.length ? data : FALLBACK_GALLERY;

  return (
    <>
      <section className="page-hero gallery-hero" aria-labelledby="gallery-page-title">
        <div className="container page-hero-inner">
          <p className="eyebrow hero-reveal">A seat at our table</p>
          <h1 className="hero-reveal" id="gallery-page-title">
            A little look<span>.</span>
          </h1>
          <p className="hero-reveal">The dishes, the details, and the people that make Green Hands feel like home.</p>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>
      <section className="gallery-section section-pad" aria-labelledby="gallery-title">
        <div className="container">
          <Reveal className="gallery-heading">
            <div>
              <p className="eyebrow">From our kitchen &amp; community</p>
              <h2 id="gallery-title">Good things are growing.</h2>
            </div>
            <p>Tap any photo to see it up close.</p>
          </Reveal>
          <GalleryGrid images={gallery.images} categories={gallery.categories} />
        </div>
      </section>
    </>
  );
}
