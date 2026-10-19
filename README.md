<p align="center">
  <img alt="Tixly" src="public/next.svg" height="0" style="display:none">
</p>

<h1 align="center">Tixly</h1>

<p align="center">
  <strong>Turn any screenshot into a structured, actionable ticket in seconds.</strong><br>
  Free forever. Bring your own AI key — OpenAI, Anthropic, or OpenRouter.
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-how-it-works">How it works</a> ·
  <a href="#-getting-started">Getting started</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-scripts">Scripts</a> ·
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs&labelColor=1e1e2e&color=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&labelColor=1e1e2e&color=3178C6">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&labelColor=1e1e2e&color=61DAFB">
  <img alt="AI: BYOK" src="https://img.shields.io/badge/AI-BYOK-412991?style=flat-square&labelColor=1e1e2e&color=412991">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&labelColor=1e1e2e&color=4169E1">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=1e1e2e&color=blue">
</p>

---

## What is Tixly?

Tixly is a **screenshot → structured ticket machine**. Drag in a screenshot, optionally paste OCR text or a sentence of context, and Tixly returns a complete ticket in ~5 seconds:

- **Title** — clear, specific summary
- **Description** — full explanation with inline code references
- **Priority** — auto-assessed severity (Critical / High / Medium / Low)
- **Reproduction steps** — numbered, concrete walkthrough
- **Expected vs Actual** — side-by-side comparison
- **Environment** — browser, OS, and contextual details

When the model isn't confident, it says so (`needsHumanReview`) instead of hallucinating a clean-sounding ticket.

**Who it's for:** developers, QA engineers, PMs, and on-call folks who are tired of retyping bugs into Linear/Jira by hand.

### Why BYOK?

Tixly has **no subscription, no paid tier, and no credits**. You bring your own API key (OpenAI, Anthropic, or OpenRouter):

- Your key is encrypted at rest with **AES-256-GCM** and decrypted only server-side, per request, in memory. It is never logged and never sent to the client.
- Your data goes directly to the provider you chose — no markup, no middleman.
- Our costs and liability stay near zero, which is what keeps the product free.

### Features

| | |
|---|---|
| 📸 **Screenshot in** | Drag & drop, browse, or paste from clipboard (PNG, JPG, WEBP, HEIC — max 10 MB) |
| 🤖 **Vision analysis** | The model reads your screenshot directly — no brittle OCR pipeline in the path |
| ⚡ **Live agent stream** | Watch the run progress step by step (validate → analyze → tools → draft) as NDJSON frames |
| 🛡 **Guardrails** | Input/output guardrails, prompt-injection detection, PII masking, per-run model-call limits |
| 📋 **One-click out** | Copy ticket + screenshot as a single clipboard item |
| 💬 **Slack** | DM the ticket to yourself or a channel |
| 📌 **Linear** | Create a Linear issue from the generated ticket |
| 🕘 **History** | Every ticket is saved and re-openable with its screenshot |
| 🌗 **Dark mode** | Token-driven warm-stone palette in both light and dark |
| 🔍 **⌘K palette** | Global command palette for keyboard navigation |

---

## ✨ How it works

```
Screenshot + context
        │
        ▼
┌──────────────────────────────────────────────┐
│  POST /api/tickets  (NDJSON stream)          │
│  1. Clerk auth → rate limit → load AI key    │
│  2. Decrypt key (in memory)                  │
│  3. LangChain v1 agent run:                  │
│     input guardrails → model → tools →       │
│     structured output → output guardrails    │
│  4. Persist ticket, flag for review if needed│
└──────────────────────────────────────────────┘
        │  step / guardrail / done / error frames
        ▼
Generate screen (live timeline → rendered ticket document)
        │
        ▼
Copy · Send to Slack · Push to Linear
```

Every generation streams `RunStreamEvent` frames (`step`, `guardrail`, `done`, `error`) so long vision runs never look hung. The event contract lives in `lib/ai/stream-types.ts` and is shared by client and server.

---

