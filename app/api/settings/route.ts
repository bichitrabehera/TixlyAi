import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, updateProfile } from "@/lib/db/users";
import { getPlan } from "@/lib/billing/plans";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = getPlan(user.plan);

    return NextResponse.json({
      name: user.name || "",
      email: user.email,
      plan: user.plan,
      planName: plan.name,
      aiProvider: user.aiProvider,
      hasAiKey: !!user.aiEncryptedKey,
      notificationEmail: user.notificationEmail === "on",
      hasSlack: !!user.slackEncryptedToken,
      hasLinear: !!user.linearEncryptedKey,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (typeof name === "string") {
      await updateProfile(userId, name.trim());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
