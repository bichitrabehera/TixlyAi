import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { decryptToken } from "@/lib/slack";
import { getSlackTokens } from "@/lib/db/users";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const rateCheck = checkRateLimit(`slack:${userId}`, "free");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)),
          },
        },
      );
    }

    const tokens = await getSlackTokens(userId);
    if (!tokens) {
      return NextResponse.json(
        { error: "Slack not connected. Please connect Slack first." },
        { status: 401 },
      );
    }

    const token = decryptToken(tokens.encryptedToken);
    const slackUserId = tokens.slackUserId;

    // Step 1: Open DM conversation
    const openResponse = await fetch(
      "https://slack.com/api/conversations.open",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: slackUserId }),
      },
    );

    const openData = await openResponse.json();

    if (!openData.ok) {
      console.error("conversations.open error:", openData);
      return NextResponse.json(
        { error: openData.error || "Failed to open conversation" },
        { status: 500 },
      );
    }

    const channelId = openData.channel?.id;
    if (!channelId) {
      return NextResponse.json(
        { error: "Could not open DM channel" },
        { status: 500 },
      );
    }

    // Step 2: Send message
    const messageResponse = await fetch(
      "https://slack.com/api/chat.postMessage",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: channelId,
          text: `🐞 *New Bug Report*\n\n${text}`,
        }),
      },
    );

    const messageData = await messageResponse.json();

    if (!messageData.ok) {
      console.error("chat.postMessage error:", messageData);
      return NextResponse.json(
        { error: messageData.error || "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send to Slack",
      },
      { status: 500 },
    );
  }
}