import "dotenv/config";
import { getAiKey } from "@/lib/db/users";
import { streamTicketRun } from "@/lib/ai";
import type { TicketRequest } from "@/lib/tickets/schemas";

async function main() {
  const USER = process.argv[2] ?? "user_3Dlgi36KYfVnlpAZJQ42GISb0z0";

  const aiKey = await getAiKey(USER);
  console.log("provider:", aiKey?.provider, "| hasKey:", Boolean(aiKey));
  if (!aiKey) process.exit(1);

  const req: TicketRequest = {
    note: "The login button does nothing when clicked in Firefox.",
    ticketType: "bug",
    detailLevel: "standard",
    includeReproSteps: true,
    detectSeverity: true,
    detectComponent: true,
    language: "en",
  };

  let done = false;
  try {
    for await (const ev of streamTicketRun({
      provider: aiKey.provider,
      encryptedKey: aiKey.encryptedKey,
      req,
      userId: USER,
    })) {
      const line = JSON.stringify(ev);
      console.log(ev.type === "done" ? line.slice(0, 1200) : line.slice(0, 300));
      if (ev.type === "done") done = true;
    }
  } catch (e) {
    console.error("THROWN:", e instanceof Error ? (e.stack ?? e.message) : e);
  }
  console.log("RESULT:", done ? "DONE_OK" : "NO_DONE_EVENT");
}

main().catch((e) => console.error("FATAL:", e));
