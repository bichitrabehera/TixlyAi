import { db } from "./db";
import { users, type User } from "./db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { tickets } from "./db/schema";

export type Plan = "free" | "basic";

export const PLAN_LIMITS = {
  free: 10,
  basic: 50,
} as const;

export const PLAN_DURATION_DAYS = 30;

export async function getUserPlan(clerkUserId: string): Promise<Plan> {
  const user = (await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).then(r => r[0])) as User | undefined;
  
  if (!user) {
    return "free";
  }

  // Check for auto-downgrade
  if (user.plan === "basic" && user.planStartedAt) {
    const daysSinceUpgrade = Math.floor(
      (Date.now() - new Date(user.planStartedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpgrade >= PLAN_DURATION_DAYS) {
      // Auto-downgrade to free
      await db.update(users).set({ plan: "free", planStartedAt: null }).where(eq(users.id, user.id));
      return "free";
    }
  }

  return user.plan as Plan;
}

export async function isBasic(clerkUserId: string): Promise<boolean> {
  return (await getUserPlan(clerkUserId)) === "basic";
}

export function getDailyLimit(plan: Plan): number {
  return PLAN_LIMITS[plan];
}

export async function getTodayTicketCount(userId: number): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayStart = today;
  const tomorrowStart = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(
      and(
        eq(tickets.userId, userId),
        gte(tickets.createdAt, todayStart),
        lt(tickets.createdAt, tomorrowStart)
      )
    );

  return result[0]?.count || 0;
}

export async function canGenerateTicket(clerkUserId: string): Promise<{ allowed: boolean; remaining: number; plan: Plan }> {
  const user = (await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).then(r => r[0])) as User | undefined;
  
  if (!user) {
    return { allowed: true, remaining: PLAN_LIMITS.free, plan: "free" };
  }

  const plan = await getUserPlan(clerkUserId);
  const dailyLimit = PLAN_LIMITS[plan];
  const todayCount = await getTodayTicketCount(user.id);
  const remaining = Math.max(0, dailyLimit - todayCount);

  return {
    allowed: todayCount < dailyLimit,
    remaining,
    plan,
  };
}

export async function upgradeToBasic(clerkUserId: string): Promise<boolean> {
  const user = (await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).then(r => r[0])) as User | undefined;
  
  if (!user) {
    return false;
  }

  await db
    .update(users)
    .set({ plan: "basic", planStartedAt: new Date() })
    .where(eq(users.id, user.id));

  return true;
}

export async function getUserPlanInfo(clerkUserId: string): Promise<{
  plan: Plan;
  planStartedAt: Date | null;
  daysRemaining: number | null;
  dailyLimit: number;
  todayUsage: number;
}> {
  const user = (await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).then(r => r[0])) as User | undefined;
  
  if (!user) {
    return { plan: "free", planStartedAt: null, daysRemaining: null, dailyLimit: PLAN_LIMITS.free, todayUsage: 0 };
  }

  const plan = await getUserPlan(clerkUserId);
  const dailyLimit = PLAN_LIMITS[plan];
  const todayCount = await getTodayTicketCount(user.id);

  let daysRemaining: number | null = null;
  if (plan === "basic" && user.planStartedAt) {
    const daysSinceUpgrade = Math.floor(
      (Date.now() - new Date(user.planStartedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    daysRemaining = Math.max(0, PLAN_DURATION_DAYS - daysSinceUpgrade);
  }

  return {
    plan,
    planStartedAt: user.planStartedAt,
    daysRemaining,
    dailyLimit,
    todayUsage: todayCount,
  };
}