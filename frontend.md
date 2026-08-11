---
name: erp-dark-dashboard-design
description: Use this skill whenever building, styling, or reviewing frontend UI for the Mini ERP + CRM Operations Portal (or any similarly-scoped internal admin/dashboard tool) — dashboard home, customer CRM, product/inventory, sales challan, login/role screens, tables, forms, cards, sidebars, calendars, and KPI widgets. Trigger this any time the user asks to build a screen, component, page, or style pass for this project, mentions "dashboard," "admin panel," "ERP," "CRM UI," or references matching the dark purple glassmorphic reference screenshots, even if they don't explicitly say "design system." This file is the single source of truth for colors, type, spacing, component patterns, and motion — read it before writing any CSS/JSX for this project.
---

# ERP Dark Dashboard — Design System

This is the exact visual language extracted from two reference screenshots the client approved, applied to the **Mini ERP + CRM Operations Portal** PRD (Node/TS backend, React frontend, roles: Admin/Sales/Warehouse/Accounts, modules: Customer CRM, Product & Inventory, Sales Challan).

Reference 1 = "SaaS Dashboard" screenshot (dark near-black admin shell, purple accents, wireframe-style cards, calendar, planner list, finance line chart).
Reference 2 = "Glass Stat Widget" screenshot (frosted glass KPI cards over a blurred photo background, saturated gradient fills per metric).

