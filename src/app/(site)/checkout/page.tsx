import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getRestaurant, withFallback } from "@/lib/api";
import { FALLBACK_RESTAURANT } from "@/data/fallback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const { data: restaurant } = await withFallback(getRestaurant, FALLBACK_RESTAURANT, "restaurant");
  return (
    <>
      <section className="page-hero page-hero-compact" aria-labelledby="checkout-title">
        <div className="container page-hero-inner">
          <p className="eyebrow hero-reveal">Almost there</p>
          <h1 className="hero-reveal" id="checkout-title">
            Checkout<span>.</span>
          </h1>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>
      <section className="section-pad" style={{ paddingTop: 40 }}>
        <div className="container">
          <Suspense fallback={<span className="spinner" aria-label="Loading checkout" />}>
            <CheckoutClient restaurant={restaurant} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
