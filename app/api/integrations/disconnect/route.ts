import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clearSlackTokens, removeLinearKey } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tool } = await request.json();

    if (!tool || !["slack", "linear"].includes(tool)) {
      return NextResponse.json(
        { error: "Invalid tool. Must be 'slack' or 'linear'" },
        { status: 400 },
      );
    }

    if (tool === "slack") {
      await clearSlackTokens(userId);
    } else {
      await removeLinearKey(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 },
    );
  }
}
