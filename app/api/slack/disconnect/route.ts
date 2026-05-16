import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clearSlackTokens } from "@/lib/db/users";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clearSlackTokens(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Slack" },
      { status: 500 },
    );
  }
}