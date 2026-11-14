"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";

export function CartDrawer({ phone, phoneE164, taxRate }: { phone: string; phoneE164: string; taxRate: number }) {
  const { lines, count, subtotalCents, isOpen, closeCart, changeQuantity, removeLine } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
    } else {
      returnFocus.current?.focus?.();
    }
  }, [isOpen]);

  const taxCents = Math.round(subtotalCents * taxRate);

  return (
    <>
      <div className="drawer-scrim" onClick={closeCart} aria-hidden="true" />
      <section className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!isOpen} tabIndex={-1}>
        <div className="cart-header">
          <div>
            <p className="eyebrow">Pickup order</p>
            <h2 id="cart-title">
              Your bag <span>({count})</span>
            </h2>
          </div>
          <button ref={closeRef} className="icon-button" type="button" onClick={closeCart} aria-label="Close bag">
            ×
          </button>
        </div>
        <div className="cart-content">
          {lines.length === 0 ? (
            <div className="cart-empty">
              <span aria-hidden="true">✳</span>
              <h3>Your bag is taking a breather.</h3>
              <p>Add something delicious from the menu.</p>
              <Link className="text-link" href="/menu" onClick={closeCart}>
                Browse the menu →
              </Link>
            </div>
          ) : (
            <>
              <div>
                {lines.map((line) => (
                  <article className="cart-line" key={line.key}>
                    <div className="cart-line-copy">
                      <b>{line.name}</b>
                      {line.selectedOptions.length ? <span>{line.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(" · ")}</span> : null}
                      {line.notes ? <span>Note: {line.notes}</span> : null}
                      <strong>{money(line.unitPriceCents * line.quantity)}</strong>
                    </div>
                    <div className="quantity-control" aria-label={`Quantity for ${line.name}`}>
                      <button type="button" onClick={() => changeQuantity(line.key, -1)} aria-label={`Remove one ${line.name}`}>
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(line.key, 1)} aria-label={`Add one ${line.name}`}>
                        +
                      </button>
                      <button type="button" className="remove-line" onClick={() => removeLine(line.key)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="checkout-area">
                <div className="cart-total">
                  <span>Subtotal</span>
                  <strong>{money(subtotalCents)}</strong>
                </div>
                <p className="checkout-caption">
                  Estimated tax {money(taxCents)} · total {money(subtotalCents + taxCents)}. The final figure is confirmed at checkout.
                </p>
                <Link className="button button-gold checkout-button" href="/checkout" onClick={closeCart}>
                  Choose pickup time &amp; pay <span aria-hidden="true">→</span>
                </Link>
                <a className="call-to-order" href={`tel:${phoneE164}`}>
                  Prefer to call? {phone}
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function Toast() {
  const { toast } = useCart();
  return (
    <div className={`toast${toast ? " toast-visible" : ""}${toast?.error ? " toast-error" : ""}`} role="status" aria-live="polite">
      {toast?.message ?? ""}
    </div>
  );
}
