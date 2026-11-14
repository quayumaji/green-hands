"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearPendingOrder, readPendingOrder, useCart } from "@/components/cart/CartProvider";
import { ApiError, getOrder, recreateCheckout } from "@/lib/api";
import { dateLabel, money } from "@/lib/format";
import type { Order, OrderStatus as Status } from "@/lib/types";

const COPY: Record<Status, { title: string; body: string }> = {
  pending_payment: { title: "Waiting for payment confirmation…", body: "This usually takes a few seconds. Keep this page open." },
  paid: { title: "Order received!", body: "Thank you. The kitchen has your order and we'll start cooking shortly." },
  preparing: { title: "Your food is being prepared.", body: "We'll have it ready for your pickup time." },
  ready: { title: "Ready for pickup!", body: "Come on in, your order is waiting at the counter." },
  completed: { title: "Picked up. Thank you!", body: "We hope you enjoyed it. See you next time." },
  cancelled: { title: "This order was cancelled.", body: "Nothing further is needed. If you were charged, you'll be refunded." },
  payment_failed: { title: "Payment didn't go through.", body: "No worries, you can try again below." },
};

const POLL_MS = 2000;
const POLL_LIMIT_MS = 60_000;

export function OrderStatus({ orderId, address, phone, phoneE164 }: { orderId: string; address: string; phone: string; phoneE164: string }) {
  const search = useSearchParams();
  const { clear } = useCart();
  const [token, setToken] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const clearedCart = useRef(false);

  useEffect(() => {
    const fromUrl = search.get("token");
    const pending = readPendingOrder();
    setToken(fromUrl || (pending?.id === orderId ? pending.token : null) || "");
  }, [search, orderId]);

  useEffect(() => {
    if (token === null) return;
    if (!token) {
      setError("This link is missing its access token. Use the link from your confirmation email.");
      return;
    }
    let cancelled = false;
    let timer: number | undefined;
    const started = Date.now();

    async function tick() {
      try {
        const { order: o } = await getOrder(orderId, token as string);
        if (cancelled) return;
        setOrder(o);
        setError("");
        const stillPending = o.status === "pending_payment";
        if (!stillPending && !clearedCart.current && (o.status === "paid" || o.status === "preparing" || o.status === "ready" || o.status === "completed")) {
          clearedCart.current = true;
          clear();
          clearPendingOrder();
        }
        if (stillPending) {
          if (Date.now() - started < POLL_LIMIT_MS) timer = window.setTimeout(tick, POLL_MS);
          else setSlow(true);
        } else if (o.status === "paid" || o.status === "preparing") {
          // Keep the status fresh while the customer waits (slow poll).
          timer = window.setTimeout(tick, 30_000);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) setError("This order link isn't valid. Check the link in your confirmation email.");
        else if (err instanceof ApiError && err.status === 404) setError("We couldn't find that order.");
        else setError("We're having trouble reaching the restaurant. We'll keep trying.");
        if (!(err instanceof ApiError) || err.status >= 500) timer = window.setTimeout(tick, 5000);
      }
    }
    void tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [token, orderId, clear]);

  async function retry() {
    if (!token) return;
    setRetrying(true);
    try {
      const { checkout } = await recreateCheckout(orderId, token);
      window.location.assign(checkout.url);
    } catch (err) {
      setRetrying(false);
      setError(err instanceof ApiError ? err.friendlyMessage : "We couldn't restart the payment.");
    }
  }

  if (error && !order) {
    return (
      <div className="status-card">
        <h2>Hmm.</h2>
        <p>{error}</p>
        <p>
          Need help? Call us at <a href={`tel:${phoneE164}`}>{phone}</a>.
        </p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="status-card" aria-busy="true">
        <span className="spinner" aria-label="Loading your order" />
      </div>
    );
  }

  const copy = COPY[order.status];
  const pending = order.status === "pending_payment";

  return (
    <div className="checkout-layout">
      <div className="status-card">
        <span className="status-badge">
          {pending ? <span className="pulse" aria-hidden="true" /> : null}
          {order.status.replace("_", " ")}
        </span>
        <h2>{copy.title}</h2>
        <p>{slow && pending ? "This is taking longer than usual. Check your email for a confirmation, or call us." : copy.body}</p>
        {order.status === "ready" ? <p>Pickup at {address}.</p> : null}
        {order.status === "payment_failed" || (pending && slow) ? (
          <button className="button button-gold" type="button" onClick={retry} disabled={retrying}>
            {retrying ? "Opening payment…" : "Try paying again"}
          </button>
        ) : null}
        <div className="pickup-code" aria-label={`Pickup code ${order.orderNumber}`}>
          <span>Your pickup code</span>
          <b>{order.orderNumber}</b>
          <small>Give this code at the counter when you collect your order.</small>
        </div>
        <div className="order-meta">
          <span>
            Pickup <b>{order.pickupTimeLabel}</b> on <b>{dateLabel(order.pickupDate)}</b>
          </span>
          <span>
            Confirmation sent to <b>{order.customer.email}</b>
          </span>
          {order.receiptUrl ? (
            <a className="text-link" href={order.receiptUrl} target="_blank" rel="noopener noreferrer">
              View receipt ↗
            </a>
          ) : null}
        </div>
        {error ? <p className="form-feedback is-error">{error}</p> : null}
        <p className="checkout-caption">
          Questions? Call <a href={`tel:${phoneE164}`}>{phone}</a>.
        </p>
      </div>
      <aside className="checkout-panel" aria-labelledby="order-items-title">
        <h2 id="order-items-title">What you ordered</h2>
        {order.items.map((it, i) => (
          <div className="summary-line" key={`${it.menuItemId}-${i}`}>
            <div>
              {it.quantity} × {it.name}
              {it.selectedOptions.length ? <small>{it.selectedOptions.map((o) => o.optionName).join(", ")}</small> : null}
              {it.notes ? <small>Note: {it.notes}</small> : null}
            </div>
            <strong>{money(it.lineTotalCents)}</strong>
          </div>
        ))}
        <div className="summary-total">
          <div>
            <span>Subtotal</span>
            <span>{money(order.subtotalCents)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>{money(order.taxCents)}</span>
          </div>
          <div className="grand">
            <span>{order.paymentStatus === "paid" ? "Paid" : "Total"}</span>
            <span>{money(order.totalCents)}</span>
          </div>
        </div>
        {order.notes ? <p className="checkout-caption">Your note: {order.notes}</p> : null}
        <Link className="text-link" href="/menu">
          Order something else →
        </Link>
      </aside>
    </div>
  );
}
