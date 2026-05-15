import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { isBasic } from "@/lib/plan";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is on Basic plan
    const basicUser = await isBasic(userId);
    if (!basicUser) {
      return NextResponse.json(
        {
          error:
            "Slack integration is a Basic feature. Upgrade to Basic to use Slack.",
        },
        { status: 403 },
      );
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Read token from cookies (browser storage)
    const cookieStore = await cookies();
    const token = cookieStore.get("slack_token")?.value;
    const slackUserId = cookieStore.get("slack_user_id")?.value;

    if (!token || !slackUserId) {
      return NextResponse.json(
        { error: "Slack not connected. Please connect Slack first." },
        { status: 401 },
      );
    }

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
