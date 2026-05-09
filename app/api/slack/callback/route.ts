import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.log("Slack OAuth error param:", error);
    return NextResponse.redirect(new URL(`/demo?error=slack_${error}`, request.url));
  }

  if (!code) {
    console.log("No code in callback, full URL:", request.url);
    return NextResponse.redirect(new URL("/demo?error=no_code", request.url));
  }

  // Get redirect_uri from the state or use configured base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    request.headers.get("x-forwarded-host") || 
    request.headers.get("host") ||
    "https://your-domain.com";
  
  const protocol = baseUrl.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${baseUrl}/api/slack/callback`;

  console.log("=== OAuth Debug ===");
  console.log("Request URL:", request.url);
  console.log("Base URL env:", process.env.NEXT_PUBLIC_BASE_URL);
  console.log("Computed redirectUri:", redirectUri);
  console.log("Code length:", code.length);

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing client ID or secret");
    return NextResponse.redirect(new URL("/demo?error=missing_config", request.url));
  }

  try {
    // Try OAuth v2 access
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
    console.log("Slack response ok:", data.ok, "error:", data.error);

    if (!data.ok) {
      return NextResponse.redirect(new URL(`/demo?error=oauth_failed&msg=${data.error}`, request.url));
    }

    const accessToken = data.access_token;
    const userId = data.authed_user?.id;
    const teamId = data.team?.id;

    const isProduction = !redirectUri.includes("localhost");

    const redirectResponse = NextResponse.redirect(new URL("/demo?slack_connected=true", request.url));

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

    console.log("OAuth success! Token length:", accessToken?.length);

    return redirectResponse;
  } catch (error) {
    console.error("OAuth exception:", error);
    return NextResponse.redirect(new URL("/demo?error=oauth_exception", request.url));
  }
}