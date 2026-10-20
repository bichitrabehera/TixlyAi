# AI Stack

All AI lives in `lib/ai/`. It is a **LangChain v1** agent (`createAgent`) with middleware, running on the user's own API key (BYOK). There is no server-side OpenAI/Anthropic SDK usage anymore — LangChain's chat-model wrappers (`ChatOpenAI`, `ChatAnthropic`) are the only model clients.

```
lib/ai/
  config.ts          Models, limits, run-step labels, temperature
  models.ts          createChatModel(provider, apiKey, temp)
  prompts.ts         buildSystemPrompt / buildUserText
  tools.ts           createTicketTools(userId) — real DB lookups
  agent.ts           createTicketAgent() — the createAgent wiring
  middleware/        guardrails, observability, state
  run.ts             streamTicketRun() — the streaming entrypoint
  stream-types.ts    RunStreamEvent contract (client + server)
  index.ts           Public exports + detectProvider / testAiKey
```

## Provider & model

`AI_MODEL_CONFIG` in `config.ts` holds the per-provider default model; `MODEL_CATALOG` is the curated list the Generate-screen picker offers:

| Provider | Default model | Catalog models |
| --- | --- | --- |
| `openai` | `gpt-4o` | gpt-4o, gpt-4o-mini, gpt-4.1, o3, o4-mini |
| `anthropic` | `claude-sonnet-4-20250514` | claude-sonnet-4, claude-opus-4, claude-3.5-haiku |
| `openrouter` | `openrouter/auto` | auto, gpt-4o, claude-sonnet-4, gemini-2.0-flash |
| `google` | `gemini-2.0-flash` | gemini-2.0-flash, gemini-2.5-flash, gemini-2.5-pro |

The user picks a model on the Generate screen (`ModelPicker.tsx`); the client sends `model` in the request and the server honors it, falling back to the provider default when absent. Vision support is derived from the resolved model via `modelVisionHeuristic(provider, model)` — the server ignores any client-supplied `modelVision`.

Provider is detected from the key prefix (`detectProvider` in `index.ts`): `sk-or-v1-` → openrouter, `sk-ant-` → anthropic, `sk-` → openai, `AIza` → google. Keys are stored per-provider in the `aiKeys` table. OpenRouter runs use `maxRetries: 0` — retries are handled once by `modelRetryMiddleware`, not by the client wrapper.

## The agent

`createTicketAgent({ provider, apiKey, req, userId, model })`:

- **model** — BYOK chat model at the selected (or default) model id, temperature from `temperatureFor(preferredPriority)`; omitted for OpenAI reasoning models (o-series / gpt-5) via `modelSupportsTemperature`, which reject any non-default value.
- **tools** — `createTicketTools(userId)`: `search_past_tickets` (real Drizzle `ILIKE` query scoped to the user), `get_ticket_template`, `get_priority_guidelines`.
- **systemPrompt** — `buildSystemPrompt(req)`: pixel-analysis instructions per ticket type, plus a `confidence` instruction (model self-reports 0–100 certainty; below 60 also forces `needsHumanReview`).
- **responseFormat** — `TicketOutputSchema` (Zod object covering the 5 ticket types). The model must produce JSON validating against this schema; the validated object is available as `structuredResponse` on state. Includes an optional `confidence: z.number().min(0).max(100)` field.
- **middleware** — the stack below.

## Middleware stack (execution order)

Defined in `middleware/index.ts`:

1. **input-guardrails** (custom) — blocks/flags unsafe input before each model call.
2. **run-observability** (custom) — records model/tool call trail into `state.runSteps`.
3. **model-retry** (built-in) — exponential backoff on transient model failures.
4. **model-call-limit** (built-in) — caps model calls per run (`exitBehavior: "end"`) so cost can't run away.
5. **pii-mask** (built-in) — masks credit-card-like numbers in user text.
6. **output-guardrails** (custom) — business rules on the final structured output.

## Guardrails

`middleware/input-guardrail.ts`:

