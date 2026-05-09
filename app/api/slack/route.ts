import { NextResponse } from "next/server";

interface SlackUserData {
  accessToken: string;
  userId: string;
  teamId: string;
}

// In-memory store (resets on server restart)
const userData: Record<string, SlackUserData> = {};

export async function GET() {
  const data = userData["default"];
  return NextResponse.json({ 
    connected: !!data?.accessToken,
    accessToken: data?.accessToken,
    userId: data?.userId 
  });
}

export async function POST(request: Request) {
  try {
    const { text, accessToken, userId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const token = accessToken || userData["default"]?.accessToken;
    const slackUserId = userId || userData["default"]?.userId;

    if (!token) {
      return NextResponse.json(
        { error: "Slack not connected" },
        { status: 401 }
      );
    }

    // Check token scopes
    const authTestRes = await fetch("https://slack.com/api/auth.test", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const authTest = await authTestRes.json();
    console.log("Auth test:", authTest);

    const formatted = `🐞 *New Bug Report*\n\n${text.replace(/\n/g, '\n')}`;

    // Try to find a direct message channel with user first
    const openResponse = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: slackUserId }),
    });

    const openData = await openResponse.json();

    let channelId;
    if (openData.ok && openData.channel?.id) {
      channelId = openData.channel.id;
    } else {
      // Fallback: try to find existing IM
      const listResponse = await fetch("https://slack.com/api/conversations.list?types=im", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listResponse.json();
      const imChannel = listData.channels?.find((c: any) => c.user === slackUserId);
      channelId = imChannel?.id;
    }

    if (!channelId) {
      throw new Error("Could not open DM with user. Make sure you have im:write scope.");
    }

    // Send message to the channel
    const messageResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        text: formatted,
      }),
    });

    const messageData = await messageResponse.json();

    if (!messageData.ok) {
      throw new Error(messageData.error || "Failed to send to Slack");
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

export function setUserData(userId: string, accessToken: string, userIdFromSlack: string, teamId: string) {
  userData[userId] = {
    accessToken,
    userId: userIdFromSlack,
    teamId,
  };
}

export function getUserData(userId: string) {
  return userData[userId];
}

export function isConnected(userId: string): boolean {
  return !!userData[userId]?.accessToken;
}