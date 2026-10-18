# Design System

Light-first "Spaceform warm-stone" system with a real dark theme: an inset-canvas shell with tactile controls on warm stone surfaces. Calm, editorial, precise.

## Stack

- **Framework:** Next.js App Router + React + TypeScript
- **Styling:** Tailwind CSS v4 via `@theme inline` in `app/globals.css`
- **Components:** shadcn-style primitives in `components/ui`
- **Icons:** Lucide React (`developer-icons` for brand icons like Slack, `react-icons` for Linear). Nav rows are text-only — no icons in the sidebar.
- **Fonts:** IBM Plex Sans (body), Fraunces (display), IBM Plex Mono (technical labels/code)
- **Dark mode:** token-driven and fully supported. Components use semantic utility classes (`bg-shell`, `text-ink`, `border-hairline`, …), never raw hexes, so both themes stay in sync. `components/ThemeProvider.tsx` toggles `.dark` on `<html>` and sets `color-scheme`; the toggle lives in the sidebar. `app/dashboard/layout.tsx` runs a no-flash inline script that applies `localStorage['theme']` (key `STORAGE_THEME_KEY` in `lib/constants/index.ts`) before paint. Only the authenticated shell is themed; marketing/auth inherit the light palette.
- **Utilities:** `cn()` from `@/lib/utils`

## Visual direction

Warm-stone monochrome with a single deep-green accent. Depth comes from the canvas ladder (shell → inset frame → panel), hairline borders, and one tactile shadow — not from extra accent colors.

- **Do not hard-code the warm hexes.** They live once as tokens in `app/globals.css`; use the generated utility classes. Prefer tokens over literals for all new UI.
- **Canvas ladder:** `bg-shell` → `bg-canvas` (the ticket document / inset frame) → `bg-card` / `bg-panel-soft` (secondary panels).
- **Elevated controls** (buttons, inputs, segmented pills): `bg-control` + `border-control-border` + `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`.
- **Green** (`text-primary` / `bg-primary`, hover `hover:bg-primary-hover`) is the one accent and the action color: primary CTAs, focus rings, the ready status dot, and success/connected states. It flips to a lighter green in dark mode. Never neon greens.
- **Text ramp:** `text-ink` / `text-muted` / `text-ink-3` (primary / secondary / faint); `text-prose` for body copy.
- Never introduce other accent hues. Destructive red is used sparingly (bug dots, error alerts, disconnect). Amber is only the brand mark.
- Brand mark: amber squircle `bg-brand` with `border-brand-border` — the single warm color moment; the logo tile is `bg-brand-tile`.
- Fixed literals that intentionally do **not** theme: the screenshot preview backdrop (`#141413`, ScreenshotDropzone) and the Slack `#4A154B` / Linear `#5E6AD2` brand tiles.

## Tokens

Semantic tokens live in `app/globals.css`. `:root` is the warm-stone light palette; `.dark` is the warm dark-stone palette. Consume them through the utility classes below, not the raw hexes.

| Token | Light | Dark | Utility / usage |
| --- | --- | --- | --- |
| `shell` | `#EEEDE8` | `#14120F` | `bg-shell` — viewport / sidebar |
| `canvas` | `#FAF9F5` | `#1B1915` | `bg-canvas` — inset frame / document |
| `card` (`panel`) | `#F3F2ED` | `#231F1A` | `bg-card` / `bg-panel` — secondary panels |
| `panel-soft` | `card` 55% | `card` 55% | `bg-panel-soft` — tinted panels |
| `control` | `#FFFFFF` | `#2A251F` | `bg-control` — elevated controls |
| `control-border` | `#E3E3E3` | `#3A342B` | `border-control-border` |
| `border` (`hairline`) | `#E6E6E6` | `#302B24` | `border-hairline` / `divide-hairline` |
| `dash` | `#D6D6D6` | `#4A4338` | `border-dash` — dashed boxes |
| `track` | `#ECECEC` | `#2E2922` | `bg-track` — segmented track |
| `ink` (`foreground`) | `#181816` | `#F3EFE4` | `text-ink` / `bg-ink` (inverted tile) |
| `ink-2` (`muted`) | `#686762` | `#B0A995` | `text-muted` — supporting copy |
| `ink-3` | `#9B9992` | `#7A7464` | `text-ink-3` — faint text / placeholder |
| `prose` | `#2C2C2A` | `#E2DDCF` | `text-prose` — body prose |
| `primary` | `#2D6A4F` | `#6BB88A` | `bg-primary` / `text-primary` / `ring-primary` (hover `hover:bg-primary-hover`) |
| `primary-foreground` | `#FFFFFF` | `#0D1A12` | `text-primary-foreground` — text on primary |
| `nav-active` / `nav-active-fg` | `#E2E5F3` / `#252B42` | `#25382D` / `#CFE8D9` | active nav row |
| `brand` / `brand-border` / `brand-tile` | `#F3D060` / `#E0BE4B` / `#4D8871` | `#F3D060` / `#C9A63A` / `#3F7A62` | brand squircle + logo tile |
| `destructive` | `#DC2626` | `#E5484D` | errors / permanent removal |

