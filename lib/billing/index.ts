import Razorpay from "razorpay";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials not configured");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function createSubscription(clerkUserId: string, email: string): Promise<{ id: string; short_url: string }> {
  const razorpay = getRazorpay();
  const planId = process.env.RAZORPAY_PRO_PLAN_ID;
  if (!planId) throw new Error("Razorpay plan ID not configured");

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12,
    notes: { clerkUserId },
  });

  return { id: subscription.id as string, short_url: subscription.short_url as string };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const razorpay = getRazorpay();
  await razorpay.subscriptions.cancel(subscriptionId);
}

export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  return validateWebhookSignature(body, signature, secret);
}
