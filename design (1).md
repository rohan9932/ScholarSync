# Scholar Sync Design System

Reverse-engineered from live screenshots (dashboard, routes, pickup, and landing page) for use as a design reference in a React + Tailwind CSS rebuild.

---

## 1. Overall Feel

- **Dark-mode-first** app — near-black background with a subtle green tint, not pure black/gray.
- **Single accent color**: a clean emerald/green used for primary actions, active states, and highlighted text — used sparingly so it stays punchy.
- **Flat, card-based UI** — soft rounded corners, thin/no borders, very light elevation (no heavy shadows).
- **Confident, bold typography** — large tight-tracked headlines, small uppercase letter-spaced eyebrow labels.
- Icons throughout are simple line icons (Lucide-style):  flag, bell, calendar, info, sun/moon.

---

## 2. Color Palette

| Token | Hex (approx) | Usage |
|---|---|---|
| `bg-base` | `#0A0F0C` | App background (body) |
| `bg-surface` | `#101712` | Card / panel background (green-black tint) |
| `bg-surface-alt` | `#121A20` | Slightly blue-gray surface for inputs, detail panels, inactive/disabled sub-buttons |
| `bg-surface-raised` | `#161F1A` | Sidebar active nav item, hover states |
| `border-subtle` | `rgba(255,255,255,0.06)` | Card borders, dividers |
| `border-accent` | `rgba(34,197,94,0.25)` | Border on highlighted/active cards |
| `accent-500` (primary green) | `#16A34A` | Solid buttons, active badges, primary CTAs |
| `accent-400` | `#22C55E` / `#4ADE80` | Icon accents, eyebrow labels, links, "Active" text |
| `accent-300` | `#86EFAC` | Subtle glows / decorative dots |
| `text-primary` | `#FFFFFF` / `#F5F7F5` | Headings, high-emphasis text |
| `text-secondary` | `#9CA3AF` | Body copy, descriptions |
| `text-muted` | `#6B7280` | Placeholder text, timestamps, disabled labels |
| `status-success` | `#22C55E` (translucent bg `rgba(34,197,94,0.15)`) | "Running" / "Active" pills |
| `status-warning` | `#F59E0B` (translucent bg `rgba(245,158,11,0.15)`) | "Boarding" pill |
| `status-neutral` | `#9CA3AF` (translucent bg `rgba(156,163,175,0.15)`) | "Scheduled" pill |
| `status-info` | `#3B82F6` | Info icon badges, "5 min ago" links |

### Tailwind config extension

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0A0F0C',
        surface: '#101712',
        'surface-alt': '#121A20',
        'surface-raised': '#161F1A',
        accent: {
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
      },
      borderRadius: {
        card: '16px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
};
```

---

## 3. Typography

- **Font family**: Inter (or a similar geometric grotesque — matches Vercel/Geist-style default). Fallback: `system-ui, sans-serif`.
- **Headings**: bold (700–800), tight line-height, tight/negative letter-spacing on large hero text.
  - Hero (landing) headline: ~64px, `font-weight: 800`, `line-height: 1.05`.
  - Page title (dashboard sections, e.g. "Select Your Route"): ~32–36px, `font-weight: 700`.
  - Card title (e.g. route name "AUST Campus → Gulshan Express"): ~18–20px, `font-weight: 700`.
- **Eyebrow / section label** (e.g. "TRAVEL PREFERENCES", "ROUTE DETAILS", "BOARDING PREFERENCES"):
  - Uppercase, `font-size: 11–12px`, `font-weight: 600–700`, `letter-spacing: 0.08em`, color `accent-400`.
- **Body text**: `14–15px`, `font-weight: 400`, color `text-secondary`.
- **Small meta text** (timestamps, IDs, stat labels): `12–13px`, color `text-muted`.

---

## 4. Layout Structure

### App shell (dashboard)
- **Left sidebar**, fixed width ~260px, `bg-base` (same as page, no separate panel color — just a right border `border-subtle`).
  - Top: logo block — green rounded-square icon tile (bus icon) + app name (bold white) / subtitle "Student App" (gray, small).
  - Nav list: icon + label rows, generous vertical padding, `rounded-lg`.
    - **Active item**: `bg-surface-raised` background, green left accent implied by icon/text turning `accent-400`, full-width rounded pill/rect highlight.
    - **Inactive item**: transparent, `text-secondary`, icon + label in gray.
  - Bottom: user profile card, pinned to bottom, `bg-surface` rounded card:
    - Circular avatar (green bg, white initial letter)
    - Name (bold white) + "Profile" link (green, right-aligned)
    - Role pill (small, green outline/bg, uppercase e.g. "STUDENT")
    - ID text + status dot (green dot + "active" text)

- **Top bar** (inside main content area): breadcrumb-style label top-left (gray, e.g. "Student App"), circular icon button top-right (sun icon for theme toggle) on `bg-surface-raised`.

- **Main content**: generous padding (~32px), max content width, vertical rhythm of: eyebrow label → H1 → description → content grid.

### Landing page
- **Floating pill navbar**: centered, rounded-full container, `bg-surface` with border, containing:
  - Left: logo (white circular badge + bus icon) + wordmark
  - Center: nav links (Home, Routes, Map, Notices) — active link has a filled dark pill background
  - Right: theme toggle circle + solid white "Open App" pill button (inverted — white bg, dark text, stands out from the green CTA pattern)
- **Hero section**: centered text column.
  - Small pill badge above headline ("University bus tracking for AUST") — dark bg, thin border, small text.
  - Massive bold white headline, 3 lines, centered.
  - Muted gray subtext paragraph below, centered, max-width constrained.
  - CTA row: primary solid green pill button with trailing arrow icon ("View Routes →"), secondary dark pill button with icon ("See Trips").
- **Floating preview cards** beneath the hero, partially cropped at viewport edge — decorative product screenshots peeking up (parallax/hint-of-content style), with small floating badge chips ("Smart campus route", "Next trip · 08 min").

---

## 5. Components

### Buttons
- **Primary**: solid `accent-600` (`#16A34A`) background, white bold text, `rounded-lg` (dashboard) or `rounded-full` (landing page), padding ~`12px 20px`. No visible border. Slight brightness-up on hover.
- **Secondary / outline**: `bg-surface-alt` or transparent with `border-subtle`, white/gray text, same radius as context.
- **Disabled / inactive**: muted text (`text-muted`) on `bg-surface-alt`, no hover affordance (e.g. "Add secondary" with a `+` icon).
- **Icon-only circular button** (theme toggle): `bg-surface-raised`, circular, centered icon, ~40px diameter.

