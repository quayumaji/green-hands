import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { SITE_PHOTOS } from "@/data/fallback";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Meet Green Hands African Restaurant and learn about our scratch-made West and East African food.",
};

const VALUES = [
  ["01", "Real ingredients", "Spices, produce, and everyday staples are the beginning of every good plate."],
  ["02", "Cooked with care", "We make food from scratch and serve it with the warmth of a family kitchen."],
  ["03", "Tradition, shared", "West and East African flavors have a place at our table, and yours."],
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero about-hero" aria-labelledby="about-page-title">
        <div className="container page-hero-inner">
          <p className="eyebrow hero-reveal">The people behind the plate</p>
          <h1 className="hero-reveal" id="about-page-title">
            Our story<span>.</span>
          </h1>
          <p className="hero-reveal">Good food connects us to home, to each other, and to the traditions that make every meal matter.</p>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>

      <section className="story-section section-pad" aria-labelledby="story-title">
        <div className="container story-grid">
          <Reveal>
            <Photo className="story-photo" src={SITE_PHOTOS.about.src} alt={SITE_PHOTOS.about.alt} label={SITE_PHOTOS.about.label} ratio="portrait" sizes="(min-width: 680px) 45vw, 100vw" />
          </Reveal>
          <Reveal className="story-copy" index={1}>
            <p className="eyebrow">A family-kitchen welcome</p>
            <h2 id="story-title">
              Food with roots.
              <br />
              <em>Made for sharing.</em>
            </h2>
            <p>
              Green Hands African Restaurant was built around a simple idea: put honest West and East African food on the table, cooked from scratch with real
              spices and a family-kitchen welcome.
            </p>
            <p>
              Our menu brings together comforting rice plates, soulful soups and swallow, and familiar favorites made our way. We honor the ingredients and cooking
              traditions that inspire us, while making every guest feel at home in Glen Burnie.
            </p>
            <p>We believe a good meal should feel generous, in flavor, in care, and in the people gathered around it. Come by, take a plate to go, and make yourself part of our table.</p>
            <Link className="button button-green" href="/menu">
              Taste the menu <span aria-hidden="true">↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="values-section section-pad" aria-labelledby="values-title">
        <div className="container">
          <Reveal as="h2" className="eyebrow" id="values-title">
            What matters to us
          </Reveal>
          <div className="values-grid">
            {VALUES.map(([n, title, copy], i) => (
              <Reveal as="article" className="value-card" key={n} index={i}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal as="section" className="home-order" aria-labelledby="about-cta-title">
        <div className="container home-order-inner">
          <div>
            <p className="eyebrow">Come hungry</p>
            <h2 id="about-cta-title">There&apos;s room at our table.</h2>
          </div>
          <Link className="button button-gold" href="/contact">
            Plan your visit <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </Reveal>
    </>
  );
}
