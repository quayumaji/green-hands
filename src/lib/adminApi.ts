"use client";

import { API_URL, ApiError } from "./api";
import type { ApiErrorBody, DietaryLabel, GalleryCategory, MenuCategory, MenuItem, Order, OrderStatus, OptionGroup } from "./types";

/* ---------- Types ---------- */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "staff";
}

export interface AdminOrder extends Order {
  payment: {
    provider: "stripe" | "mock";
    status: "unpaid" | "paid" | "failed" | "refunded";
    checkoutSessionId: string | null;
    paymentIntentId: string | null;
    paidAt: string | null;
    receiptUrl: string | null;
  };
  statusHistory: { status: OrderStatus; at: string; by: string }[];
  notifications: { customerConfirmationSentAt: string | null; restaurantNotifiedAt: string | null };
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export type AdminCategory = Omit<MenuCategory, "items"> & { itemCount: number };
export type AdminMenuItem = MenuItem & { createdAt?: string; updatedAt?: string };

export interface OptionGroupInput {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: { name: string; priceDeltaCents: number; isAvailable: boolean; sortOrder: number }[];
}

export interface MenuItemInput {
  categoryId: string;
  name: string;
  slug?: string;
  description: string;
  priceCents: number;
  isPriceConfirmed: boolean;
  imageUrl: string;
  imageAlt: string;
  dietaryLabels: DietaryLabel[];
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  optionGroups: OptionGroupInput[];
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export type ContactStatus = "new" | "read" | "replied" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string | null;
}

export interface AdminGalleryImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  sortOrder: number;
  isActive: boolean;
}

export interface GalleryImageInput {
  url: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  sortOrder: number;
  isActive: boolean;
}

export interface Stats {
  range: { from: string; to: string };
  orders: {
    created: number;
    paid: number;
    revenueCents: number;
    averageOrderCents: number;
    checkoutToPaidRate: number;
    byStatus: Partial<Record<OrderStatus, number>>;
  };
  contactSubmissions: number;
  topItems: { menuItemId: string; name: string; quantity: number }[];
}

export const ORDER_STATUSES: OrderStatus[] = ["pending_payment", "paid", "preparing", "ready", "completed", "cancelled", "payment_failed"];
export const DIETARY_LABELS: DietaryLabel[] = ["vegetarian", "vegan", "spicy", "gluten-free", "halal", "contains-nuts"];
export const GALLERY_CATEGORIES: GalleryCategory[] = ["interior", "dishes", "events", "customers"];
export const CONTACT_STATUSES: ContactStatus[] = ["new", "read", "replied", "archived"];

/** Mirrors ADMIN_TRANSITIONS in the backend; the server still enforces it. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["preparing", "ready", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  payment_failed: ["cancelled"],
};

/* ---------- Token storage ---------- */

const TOKEN_KEY = "green-hands-admin-token";

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Thrown when the API answers 401: the shell catches it and sends staff to the login page. */
export class UnauthorizedError extends ApiError {}

async function adminRequest<T>(path: string, init: Omit<RequestInit, "body"> & { body?: unknown } = {}): Promise<T> {
  const token = getToken();
  const { body, headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  if (!res.ok) {
    const errBody = parsed as ApiErrorBody | null;
    if (res.status === 401) {
      setToken(null);
      throw new UnauthorizedError(401, errBody, "Session expired");
    }
    throw new ApiError(res.status, errBody, `Request failed (${res.status})`);
  }
  return parsed as T;
}

const qs = (params: object) => {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  const s = u.toString();
  return s ? `?${s}` : "";
};

/* ---------- Auth ---------- */

export async function login(email: string, password: string): Promise<AdminUser> {
  const res = await adminRequest<{ token: string; expiresIn: string; user: AdminUser }>("/api/admin/auth/login", { method: "POST", body: { email, password } });
  setToken(res.token);
  return res.user;
}
export const me = () => adminRequest<{ user: AdminUser }>("/api/admin/auth/me").then((r) => r.user);
export function logout(): void {
  setToken(null);
}

/* ---------- Orders ---------- */

export interface OrderListParams {
  status?: OrderStatus | "";
  pickupDate?: string;
  q?: string;
  sort?: "pickupTime" | "-pickupTime" | "createdAt" | "-createdAt";
  page?: number;
  limit?: number;
}
export const listOrders = (p: OrderListParams) => adminRequest<Paginated<AdminOrder>>(`/api/admin/orders${qs(p)}`);
export const activeOrders = () => adminRequest<{ data: AdminOrder[] }>("/api/admin/orders/active").then((r) => r.data);
export const getAdminOrder = (id: string) => adminRequest<{ order: AdminOrder }>(`/api/admin/orders/${id}`).then((r) => r.order);
export const setOrderStatus = (id: string, status: OrderStatus) =>
  adminRequest<{ order: AdminOrder }>(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status } }).then((r) => r.order);

