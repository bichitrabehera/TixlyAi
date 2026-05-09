import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/demo?error=no_code", request.url));
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const origin = request.headers.get("origin") || "http://localhost:3000";
  const redirectUri = `${origin}/api/slack/callback`;

  if (!clientId || !clientSecret || clientId === "your_client_id_here") {
    return NextResponse.redirect(new URL("/demo?error=slack_not_configured", request.url));
  }

  try {
    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Slack OAuth error:", data);
      return NextResponse.redirect(new URL("/demo?error=oauth_failed", request.url));
    }

    const accessToken = data.access_token;
    const botToken = data.bot_access_token || data.access_token; // Use bot token if available
    const userId = data.authed_user?.id;
    const teamId = data.team?.id;

    console.log("Slack OAuth response:", { 
      hasAccessToken: !!data.access_token, 
      hasBotToken: !!data.bot_access_token,
      tokenType: data.access_token?.startsWith("xoxb") ? "bot" : "user" 
    });

    // Use bot token if available, otherwise use access token
    const finalToken = botToken;

    // Create response with redirect
    const redirectResponse = NextResponse.redirect(new URL("/demo?slack_connected=true", request.url));

    // Set cookies to persist token
    redirectResponse.cookies.set("slack_token", finalToken, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    redirectResponse.cookies.set("slack_user_id", userId, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirectResponse.cookies.set("slack_team_id", teamId || "", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return redirectResponse;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/demo?error=oauth_failed", request.url));
  }
}