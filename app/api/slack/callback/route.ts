import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encryptToken } from "@/lib/slack";
import { updateSlackTokens } from "@/lib/db/users";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=unauthorized", request.url),
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/integrations?error=slack_${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=no_code", request.url));
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const host = request.headers.get("host") || "";
  const isLocalhost = host.includes("localhost");
  const baseUrl = isLocalhost ? "http://localhost:3000" : `https://${host}`;
  const redirectUri = `${baseUrl}/api/slack/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=missing_config", request.url));
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
      return NextResponse.redirect(new URL("/dashboard/integrations?error=oauth_failed", request.url));
    }

    const encryptedToken = encryptToken(data.access_token);
    await updateSlackTokens(userId, encryptedToken, data.authed_user?.id);

    return NextResponse.redirect(
      new URL("/dashboard/integrations?slack_connected=true", request.url),
    );
  } catch (error) {
    console.error("OAuth exception:", error);
    return NextResponse.redirect(new URL("/dashboard/integrations?error=oauth_exception", request.url));
  }
}