/* ---------- Menu ---------- */

export const listCategories = () => adminRequest<{ data: AdminCategory[] }>("/api/admin/menu/categories").then((r) => r.data);
export const createCategory = (input: CategoryInput) =>
  adminRequest<{ category: AdminCategory }>("/api/admin/menu/categories", { method: "POST", body: input }).then((r) => r.category);
export const updateCategory = (id: string, input: Partial<CategoryInput>) =>
  adminRequest<{ category: AdminCategory }>(`/api/admin/menu/categories/${id}`, { method: "PATCH", body: input }).then((r) => r.category);
export const deleteCategory = (id: string) => adminRequest<void>(`/api/admin/menu/categories/${id}`, { method: "DELETE" });

export const listItems = (categoryId?: string) => adminRequest<{ data: AdminMenuItem[] }>(`/api/admin/menu/items${qs({ categoryId })}`).then((r) => r.data);
export const createItem = (input: MenuItemInput) => adminRequest<{ item: AdminMenuItem }>("/api/admin/menu/items", { method: "POST", body: input }).then((r) => r.item);
export const updateItem = (id: string, input: Partial<MenuItemInput>) =>
  adminRequest<{ item: AdminMenuItem }>(`/api/admin/menu/items/${id}`, { method: "PATCH", body: input }).then((r) => r.item);
export const setItemAvailability = (id: string, isAvailable: boolean) =>
  adminRequest<{ item: AdminMenuItem }>(`/api/admin/menu/items/${id}/availability`, { method: "PATCH", body: { isAvailable } }).then((r) => r.item);
export const deleteItem = (id: string) => adminRequest<void>(`/api/admin/menu/items/${id}`, { method: "DELETE" });

/** Converts an item from the API into the editable input shape (option ids are dropped; the server regenerates them). */
export function itemToInput(item: AdminMenuItem): MenuItemInput {
  return {
    categoryId: item.categoryId,
    name: item.name,
    slug: item.slug,
    description: item.description,
    priceCents: item.priceCents,
    isPriceConfirmed: item.isPriceConfirmed,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    dietaryLabels: item.dietaryLabels,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    optionGroups: item.optionGroups.map(groupToInput),
  };
}
export function groupToInput(g: OptionGroup, i = 0): OptionGroupInput {
  return {
    name: g.name,
    required: g.required,
    minSelect: g.minSelect,
    maxSelect: g.maxSelect,
    sortOrder: i,
    options: g.options.map((o, oi) => ({ name: o.name, priceDeltaCents: o.priceDeltaCents, isAvailable: o.isAvailable, sortOrder: oi })),
  };
}

/* ---------- Contact inbox ---------- */

export const listMessages = (p: { status?: ContactStatus | ""; page?: number; limit?: number }) =>
  adminRequest<Paginated<ContactMessage>>(`/api/admin/contact-messages${qs(p)}`);
export const setMessageStatus = (id: string, status: ContactStatus) =>
  adminRequest<{ message: ContactMessage }>(`/api/admin/contact-messages/${id}`, { method: "PATCH", body: { status } }).then((r) => r.message);
export const deleteMessage = (id: string) => adminRequest<void>(`/api/admin/contact-messages/${id}`, { method: "DELETE" });

/* ---------- Gallery ---------- */

export const listGallery = () => adminRequest<{ data: AdminGalleryImage[] }>("/api/admin/gallery").then((r) => r.data);
export const createGalleryImage = (input: GalleryImageInput) =>
  adminRequest<{ image: AdminGalleryImage }>("/api/admin/gallery", { method: "POST", body: input }).then((r) => r.image);
export const updateGalleryImage = (id: string, input: Partial<GalleryImageInput>) =>
  adminRequest<{ image: AdminGalleryImage }>(`/api/admin/gallery/${id}`, { method: "PATCH", body: input }).then((r) => r.image);
export const deleteGalleryImage = (id: string) => adminRequest<void>(`/api/admin/gallery/${id}`, { method: "DELETE" });

/* ---------- Stats ---------- */

export const getStats = (from?: string, to?: string) => adminRequest<Stats>(`/api/admin/stats${qs({ from, to })}`);

/* ---------- Helpers ---------- */

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.friendlyMessage;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "New",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Picked up",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
};

export const TRANSITION_LABEL: Partial<Record<OrderStatus, string>> = {
  preparing: "Start preparing",
  ready: "Mark ready",
  completed: "Picked up",
  cancelled: "Cancel order",
};
