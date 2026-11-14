"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Empty, OrderCard } from "@/components/admin/shared";
import { activeOrders, errorMessage, getStats, setOrderStatus, type AdminOrder, type Stats } from "@/lib/adminApi";
import { ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const POLL_MS = 20_000;

export default function BoardPage() {
  const { guard } = useAdmin();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const knownIds = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await guard(activeOrders());
      setOrders(data);
      setError("");
      setUpdatedAt(new Date());
      if (knownIds.current) {
        const newOnes = data.filter((o) => !knownIds.current!.has(o.id)).map((o) => o.id);
        if (newOnes.length) setFresh(newOnes);
      }
      knownIds.current = new Set(data.map((o) => o.id));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [guard]);

  useEffect(() => {
    void load();
    guard(getStats()).then(setStats).catch(() => {});
    const t = window.setInterval(load, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, guard]);

  useEffect(() => {
    const n = orders?.filter((o) => o.status === "paid").length ?? 0;
    document.title = `${n ? `(${n}) ` : ""}Board | Green Hands staff`;
  }, [orders]);

  async function transition(order: AdminOrder, status: OrderStatus) {
    if (status === "cancelled" && !window.confirm(`Cancel order ${order.orderNumber}? The customer has already paid; refund it in Stripe afterwards.`)) return;
    setBusyId(order.id);
    try {
      const updated = await guard(setOrderStatus(order.id, status));
      setOrders((cur) => (cur ?? []).map((o) => (o.id === updated.id ? updated : o)).filter((o) => ["paid", "preparing", "ready"].includes(o.status)));
      setError("");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? `${err.message}. Refreshing the board.` : errorMessage(err));
      void load();
    } finally {
      setBusyId(null);
    }
  }

  const groups: { status: OrderStatus; title: string }[] = [
    { status: "paid", title: "New" },
    { status: "preparing", title: "Preparing" },
    { status: "ready", title: "Ready for pickup" },
  ];

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Order board</h1>
          <p>Paid orders waiting on the kitchen, soonest pickup first.</p>
        </div>
        <div className="admin-actions">
          <span className="refresh-note">
            {updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Loading…"} · refreshes every 20 s
          </span>
          <button type="button" className="button button-ghost" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {stats ? (
        <div className="admin-panel" style={{ marginBottom: 16 }}>
          <h2>
            Last 7 days{" "}
            <Link href="/admin/orders" className="text-link" style={{ fontSize: 12, marginLeft: 8 }}>
              All orders →
            </Link>
          </h2>
          <div className="stat-row">
            <div className="stat">
              <b>{stats.orders.paid}</b>
              <span>Paid orders</span>
            </div>
            <div className="stat">
              <b>{money(stats.orders.revenueCents)}</b>
              <span>Revenue</span>
            </div>
            <div className="stat">
              <b>{money(stats.orders.averageOrderCents)}</b>
              <span>Average order</span>
            </div>
            <div className="stat">
              <b>{Math.round(stats.orders.checkoutToPaidRate * 100)}%</b>
              <span>Checkout → paid</span>
            </div>
            <div className="stat">
              <b>{stats.contactSubmissions}</b>
              <span>Messages</span>
            </div>
            <div className="stat">
              <b style={{ fontSize: 16, lineHeight: 1.3 }}>{stats.topItems.slice(0, 3).map((t) => `${t.name} (${t.quantity})`).join(", ") || "–"}</b>
              <span>Top dishes</span>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}
      {fresh.length ? (
        <p className="notice" role="status">
          {fresh.length} new order{fresh.length > 1 ? "s" : ""} just came in.{" "}
          <button type="button" className="text-link" style={{ background: "none", border: 0, padding: 0 }} onClick={() => setFresh([])}>
            Dismiss
          </button>
        </p>
      ) : null}

      {orders === null ? (
        <span className="spinner" aria-label="Loading orders" />
      ) : orders.length === 0 ? (
        <Empty title="No open orders.">New paid orders appear here automatically.</Empty>
      ) : (
        groups.map(({ status, title }) => {
          const list = orders.filter((o) => o.status === status);
          if (!list.length) return null;
          return (
            <section key={status} className="admin-panel" aria-labelledby={`board-${status}`}>
              <h2 id={`board-${status}`}>
                {title} <span style={{ color: "var(--muted)", fontFamily: "var(--sans)", fontSize: 14 }}>({list.length})</span>
              </h2>
              <div className="admin-grid admin-grid-3">
                {list.map((o) => (
                  <OrderCard key={o.id} order={o} busy={busyId === o.id} onTransition={transition} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </>
  );
}
