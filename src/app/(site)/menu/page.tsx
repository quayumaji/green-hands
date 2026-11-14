import type { Metadata } from "next";
import Link from "next/link";
import { MenuCard } from "@/components/menu/MenuCard";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { getMenu, withFallback } from "@/lib/api";
import { FALLBACK_MENU, SITE_PHOTOS } from "@/data/fallback";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the Green Hands African Restaurant menu and order ahead for pickup in Glen Burnie, Maryland.",
};

export default async function MenuPage() {
  const { data: menu, live } = await withFallback(getMenu, FALLBACK_MENU, "menu");
  const categories = menu.categories.filter((c) => c.items.length > 0);

  return (
    <>
      <section className="page-hero menu-hero" aria-labelledby="menu-page-title">
        <div className="container menu-hero-layout">
          <div className="page-hero-inner">
            <p className="eyebrow hero-reveal">Made fresh, just for you</p>
            <h1 className="hero-reveal" id="menu-page-title">
              The menu<span>.</span>
            </h1>
            <p className="hero-reveal">Comforting classics, generous plates, and a little something for everyone. Build your bag, pick a time, and pay online for pickup.</p>
            <a className="button button-gold hero-reveal" href="#menu">
              Browse the menu <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-visual-in">
            <Photo className="menu-hero-photo" src={SITE_PHOTOS.hero.src} alt="" ratio="hero" priority sizes="(min-width: 680px) 45vw, 88vw" />
          </div>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>

      <section className="menu-section section-pad" id="menu" aria-labelledby="menu-section-title">
        <div className="container">
          <Reveal className="menu-intro">
            <div>
              <p className="eyebrow">Cooked from scratch</p>
              <h2 id="menu-section-title">What sounds good?</h2>
            </div>
            <p>
              From comforting rice plates to soulful soups and swallow, there’s something delicious waiting for you. Choose your options, add to your bag, then pick
              a pickup time and pay securely online. Tax is calculated at checkout.
            </p>
          </Reveal>
          {!live ? (
            <p className="notice" role="status">
              <span aria-hidden="true">ⓘ</span>
              <span>
                Online ordering is paused for a moment. You can still browse the menu, or <Link href="/contact">call us</Link> to order.
              </span>
            </p>
          ) : null}
          <nav className="category-nav" aria-label="Menu categories">
            {categories.map((c) => (
              <a key={c.id} href={`#${c.slug}`}>
                {c.name}
              </a>
            ))}
          </nav>
          <div id="menu-categories">
            {categories.map((category, ci) => (
              <section className="menu-category" id={category.slug} key={category.id} aria-labelledby={`${category.slug}-title`}>
                <Reveal className="category-heading">
                  <div>
                    <span className="category-number" aria-hidden="true">
                      {String(ci + 1).padStart(2, "0")}
                    </span>
                    <h2 id={`${category.slug}-title`}>{category.name}</h2>
                  </div>
                  <p>{category.description}</p>
                </Reveal>
                <div className="menu-grid">
                  {category.items.map((item, i) => (
                    <Reveal key={item.id} index={i % 3}>
                      <MenuCard item={item} orderingEnabled={live} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="menu-note">
            Some dishes contain common allergens. Menu descriptions are not a guarantee of allergen-free preparation. <Link href="/contact">Contact us</Link> with questions before ordering.
          </p>
        </div>
      </section>
    </>
  );
}
