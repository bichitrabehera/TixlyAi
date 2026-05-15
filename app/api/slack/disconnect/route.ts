import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear Slack cookies
    cookieStore.delete("slack_token");
    cookieStore.delete("slack_user_id");
    cookieStore.delete("slack_team_id");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect Slack" }, { status: 500 });
  }
}