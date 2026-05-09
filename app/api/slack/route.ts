import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const token = process.env.SLACK_BOT_TOKEN;

    if (!token || token === "xoxb-your-slack-bot-token") {
      return NextResponse.json(
        { error: "Slack bot token not configured. Add SLACK_BOT_TOKEN to .env.local" },
        { status: 500 }
      );
    }

    const formatted = formatForSlack(text);

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: "#bugs",
        text: formatted,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || "Failed to send to Slack");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send to Slack" },
      { status: 500 }
    );
  }
}

function formatForSlack(text: string): string {
  return `🐞 *New Bug Report*\n───────────────────────\n${text}`;
}