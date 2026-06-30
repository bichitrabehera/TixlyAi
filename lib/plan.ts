import { db } from "./db";
import { tickets } from "./db/schema";
import { and, gte, sql } from "drizzle-orm";
import { getUserByClerkId, getMonthlyTicketCount } from "./db/users";
import { MONTHLY_LIMIT_FREE } from "./constants";
import { getPlan } from "./billing/plans";

export async function canGenerateTicket(clerkUserId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const user = await getUserByClerkId(clerkUserId);
  const plan = getPlan(user?.plan || "free");

  if (plan.price > 0) {
    return { allowed: true, remaining: Infinity };
  }

  const monthlyCount = await getMonthlyTicketCount(clerkUserId);
  const remaining = Math.max(0, MONTHLY_LIMIT_FREE - monthlyCount);
  return { allowed: monthlyCount < MONTHLY_LIMIT_FREE, remaining };
}

export async function getUsageInfo(clerkUserId: string): Promise<{
  monthlyLimit: number;
  monthlyUsage: number;
  plan: string;
}> {
  const user = await getUserByClerkId(clerkUserId);
  const plan = getPlan(user?.plan || "free");
  const monthlyCount = await getMonthlyTicketCount(clerkUserId);

  return {
    monthlyLimit: plan.monthlyLimit,
    monthlyUsage: monthlyCount,
    plan: user?.plan || "free",
  };
}
