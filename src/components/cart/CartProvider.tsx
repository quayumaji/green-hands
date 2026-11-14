"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartLine, MenuItem, SelectedOption } from "@/lib/types";

const STORAGE_KEY = "green-hands-cart-v2";
const MAX_QTY = 20;

interface CartState {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  hydrated: boolean;
  toast: { message: string; error: boolean; id: number } | null;
  addItem: (item: MenuItem, selectedOptions: SelectedOption[], notes?: string) => void;
  changeQuantity: (key: string, delta: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  notify: (message: string, error?: boolean) => void;
}

const CartContext = createContext<CartState | null>(null);

function lineKey(menuItemId: string, selected: SelectedOption[], notes: string): string {
  const opts = selected
    .map((s) => `${s.groupId}:${s.optionId}`)
    .sort()
    .join(",");
  return `${menuItemId}|${opts}|${notes}`;
}

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is CartLine => Boolean(l) && typeof l.menuItemId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
      .map((l) => ({ ...l, quantity: Math.min(l.quantity, MAX_QTY), selectedOptions: l.selectedOptions ?? [], notes: l.notes ?? "" }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<CartState["toast"]>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setLines(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode or full storage: cart still works for this page view */
    }
  }, [lines, hydrated]);

  const notify = useCallback((message: string, error = false) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, error, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const addItem = useCallback(
    (item: MenuItem, selectedOptions: SelectedOption[], notes = "") => {
      const key = lineKey(item.id, selectedOptions, notes);
      const unitPriceCents = item.priceCents + selectedOptions.reduce((sum, o) => sum + o.priceDeltaCents, 0);
      setLines((current) => {
        const existing = current.find((l) => l.key === key);
        if (existing) {
          return current.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + 1) } : l));
        }
        return [...current, { key, menuItemId: item.id, slug: item.slug, name: item.name, unitPriceCents, quantity: 1, selectedOptions, notes }];
      });
      notify(`${item.name} added to your bag`);
    },
    [notify],
  );

  const changeQuantity = useCallback((key: string, delta: number) => {
    setLines((current) =>
      current
        .map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((key: string) => setLines((current) => current.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.body.classList.toggle("cart-open", isOpen);
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
    return { lines, count, subtotalCents, isOpen, hydrated, toast, addItem, changeQuantity, removeLine, clear, openCart, closeCart, notify };
  }, [lines, isOpen, hydrated, toast, addItem, changeQuantity, removeLine, clear, openCart, closeCart, notify]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** The order the customer is paying for right now, kept until the confirmation page has shown it. */
const PENDING_KEY = "green-hands-pending-order";

export function savePendingOrder(id: string, token: string): void {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ id, token, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readPendingOrder(): { id: string; token: string } | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; token?: string };
    return parsed.id && parsed.token ? { id: parsed.id, token: parsed.token } : null;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}
