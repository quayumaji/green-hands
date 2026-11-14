import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderStatus } from "@/components/order/OrderStatus";
import { getRestaurant, withFallback } from "@/lib/api";
import { FALLBACK_RESTAURANT } from "@/data/fallback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: r } = await withFallback(getRestaurant, FALLBACK_RESTAURANT, "restaurant");
  return (
    <>
      <section className="page-hero page-hero-compact" aria-labelledby="order-title">
        <div className="container page-hero-inner">
          <p className="eyebrow hero-reveal">Thank you</p>
          <h1 className="hero-reveal" id="order-title">
            Your order<span>.</span>
          </h1>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>
      <section className="section-pad" style={{ paddingTop: 40 }}>
        <div className="container">
          <Suspense fallback={<span className="spinner" aria-label="Loading your order" />}>
            <OrderStatus orderId={id} address={r.address.formatted} phone={r.phone} phoneE164={r.phoneE164} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
