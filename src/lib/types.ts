/** Shapes returned by green-hands-backend. Money is integer cents; instants are ISO-8601 UTC strings. */

export type DietaryLabel = "vegetarian" | "vegan" | "spicy" | "gluten-free" | "halal" | "contains-nuts";

export interface MenuOption {
  id: string;
  name: string;
  priceDeltaCents: number;
  isAvailable: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  isPriceConfirmed: boolean;
  imageUrl: string;
  imageAlt: string;
  dietaryLabels: DietaryLabel[];
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  canOrder: boolean;
  optionGroups: OptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

export interface Menu {
  categories: MenuCategory[];
}

export interface RestaurantHoursRow {
  days: string;
  hours: string;
}

export interface Restaurant {
  name: string;
  tagline: string;
  category: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    formatted: string;
  };
  phone: string;
  phoneE164: string;
  email: string;
  instagram?: string;
  timezone: string;
  hours: RestaurantHoursRow[];
  hoursByDay: { day: number; open: string; close: string }[];
  isOpenNow: boolean;
  localDate: string;
  pickup: { leadMinutes: number; slotMinutes: number; maxDaysAhead: number };
  taxRate: number;
  currency: string;
  paymentsProvider: "stripe" | "mock";
}

export interface PickupSlot {
  time: string;
  label: string;
}

export interface PickupDate {
  date: string;
  weekday: number;
  isOpen: boolean;
  open: string | null;
  close: string | null;
}

export interface PickupSlots {
  date: string;
  isOpen: boolean;
  open: string | null;
  close: string | null;
  slots: PickupSlot[];
  dates: PickupDate[];
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "payment_failed";

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDeltaCents: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  notes: string;
  selectedOptions: SelectedOption[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string };
  pickupTime: string;
  pickupDate: string;
  pickupTimeLabel: string;
  notes: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  receiptUrl: string | null;
  createdAt: string;
}

export interface Checkout {
  provider: "stripe" | "mock";
  url: string;
  expiresAt: string | null;
}

export interface CreateOrderInput {
  customer: { name: string; email: string; phone: string };
  pickupTime: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    selectedOptions?: { groupId: string; optionId: string }[];
    notes?: string;
  }[];
}

export interface CreateOrderResponse {
  order: Order;
  accessToken: string;
  checkout: Checkout;
}

export type GalleryCategory = "interior" | "dishes" | "events" | "customers";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
}

export interface Gallery {
  categories: readonly GalleryCategory[];
  images: GalleryImage[];
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  website?: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { path?: string; message: string }[] | Record<string, unknown>;
  };
}

/** A line in the client-side cart. Prices are a preview only; the server re-prices every order. */
export interface CartLine {
  key: string;
  menuItemId: string;
  slug: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  notes: string;
}
