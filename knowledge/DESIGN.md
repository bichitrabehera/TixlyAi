# Design System

Dark-first "founder war-room / blueprint desk" system. Interfaces should feel like an editorial planning surface: dramatic, tactical, precise, highly usable.

## Stack

- **Framework:** Next.js App Router + React + TypeScript
- **Styling:** Tailwind CSS v4 via `@theme inline` in `app/globals.css`
- **Components:** shadcn-style primitives in `components/ui`
- **Icons:** Lucide React (`developer-icons` for brand icons like Slack, `react-icons` for Linear)
- **Fonts:** IBM Plex Sans (body), Fraunces (display), IBM Plex Mono (technical labels/code)
- **Dark mode:** `next-themes`, class-based, dark default
- **Utilities:** `cn()` from `@/lib/utils`

## Visual direction

Monochrome with green as the app accent. A calm, focused utility — not a rainbow dashboard.

- Neutral ink surfaces (`--bg`, `--text`, `--card`, `--border`) with green (`--primary`) as the app-wide accent.
- Green is reserved for primary actions, focus rings, connected/active states, and success badges. The generate workspace (`/dashboard/generate`) uses the same green throughout — there is no second accent (an earlier indigo exception has been removed).
- Never introduce other accent colors (orange, amber, teal, violet, purple — amber only where noted below).
- Destructive actions and errors use `--destructive` red, sparingly, only where the action permanently removes data/secrets.
- Prefer flat, precise surfaces over decorative gradients. Shadows stay subtle.
- Avoid generic purple/white gradients, unfinished-looking gray panels, and default dashboards.

> **Exception:** warn-level AI guardrail notices may use a muted amber tint. This is the only place amber appears, and only because it signals "review needed," not a brand color.

## Tokens

All semantic tokens live in `app/globals.css`, referenced as `var(--token)`.

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `background` (`--bg`) | `#ffffff` | `#000000` | Page canvas |
| `foreground` (`--text`) | `#0f172a` | `#fafafa` | Primary text |
| `muted` | `#64748b` | `#a1a1aa` | Supporting copy |
| `card` | `#f8fafc` | `#0a0a0a` | Panels and surfaces |
| `card-2` | `#f1f5f9` | `#111111` | Secondary surfaces |
| `border` | `#e2e8f0` | `#1a1a1a` | Panel and input borders |
| `primary` | `#1f883d` | `#22c55e` | THE single accent (light value chosen for ≥4.5:1 with `primary-foreground`) |
| `primary-hover` | `#15803d` | `#16a34a` | Primary action hover |
| `primary-foreground` | `#ffffff` | `#052e16` | Text on `primary` (dark uses a deep green ink for contrast) |
| `glow` | `rgba(34,197,94,0.14)` | `rgba(34,197,94,0.16)` | Subtle green glow |

Outside these tokens, use `green-*` only, plus the neutral family (`slate`/`zinc`/`neutral`) for monochrome surfaces.

## Typography

| Token | Font | Usage |
| --- | --- | --- |
| `--font-body` | IBM Plex Sans | Body, controls, forms |
| `--font-display-family` | Fraunces | Hero headings, card titles, empty states |
| `--font-code` | IBM Plex Mono | Model names, labels, code, technical metadata |

- Hero headings: `font-display`, very tight tracking, large scale (`text-5xl`–`text-8xl`).
- Card titles: `font-display text-xl font-bold tracking-tight`.
- Technical eyebrows: `.micro-label` — mono, uppercase, wide tracking.
- Body copy: `leading-7` or `leading-8`.

## Utilities

Defined in `app/globals.css`:

- `.micro-label` — technical uppercase label.
- `.shimmer-text` / `.shimmer-block` — green-shimmer loading states (AI running).
- `.animate-fade-up` — small fade-up entrance for newly rendered content.
- `.animate-pulse-ring` — green pulse ring for the active agent step.

## AI elements

Reusable AI-specific components live in `components/ai/`:

- **`AgentRunTimeline`** — the live step list (pending → running → done/error) shown while the agent runs. Active step uses `.animate-pulse-ring` + `.shimmer-text`.
- **`ShimmerText` / `ShimmerBlock`** — loading surfaces.
- **`GuardrailNotice`** / **`NeedsReviewBanner`** — guardrail messaging.
- **`Spinner`** (`components/ui/spinner.tsx`) — the one spinner primitive.

**Navigation.** The authenticated shell (`components/dashboard/DashboardShell.tsx`) is a sticky `h-14` TopBar over a scrolling `<main>`. The brand links to `/dashboard`; **`TopNav.tsx`** renders the primary tabs (Overview · Generate · History) from `NAV_PRIMARY` in `lib/routes.ts` and marks the active route with `aria-current`. On the right sit a ⌘K trigger, the Settings gear, and the avatar menu. **`CommandPalette.tsx`** is the global ⌘K/Ctrl-K jump-to (Navigate / Actions / Recent tickets), built from the shared `Dialog` + `Input` — no `cmdk` dependency; its rows only mount while the palette is open, so query/selection state resets on each launch. Never hardcode route strings: import `ROUTES` from `lib/routes.ts`.