Legacy aliases (`--background`, `--text`, `--muted`, `--card-2`, `--popover`, `--input`, `--ring`, …) resolve through the tokens above so shadcn primitives keep working in both themes.

## Typography

| Token | Font | Usage |
| --- | --- | --- |
| `--font-body` | IBM Plex Sans | Body, controls, forms |
| `--font-display-family` | Fraunces | Hero headings only |
| `--font-code` | IBM Plex Mono | Labels, metadata, code |

- Document title: `text-xl font-semibold tracking-tight text-ink`.
- Section headings: `text-xs font-semibold text-ink` — sentence case, not uppercase.
- Metadata typography: bold value + muted label ("High severity", "Production env").
- Mono for technical fragments: component pills, environment blocks, step numbers, ticket IDs.
- `.micro-label` — mono, uppercase, wide tracking (run progress labels).

## Utilities

Defined in `app/globals.css`:

- `.micro-label` — technical uppercase label.
- `.shimmer-text` / `.shimmer-block` — themed shimmer loading states.
- `.animate-fade-up` — small fade-up entrance for newly rendered content.
- `.animate-pulse-ring` — pulse ring for the active agent step.

## Layout & shell

The authenticated shell (`components/dashboard/DashboardShell.tsx`) is an **inset-canvas** frame:

- Viewport `bg-shell` (`select-none`).
- **`AppSidebar.tsx`** (`w-64 lg:w-74`, collapsible via `PanelLeft`; on `<lg` it renders as an overlay drawer with a backdrop): brand squircle + "Tixly", ⌘K search button, text-only nav rows (Overview · Generate · History · Settings), Integrations + Help & Support links, avatar/email + three-dot menu (Manage account, theme, logout). Active route: `bg-nav-active text-nav-active-fg`.
- Main column is an inset frame: `h-11` breadcrumb bar (`border-hairline`, Tixly + pathname-derived label) with a right-side slot for page actions, then `main` with `px-4 py-4 overflow-y-auto`. The frame sits on the shell with padding, so the stone canvas stays visible around it.
- **`TopBarSlot.tsx`** — `TopBarSlotProvider` + `useTopBarSlot()`; pages portal their actions (status pill, Copy MD, Edit, Push to Linear) into the breadcrumb bar. Providers wrap as Workspace → Settings → CommandPalette → TopBarSlot.
- **`CommandPalette.tsx`** — global ⌘K/Ctrl-K jump-to, built from shared `Dialog` + `Input` (no `cmdk`). Never hardcode route strings: import `ROUTES` from `lib/routes.ts`.

## Marketing surface

The public landing and auth pages share the app's tokens — there is no separate palette.

- **`app/page.tsx`** sits on `bg-shell`; sections are `border-hairline bg-canvas` cards with `text-ink` headings and `text-muted` copy.
- **`Header.tsx`** — sticky pill: `border-hairline bg-canvas/70 backdrop-blur`, `bg-brand-tile` logo tile, primary Buttons.
- **`Hero.tsx`** — `bg-primary/10` badge, `text-ink` headline with a `text-primary` highlight, primary/tactile CTAs, `border-hairline` banner frame + integration cards.
- `HowItWorks` / `UseCases` / `Features` / `CallToAction` / `Footer` / `TixlyCard` — all token-based (`border-hairline`, `bg-canvas`, `bg-panel`, `text-ink`, `text-muted`, `bg-primary`). The old mint `#ECFFF1` background and orange Product Hunt button are gone.
- Auth pages (`app/(auth)/layout.tsx`, `/login`, `/signup`) and `/docs`, `/terms`, `/privacy` sit on `bg-shell`.