Use **Reference 1's shell** (sidebar, top bar, tables, calendar, lists) as the base for every page in this app — it's the correct register for an internal ops tool. Use **Reference 2's glass-gradient KPI card treatment** only for the Dashboard home's summary tiles (Today's Sales, Stock Alerts, Pending Challans, Follow-ups Due) — it's the "hero" moment, not the whole app.

---

## 1. Color tokens

```css
:root {
  /* Surfaces */
  --bg-app: #0a0a0d;           /* page background, almost black */
  --bg-sidebar: #0d0d12;       /* slightly darker than cards, recedes */
  --bg-card: #16161d;          /* default card surface */
  --bg-card-hover: #1c1c25;
  --bg-input: #131318;
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);

  /* Accent (single hero hue — do not add a second accent color) */
  --accent: #7c5cff;
  --accent-strong: #6d4bff;
  --accent-soft: rgba(124,92,255,0.16);   /* pill backgrounds, active nav */
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%);

  /* Text */
  --text-primary: #f5f5f7;
  --text-secondary: #9a9aa5;
  --text-muted: #63636e;

  /* Status (used sparingly, semantic only — never decorative) */
  --status-positive: #22c55e;   /* stock OK, confirmed, paid */
  --status-warning: #f59e0b;    /* low stock, draft, follow-up due */
  --status-negative: #ef4444;   /* out of stock, cancelled, overdue */
  --status-info: #38bdf8;       /* lead, informational */

  /* Glass KPI gradients — Dashboard hero tiles ONLY (Reference 2) */
  --glass-rose:   linear-gradient(160deg, rgba(196,109,140,0.9), rgba(90,60,110,0.9));
  --glass-teal:   linear-gradient(160deg, rgba(31,58,52,0.9), rgba(15,30,28,0.9));
  --glass-pink:   linear-gradient(160deg, rgba(179,87,122,0.9), rgba(80,40,70,0.9));
  --glass-blue:   linear-gradient(160deg, rgba(26,43,79,0.9), rgba(12,20,40,0.9));
  --glass-orange: linear-gradient(160deg, rgba(168,70,31,0.9), rgba(80,30,15,0.9));
}
```

Rules:
- **One accent hue only** (`--accent` violet). Everything else is greyscale + semantic status colors. Do not introduce blue-as-brand or teal-as-brand anywhere outside the four glass tiles.
- Status colors appear only on badges, dots, and deltas (e.g. `↑ 80.8%`) — never as large fills outside the KPI tiles.
- Never pure black (`#000`) or pure white (`#fff`) for surfaces/text — everything is slightly warmed/cooled off-black and off-white per the tokens above.

---

## 2. Typography

- **Display / numbers**: Inter or General Sans, 600–700 weight. Big KPI numbers (e.g. "722,543.5", "56%") are the loudest thing on the page — size them at 32–40px, tight letter-spacing (-0.02em).
- **UI text / labels**: same family, 400–500 weight, 12–13px, `--text-secondary`, uppercase with +0.04em tracking for section eyebrows only ("WORKLOAD", "FINANCE", "PLANNER", "CURRENT RESERVATIONS") — sentence case everywhere else (button labels, table cells, nav).
- **Body / table data**: 14px, 400 weight, `--text-primary`.
- Never use a serif or a second display face — this system reads as "precise ops tool," not editorial.

Type scale:
| Role | Size | Weight | Color |
|---|---|---|---|
| Page title (e.g. "Dashboard") | 28px | 700 | text-primary |
| Card eyebrow label | 12px | 500, uppercase | text-secondary |
| KPI big number | 36px | 700 | text-primary |
| Section heading | 16px | 600 | text-primary |
| Body / table cell | 14px | 400 | text-primary |
| Caption / meta | 12px | 400 | text-muted |

---

## 3. Spacing & shape

- Base unit: **4px**. Card padding 20–24px. Gap between sibling cards: 16–20px.
- Border radius: **16px** for cards, **12px** for inputs/buttons, **999px** (full pill) for status badges, filter chips, and the primary nav-action button (see "Salva" pill in Reference 2 — dark pill, folder icon, white label).
- Cards never touch the viewport edge; page gutter is 24–32px.
- Sidebar width: 72px collapsed (icon-only, matches Reference 1) or 240px expanded with labels. Default to icon-only for this internal tool to maximize table space.

---

## 4. Core components (mapped to PRD modules)

### App shell
- Left icon-only sidebar (`--bg-sidebar`), 6–7 icons max: Dashboard, Customers, Products/Inventory, Challans, Reports, Settings. Active icon gets `--accent-soft` rounded background + `--accent` icon color.
- Top bar: page title left, global search center-left (`--bg-input`, rounded 12px, `⌘F` hint right-aligned in `--text-muted`), role/location chip far right with chevron.

### KPI / stat cards (Dashboard home — Reference 2 glass style)
- Use for: Today's Sales Total, Stock Alerts count, Pending Challans, Follow-ups Due Today.
- Structure: eyebrow label top-left → big number bottom-left → optional small ring/sparkline top-right.
- Gradient fill per card via the `--glass-*` tokens, `border-radius: 20px`, subtle inner highlight (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.08)`), no photo background needed in this app — use the gradient alone.
- One card should carry a thin circular progress ring (SVG stroke, 3px, rounded caps) mirroring the "84" ring in Reference 1 — reuse this pattern for "% of stock in healthy range" or similar.

### Standard cards (everything else — Reference 1 style)
- `--bg-card`, 1px `--border-subtle`, 16px radius, 20–24px padding.
- Card header row: eyebrow label left, "Manage →" or "View all →" link right in `--accent`, 13px, arrow nudges 2px right on hover.
- Workload-style card: single wave/area chart in `--accent-gradient`, big number bottom-left, "Max. X%" bottom-right in `--text-muted`.
- Finance/line-chart card: big currency figure top-left, green delta chip next to it, thin single-color line chart (`--accent`) with a filled dot marker on the last data point, timeframe pill-tabs (1H/1D/1M/1Y) bottom-aligned, active tab = filled `--bg-card-hover` pill.

### Tables (Customer list, Product list, Challan list, Reservations-style "Current Challans")
- No cell borders; use 1px `--border-subtle` row dividers only.
- Header row: 12px uppercase `--text-secondary`, sticky.
- Status column always renders as a pill badge (rounded-full, 4px/10px padding, 12px text): Draft = grey, Confirmed = `--status-positive` tint, Cancelled = `--status-negative` tint; Lead = `--status-info` tint, Active = `--status-positive` tint, Inactive = grey.
- Row hover: `--bg-card-hover`, 150ms ease.
- Actions (edit/view) appear on hover only, right-aligned, ghost icon buttons.

### Calendar widget (Follow-up dates / challan scheduling)
- Month header with `<` `>` chevrons, month/year in 600 weight.
- Day grid: today = `--accent` filled circle; dates with events = `--accent-soft` filled circle; no visual noise on empty days beyond default `--text-secondary`.

### Planner / task list (Follow-up notes, low-stock action list)
- Checkbox rows; checked state = filled `--accent` checkbox + strikethrough + `--text-muted` label, animated with a 150ms checkmark draw-in (see motion section).
- Right-aligned relative date meta in `--text-muted`.

### Forms (Add/Edit Customer, Add/Edit Product, New Challan)
- Inputs: `--bg-input`, 1px `--border-default`, 12px radius, 40px height, focus ring = 2px `--accent` outline offset 2px, no default browser blue.
- Multi-product challan line items: each product row is its own mini-card with quantity stepper (− / input / +), remove icon fades in on row hover.
- Primary action button: filled `--accent`, white text, 12px radius, 40–44px height, subtle `--accent-strong` on hover, scale(0.98) on active press.
- Secondary/ghost button: transparent, `--border-default`, `--text-primary`.

---

## 5. Motion

Keep motion **quiet and functional** — this is an internal ops tool, not a marketing site. Nothing should animate for longer than ~250ms except page-level chart draw-ins.

- **Transitions**: `transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)` for hover/active states (buttons, table rows, nav icons, links).
- **Card entrance**: on route/page load, stagger cards in with `opacity 0→1` + `translateY(8px→0)`, 200ms each, 40ms stagger delay per card — never more than ~6 cards staggered before falling back to a simultaneous fade.
- **Charts**: line/area charts draw left-to-right on mount (`stroke-dasharray` reveal or width clip-path), 500–700ms ease-out, once per mount only — do not replay on every re-render/hover.
- **KPI ring** (Reference 1 style): animate `stroke-dashoffset` from full to the target percentage on mount, 600ms ease-out.
- **Number count-up**: big KPI numbers count up from 0 on first mount only (not on every poll/refresh), ~500ms.
- **Status pill change** (e.g. Draft → Confirmed): 150ms color-fade crossfade, no bounce.
- **Modal/drawer** (Add Customer, New Challan): slide-in from right 280ms ease-out + backdrop fade 200ms; slide-out reverses at 180ms (exits are faster than entrances).
- **Toasts** (Challan confirmed, Stock updated): slide-up + fade, 200ms in, auto-dismiss fade-out 150ms.
- **Explicitly avoid**: parallax, spring/bounce easing, hover-triggered chart replays, looping ambient animation, confetti — none of that fits an ops tool even though it's a legitimate look elsewhere.

Respect `prefers-reduced-motion`: fall back to opacity-only transitions, no translate/scale/draw-in.

---

## 6. Applying this to the PRD's screens

| PRD requirement | Component to use |
|---|---|
| Login (role-based) | Centered card, `--bg-card`, app mark top, role auto-detected after auth — no role picker needed if JWT carries it |
| Dashboard home | Glass KPI row (Reference 2) + standard cards below (Reference 1): recent challans table, low-stock list, today's follow-ups |
| Customer CRM list/search | Table pattern, status pill = Lead/Active/Inactive, search bar in top bar filters table |
| Customer detail page | Header card (name, business, GST) + tabbed sections (Details / Follow-ups / Orders), follow-up notes as planner-list pattern |
| Product & Inventory list | Table pattern, low-stock rows get a `--status-warning` left-border accent (4px) instead of a full pill, to scan quickly |
| Stock movement log | Reverse-chronological list, IN = green + icon, OUT = red/orange + icon, same row pattern as planner list |
| Sales challan builder | Form pattern with multi-product line-item mini-cards + running total footer bar (sticky bottom, `--bg-card`, elevated shadow) |
| Challan status | Draft/Confirmed/Cancelled pill, insufficient-stock error surfaces as inline red text under the offending line item, not a generic toast |

---

## 7. Do / don't

**Do**: single accent hue, off-black surfaces, generous 16px radii, restrained 150–250ms transitions, semantic-only status color, uppercase eyebrow labels, right-aligned "Manage →" links.

**Don't**: multiple accent colors, pure black/white, drop shadows heavier than a subtle ambient glow, decorative gradients outside the four KPI tiles, animated icons/emoji, more than one chart style drawing-in at once, bouncy easing anywhere.