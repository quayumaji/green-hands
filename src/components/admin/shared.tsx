"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { money } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { ALLOWED_TRANSITIONS, STATUS_LABEL, TRANSITION_LABEL, formatDateTime, type AdminOrder, type Pagination } from "@/lib/adminApi";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge s-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Pager({ pagination, onPage }: { pagination: Pagination; onPage: (page: number) => void }) {
  const { page, totalPages, total } = pagination;
  return (
    <div className="pager">
      <span>
        {total} result{total === 1 ? "" : "s"} · page {page} of {totalPages}
      </span>
      <span className="admin-actions">
        <button type="button" className="button button-ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          ← Prev
        </button>
        <button type="button" className="button button-ghost" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next →
        </button>
      </span>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="admin-empty">
      <b>{title}</b>
      {children}
    </div>
  );
}

interface OrderCardProps {
  order: AdminOrder;
  busy?: boolean;
  onTransition: (order: AdminOrder, status: OrderStatus) => void;
}

/** Kitchen board card: big pickup time, items, one-tap status buttons. */
export function OrderCard({ order, busy, onTransition }: OrderCardProps) {
  const transitions = ALLOWED_TRANSITIONS[order.status];
  const minutesToPickup = (new Date(order.pickupTime).getTime() - Date.now()) / 60000;
  const due = order.status !== "ready" && minutesToPickup <= 15;
  return (
    <article className={`order-card status-${order.status}${due ? " is-due" : ""}`}>
      <div className="order-card-head">
        <div>
          <b>
            <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {order.orderNumber}
            </Link>
          </b>
          <small>
            {order.customer.name} · <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
          </small>
          <StatusBadge status={order.status} />
        </div>
        <div className="pickup-time">
          <b>{order.pickupTimeLabel}</b>
          <small>{order.pickupDate === new Date().toISOString().slice(0, 10) ? "today" : order.pickupDate}</small>
          {due ? <small style={{ display: "block", color: "#a0631d", fontWeight: 700 }}>{minutesToPickup < 0 ? "overdue" : "due soon"}</small> : null}
        </div>
      </div>
      <ul className="order-items">
        {order.items.map((it, i) => (
          <li key={i}>
            <span>
              <span className="qty">{it.quantity}×</span>
              {it.name}
              {it.selectedOptions.length ? <small>{it.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(" · ")}</small> : null}
              {it.notes ? <small>Note: {it.notes}</small> : null}
            </span>
            <span>{money(it.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      {order.notes ? <p className="order-note">Customer note: {order.notes}</p> : null}
      <div className="order-card-foot">
        <span className="total">
          {money(order.totalCents)} · {order.payment.status === "paid" ? "paid" : order.payment.status} · placed {formatDateTime(order.createdAt)}
        </span>
        <div className="order-card-actions">
          {transitions.map((next) => (
            <button
              key={next}
              type="button"
              className={`button ${next === "cancelled" ? "button-danger" : next === "ready" ? "button-green" : "button-gold"}`}
              disabled={busy}
              onClick={() => onTransition(order, next)}
            >
              {TRANSITION_LABEL[next] ?? STATUS_LABEL[next]}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