## 🛠 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, `proxy.ts`) + **React 19** |
| Language | TypeScript (strict) |
| Auth | **Clerk** (session handling, middleware-provided `auth()`) |
| Database | **PostgreSQL (Neon)** via **Drizzle ORM** (`neon-http` driver) |
| AI | **LangChain v1** `createAgent` + middleware stack — BYOK via `ChatOpenAI` / `ChatAnthropic` |
| Structured output | **Zod** discriminated union over the 5 ticket types |
| Styling | **Tailwind CSS v4** (`@theme inline` tokens) + shadcn-style primitives |
| Icons | Lucide React, react-icons, developer-icons |
| Uploads | **ImageKit** |
| Integrations | Slack OAuth v2 + Web API · Linear GraphQL/REST |
| Crypto | AES-256-GCM (`lib/crypto.ts`) |
| Validation | Zod v4 |

---

## 📁 Project structure

```
app/
  page.tsx                   Marketing / landing
  docs, privacy, terms       Static pages
  (auth)/                    login / signup (centered-card chrome)
  dashboard/                 Authenticated shell (Clerk-protected)
    layout.tsx               Auth guard + theme + shell + toaster
    page.tsx                 Overview
    generate/                InputScreen → OutputScreen split workspace
    history/                 Past tickets
    settings/                AI keys · Integrations · Notifications · Account
    tickets/[id]/            Ticket detail + actions
    playground/              Dev sandbox
  api/
    tickets/                 POST: stream a generation · GET: history
    upload/                  Screenshot upload (ImageKit)
    slack/, slack/callback/  Slack OAuth + status
    integrations/            send / disconnect / Linear keys
    settings/                ai-key, notifications, account
    ai/models/               Provider/key status checks
components/
  ui/                        shadcn-style primitives
  dashboard/                 Shell, sidebar, command palette, timeline
  generate/                  Generate workspace, input/output screens
  settings/                  Settings page sections
lib/
  ai/                        LangChain agent: config, models, prompts,
                             tools, middleware/, run.ts, stream-types.ts
  db/                        schema.ts, migrations/, query helpers
  hooks/                     useTicketGeneration, session persistence, …
  integrations/              slack.ts, linear.ts
  tickets/                   Zod schemas, formatting, human-in-loop
  crypto.ts  routes.ts  rate-limit.ts  constants/
knowledge/                   Project knowledge base (start here)
proxy.ts                     Clerk middleware matcher
```

**Conventions**

- All route strings live in `lib/routes.ts` — import `ROUTES`, never hardcode paths.
- Ticket types, priorities, and limits live in `lib/constants/index.ts`.
- Design tokens live in `app/globals.css` — use semantic utilities (`bg-shell`, `text-ink`, `border-hairline`), never raw hexes.

---

## 🚀 Getting started

### Prerequisites

- **Node.js 20+**
- A **Clerk** account (free tier works)
- A **Neon** Postgres database (free tier works)
- An API key from **OpenAI**, **Anthropic**, or **OpenRouter** (added in-app after signup)

### 1. Clone & install

```bash
git clone https://github.com/bichitrabehera/TixlyAi.git
cd TixlyAi
npm install
```

### 2. Configure environment

Copy the example and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon/Postgres connection string |
| `ENCRYPTION_KEY` | ✅ | 32-byte hex key — `openssl rand -hex 32` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (`pk_…`) |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (`sk_…`) |
| `IMAGEKIT_PRIVATE_KEY` | for uploads | ImageKit private API key |
| `NEXT_PUBLIC_SLACK_CLIENT_ID` | for Slack | Slack app client ID (browser) |
| `SLACK_CLIENT_ID` | for Slack | Slack app client ID (server) |
| `SLACK_CLIENT_SECRET` | for Slack | Slack app signing secret |

> ⚠️ `ENCRYPTION_KEY` must be exactly 64 hex characters (32 bytes). Losing it makes all stored AI keys and Slack/Linear tokens unreadable.

### 3. Run migrations

```bash
npx drizzle-kit migrate
```

> **Hard rule:** schema changes always go through `npx drizzle-kit generate` + `npx drizzle-kit migrate`. **Never** `drizzle push`. Never edit a shipped migration — generate a new one.

### 4. Start developing

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, add your AI key in **Settings → AI Provider**, and start generating.

---

## 🔌 Integrations setup

