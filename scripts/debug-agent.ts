import "dotenv/config";
import { getAiKey } from "@/lib/db/users";
import { decrypt } from "@/lib/crypto";
import { createTicketAgent } from "@/lib/ai";
import { buildUserText } from "@/lib/ai/prompts";
import type { TicketRequest } from "@/lib/tickets/schemas";

async function main() {
  const USER = process.argv[2] ?? "user_3DkSAwAMi2SA66veHhQLAYsVG6J";
  const aiKey = await getAiKey(USER);
  if (!aiKey) {
    console.error("no key");
    process.exit(1);
  }

  const req: TicketRequest = {
    note: "The login button does nothing when clicked in Firefox.",
    ticketType: "bug",
    detailLevel: "standard",
    includeReproSteps: true,
    detectSeverity: true,
    detectComponent: true,
    language: "en",
  };

  const agent = createTicketAgent({
    provider: aiKey.provider,
    apiKey: decrypt(aiKey.encryptedKey),
    req,
    userId: USER,
  });

  const stream = await agent.stream(
    { messages: [{ role: "user", content: buildUserText(req) }] },
    { streamMode: ["values", "updates"] },
  );

  let i = 0;
  for await (const [mode, chunk] of stream) {
    i++;
    if (mode === "updates") {
      const nodes = Object.keys(chunk as Record<string, unknown>);
      const detail: string[] = [];
      for (const node of nodes) {
        const upd = (chunk as Record<string, Record<string, unknown>>)[node];
        detail.push(`${node} -> keys=[${Object.keys(upd).join(",")}]`);
      }
      console.log(`#${i} UPDATES: ${detail.join(" | ")}`);
    } else {
      const state = chunk as Record<string, unknown>;
      const msgs = Array.isArray(state.messages) ? state.messages : [];
      const last = msgs[msgs.length - 1] as
        | {
            _getType?: () => string;
            content?: unknown;
            tool_calls?: unknown;
            response_metadata?: { finish_reason?: string };
          }
        | undefined;
      if (last && last._getType?.() === "ai") {
        console.log(
          "   AI finish_reason:",
          last.response_metadata?.finish_reason,
          "| tool_calls:",
          JSON.stringify(last.tool_calls ?? []),
          "| content:",
          JSON.stringify(last.content).slice(0, 400),
        );
      }
      console.log(
        `#${i} VALUES: keys=[${Object.keys(state).join(",")}] structured=${
          state.structuredResponse ? "YES" : "no"
        } messages=${msgs.length}`,
      );
    }
  }
  console.log("frames:", i);
}

main().catch((e) => console.error("FATAL:", e));
