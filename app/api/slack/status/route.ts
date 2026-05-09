import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("slack_token")?.value;
    const userId = cookieStore.get("slack_user_id")?.value;
    const teamId = cookieStore.get("slack_team_id")?.value;
    
    console.log("Status check - token exists:", !!token, "userId:", !!userId);
    
    return NextResponse.json({ 
      connected: !!token && !!userId,
      accessToken: token,
      userId: userId,
      teamId: teamId
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ 
      connected: false,
      error: "Failed to check status"
    });
  }
}