### Slack

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes: `chat:write`, `im:write`, `im:read`, `users:read`
3. Set the redirect URL to `https://your-domain.com/api/slack/callback`
4. Add `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, and `NEXT_PUBLIC_SLACK_CLIENT_ID` to your env
5. Connect from **Settings → Integrations → Slack**

### Linear

1. Create a **Personal API Key** in Linear → Settings → API
2. Paste it in **Settings → Integrations → Linear**
3. Push generated tickets to Linear with one click

### ImageKit (screenshot uploads)

Set `IMAGEKIT_PRIVATE_KEY` in your env. Uploads go through `POST /api/upload`, which stores screenshots under `tickets/<userId>/`.

---

## 🧠 Architecture

Deep details live in [`knowledge/`](./knowledge/) — read `ARCHITECTURE.md` for the full map and `AI_STACK.md` for generation internals.

### Request flow

1. **Client** (`useTicketGeneration`) uploads the screenshot to `/api/upload`, then `POST /api/tickets`.
2. **Route** authenticates with Clerk, rate-limits, loads the encrypted AI key, decrypts it in memory.
3. **Agent** (`lib/ai/run.ts` → `createTicketAgent`) runs with middleware: input guardrails → observability → retry → model-call limit → PII mask → output guardrails.
4. **Stream** frames are written to the response as NDJSON; the client updates the live timeline.
5. On `done`, the validated ticket JSON is persisted to `tickets` and the UI renders it as an editorial document.

### Security posture

- **BYOK key custody** — AES-256-GCM at rest, decrypt-per-request in memory, hints-only responses, never logged, never returned to the client.
- **Auth** — Clerk middleware protects `/dashboard`; every API route independently calls `auth()`; ticket reads are UUID-validated and scoped by `userId` (no IDOR).
- **Input hardening** — Zod-validated requests, length caps, `https://`-only image URLs, server-side upload size/type checks, per-user rate limiting.
- **Agent guardrails** — hard aborts for empty/oversized/invalid input, soft-flagging for prompt-injection patterns, `needsHumanReview` forced on guardrail hits, per-run model-call budget with no fallback loop.
- **SQLi / XSS / SSRF** — parameterized Drizzle queries everywhere, React-escaped rendering (no `dangerouslySetInnerHTML` on user content), no server-side fetches of user-supplied URLs.

### Database

Two tables (`lib/db/schema.ts`):

- **users** — `clerkUserId` (PK), `email`, encrypted Slack/Linear/AI credentials, `aiProvider`, notification prefs.
- **tickets** — `id` (uuid), `userId` (FK), `ticketType`, `screenshotUrl`, `inputText`, `generatedTicket` (JSON string), `createdAt`, indexed on `(userId, createdAt)`.

Migrations live in `lib/db/migrations/`. Verify with `select * from drizzle.__drizzle_migrations order by id` if a relation ever appears missing.

---

## 📜 Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck without emitting |
| `npx drizzle-kit generate` | Generate a migration from schema changes |
| `npx drizzle-kit migrate` | Apply pending migrations |

**After any change, run lint + typecheck + build before calling it done.** There is no test framework yet — those three are the verification gate.

---

## 🧩 Product rules (non-negotiable)

1. **BYOK only.** Never store AI keys beyond AES-256-GCM at rest. Never log a key. Never send a key to the client.
2. **Drizzle generate + migrate only.** Never `drizzle push`.
3. **One accent color.** Deep green (`--primary`) is the only accent; red (`--destructive`) is only for permanent deletions.
4. **No paid tier.** No plans, badges, or upgrade CTAs — the product is free by design.
5. **Verify after changes.** Lint, typecheck, build.

Full decision log with rationale: [`knowledge/DECISIONS.md`](./knowledge/DECISIONS.md).

---

## 📚 Contributing

1. Read [`knowledge/README.md`](./knowledge/README.md) first — it indexes everything.
2. New to the repo? `IDEA.md` → `ARCHITECTURE.md`. Building UI? `DESIGN.md` first. Touching `lib/ai/`? `AI_STACK.md` first.
3. Keep responses and diffs concise; plan before building; ask when a requirement is ambiguous.
4. Follow the design system in `knowledge/DESIGN.md` for any UI work.

---

## 📄 License

MIT. See [LICENSE](LICENSE) for details.

---

**Stop rewriting. Start generating.**
