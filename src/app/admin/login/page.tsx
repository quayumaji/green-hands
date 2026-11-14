"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { errorMessage, login } from "@/lib/adminApi";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await login(String(data.get("email") || ""), String(data.get("password") || ""));
      const next = search.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className="admin-login form-grid" onSubmit={onSubmit}>
      <div className="brand" aria-hidden="true">
        <span className="brand-mark">GH</span>
        <span className="brand-name">
          GREEN<span>HANDS</span>
          <small>STAFF DASHBOARD</small>
        </span>
      </div>
      <h1>Sign in</h1>
      <label className="form-field">
        Email
        <input name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <label className="form-field">
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <p className="form-feedback is-error" role="alert" aria-live="assertive">
        {error}
      </p>
      <button className="button button-green" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<span className="spinner" aria-label="Loading" />}>
      <LoginForm />
    </Suspense>
  );
}
