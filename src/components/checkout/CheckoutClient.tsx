"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { clearPendingOrder, readPendingOrder, savePendingOrder, useCart } from "@/components/cart/CartProvider";
import { ApiError, createOrder, getPickupSlots, recreateCheckout } from "@/lib/api";
import { dateLabel, money } from "@/lib/format";
import type { PickupDate, PickupSlot, Restaurant } from "@/lib/types";

interface Props {
  restaurant: Restaurant;
}

export function CheckoutClient({ restaurant }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const { lines, subtotalCents, hydrated, clear, notify } = useCart();

  const cancelled = search.get("checkout") === "cancelled";
  const cancelledOrderId = search.get("order");

  const [dates, setDates] = useState<PickupDate[]>([]);
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const taxCents = Math.round(subtotalCents * restaurant.taxRate);
  const totalCents = subtotalCents + taxCents;

  const loadSlots = useCallback(async (forDate?: string) => {
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const res = await getPickupSlots(forDate);
      setDates(res.dates);
      setDate(res.date);
      setSlots(res.slots);
      setPickupTime((current) => (res.slots.some((s) => s.time === current) ? current : ""));
      // Today may already be closed or out of slots: jump to the next open day automatically.
      if (!forDate && res.slots.length === 0) {
        const next = res.dates.find((d) => d.isOpen && d.date > res.date);
        if (next) {
          const nextRes = await getPickupSlots(next.date);
          setDate(nextRes.date);
          setSlots(nextRes.slots);
        }
      }
    } catch (err) {
      setSlotsError(err instanceof ApiError ? err.friendlyMessage : "We couldn't load pickup times. Please refresh.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const pendingOrder = useMemo(() => (typeof window !== "undefined" ? readPendingOrder() : null), []);
  const canRetry = cancelled && cancelledOrderId && pendingOrder?.id === cancelledOrderId;

  async function retryPayment() {
    if (!pendingOrder) return;
    setRetrying(true);
    setError("");
    try {
      const { checkout } = await recreateCheckout(pendingOrder.id, pendingOrder.token);
      window.location.assign(checkout.url);
    } catch (err) {
      setRetrying(false);
      if (err instanceof ApiError && err.status === 409) {
        clearPendingOrder();
        setError("That order can no longer be paid. Please place it again below.");
      } else {
        setError(err instanceof ApiError ? err.friendlyMessage : "We couldn't restart the payment. Please place the order again.");
      }
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lines.length) return;
    if (!pickupTime) {
      setError("Choose a pickup time.");
      return;
    }
    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await createOrder({
        customer: { name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(), phone: String(data.get("phone") || "").trim() },
        pickupTime,
        notes: String(data.get("notes") || "").trim(),
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          selectedOptions: l.selectedOptions.map((o) => ({ groupId: o.groupId, optionId: o.optionId })),
          notes: l.notes,
        })),
      });
      savePendingOrder(res.order.id, res.accessToken);
      window.location.assign(res.checkout.url);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        const perField: Record<string, string> = {};
        for (const d of err.details) {
          if (d.path?.startsWith("customer.")) perField[d.path.slice("customer.".length)] = d.message;
        }
        setFieldErrors(perField);
        if (err.details.some((d) => d.path === "pickupTime")) {
          setError("That pickup time is no longer available. Please choose another.");
          void loadSlots(date);
        } else if (err.status === 422) {
          setError(`Some items in your bag can't be ordered right now: ${err.details.map((d) => d.message).join(" ")} Please update your bag.`);
        } else if (!Object.keys(perField).length) {
          setError(err.friendlyMessage);
        } else {
          setError("Please check the highlighted fields.");
        }
      } else {
        setError("We couldn't reach the restaurant's ordering system. Please try again or call us.");
      }
    }
  }

  if (!hydrated) {
    return (
      <div className="checkout-panel" aria-busy="true">
        <span className="spinner" aria-label="Loading your bag" />
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <div className="checkout-panel">
        {cancelled ? (
          <div className="notice" role="status">
            <span aria-hidden="true">ⓘ</span>
            <span>
              Payment was cancelled, nothing was charged. Your bag is saved.{" "}
              {canRetry ? (
                <button type="button" className="text-link" onClick={retryPayment} disabled={retrying} style={{ background: "none", border: 0, padding: 0 }}>
                  {retrying ? "Opening payment…" : "Try paying again →"}
                </button>
              ) : (
                "Place the order again below when you're ready."
              )}
            </span>
          </div>
        ) : null}

        {lines.length === 0 ? (
          <div className="cart-empty">
            <span aria-hidden="true">✳</span>
            <h3>Your bag is empty.</h3>
            <p>Add something delicious from the menu to check out.</p>
            <Link className="button button-green" href="/menu">
              Browse the menu
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="form-grid" aria-describedby="checkout-error">
            <h2>Pickup time</h2>
            {slotsError ? (
              <p className="notice notice-error" role="alert">
                {slotsError}{" "}
                <button type="button" className="text-link" onClick={() => loadSlots()} style={{ background: "none", border: 0, padding: 0 }}>
                  Retry
                </button>
              </p>
            ) : null}
            <div className="date-grid" role="group" aria-label="Pickup date">
              {dates.map((d) => (
                <button key={d.date} type="button" aria-pressed={d.date === date} disabled={!d.isOpen} onClick={() => loadSlots(d.date)} aria-label={`${dateLabel(d.date)}, ${d.isOpen ? `open ${d.open} to ${d.close}` : "closed"}`}>
                  {dateLabel(d.date)}
                  <small>{d.isOpen ? `${d.open} – ${d.close}` : "Closed"}</small>
                </button>
              ))}
            </div>
            {slotsLoading ? (
              <span className="spinner" aria-label="Loading pickup times" />
            ) : slots.length === 0 ? (
              <p className="form-feedback">No more pickup times {date ? `on ${dateLabel(date)}` : "today"}. Please pick another day.</p>
            ) : (
              <div className="slot-grid" role="group" aria-label="Pickup time">
                {slots.map((s) => (
                  <button key={s.time} type="button" aria-pressed={s.time === pickupTime} onClick={() => setPickupTime(s.time)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <p className="checkout-caption">
              Orders need about {restaurant.pickup.leadMinutes} minutes. Pickup at {restaurant.address.formatted}.
            </p>

            <h2>Your details</h2>
            <label className="form-field">
              Your name
              <input name="name" autoComplete="name" maxLength={100} required aria-invalid={Boolean(fieldErrors.name)} />
              {fieldErrors.name ? <span className="form-feedback is-error">{fieldErrors.name}</span> : null}
            </label>
            <label className="form-field">
              Email (for your receipt)
              <input name="email" type="email" autoComplete="email" maxLength={200} required aria-invalid={Boolean(fieldErrors.email)} />
              {fieldErrors.email ? <span className="form-feedback is-error">{fieldErrors.email}</span> : null}
            </label>
            <label className="form-field">
              Phone (in case we have a question)
              <input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required aria-invalid={Boolean(fieldErrors.phone)} />
              {fieldErrors.phone ? <span className="form-feedback is-error">{fieldErrors.phone}</span> : null}
            </label>
            <label className="form-field">
              Order note <span className="optional">(optional)</span>
              <textarea name="notes" rows={2} maxLength={500} placeholder="Anything our kitchen should know?" />
            </label>

            <p id="checkout-error" className="form-feedback is-error" role="alert" aria-live="assertive">
              {error}
            </p>
            <button className="button button-gold checkout-button" type="submit" disabled={submitting || slotsLoading || !pickupTime}>
              {submitting ? "Starting secure payment…" : `Pay ${money(totalCents)} securely`} <span aria-hidden="true">→</span>
            </button>
            <p className="checkout-caption">
              You&apos;ll be taken to our secure payment page{restaurant.paymentsProvider === "stripe" ? " (powered by Stripe)" : ""}. We never see your card details.
            </p>
          </form>
        )}
      </div>

      <aside className="checkout-panel" aria-labelledby="summary-title">
        <h2 id="summary-title">Your bag</h2>
        {lines.map((l) => (
          <div className="summary-line" key={l.key}>
            <div>
              {l.quantity} × {l.name}
              {l.selectedOptions.length ? <small>{l.selectedOptions.map((o) => o.optionName).join(", ")}</small> : null}
            </div>
            <strong>{money(l.unitPriceCents * l.quantity)}</strong>
          </div>
        ))}
        <div className="summary-total">
          <div>
            <span>Subtotal</span>
            <span>{money(subtotalCents)}</span>
          </div>
          <div>
            <span>Maryland sales tax ({Math.round(restaurant.taxRate * 100)}%)</span>
            <span>{money(taxCents)}</span>
          </div>
          <div className="grand">
            <span>Total</span>
            <span>{money(totalCents)}</span>
          </div>
        </div>
        <p className="checkout-caption">Prices are confirmed by the restaurant when the order is placed.</p>
        <Link className="text-link" href="/menu">
          ← Edit your bag
        </Link>
        {lines.length ? (
          <button
            type="button"
            className="remove-line"
            style={{ marginTop: 14 }}
            onClick={() => {
              clear();
              notify("Bag emptied");
              router.replace("/checkout");
            }}
          >
            Empty bag
          </button>
        ) : null}
      </aside>
    </div>
  );
}
