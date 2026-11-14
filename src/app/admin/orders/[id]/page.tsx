"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/shared";
import { ALLOWED_TRANSITIONS, STATUS_LABEL, TRANSITION_LABEL, errorMessage, formatDateTime, getAdminOrder, setOrderStatus, type AdminOrder } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { guard } = useAdmin();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => guard(getAdminOrder(id)).then(setOrder).catch((err) => setError(errorMessage(err))), [guard, id]);
  useEffect(() => {
    void load();
  }, [load]);

  async function transition(status: OrderStatus) {
    if (!order) return;
    if (status === "cancelled" && !window.confirm(`Cancel order ${order.orderNumber}?${order.payment.status === "paid" ? " The customer has paid; refund it in Stripe afterwards." : ""}`)) return;
    setBusy(true);
    try {
      setOrder(await guard(setOrderStatus(order.id, status)));
      setError("");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? err.message : errorMessage(err));
      void load();
    } finally {
      setBusy(false);
    }
  }

  if (error && !order) {
    return (
      <p className="notice notice-error" role="alert">
        {error} <Link href="/admin/orders">Back to orders</Link>
      </p>
    );
  }
  if (!order) return <span className="spinner" aria-label="Loading order" />;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <p style={{ margin: 0 }}>
            <Link href="/admin/orders" className="text-link">
              ← All orders
            </Link>
          </p>
          <h1>
            {order.orderNumber} <StatusBadge status={order.status} />
          </h1>
          <p>
            Pickup <b>{order.pickupTimeLabel}</b> on {order.pickupDate} · placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="admin-actions">
          {ALLOWED_TRANSITIONS[order.status].map((next) => (
            <button key={next} type="button" className={`button ${next === "cancelled" ? "button-danger" : next === "ready" ? "button-green" : "button-gold"}`} disabled={busy} onClick={() => transition(next)}>
              {TRANSITION_LABEL[next] ?? STATUS_LABEL[next]}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="detail-grid">
        <div>
          <section className="admin-panel">
            <h2>Items</h2>
            <ul className="order-items">
              {order.items.map((it, i) => (
                <li key={i}>
                  <span>
                    <span className="qty">{it.quantity}×</span>
                    {it.name} <small style={{ display: "inline" }}>@ {money(it.unitPriceCents)}</small>
                    {it.selectedOptions.length ? <small>{it.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}${o.priceDeltaCents ? ` (+${money(o.priceDeltaCents)})` : ""}`).join(" · ")}</small> : null}
                    {it.notes ? <small>Note: {it.notes}</small> : null}
                  </span>
                  <span>{money(it.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
            {order.notes ? <p className="order-note" style={{ marginTop: 10 }}>Customer note: {order.notes}</p> : null}
            <div className="summary-total" style={{ marginTop: 12 }}>
              <div>
                <span>Subtotal</span>
                <span>{money(order.subtotalCents)}</span>
              </div>
              <div>
                <span>Tax</span>
                <span>{money(order.taxCents)}</span>
              </div>
              <div className="grand">
                <span>Total</span>
                <span>{money(order.totalCents)}</span>
              </div>
            </div>
          </section>
          <section className="admin-panel">
            <h2>History</h2>
            <ul className="history">
              {order.statusHistory.map((h, i) => (
                <li key={i}>
                  <time dateTime={h.at}>{formatDateTime(h.at)}</time>
                  <StatusBadge status={h.status} />
                  <span style={{ color: "var(--muted)" }}>by {h.by}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div>
          <section className="admin-panel">
            <h2>Customer</h2>
            <dl className="kv">
              <dt>Name</dt>
              <dd>{order.customer.name}</dd>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
              </dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${order.customer.email}?subject=${encodeURIComponent(`Your Green Hands order ${order.orderNumber}`)}`}>{order.customer.email}</a>
              </dd>
            </dl>
          </section>
          <section className="admin-panel">
            <h2>Payment</h2>
            <dl className="kv">
              <dt>Provider</dt>
              <dd>{order.payment.provider}</dd>
              <dt>Status</dt>
              <dd>{order.payment.status}</dd>
              <dt>Paid at</dt>
              <dd>{formatDateTime(order.payment.paidAt)}</dd>
              <dt>Session</dt>
              <dd style={{ wordBreak: "break-all" }}>{order.payment.checkoutSessionId ?? "–"}</dd>
              <dt>Intent</dt>
              <dd style={{ wordBreak: "break-all" }}>{order.payment.paymentIntentId ?? "–"}</dd>
              <dt>Receipt</dt>
              <dd>
                {order.payment.receiptUrl ? (
                  <a href={order.payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                    Open ↗
                  </a>
                ) : (
                  "–"
                )}
              </dd>
            </dl>
            <p className="checkout-caption" style={{ marginTop: 10 }}>
              Refunds are issued from the Stripe dashboard; the webhook marks the order refunded.
            </p>
          </section>
          <section className="admin-panel">
            <h2>Notifications</h2>
            <dl className="kv">
              <dt>Customer email</dt>
              <dd>{formatDateTime(order.notifications.customerConfirmationSentAt)}</dd>
              <dt>Restaurant email</dt>
              <dd>{formatDateTime(order.notifications.restaurantNotifiedAt)}</dd>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
