import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { encryptToken } from "@/lib/slack";
import { updateSlackTokens } from "@/lib/db/users";
import { SLACK_API_BASE } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

const STATE_COOKIE = "tixly_slack_state";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function appBaseUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = request.headers.get("host") || "";
  const isLocalhost = host === "localhost" || host.startsWith("localhost:");
  return isLocalhost ? "http://localhost:3000" : `https://${host}`;
}

function redirect(request: Request, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return redirect(request, `${ROUTES.generate}?error=unauthorized`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return redirect(request, `${ROUTES.generate}?error=slack_${error}`);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;

  if (!code) {
    return redirect(request, `${ROUTES.generate}?error=no_code`);
  }

  if (!state || !expectedState || !safeEqual(state, expectedState)) {
    return redirect(request, `${ROUTES.generate}?error=invalid_state`);
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUri = `${appBaseUrl(request)}/api/slack/callback`;

  if (!clientId || !clientSecret) {
    return redirect(request, `${ROUTES.generate}?error=missing_config`);
  }

  try {
    const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
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
      console.error("Slack OAuth exchange failed");
      return redirect(request, `${ROUTES.generate}?error=oauth_failed`);
    }

    const encryptedToken = encryptToken(data.access_token);
    await updateSlackTokens(userId, encryptedToken, data.authed_user?.id);

    return redirect(request, `${ROUTES.generate}?slack_connected=true`);
  } catch {
    console.error("Slack OAuth exception");
    return redirect(request, `${ROUTES.generate}?error=oauth_exception`);
  }
}
