import Link from "next/link";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer, Toast } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getRestaurant, withFallback } from "@/lib/api";
import { FALLBACK_RESTAURANT } from "@/data/fallback";

export default async function NotFound() {
  const { data: restaurant } = await withFallback(getRestaurant, FALLBACK_RESTAURANT, "restaurant");
  return (
    <CartProvider>
      <SiteHeader />
      <main id="main">
        <section className="page-hero" aria-labelledby="nf-title">
          <div className="container page-hero-inner">
            <p className="eyebrow hero-reveal">Page not found</p>
            <h1 className="hero-reveal" id="nf-title">
              Nothing here<span>.</span>
            </h1>
            <p className="hero-reveal">That page may have moved. The menu, however, is right where you left it.</p>
            <Link className="button button-gold hero-reveal" href="/menu">
              Go to the menu
            </Link>
          </div>
          <span className="page-hero-mark" aria-hidden="true">✳</span>
        </section>
      </main>
      <SiteFooter restaurant={restaurant} />
      <CartDrawer phone={restaurant.phone} phoneE164={restaurant.phoneE164} taxRate={restaurant.taxRate} />
      <Toast />
    </CartProvider>
  );
}
