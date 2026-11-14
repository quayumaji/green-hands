import Link from "next/link";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { getRestaurant, withFallback } from "@/lib/api";
import { FALLBACK_RESTAURANT, SITE_PHOTOS } from "@/data/fallback";

export const revalidate = 60;

export default async function HomePage() {
  const { data: restaurant, live } = await withFallback(getRestaurant, FALLBACK_RESTAURANT, "restaurant");

  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-reveal">A little taste of home</p>
            <h1 className="hero-reveal" id="home-title">
              Good food.
              <br />
              <span>Green hands.</span>
            </h1>
            <p className="hero-lede hero-reveal">West and East African favorites, cooked from scratch with real spices and a family-kitchen welcome.</p>
            <div className="hero-actions hero-reveal">
              <Link className="button button-gold" href="/menu">
                Order now <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-outline" href="/menu#menu">
                View menu
              </Link>
            </div>
            <div className="hero-note hero-reveal">
              <span className={`open-dot${live && !restaurant.isOpenNow ? " is-closed" : ""}`} />
              {live ? (restaurant.isOpenNow ? "Open now for pickup orders" : "Closed right now, order ahead for pickup") : "Made fresh in Glen Burnie, Maryland"}
            </div>
          </div>
          <div className="hero-visual hero-visual-in">
            <Photo className="hero-photo" src={SITE_PHOTOS.hero.src} alt={SITE_PHOTOS.hero.alt} label={SITE_PHOTOS.hero.label} ratio="hero" priority sizes="(min-width: 680px) 45vw, 92vw" />
            <span className="hero-sticker" aria-label="Made from scratch">
              Made with
              <br />
              <strong>love &amp; spice</strong> <span aria-hidden="true">✳</span>
            </span>
            <span className="float-shape shape-one" aria-hidden="true">✳</span>
            <span className="float-shape shape-two" aria-hidden="true">✦</span>
          </div>
        </div>
        <div className="hero-bottom container">
          <span>FAMILY RECIPES</span>
          <i />
          <span>REAL INGREDIENTS</span>
          <i />
          <span>BIG-HEARTED FLAVOR</span>
        </div>
      </section>

      <Reveal as="section" className="intro section-pad" aria-labelledby="intro-title">
        <div className="container intro-grid">
          <div>
            <p className="eyebrow">From our kitchen to your table</p>
            <h2 id="intro-title">
              Honest food,
              <br />
              <em>made with heart.</em>
            </h2>
          </div>
          <div className="intro-copy">
            <p>
              At Green Hands, every plate starts with the ingredients and traditions we love. From peppery stews to comforting rice and plantains, we make the
              food we want to share, with generous portions and a warm welcome.
            </p>
            <Link className="text-link" href="/about">
              Get to know us <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Reveal>

      <section className="favorites section-pad" aria-labelledby="favorites-title">
        <div className="container">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">Straight from the kitchen</p>
              <h2 id="favorites-title">Find your new favorite.</h2>
            </div>
            <Link className="text-link" href="/menu">
              Explore the menu <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <div className="favorite-grid">
            <Reveal index={0}>
              <Link className="favorite-card" href="/menu#rice">
              <Photo src={SITE_PHOTOS.jollof.src} alt={SITE_PHOTOS.jollof.alt} ratio="square" />
              <div className="favorite-label">
                <span>01 / RICE &amp; PROTEIN</span>
                <b>Jollof Rice</b>
                <span>
                  Smoky, savory, and made to share <span aria-hidden="true">↗</span>
                </span>
              </div>
              </Link>
            </Reveal>
            <Reveal className="favorite-offset" index={1}>
              <Link className="favorite-card" href="/menu#swallow">
              <Photo src={SITE_PHOTOS.egusi.src} alt={SITE_PHOTOS.egusi.alt} ratio="square" />
              <div className="favorite-label">
                <span>02 / SOUP &amp; SWALLOW</span>
                <b>Egusi</b>
                <span>
                  Rich melon-seed stew, full of flavor <span aria-hidden="true">↗</span>
                </span>
              </div>
              </Link>
            </Reveal>
            <Reveal index={2}>
              <Link className="favorite-card" href="/menu#fast-food">
              <Photo src={SITE_PHOTOS.megaFries.src} alt={SITE_PHOTOS.megaFries.alt} ratio="square" />
              <div className="favorite-label">
                <span>03 / FAST FOOD</span>
                <b>Mega Fries</b>
                <span>
                  Golden fries, cheese, and crispy bacon <span aria-hidden="true">↗</span>
                </span>
              </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <Reveal as="section" className="home-order" aria-labelledby="home-order-title">
        <div className="container home-order-inner">
          <div>
            <p className="eyebrow">Your table is waiting</p>
            <h2 id="home-order-title">
              Bring a little more
              <br />
              flavor to today.
            </h2>
          </div>
          <Link className="button button-gold" href="/menu">
            Order for pickup <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </Reveal>

      <section className="hours-strip" aria-labelledby="hours-title">
        <div className="container hours-strip-inner">
          <h2 className="eyebrow" id="hours-title">
            Come see us
          </h2>
          <p>
            {restaurant.hours.map((row, i) => (
              <span key={row.days} style={{ display: "contents" }}>
                {i > 0 ? <i aria-hidden="true" /> : null}
                {row.days} <b>{row.hours}</b>
              </span>
            ))}
          </p>
          <Link className="text-link" href="/contact#map-title">
            Get directions <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
