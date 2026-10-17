# Tixly Knowledge Base

Everything an agent (or new contributor) needs to work on Tixly without scanning the whole repo.

| Doc | Read it when |
| --- | --- |
| [IDEA.md](./IDEA.md) | You need to understand what Tixly is, who it's for, and what "good" looks like. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | You need the app map: routes, data flow, DB schema, integrations, auth. |
| [AI_STACK.md](./AI_STACK.md) | You're touching anything in `lib/ai/` — the LangChain v1 agent, guardrails, streaming, BYOK keys. |
| [DESIGN.md](./DESIGN.md) | You're building or reviewing any UI. Single source of truth for tokens, components, and interaction. |
| [DECISIONS.md](./DECISIONS.md) | You want to know *why* a thing is done a certain way before changing it. |

## Read first

- New to the repo? `IDEA.md` → `ARCHITECTURE.md`.
- Building UI? `DESIGN.md` before `ARCHITECTURE.md`.
- Working on ticket generation? `AI_STACK.md` first — it's the densest part.

## Hard rules (non-negotiable)

1. **BYOK only.** Never store AI provider keys on our side beyond AES-256-GCM encryption at rest. Never log keys. Never send keys to the client.
2. **Drizzle generate + migrate only.** Never `drizzle push`. Schema changes always go through a migration.
3. **One accent color.** Green (`--primary`) is the only accent. Red (`--destructive`) is only for permanent deletions.
4. **Verify after changes.** Run lint, typecheck, and build before calling anything done.
