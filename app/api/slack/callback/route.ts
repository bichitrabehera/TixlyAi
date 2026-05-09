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

  console.log("OAuth callback - origin:", origin, "redirectUri:", redirectUri);

  if (!clientId || !clientSecret || clientId === "your_client_id_here") {
    console.error("Missing client ID or secret");
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
    console.log("Slack OAuth response:", data);

    if (!data.ok) {
      console.error("Slack OAuth error:", JSON.stringify(data));
      const errorMsg = data.error || data.message || JSON.stringify(data);
      return NextResponse.redirect(new URL("/demo?error=oauth_failed: " + errorMsg, request.url));
    }

    const accessToken = data.access_token;
    const userId = data.authed_user?.id;
    const teamId = data.team?.id;

    // Determine if production
    const isProduction = !origin.includes("localhost");

    // Create response with redirect
    const redirectResponse = NextResponse.redirect(new URL("/demo?slack_connected=true", request.url));

    // Set cookies with appropriate settings for environment
    redirectResponse.cookies.set("slack_token", accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirectResponse.cookies.set("slack_user_id", userId, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirectResponse.cookies.set("slack_team_id", teamId || "", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return redirectResponse;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/demo?error=oauth_failed", request.url));
  }
}