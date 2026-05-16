import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encryptToken } from "@/lib/slack";
import { updateLinearKey, removeLinearKey, getLinearKey } from "@/lib/db/users";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = await getLinearKey(userId);
    return NextResponse.json({ connected: key !== null });
  } catch (error) {
    console.error("Linear key check error:", error);
    return NextResponse.json({ connected: false });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey } = await request.json();
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    const encryptedKey = encryptToken(apiKey);
    await updateLinearKey(userId, encryptedKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Linear key save error:", error);
    return NextResponse.json(
      { error: "Failed to save Linear key" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await removeLinearKey(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Linear key delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove Linear key" },
      { status: 500 },
    );
  }
}
