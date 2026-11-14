"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Empty, Pager } from "@/components/admin/shared";
import { CONTACT_STATUSES, deleteMessage, errorMessage, formatDateTime, listMessages, setMessageStatus, type ContactMessage, type ContactStatus, type Paginated } from "@/lib/adminApi";

export default function MessagesPage() {
  const { guard } = useAdmin();
  const [status, setStatus] = useState<ContactStatus | "">("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<ContactMessage> | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      guard(listMessages({ status, page, limit: 20 }))
        .then((r) => {
          setResult(r);
          setError("");
        })
        .catch((err) => setError(errorMessage(err))),
    [guard, status, page],
  );
  useEffect(() => {
    void load();
  }, [load]);

  async function change(m: ContactMessage, next: ContactStatus) {
    try {
      const updated = await guard(setMessageStatus(m.id, next));
      setResult((r) => (r ? { ...r, data: r.data.map((x) => (x.id === updated.id ? updated : x)) } : r));
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  async function remove(m: ContactMessage) {
    if (!window.confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return;
    try {
      await guard(deleteMessage(m.id));
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Messages</h1>
          <p>Contact-form submissions. They are also emailed to the restaurant inbox.</p>
        </div>
        <div className="chip-row" role="group" aria-label="Filter by status">
          <button type="button" className="chip" aria-pressed={status === ""} onClick={() => (setStatus(""), setPage(1))}>
            All
          </button>
          {CONTACT_STATUSES.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => (setStatus(s), setPage(1))}>
              {s}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      ) : null}
      {!result ? (
        <span className="spinner" aria-label="Loading messages" />
      ) : result.data.length === 0 ? (
        <Empty title="No messages." />
      ) : (
        <div className="admin-grid">
          {result.data.map((m) => (
            <article key={m.id} className={`msg-card${m.status === "new" ? " is-new" : ""}`}>
              <div className="msg-head">
                <div>
                  <b>{m.name}</b> <small>· {m.subject || "No subject"}</small>
                  <br />
                  <small>
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message to Green Hands"}`)}`}>{m.email}</a>
                    {m.phone ? <> · <a href={`tel:${m.phone}`}>{m.phone}</a></> : null} · {formatDateTime(m.createdAt)}
                  </small>
                </div>
                <span className={`status-badge s-${m.status === "new" ? "paid" : m.status === "archived" ? "completed" : "ready"}`}>{m.status}</span>
              </div>
              <p className="msg-body">{m.message}</p>
              <div className="row-actions">
                {m.status === "new" ? (
                  <button type="button" className="button button-ghost mini" onClick={() => change(m, "read")}>
                    Mark read
                  </button>
                ) : null}
                {m.status !== "replied" ? (
                  <button type="button" className="button button-green mini" onClick={() => change(m, "replied")}>
                    Mark replied
                  </button>
                ) : null}
                {m.status !== "archived" ? (
                  <button type="button" className="button button-ghost mini" onClick={() => change(m, "archived")}>
                    Archive
                  </button>
                ) : (
                  <button type="button" className="button button-ghost mini" onClick={() => change(m, "read")}>
                    Unarchive
                  </button>
                )}
                <button type="button" className="button button-danger mini" onClick={() => remove(m)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          <Pager pagination={result.pagination} onPage={setPage} />
        </div>
      )}
    </>
  );
}
