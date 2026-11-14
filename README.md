# Green Hands African Restaurant - Website

Next.js 16 (App Router, React 19, TypeScript) site for Green Hands African Restaurant, Glen Burnie, MD. Customers browse the menu, build a bag, choose a pickup time and pay online through the `green-hands-backend` API and Stripe Checkout. Staff manage orders, the menu, the gallery and the inbox at `/admin`.

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – routes, data flow, caching, checkout and order status.
- [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md) – design tokens, typography, components, motion and responsive rules.
- API contract: `../green-hands-backend/docs/API.md`.

## Run locally

```bash
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                     # http://localhost:3000
```

Start the API first (`cd ../green-hands-backend && npm run dev`). If the API is unreachable the site still renders every page from the offline snapshot in `src/data/fallback.ts`, with ordering disabled and a notice on the menu.

| Script              | What it does                 |
| ------------------- | ---------------------------- |
| `npm run dev`       | Dev server with Turbopack    |
| `npm run build`     | Production build             |
| `npm start`         | Serve the production build   |
| `npm run typecheck` | `tsc --noEmit`               |

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the API, no trailing slash. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site (canonical links, sitemap, Open Graph). |

## Layout

```
src/
  app/                 routes (App Router)
    layout.tsx         fonts + global CSS only
    (site)/            customer pages; its layout adds the header, cart drawer and footer
      page.tsx         Home
      menu/            Menu + /menu/[slug] item deep links
      checkout/        Pickup time + details; Stripe cancel return
      order/[id]/      Confirmation / status; Stripe success return + email link
      about/ gallery/ contact/
    admin/             staff dashboard (login, board, orders, menu, gallery, messages) + admin.css
    sitemap.ts robots.ts not-found.tsx globals.css
  components/          Photo, Reveal, SiteHeader, SiteFooter, cart/, menu/, checkout/, order/, gallery/, contact/, admin/
  lib/                 api.ts (public client), adminApi.ts (JWT client), types.ts, format.ts
  data/fallback.ts     offline snapshot of restaurant, menu and gallery
public/images/         dish and restaurant photos (also referenced by the API's imageUrl fields)
legacy-static/         the original static HTML site, kept for reference only
```

## Deploying

Vercel, Netlify or any Node host. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`, then tell the backend your site origin (`CORS_ORIGINS`, `FRONTEND_URL`). Images are served from `public/images` with long cache headers and optimised by `next/image` (AVIF/WebP).
