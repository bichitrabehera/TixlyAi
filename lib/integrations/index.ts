import type { Ticket, IntegrationTool, SendResult } from "./types";
import { sendToSlack } from "./slack";
import { createLinearIssue, parseTicketText } from "./linear";

export async function sendToIntegration(
  tool: IntegrationTool,
  ticket: Ticket,
  clerkUserId: string,
): Promise<SendResult> {
  switch (tool) {
    case "slack":
      return sendToSlack(ticket.description || ticket.title, clerkUserId);

    case "linear": {
      const { getLinearKey } = await import("@/lib/db/users");
      const encryptedKey = await getLinearKey(clerkUserId);
      if (!encryptedKey) {
        return { success: false, error: "Connect Linear first" };
      }
      const { decryptToken } = await import("@/lib/slack");
      const apiKey = decryptToken(encryptedKey);
      return createLinearIssue(ticket, apiKey);
    }

    default:
      return { success: false, error: `Unknown integration: ${tool}` };
  }
}

export function parseRawTicket(raw: string): Ticket {
  return parseTicketText(raw);
}

export { createLinearIssue } from "./linear";
export { sendToSlack } from "./slack";
