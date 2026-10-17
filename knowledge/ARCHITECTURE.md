# Architecture

Next.js 16 (App Router) · TypeScript · Clerk auth · Drizzle ORM on Neon Postgres · Tailwind v4 · LangChain v1 for AI.

## App map

```
app/
  page.tsx                     Marketing / landing (per-page chrome via Header/Footer)
  docs, privacy, terms         Static
  (auth)/                      Only route group — centered-card chrome (layout.tsx)
    login/                     /login — thin <SignIn>
    signup/                    /signup — redirects to /login
  dashboard/                   Authenticated shell (Clerk middleware-protected)
    layout.tsx                 Auth guard + ThemeProvider + DashboardShell + SessionCleanup + Toaster
    page.tsx                   /dashboard — overview
    generate/                  /dashboard/generate — InputScreen → OutputScreen
    history/                   /dashboard/history — past tickets
    playground/                /dashboard/playground — dev sandbox
    tickets/[id]/              /dashboard/tickets/[id] — detail + actions
  api/
    tickets/                   POST: stream a generation · GET: history
    upload/                    Screenshot upload (ImageKit)
    slack/, slack/callback/    Slack OAuth + status
    integrations/              send / disconnect / linear keys
    settings/                  ai-key, notifications, account
```

All route strings live in **`lib/routes.ts`** (`WORKSPACE_ROOT = "/dashboard"`, `ROUTES`, `NAV_PRIMARY`) — import from there, never hardcode. Navigation is the TopBar (**`components/dashboard/TopNav.tsx`** tabs) plus a global ⌘K/Ctrl-K command palette (**`components/dashboard/CommandPalette.tsx`**). Settings is a dialog, not a route — gear in the TopBar / account dropdown / `NoAiKeyCard` open it.

## Request flow: generating a ticket

```
InputScreen (client, /dashboard/generate)
  → lib/hooks/useTicketGeneration.ts
      · uploads screenshot to /api/upload → ImageKit URL
      · POST /api/tickets  (NDJSON stream request)
  → app/api/tickets/route.ts
      · Clerk auth → rate limit → load encrypted AI key
      · streamTicketRun()  ← lib/ai/run.ts
          · decrypt key → createTicketAgent() (lib/ai/agent.ts)
          · agent.stream() driven, yielding RunStreamEvent frames
      · on `done`: insert into tickets, flagForHumanReview if needed
      · frames written to ReadableStream (NDJSON)
  → client parses each line, updates steps / status / ticket state
  → GenerateWorkspace shows the run in the OutputScreen pane (AgentRunTimeline
    while running); on `done` the hook flips `screen` → OutputScreen resolves
    the streamed steps into the ticket document
```

Streaming contract lives in `lib/ai/stream-types.ts` and is shared by client and server — change the event shapes there, not ad hoc.

## Auth & tenancy

- Clerk handles identity. `users` table is keyed by `clerkUserId`.
- Every ticket row references `users.clerkUserId`.
- `getOrCreateUser(userId, email)` upserts on first use — call it wherever you need a user row (route handlers), don't assume it exists from Clerk alone.
- No orgs/teams. One user = one workspace.

## Database (Drizzle + Neon)

`lib/db/schema.ts` — two tables:

- **users** — `clerkUserId` (PK), `email`, `slackEncryptedToken`, `slackUserId`, `linearEncryptedKey`, `aiEncryptedKey`, `aiProvider`, `notificationEmail`.
- **tickets** — `id` (uuid PK), `userId` (FK → users), `ticketType`, `screenshotUrl`, `inputText`, `generatedTicket` (the JSON string), `createdAt`.

**Schema changes:** always `npx drizzle-kit generate` + `npx drizzle-kit migrate`. Never `drizzle push`. Migrations live in `lib/db/migrations/`.

## Secrets

- AES-256-GCM via `lib/crypto.ts` (`encrypt` / `decrypt`).
- AI keys, Slack tokens, and Linear keys are encrypted at rest and decrypted only server-side, per request, in memory. Never return a decrypted key to the client. Never log one.
- `ENCRYPTION_KEY` env var must be 32 bytes (`openssl rand -hex 32`).

## Integrations

`lib/integrations/{slack,linear}.ts` — send a generated ticket to Slack DM or create a Linear issue. Tokens/keys are decrypted per send. Client side is `lib/hooks/useIntegrationActions.ts`.

## Key modules outside the AI layer

- `lib/rate-limit.ts` — in-memory per-user limiter used by `/api/tickets` before spending the user's AI credits.
- `lib/tickets/schemas.ts` — Zod request + output schemas. The output schema is the structured-output contract for the agent.
- `lib/tickets/format.ts` — `parseTicketData()` turns the JSON ticket into a view model; `ticketToPlainText()` renders the clipboard/export text.
- `lib/tickets/humanInLoop.ts` — `flagForHumanReview()` when a run is flagged.
- `lib/constants/index.ts` — ticket types, priorities, limits, meta labels. Check here before hardcoding a string.

See [AI_STACK.md](./AI_STACK.md) for the generation internals.
