# Design System

This project uses a dark-first "founder war-room / blueprint desk" visual system. Interfaces should feel like an editorial planning surface: dramatic, tactical, precise, and highly usable.

---

## Stack

- **Framework:** Next.js App Router + React + TypeScript
- **Styling:** Tailwind CSS v4 via `@theme inline` in `app/globals.css`
- **Components:** shadcn-style primitives in `components/ui`
- **Icons:** Lucide React
- **Fonts:** IBM Plex Sans for UI, Fraunces for display headings, IBM Plex Mono for technical labels/code
- **Dark mode:** `next-themes`, class-based, dark default
- **Utilities:** `cn()` from `@/lib/utils`

---

## Visual Direction

Monochrome with a single green accent. The app is a calm, focused utility — not a rainbow dashboard.

- Neutral ink surfaces (`--bg`, `--text`, `--card`, `--border`) with **one** accent color: green (`--primary`).
- Green is reserved for primary actions, focus rings, connected/active states, and success badges.
- Never introduce a second accent color (no blue, red, orange, amber, teal, violet, or purple). Error/destructive styling must stay monochrome (neutral borders + muted text), not red.
- Prefer flat, precise surfaces over decorative gradients. Shadows stay subtle.
- Make controls feel tactile: rounded corners, clear hover states, and visible green focus rings.
- Avoid generic purple/white gradients, flat gray panels that feel unfinished, and default-looking dashboards.

---

## Tokens

All semantic tokens live in `app/globals.css` and are referenced as `var(--token)`.

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `background` (`--bg`) | `#ffffff` | `#000000` | Page canvas |
| `foreground` (`--text`) | `#0f172a` | `#fafafa` | Primary text |
| `muted` | `#64748b` | `#a1a1aa` | Supporting copy |
| `card` | `#f8fafc` | `#0a0a0a` | Panels and surfaces |
| `card-2` | `#f1f5f9` | `#111111` | Secondary surfaces |
| `border` | `#e2e8f0` | `#1a1a1a` | Panel and input borders |
| `primary` | `#16a34a` | `#22c55e` | THE single accent: actions, focus, active states |
| `primary-hover` | `#15803d` | `#16a34a` | Primary action hover |
| `glow` | `rgba(34,197,94,0.14)` | `rgba(34,197,94,0.16)` | Subtle green glow |

When a Tailwind color utility is needed outside these tokens, use `green-*` only — plus the neutral family (`slate`/`zinc`/`neutral`) for monochrome surfaces.

---

## Typography

| Token | Font | Usage |
| --- | --- | --- |
| `--font-body` | IBM Plex Sans | Body text, controls, forms |
| `--font-display-family` | Fraunces | Hero headings, card titles, empty states |
| `--font-code` | IBM Plex Mono | Model names, labels, code blocks, technical metadata |

Guidelines:

- Hero headings use `font-display`, very tight tracking, and large scale (`text-5xl` to `text-8xl`).
- Card titles use `font-display text-xl font-bold tracking-tight`.
- Technical eyebrows use `.micro-label`: mono, uppercase, wide tracking.
- Body copy should stay readable with `leading-7` or `leading-8`.

---

## Core Utilities

Defined in `app/globals.css`:

- `.micro-label`: technical uppercase label style.

---

## Components

### Cards

Cards are rounded, precise surfaces with a visible border and the `--card` background.

Use:

```tsx
<Card className="overflow-hidden">
```

Nested item cards should use `bg-background/30`, borders, and subtle inner shadow.

### Buttons

Use the shadcn `Button` primitive. Default buttons are green (`--primary`); outline/ghost buttons are monochrome. Destructive actions use the neutral outline style — never red.

### Inputs

Inputs and textareas use the shadcn `Input`/`Textarea` primitives: rounded, translucent backgrounds, and a green focus ring.

### Badges

Use the shadcn `Badge` primitive. Connected/active/success states use the green `success` variant; neutral states use `secondary`/`outline`. Badges are mono, uppercase, wide-tracked pills.

### Graphs

Graph containers use monochrome surfaces with green highlights only.

---

## Layout

Use a centered, readable workspace:

```tsx
<main className="min-h-screen flex-1 overflow-hidden">
  <div className="container mx-auto max-w-[1500px] px-4 py-8 lg:py-12">
```

Mobile remains single-column with no sticky behavior.

---

## Interaction

- Hover lift: `hover:-translate-y-0.5`
- Focus: `focus-visible:ring-[var(--primary)]/40 focus-visible:ring-1`
- Disabled: `disabled:pointer-events-none disabled:opacity-50`
- Keep motion subtle and purposeful; avoid decorative loops that distract from the task.

---

## Accessibility

- Preserve visible focus rings on all interactive controls.
- Keep text contrast high on translucent panels.
- Provide text representations for graphs and generated data.
- Controls must remain usable on mobile, especially add/remove/edit actions.
