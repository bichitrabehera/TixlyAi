import "dotenv/config";
import { NextResponse } from "next/server";
import { updatePlan } from "@/lib/db/users";
import { verifyWebhookSignature } from "@/lib/billing";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 },
      );
    }

    const isValid = verifyWebhookSignature(body, signature, secret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (
      event.event === "subscription.charged" ||
      event.event === "payment.captured"
    ) {
      const notes =
        event.payload?.subscription?.entity?.notes ||
        event.payload?.payment?.entity?.notes ||
        {};
      const clerkUserId = notes.clerkUserId;
      const subscriptionId = event.payload?.subscription?.entity?.id || "";

      if (clerkUserId) {
        await updatePlan(clerkUserId, "pro", subscriptionId);
      }
    }

    if (event.event === "subscription.cancelled") {
      const notes = event.payload?.subscription?.entity?.notes || {};
      const clerkUserId = notes.clerkUserId;

      if (clerkUserId) {
        await updatePlan(clerkUserId, "free");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
