import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer, Toast } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getRestaurant, withFallback } from "@/lib/api";
import { FALLBACK_RESTAURANT } from "@/data/fallback";

/** Customer-facing chrome: header, cart drawer, footer. Admin pages use their own shell. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data: restaurant } = await withFallback(getRestaurant, FALLBACK_RESTAURANT, "restaurant");
  return (
    <CartProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter restaurant={restaurant} />
      <CartDrawer phone={restaurant.phone} phoneE164={restaurant.phoneE164} taxRate={restaurant.taxRate} />
      <Toast />
    </CartProvider>
  );
}
