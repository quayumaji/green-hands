# Style guide

The site keeps the "warm editorial" design of the original static site. All values live in `src/app/globals.css`; this document explains them.

## Design tokens (`:root`)

| Token | Value | Used for |
| --- | --- | --- |
| `--green` | `#163f2d` | Primary brand, headings, dark sections |
| `--green-deep` | `#0c2e20` | Text on gold, footer |
| `--green-mid` | `#2b6748` | Button hover, diet tags |
| `--green-soft` | `#dce8d9` | Soft hover backgrounds |
| `--gold` | `#e3b552` | Accent: CTAs, brand mark, badges, underline on links |
| `--gold-light` | `#f1dfb8` | Price pills, notices, soft gold surfaces |
| `--gold-text` | `#a47c2b` | Eyebrow labels, italic accents in headings |
| `--cream` | `#f5f0e5` | Alternate section background, inputs |
| `--paper` | `#fffcf5` | Page background, cards, header |
| `--ink` | `#1d2922` | Body text |
| `--muted` | `#657067` | Secondary text |
| `--line` | `#e6dfd0` | Borders, dividers |
| `--danger` | `#8b3d2c` | Errors, remove actions, spicy tag |
| `--shadow` | `0 18px 48px rgba(13,46,32,.14)` | Hover elevation |
| `--radius` | `12px` | Cards, panels |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Every transition and animation |
| `--dur` | `.5s` | Reveal duration |
| `--header-h` | `75px` / `83px` (≥680px) | Sticky header height, scroll padding, sticky category nav offset |

Contrast: body text on paper and cream passes WCAG AA; gold is only used as a background with `--green-deep` text, never as small text on light backgrounds.

## Typography

- **Display:** Playfair Display 600–800 (`--font-serif`) for `h1`, `h2`, `h3`, card titles, prices in the bag.
- **Body/UI:** DM Sans 400–700 (`--font-sans`) at 15px / 1.65.
- Eyebrows: 10px, uppercase, 2.2px tracking, gold text.
- Hero `h1`: `clamp(52px, 13vw, 76px)`, line-height .98, gold second line. Page heroes: `clamp(51px, 12vw, 96px)`; compact heroes (checkout, order, item page): `clamp(38px, 8vw, 60px)`.
- Section `h2`: `clamp(32px, 7vw, 48px)` with an italic gold `<em>` for the second line.
- Buttons: 11px uppercase, .75px tracking, 700.

Fonts load through `next/font/google` with `display: swap`; the CSS variables fall back to Georgia / Arial.

## Layout

- `.container`: `min(1160px, 100% - 40px)`; 64px gutters from 680px.
- `.section-pad`: 78px vertical, 94px from 680px.
- Breakpoints: `680px` (two-column layouts, desktop nav), `1020px` (three-column menu grid, stacked menu cards), `1200px` (hero line no-wrap), `max-width: 360px` (tighter header), `hover: none` (no lift effects on touch).
- Menu grid: 1 column → 2 → 3; cards always stack the square photo above the text so the dish stays large.
- Gallery: 2 columns with the first tile full-width → 3 columns with the first tile spanning 2×2.

## Components

| Class | Notes |
| --- | --- |
| `.button` + `.button-gold` / `.button-green` / `.button-outline` / `.button-ghost` / `.button-muted` | Pill buttons, 47px min height. Hover lifts 2px with a deeper shadow; active presses down. |
| `.text-link` | Inline link with a gold underline that grows on hover. |
| `.photo-slot.ratio-*` | Fixed aspect box (`dish` 4:3, `landscape` 16:10, `portrait` 4:5, `hero` 4:3, `square` 1:1). Holds `next/image fill` or `.photo-placeholder`. |
| `.photo-slot.photo-contain` | **Uncropped food photo.** `<Photo fit="contain">` renders the dish with `object-fit: contain` (3.5% inset, soft drop shadow) over a blurred, saturated copy of the same image, so the whole plate is visible and the edges are filled with its own colour instead of bars. Used on menu cards and the home favourites; the hero and gallery tiles stay `cover`. |
| `.menu-card` | White card, 12px radius, photo stacked above the text at every width with a square `.menu-photo` (full-width on phones). Hover lifts 5px and zooms the dish 3.5% while the backdrop blurs out further. Contains `.menu-price` pill, `.diet-tag`s, `.choice-field` selects, `.add-button`. |
| `.favorite-card`, `.value-card`, `.gallery-tile` | Same lift-and-shadow hover pattern. |
| `.category-nav` | Sticky pill row under the header; scrolls horizontally on phones. |
| `.cart-drawer` + `.drawer-scrim` | Right-side panel, `min(100%, 440px)`. |
| `.toast` | Bottom-centre pill, fades and scales in. |
| `.notice` (+ `-error`, `-success`) | Inline status banners. |
| `.form-field` | Label-above-input pattern with gold focus ring. |
| `.date-grid`, `.slot-grid` | Checkout pickers using `aria-pressed` for the selected state. |
| `.status-card`, `.status-badge` | Order confirmation page. |

## Motion rules

The brief: smooth, fast, nothing that slides in from the side.

- **Reveal on scroll** (`.reveal` → `.is-visible` via `<Reveal>`): opacity 0→1, `blur(8px)`→0, `scale(.985)`→1 over `.5s` with `--ease`. No translation. Items in a grid stagger by 70ms (`index` prop, capped at 5). A 2.5s safety timer reveals anything the IntersectionObserver missed.
- **Hero entrance** (`.hero-reveal`, `.hero-visual-in`): the same `soft-in` keyframes, staggered 80ms per line.
- **Drawer / lightbox / mobile nav:** opacity + `scale(.97)` (+ a touch of blur) from the element's own origin. The scrim fades.
- **Hover:** `translateY(-2px…-6px)` lift with shadow on cards and buttons, 4% photo zoom, brand mark tilts. Disabled under `(hover: none)`.
- **Micro:** bag count bounces when an item is added; the Add button does a tiny `add-pop`; floating ✳ ✦ marks drift slowly in the hero.
- **Reduced motion:** `prefers-reduced-motion: reduce` sets every animation/transition to ~0ms and shows reveals immediately.

When adding a new animated element: use `--ease`, keep durations between .25s and .6s, prefer opacity/blur/scale, and never animate `left`/`right`/`translateX`.

## Icons and marks

The site uses text glyphs (✳ ✦ ↗ → ×) and two inline SVGs (WhatsApp, Instagram) in the footer. The brand mark is the gold "GH" tile (`.brand-mark`) and `public/favicon.svg`.
