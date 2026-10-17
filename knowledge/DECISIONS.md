# Decision Log

Why things are the way they are. Read before changing a decision; append when you make a new one.

## BYOK over hosted AI

Tixly has no AI cost of its own and no subscription. Users bring an OpenAI / OpenRouter / Anthropic key, which is encrypted at rest (AES-256-GCM) and decrypted only server-side, per request. This keeps the product free, limits our liability, and means the model list is a config concern, not a platform migration.

Consequence: never log, return, or transmit an AI key to the client; every run must load + decrypt + use + discard in memory.

## LangChain v1 agent, not raw SDK calls

Ticket generation moved from direct `openai` / `@anthropic-ai/sdk` calls to a LangChain v1 `createAgent` with a middleware stack. Rationale: structured output, tool calling, retries, call limits, and guardrails all compose through one middleware contract instead of hand-rolled in the request handler.

Consequence: the raw SDK packages are no longer direct dependencies (only transitive via LangChain). Don't reintroduce them.

## Streaming via NDJSON, not one JSON blob

`/api/tickets` streams NDJSON frames (`RunStreamEvent`) instead of returning the ticket in one response. Users see agent progress (validating → analyzing → tools → drafting) and guardrail notices in real time, and a long vision run doesn't look hung.

Consequence: the event contract lives in `lib/ai/stream-types.ts` and is shared by client and server. Never fork the shapes.

## Ticket stored as a JSON string

`tickets.generatedTicket` is a JSON string of the validated structured ticket, not a normalized table row. This keeps integrations (Slack, Linear, clipboard export) simple — one string in, formatted text out — and keeps schema evolution cheap.

Consequence: the client parses it (`parseTicketData` in `lib/tickets/format.ts`) rather than trusting field presence.

## One accent color

Green only (`--primary`), with red (`--destructive`) reserved for permanent deletions. Amber appears only on guardrail "review needed" notices — a semantic warning, not a brand color. This keeps a busy utility interface calm and makes the primary action unmistakable.

See [DESIGN.md](./DESIGN.md).

## Drizzle generate + migrate only

No `drizzle push`. Schema changes always go through a generated migration (`lib/db/migrations/`), so staging and production converge on the same history. Never edit a shipped migration — generate a new one.

Consequence: the database and `drizzle.__drizzle_migrations` must always agree. They once drifted — 0001–0004 were applied structurally but never tracked, and 0005 (`ai_keys`) was therefore never applied, so key saves failed with `relation "ai_keys" does not exist`. The tracking table was baselined by inserting the 0001–0004 hashes (`sha256` of each `.sql`, `created_at` = the journal's `when`), then `drizzle-kit migrate` applied 0005. A row with hash `d4c8c0ec…` is a stale pre-0000 entry and is expected. If a query ever reports a missing relation, check `select * from drizzle.__drizzle_migrations order by id` before assuming the code is wrong.

## No test framework yet

The project has no test runner. Verification today is lint + typecheck + build. If you add one, prefer something that exercises the AI stream parsing and the Zod schemas first — those are the highest-risk surfaces.

---

## How to add a decision

Append a `## Title` section: one-line decision, the *why*, and the *consequence* (what future work must respect).
