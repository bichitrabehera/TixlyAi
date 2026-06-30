import { MONTHLY_LIMIT_FREE } from "@/lib/constants";

export type PlanFeatures = {
  integrations: boolean;
};

export const PLANS = {
  free: {
    name: "Free",
    monthlyLimit: MONTHLY_LIMIT_FREE,
    price: 0,
    features: { integrations: false } as PlanFeatures,
  },
  pro: {
    name: "Pro",
    monthlyLimit: Infinity,
    price: 5,
    priceInr: 449,
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || "",
    features: { integrations: true } as PlanFeatures,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] || PLANS.free;
}
