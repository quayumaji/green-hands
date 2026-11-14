# Site architecture

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript | Server rendering + static caching for speed, real routes for the Stripe return URLs |
| Styling | One global stylesheet (`src/app/globals.css`) with CSS custom properties | The original design was hand-written CSS; keeping it as plain CSS preserved it exactly and adds no runtime cost |
| Fonts | `next/font/google` (DM Sans, Playfair Display) | Self-hosted at build time, no layout shift, no third-party request |
| Images | `next/image` with `fill` inside fixed-aspect `.photo-slot` boxes | AVIF/WebP, responsive sizes, lazy loading; aspect boxes stop layout jumps |
| Data | Typed fetch client in `src/lib/api.ts` | Server Components read cacheable endpoints; client components call live ones |
| State | React context + localStorage for the bag | No store library needed |

## Routes

| Route | Rendering | Data |
| --- | --- | --- |
| `/` | Static, revalidates every 60 s | `GET /api/restaurant` (open/closed badge, hours) |
| `/menu` | Static, revalidates every 60 s | `GET /api/menu` |
| `/menu/[slug]` | Dynamic | `GET /api/menu/items/:slug` |
| `/about` | Static | none |
| `/gallery` | Static, revalidates every 300 s | `GET /api/gallery` |
| `/contact` | Static, revalidates every 300 s | `GET /api/restaurant`; form posts to `POST /api/contact` |
| `/checkout` | Dynamic, client-driven | `GET /api/restaurant/pickup-slots`, `POST /api/orders`, `POST /api/orders/:id/checkout-session` |
| `/order/[id]` | Dynamic, client-driven | `GET /api/orders/:id` (polled) |
| `/admin/*` | Client-only, noindex | `/api/admin/*` (see Staff dashboard below) |
| `/sitemap.xml`, `/robots.txt` | Static | menu slugs |

Customer pages live in the `(site)` route group whose layout fetches `/api/restaurant` (cached 60 s) for the footer and the cart drawer's tax preview; the root layout only sets fonts and global CSS so `/admin` can use its own shell.

## Caching and speed

- Server Components call `fetch` with `next: { revalidate }` so Next's data cache serves pages instantly and refreshes in the background (ISR). The API also sends `Cache-Control` on those endpoints.
- Live endpoints (pickup slots, orders, contact) use `cache: "no-store"` from the browser.
- Everything under `public/images` is sent with `Cache-Control: public, max-age=31536000, immutable`.
- Client JavaScript is limited to the interactive parts: header, cart, menu cards, checkout, order status, gallery grid, contact form, reveal effect. Pages themselves are server-rendered HTML.

## Offline fallback

`withFallback()` in `src/lib/api.ts` wraps every cacheable read. If the API is down the page renders from `src/data/fallback.ts` with `live = false`: the menu shows "Online ordering paused", Add buttons are disabled, and the footer/contact pages still show correct details. Keep the fallback in sync with the backend seed (`green-hands-backend/src/scripts/seedData.ts`).

## The bag (cart)

`src/components/cart/CartProvider.tsx`

- A line is identified by `menuItemId + sorted option ids + notes`. Adding the same combination increments quantity (max 20).
- Stored in `localStorage["green-hands-cart-v2"]`; hydration happens after mount so server HTML never depends on it (`hydrated` flag).
- `unitPriceCents` is a **preview** only; the server re-prices the order.
- The drawer is a fixed panel that fades and scales in (no side slide). `Escape` closes it; focus moves to the close button and returns on close.

## Checkout and payment

`src/components/checkout/CheckoutClient.tsx`

1. Load pickup dates and today's slots. If today has none, jump to the next open day automatically.
2. Customer picks a date (horizontal strip), a time (grid), fills name / email / phone / note.
3. `POST /api/orders` with item ids, quantities and selected option ids. Validation errors map back to fields; 422 cart problems tell the customer to edit the bag; a stale `pickupTime` reloads the slots.
4. On success: store `{ id, token }` in `localStorage["green-hands-pending-order"]`, then `window.location.assign(checkout.url)`.
5. Stripe (or the mock gateway) returns to:
   - `/order/:id?token=…&checkout=success` → `OrderStatus` polls every 2 s for up to 60 s while `pending_payment`, clears the bag once paid, then polls every 30 s while `paid`/`preparing`.
   - `/checkout?order=:id&checkout=cancelled` → bag kept; if the pending order matches, a "Try paying again" link calls `POST /api/orders/:id/checkout-session`.

The email link (`/order/:id?token=…`) works without any local state; the token comes from the query string.

## Accessibility

- Skip link, landmark roles, `aria-current` on nav, labelled buttons and form fields, `aria-pressed` on pickers, `role="status"`/`alert` on feedback, dialogs with `aria-modal` and Escape handling.
- `prefers-reduced-motion` disables every animation and shows content immediately.
- All photos carry `alt`; gallery `alt` comes from the API.

## Staff dashboard (`/admin`)

Route group `src/app/admin/` with its own shell (`AdminShell`): no customer header, cart or footer, `robots: noindex`, excluded from the sitemap. All pages are client components talking to `/api/admin/*` through `src/lib/adminApi.ts`, which adds the `Authorization: Bearer` header from `localStorage["green-hands-admin-token"]` and throws `UnauthorizedError` on 401; the shell catches that and redirects to `/admin/login?next=...`.

| Route | What it does |
| --- | --- |
| `/admin/login` | Email + password -> `POST /api/admin/auth/login`. |
| `/admin` | Kitchen board: `GET /api/admin/orders/active` every 20 s (and on tab focus), grouped New / Preparing / Ready, one-tap buttons for the allowed transitions, "due soon" highlight within 15 min of pickup, new-order banner, tab title shows the count of new orders. Also a 7-day stats strip from `GET /api/admin/stats`. |
| `/admin/orders` | Paginated list with search, status, pickup-date and sort filters. |
| `/admin/orders/[id]` | Full order: items, totals, history, customer, payment ids and receipt, notification timestamps, status buttons. |
| `/admin/menu` | Categories and dishes with the sold-out switch (`PATCH .../availability`), create/edit/delete for both; the dish editor covers price, image, dietary labels, flags and option groups. |
| `/admin/gallery` | Add, edit, hide and delete photos by URL or `/images` path with a live preview. |
| `/admin/messages` | Contact inbox with new/read/replied/archived filters, reply-by-email links, delete. |

Styles live in `src/app/admin/admin.css` (tablet-first, 44 px+ tap targets) on top of the site tokens. Destructive actions (cancel order, delete) ask for confirmation. Illegal status changes surface the server's 409 message and refresh the board.

## What is not built yet

- Drinks/appetizers categories, SMS notifications, analytics instrumentation, admin user management (staff accounts are created by the seed or directly in the database).
