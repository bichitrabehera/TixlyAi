import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("slack_token")?.value;
  const userId = cookieStore.get("slack_user_id")?.value;

  return NextResponse.json({ connected: !!(token && userId) });
}