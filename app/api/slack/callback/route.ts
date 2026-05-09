import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/demo?error=slack_${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/demo?error=no_code", request.url));
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const host = request.headers.get("host") || "";
  const isLocalhost = host.includes("localhost");
  const baseUrl = isLocalhost ? "http://localhost:3000" : `https://${host}`;
  const redirectUri = `${baseUrl}/api/slack/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/demo?error=missing_config", request.url));
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

    // Save token in cookies (browser storage)
    const isProduction = !isLocalhost;
    const redirectResponse = NextResponse.redirect(new URL("/demo?slack_connected=true", request.url));

    redirectResponse.cookies.set("slack_token", data.access_token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirectResponse.cookies.set("slack_user_id", data.authed_user?.id, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    console.log("Slack token stored in browser cookies");

    return redirectResponse;
  } catch (error) {
    console.error("OAuth exception:", error);
    return NextResponse.redirect(new URL("/demo?error=oauth_exception", request.url));
  }
}