The generate workspace is a **high-density, keyboard-first split screen** composed by **`components/generate/GenerateWorkspace.tsx`**. It is full-bleed — it cancels the dashboard shell's horizontal padding (`-mx-4 md:-mx-6`) and fills the viewport below the TopBar (`h-[calc(100dvh-3.5rem)] overflow-hidden`) so the page itself never scrolls; each pane scrolls independently. On `lg` and up the left pane is a fixed **`w-[440px]`** column with a `border-r` divider; below `lg` the panes swap full-width via the hook's `screen` state. The right column also owns a shared status strip (error / guardrail) above the output.

**Left pane — `components/generate/InputScreen.tsx`:** a `bg-card` column with an `h-12` header (green logo badge + `Ticket Draft / Source Input` breadcrumb + a Ready/Awaiting status pill) and a pinned footer showing the active model (`PROVIDER_MODEL_LABEL`) and the `Generate` CTA (with a `⌘↵` kbd hint) or `Stop`. The single scroll region is a `p-4 space-y-5` stack ordered **Source Capture → Issue classification → Output verbosity → Additional Context → Advanced Options**. The capture card, classification, verbosity, and advanced sections live in **`components/dashboard/{ScreenshotDropzone,TicketTypeSelector,OutputPreferences,AdvancedOptions}.tsx`**; classification and verbosity use the shared **`components/shared/SegmentedControl.tsx`** (a `bg-secondary` track with a `bg-background` active pill — not the old pill group), and advanced options are a collapsible (`Radix` collapsible) group of priority override + output toggles. There is no model picker: the model is fixed (locked to `gpt-4o`).

**Right pane — `components/generate/OutputScreen.tsx`:** an `h-12` command bar over a scrolling document canvas (`max-w-4xl px-12 py-8`). The bar holds the `TKT-XXXX / component` mono breadcrumb plus the toolbar (`Copy MD`, `Download`, `Edit`, Slack/Linear when connected, `Regenerate`) behind a divider and the primary export CTA (`Create in Linear ↗`, or `Connect Linear` which opens Settings). The document is Linear-style, not cards: `text-xl` title → a property strip of status/priority/type/component pills → uppercase micro-heading sections (Summary with inline mono code badges, Expected vs Actual as green/red tinted diff cards, numbered steps with mono badges, Environment mono strip, Notes muted callout). It also renders the loading timeline (`AgentRunTimeline`), the non-JSON fallback, an inline edit textarea, and a `Regenerate` confirm dialog when edits exist.

**Settings is a dialog, not a page.** One `components/settings/SettingsDialog.tsx` (opened by the gear in the TopBar, the account dropdown, or `NoAiKeyCard`) stacks `SectionCard`s — AI keys (`ApiKeysPanel`), Integrations (`IntegrationsPanel`), Notifications (`NotificationsSection`), Account (`AccountSection`) — in a single scroll body. Its open state lives in `SettingsDialogProvider` (a `useSettingsDialog()` context, like `WorkspaceBridge`) so any component can open it; the provider also watches `?settings=` in the URL for deep links (`/dashboard/generate?settings=ai`). Key changes broadcast on the `tixly:keys-changed` window event (`lib/keys-events.ts`) so `useTicketGeneration` re-checks its key gate.

Motion rules for AI states: content appears via `.animate-fade-up` (350ms ease-out), the running step shimmers, completed steps settle instantly. No decorative loops beyond the active step and shimmer.

## Components

### Cards

Rounded, precise surfaces with a visible border and the `--card` background. Nested item cards use `bg-background/30`, borders, and a subtle inner shadow.

### Buttons

shadcn `Button`. Default = green; outline/ghost = monochrome; `destructive` = permanent remove/delete only. Primary CTAs may use a subtle green glow shadow (`hover:shadow-[0_0_28px_var(--glow)]`). The Generate Ticket CTA uses default primary green like every other CTA.

### Inputs

shadcn `Input`/`Textarea`: rounded, translucent backgrounds, green focus ring.

### Badges

shadcn `Badge`. Connected/active/success = green; destructive = red; neutral = `secondary`/`outline`. Mono, uppercase, wide-tracked pills.

## Layout

Centered, readable workspace:

```tsx
<main className="min-h-screen flex-1 overflow-hidden">
  <div className="container mx-auto max-w-[1500px] px-4 py-8 lg:py-12">
```

Mobile stays single-column (the generate workspace swaps panes full-width). The generate input pane pins its `Generate` CTA in a footer bar (`border-t`, `bg-background`) rather than floating it.

## Interaction

- Hover lift: `hover:-translate-y-0.5`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (buttons, inputs, textareas, switches, toggles, selects)
- Disabled: `disabled:pointer-events-none disabled:opacity-50`
- Keep motion subtle and purposeful; no decorative loops that distract from the task.

## Accessibility

- Preserve visible focus rings on all interactive controls.
- Keep text contrast high on translucent panels.
- Provide text representations for generated data.
- Controls must remain usable on mobile, especially add/remove/edit actions.