- **Hard** (throw `GuardrailViolationError`, run aborts with a typed code): no input, input beyond length limits, image URL that isn't `https://` or an image data URI.
- **Soft** (run continues, flagged): prompt-injection patterns in user text. A system note is appended telling the model to treat that text as data only, and the hit is recorded in `state.guardrailHits`.

`GuardrailViolationError` carries a `code` (`empty_input`, `input_too_long`, `invalid_image`) that is surfaced to the client as an `error` event.

`middleware/output-guardrail.ts` (afterAgent): enforces title/description constraints and forces `needsHumanReview = true` when rules trip.

The `runTicketRun` driver emits a `guardrail` stream event when `guardrailHits` is non-empty, so the UI can show a notice.

## Streaming protocol

`streamTicketRun(opts)` in `run.ts` is an **async generator** yielding `RunStreamEvent` frames:

```ts
{ type: "step", step: { id, label, status } }   // pending | running | done | error
{ type: "guardrail", level: "info" | "warn", message }
{ type: "done", ticket, needsReview, steps, usage }
{ type: "error", message, code }
```

- `ticket` is the JSON string of the validated structured ticket (includes `confidence` when the model provided it).
- `usage` carries `inputTokens` / `outputTokens` (from the last `AIMessage.usage_metadata`), the resolved `model` id, and `latencyMs`. The client renders this in the OutputScreen MetaStrip alongside the confidence chip.
- Step ids/labels are defined once in `RUN_STEPS` (`config.ts`).

The route (`app/api/tickets/route.ts`) writes each frame as one NDJSON line. The client (`lib/hooks/useTicketGeneration.ts`) reads the body with a `ReadableStream` reader, buffers by `\n`, and updates `steps` / `guardrailNotice` / `usage` / `ticket` state. **Change event shapes in `stream-types.ts` only** — both sides import it.

### Fallback

If a vision run fails and the request also had text (`ocrText` or `note`), `run.ts` retries once with the image dropped, emitting a `fallback` step and a `guardrail` warn event. Guardrail violations do **not** trigger the fallback — they abort.

## BYOK key lifecycle

1. User adds a key in Settings → `/api/settings/ai-key` detects the provider from the key prefix (`AIza` → google), live-tests it, and stores `encrypt(key)` + hint in the `aiKeys` table (one row per provider).
2. `/api/tickets` loads the user's keys via `listAiKeys(userId)`; the client may request a specific provider via `req.provider`, else the most recently saved key wins.
3. `streamTicketRun` calls `decrypt(encryptedKey)` per run, in memory.
4. The key is passed to `createChatModel` and never leaves the server, is never logged, and is never returned to the client.

`testAiKey(apiKey, provider)` in `index.ts` validates a key by invoking the model with a trivial prompt — used by the settings save flow.

## Known soft spots

- `piiMiddleware` is configured with `applyToInput: true` over multimodal content arrays — verify it behaves sanely on image+text messages before relying on it.
- Output-guardrail returns cast the structured output; keep the schema and cast in sync.
- Vision-failure fallback retries text-only when both image and text are present — confirm that's the desired UX.

## Extending

- **Add a model to the picker** — add it to `MODEL_CATALOG` in `config.ts` (and update `AI_MODEL_CONFIG` if it should become the new default).
- **Add a tool** — add it in `tools.ts` and include it in `createTicketTools`; the agent picks it up automatically.
- **Add a guardrail** — new middleware file in `middleware/`, wire into `buildAgentMiddleware()` in execution order, and emit a `guardrail` event from `run.ts` if it should surface in the UI.
- **Add a run step** — add to `RUN_STEPS` in `config.ts`, emit `{ type: "step", ... }` from `run.ts`, and the timeline UI picks it up via `AgentRunTimeline`.
- **Add a provider** — extend `AI_MODEL_CONFIG` and `MODEL_CATALOG`, add a branch in `createChatModel`, add a key-prefix rule to `detectProvider`, and add a model-list branch in `/api/ai/models` if live listing is wanted.
