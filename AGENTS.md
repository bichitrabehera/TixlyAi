# AGENTS.md

Project knowledge and rules live in [`knowledge/`](./knowledge/README.md). Read that first — this file is only a pointer.

- **Rules & index:** [`knowledge/README.md`](./knowledge/README.md)
- **Product idea:** [`knowledge/IDEA.md`](./knowledge/IDEA.md)
- **App map, routes, data flow:** [`knowledge/ARCHITECTURE.md`](./knowledge/ARCHITECTURE.md)
- **AI stack (LangChain v1, guardrails, streaming, BYOK):** [`knowledge/AI_STACK.md`](./knowledge/AI_STACK.md)
- **UI design system:** [`knowledge/DESIGN.md`](./knowledge/DESIGN.md)
- **Why things are the way they are:** [`knowledge/DECISIONS.md`](./knowledge/DECISIONS.md)

## Hard rules

1. Keep responses concise.
2. Plan before building; ask when a requirement is ambiguous.
3. DB schema changes: `drizzle-kit generate` + `drizzle-kit migrate`. Never `drizzle push`.
4. After changes, run lint, typecheck, and build (`npm run lint`, `npx tsc --noEmit`, `npm run build`).
5. Follow the design system in `knowledge/DESIGN.md` for any UI work.
6. Never log, expose, or return AI keys, Slack tokens, or Linear keys.