## Generate workspace

**`components/generate/GenerateWorkspace.tsx`** is a full-bleed split screen that cancels the shell padding (`-mx-4 -my-4 h-[calc(100dvh-4rem)]`) so the page never scrolls; each pane scrolls independently.

- **Left config pane (`w-[430px]`, `bg-panel-soft`)** — `components/generate/InputScreen.tsx`: a scroll stack (Source Capture → Classification → Verbosity → Additional Context → Advanced Options, components in `components/dashboard/`) over a pinned `border-t border-hairline bg-canvas` footer with a `1 capture ready` metric and the primary `+ Generate Ticket` CTA (`bg-primary text-primary-foreground hover:bg-primary-hover`, or tactile Stop). Classification/verbosity use **`components/shared/SegmentedControl.tsx`** (track `bg-track`, active pill `bg-control` with hairline + shadow). The screenshot dropzone floats its Replace/× buttons and shows the preview on a fixed ink `#141413` backdrop.
- **Right document pane (`bg-canvas`)** — `components/generate/OutputScreen.tsx`: the ticket as an editorial document (`max-w-4xl px-10 py-8`), not cards. Title → metadata strip (type with red/gray dot, `High severity`, `Production env`, mono component pill, right-aligned tactile **Edit ticket** / **Regenerate** buttons) → sections: Executive Summary (with inline mono code badges), Expected/Actual as `bg-panel-soft` cards, numbered steps in a `bg-control divide-y divide-hairline` container with mono index badges, supporting prose sections, and a `border-dashed border-dash` Environment & Notes footer box (mono env, sans notes). Copy MD / Edit / Push to Linear live in the top bar via the slot; edit mode is an inline mono textarea with a Done button, and a Regenerate confirm dialog protects unsaved edits. The loading timeline (`AgentRunTimeline`) and non-JSON fallback render here too.
- Below `lg` the panes swap full-width via the hook's `screen` state. Status/error/guardrail strip renders between the bar and the document.

**Settings is a page, not a dialog.** `/dashboard/settings` (`components/settings/SettingsPage.tsx`) stacks SectionCards (AI keys, Integrations, Notifications, Account) in a `max-w-2xl` scroll column; `?section=ai|integrations|…` scrolls to a section. Integrations rows are `bg-control` cards with a Connected badge and Connect (primary) / Disconnect (destructive text) buttons. The header states the BYOK model plainly: no subscription, no paid tier. Key changes broadcast on `tixly:keys-changed` (`lib/keys-events.ts`).

Motion rules for AI states: content appears via `.animate-fade-up` (350ms ease-out), the running step shimmers, completed steps settle instantly. No decorative loops.

## Components

### Cards & panels
`rounded-xl border border-hairline bg-panel-soft` (tinted) or `bg-control` for elevated containers; `border-dashed border-dash` for secondary/footer boxes.

### Buttons
Primary CTA = `bg-primary text-primary-foreground hover:bg-primary-hover` + tactile shadow. Secondary/tactile = `bg-control border-control-border shadow hover:bg-panel`. The inverted ink fill (`bg-ink text-canvas`) is for non-interactive tiles only (e.g. the Features icon tile). Destructive = red, permanent remove/delete only.

### Inputs
shadcn `Input` / `Textarea`: `bg-control`, `border-control-border`, tactile bottom shadow, placeholder `placeholder:text-ink-3`, focus border/ring.

### Badges
shadcn `Badge`. Mono technical pills on `bg-card` with `border-control-border`; brand/marketing pills on `bg-brand`.

## Interaction

- Hover: background tint shifts (`hover:bg-panel`); no lift.
- Focus: `focus-visible:ring-1 focus-visible:ring-ink` on raw tactile buttons; `ring-ring` token ring on shadcn primitives.
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`.
- Keep motion subtle and purposeful.

## Accessibility

- Preserve visible focus rings on all interactive controls.
- Keep contrast high in **both** themes: `text-ink` on `bg-shell` / `bg-canvas`; `text-muted` on `bg-canvas`.
- Ticket text must stay selectable: `select-none` on the viewport root, `select-text` on the inset frame.
- Provide text representations for generated data; controls must remain usable on mobile (panes swap full-width).
