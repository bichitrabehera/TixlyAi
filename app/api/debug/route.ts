import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  return NextResponse.json({
    hasClientId: !!clientId,
    clientId: clientId ? clientId.substring(0, 10) + "..." : "missing",
    hasBaseUrl: !!baseUrl,
    baseUrl: baseUrl || "missing",
  });
}