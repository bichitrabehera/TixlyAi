import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cancelSubscription } from "@/lib/billing";
import { getUserByClerkId, updatePlan } from "@/lib/db/users";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user?.razorpaySubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    await cancelSubscription(user.razorpaySubscriptionId);
    await updatePlan(userId, "free");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
