"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getToken, logout, me, UnauthorizedError, type AdminUser } from "@/lib/adminApi";

interface AdminContextValue {
  user: AdminUser;
  signOut: () => void;
  /** Wrap any admin API call: a 401 sends staff to the login page. */
  guard: <T>(p: Promise<T>) => Promise<T>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminShell>");
  return ctx;
}

const NAV = [
  ["/admin", "Board"],
  ["/admin/orders", "Orders"],
  ["/admin/menu", "Menu"],
  ["/admin/gallery", "Gallery"],
  ["/admin/messages", "Messages"],
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [offline, setOffline] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const isLogin = pathname === "/admin/login";

  const toLogin = useCallback(() => {
    logout();
    setUser(null);
    router.replace(`/admin/login${pathname && pathname !== "/admin/login" ? `?next=${encodeURIComponent(pathname)}` : ""}`);
  }, [router, pathname]);

  useEffect(() => {
    if (isLogin) {
      setChecking(false);
      return;
    }
    if (!getToken()) {
      toLogin();
      return;
    }
    let cancelled = false;
    setOffline(false);
    me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (cancelled) return;
        // Only a real 401 ends the session; a network blip (API restarting) just shows a retry.
        if (err instanceof UnauthorizedError) toLogin();
        else setOffline(true);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLogin, toLogin, attempt]);

  const guard = useCallback(
    async <T,>(p: Promise<T>): Promise<T> => {
      try {
        return await p;
      } catch (err) {
        if (err instanceof UnauthorizedError) toLogin();
        throw err;
      }
    },
    [toLogin],
  );

  if (isLogin) return <div className="admin admin-login-wrap">{children}</div>;

  if (offline && !user) {
    return (
      <div className="admin admin-loading">
        <div className="admin-panel" style={{ maxWidth: 420, textAlign: "center" }}>
          <h2>Can&apos;t reach the ordering system.</h2>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>The API at {process.env.NEXT_PUBLIC_API_URL || "localhost:4000"} is not responding. Your sign-in is kept.</p>
          <button type="button" className="button button-gold" onClick={() => (setChecking(true), setAttempt((a) => a + 1))}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (checking || !user) {
    return (
      <div className="admin admin-loading" aria-busy="true">
        <span className="spinner" aria-label="Checking your session" />
      </div>
    );
  }

  const isCurrent = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <AdminContext.Provider value={{ user, signOut: toLogin, guard }}>
      <div className="admin">
        <header className="admin-topbar">
          <Link className="brand" href="/admin" aria-label="Green Hands admin home">
            <span className="brand-mark" aria-hidden="true">GH</span>
            <span className="brand-name">
              GREEN<span>HANDS</span>
              <small>STAFF DASHBOARD</small>
            </span>
          </Link>
          <nav className="admin-nav" aria-label="Admin navigation">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="admin-user">
            <span title={user.email}>{user.name || user.email}</span>
            <Link href="/" className="admin-user-link" target="_blank" rel="noopener">
              View site ↗
            </Link>
            <button type="button" className="button button-ghost admin-signout" onClick={toLogin}>
              Sign out
            </button>
          </div>
        </header>
        <main className="admin-main" id="main">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}
