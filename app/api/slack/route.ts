import { NextResponse } from "next/server";
import { getSlackToken, isSlackConnected } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!isSlackConnected()) {
      return NextResponse.json(
        { error: "Slack not connected. Please connect Slack first." },
        { status: 401 }
      );
    }

    const row = getSlackToken();
    if (!row) {
      return NextResponse.json({ error: "Slack token not found" }, { status: 401 });
    }

    const token = row.access_token;
    const userId = row.user_id;

    // Step 1: Open DM conversation
    const openResponse = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: userId }),
    });

    const openData = await openResponse.json();

    if (!openData.ok) {
      console.error("conversations.open error:", openData);
      return NextResponse.json({ error: openData.error || "Failed to open conversation" }, { status: 500 });
    }

    const channelId = openData.channel?.id;
    if (!channelId) {
      return NextResponse.json({ error: "Could not open DM channel" }, { status: 500 });
    }

    // Step 2: Send message
    const messageResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        text: `🐞 *New Bug Report*\n\n${text}`,
      }),
    });

    const messageData = await messageResponse.json();

    if (!messageData.ok) {
      console.error("chat.postMessage error:", messageData);
      return NextResponse.json({ error: messageData.error || "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send to Slack" }, { status: 500 });
  }
}