### Badges / Pills
- **Status pill** (rounded-full, small, bold uppercase-ish text):
  - Success/Active: translucent green bg + green text (or solid green bg + white text for the strongest "Active" tag).
  - Warning: translucent amber bg + amber text ("Boarding").
  - Neutral: translucent gray bg + gray text ("Scheduled").
- **Feature pill** ("✓ Primary"): white/light background, green check icon + green text — inverted from the rest of the palette to stand out as a special marker.
- **Info tag** (e.g. next to "Latest notice"): light background, dark/blue text, rounded-full, small.

### Cards
- Base card: `bg-surface`, `rounded-2xl` (~16px), `border-subtle` 1px border, padding ~20–24px.
- **Route card**: title row (route name + status pills right-aligned), a sub-row info bar (`bg-surface-alt`, rounded, icon + text — e.g. "Bus assignment pending"), a stats row (icon + count, e.g. "0 stops"), and two action buttons at the bottom.
- **Detail/side panel card**: same radius, uses `bg-surface-alt` (cooler tone) to visually separate secondary panels from primary content cards.
- **Quick action tile** (dashboard grid): icon in a small rounded square (`bg-surface-alt` or dark green tint), bold white title, gray subtitle beneath. Subtle decorative dots in the background (low-opacity green).
- **Notice / alert card**: icon in circular badge (white bg, colored icon) + bold title + "Info" tag + description + green timestamp link ("5 min ago").
- **Empty state card**: centered content — icon in a soft rounded square, bold heading, muted description, single CTA button below.

### Inputs
- Search bar: full-width, `bg-surface-alt`, `rounded-xl`, left-aligned search icon (green), muted placeholder text, no visible border or a very faint one.

### Stat chip (small inline stat, e.g. "4 stops", "55 min time", "8 min next")
- Small `bg-surface-alt` rounded box, icon (colored by type: green location pin, green clock, amber clock) + number (bold white) + label (gray, small, beneath or inline).

---

## 6. Spacing & Radius Scale

| Token | Value |
|---|---|
| Card radius | 16px (`rounded-2xl`) |
| Button radius (dashboard) | 10–12px (`rounded-lg`) |
| Button/pill radius (landing) | 9999px (`rounded-full`) |
| Card padding | 20–24px |
| Grid gap (cards) | 16–24px |
| Sidebar width | ~260px |
| Section vertical rhythm | 8px (label → title) / 12px (title → description) / 24–32px (description → content) |

---

## 7. Iconography

Simple 1.5–2px stroke line icons (Lucide-style), used consistently at ~18–20px in nav/cards, ~24px in tiles:
`bus`, `map`, `route` (git-branch style), `navigation`/`flag`, `bell`, `calendar`, `search`, `map-pin`, `clock`, `info`, `sun`/`moon`, `chevron/arrow-up-right`.

Icons generally inherit `accent-400` green when representing primary/active concepts, and `text-muted` gray when neutral/decorative.

---

## 8. Notes for React Implementation

- Build a small design-token file (`theme.ts` or CSS variables in `:root`) mirroring the palette above so components reference tokens, not raw hex values.
- Recommend component set: `Sidebar`, `TopBar`, `Button` (variant: primary/secondary/ghost, shape: pill/rounded), `Badge` (variant: success/warning/neutral/feature), `Card`, `StatChip`, `EmptyState`, `SearchInput`, `NoticeCard`.
- Since the app implies a light/dark toggle (sun icon), structure colors as CSS variables under a `.dark` class (default) and define a light equivalent later rather than hardcoding dark colors.
- Landing page and in-app dashboard share the same token set but landing page uses fully pill-shaped (`rounded-full`) buttons/nav while the dashboard uses `rounded-lg`/`rounded-2xl` — keep this as a deliberate "marketing vs. product" radius distinction.
