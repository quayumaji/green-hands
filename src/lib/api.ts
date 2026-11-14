import type {
  ApiErrorBody,
  ContactInput,
  CreateOrderInput,
  CreateOrderResponse,
  Gallery,
  GalleryCategory,
  Menu,
  MenuCategory,
  MenuItem,
  Order,
  PickupSlots,
  Restaurant,
  Checkout,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: { path?: string; message: string }[];

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage: string) {
    super(body?.error?.message || fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error?.code || "UNKNOWN";
    this.details = Array.isArray(body?.error?.details) ? body.error.details : [];
  }

  /** One readable line for a form's feedback area. */
  get friendlyMessage(): string {
    if (this.details.length) return this.details.map((d) => d.message).join(" ");
    if (this.status === 429) return "Too many attempts. Please wait a few minutes and try again.";
    if (this.status >= 500) return "Something went wrong on our side. Please try again in a moment.";
    return this.message;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Seconds the server-side cache may reuse this response (Next.js ISR). */
  revalidate?: number | false;
}

async function request<T>(path: string, { body, revalidate, headers, ...init }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });
  if (!res.ok) {
    let parsed: ApiErrorBody | null = null;
    try {
      parsed = (await res.json()) as ApiErrorBody;
    } catch {
      parsed = null;
    }
    throw new ApiError(res.status, parsed, `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/* ---------- Public, cacheable reads (called from Server Components) ---------- */

export const getMenu = () => request<Menu>("/api/menu", { revalidate: 60 });
export const getFeatured = () => request<{ items: MenuItem[] }>("/api/menu/featured", { revalidate: 60 });
export const getMenuItem = (idOrSlug: string) =>
  request<{ item: MenuItem; category: MenuCategory | null }>(`/api/menu/items/${encodeURIComponent(idOrSlug)}`, { revalidate: 60 });
export const getRestaurant = () => request<Restaurant>("/api/restaurant", { revalidate: 60 });
export const getGallery = (category?: GalleryCategory) =>
  request<Gallery>(`/api/gallery${category ? `?category=${category}` : ""}`, { revalidate: 300 });

/* ---------- Live reads and writes (called from the browser) ---------- */

export const getPickupSlots = (date?: string) =>
  request<PickupSlots>(`/api/restaurant/pickup-slots${date ? `?date=${date}` : ""}`, { cache: "no-store" });
export const createOrder = (input: CreateOrderInput) =>
  request<CreateOrderResponse>("/api/orders", { method: "POST", body: input, cache: "no-store" });
export const getOrder = (id: string, token: string) =>
  request<{ order: Order }>(`/api/orders/${encodeURIComponent(id)}`, { headers: { "X-Order-Token": token }, cache: "no-store" });
export const recreateCheckout = (id: string, token: string) =>
  request<{ checkout: Checkout }>(`/api/orders/${encodeURIComponent(id)}/checkout-session`, {
    method: "POST",
    headers: { "X-Order-Token": token },
    cache: "no-store",
  });
export const postContact = (input: ContactInput) =>
  request<{ ok: true; id?: string }>("/api/contact", { method: "POST", body: input, cache: "no-store" });

/** Runs a cacheable read, returning the fallback (and logging) if the API is unreachable. */
export async function withFallback<T>(load: () => Promise<T>, fallback: T, label: string): Promise<{ data: T; live: boolean }> {
  try {
    return { data: await load(), live: true };
  } catch (err) {
    console.warn(`[api] ${label} unavailable, using fallback:`, err instanceof Error ? err.message : err);
    return { data: fallback, live: false };
  }
}

/** Resolves image URLs from the API: absolute URLs pass through, "/images/x.jpg" is served by this site. */
export function imageSrc(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
}
