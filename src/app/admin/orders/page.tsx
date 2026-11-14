"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Empty, Pager, StatusBadge } from "@/components/admin/shared";
import { ORDER_STATUSES, STATUS_LABEL, errorMessage, formatDateTime, listOrders, type AdminOrder, type OrderListParams, type Paginated } from "@/lib/adminApi";
import { money } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export default function OrdersPage() {
  const { guard } = useAdmin();
  const [params, setParams] = useState<OrderListParams>({ status: "", pickupDate: "", q: "", sort: "-createdAt", page: 1, limit: 25 });
  const [result, setResult] = useState<Paginated<AdminOrder> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    guard(listOrders(params))
      .then((r) => {
        if (!cancelled) {
          setResult(r);
          setError("");
        }
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params, guard]);

  const set = (patch: Partial<OrderListParams>) => setParams((p) => ({ ...p, ...patch, page: patch.page ?? 1 }));

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Orders</h1>
          <p>Every order, including cancelled and unpaid attempts.</p>
        </div>
      </div>
      <div className="admin-panel">
        <div className="filters">
          <label className="form-field">
            Search
            <input type="search" placeholder="Order #, name, email, phone" value={params.q ?? ""} onChange={(e) => set({ q: e.target.value })} />
          </label>
          <label className="form-field">
            Status
            <select value={params.status ?? ""} onChange={(e) => set({ status: e.target.value as OrderStatus | "" })}>
              <option value="">All</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pickup date
            <input type="date" value={params.pickupDate ?? ""} onChange={(e) => set({ pickupDate: e.target.value })} />
          </label>
          <label className="form-field">
            Sort
            <select value={params.sort} onChange={(e) => set({ sort: e.target.value as OrderListParams["sort"] })}>
              <option value="-createdAt">Newest first</option>
              <option value="createdAt">Oldest first</option>
              <option value="pickupTime">Pickup time ↑</option>
              <option value="-pickupTime">Pickup time ↓</option>
            </select>
          </label>
        </div>
        {error ? (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        ) : null}
        {loading && !result ? (
          <span className="spinner" aria-label="Loading orders" />
        ) : result && result.data.length === 0 ? (
          <Empty title="No orders match." />
        ) : result ? (
          <>
            <div className="admin-table-wrap" aria-busy={loading}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Pickup</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th className="num">Total</th>
                    <th>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>
                      </td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td>
                        {o.pickupTimeLabel}
                        <br />
                        <small style={{ color: "var(--muted)" }}>{o.pickupDate}</small>
                      </td>
                      <td>
                        {o.customer.name}
                        <br />
                        <small style={{ color: "var(--muted)" }}>{o.customer.phone}</small>
                      </td>
                      <td>{o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}</td>
                      <td className="num">{money(o.totalCents)}</td>
                      <td>{formatDateTime(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager pagination={result.pagination} onPage={(page) => setParams((p) => ({ ...p, page }))} />
          </>
        ) : null}
      </div>
    </>
  );
}
