import type { SendResult } from "./types";
import { decryptToken } from "@/lib/slack";
import { getSlackTokens } from "@/lib/db/users";
import { SLACK_API_BASE } from "@/lib/constants";

export async function sendToSlack(
  rawTicket: string,
  clerkUserId: string,
): Promise<SendResult> {
  const tokens = await getSlackTokens(clerkUserId);
  if (!tokens) {
    return { success: false, error: "Connect Slack first" };
  }

  const botToken = decryptToken(tokens.encryptedToken);
  const slackUserId = tokens.slackUserId;

  const openRes = await fetch(`${SLACK_API_BASE}/conversations.open`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ users: slackUserId }),
  });
  const openData = await openRes.json();
  if (!openData.ok) {
    return { success: false, error: openData.error || "Failed to open DM" };
  }

  const channelId = openData.channel?.id;
  if (!channelId) {
    return { success: false, error: "Could not open DM channel" };
  }

  const msg = `🐞 *New Bug Report*\n\n${rawTicket}`;
  const msgRes = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel: channelId, text: msg }),
  });
  const msgData = await msgRes.json();
  if (!msgData.ok) {
    return { success: false, error: msgData.error || "Failed to send message" };
  }

  return { success: true };
}
