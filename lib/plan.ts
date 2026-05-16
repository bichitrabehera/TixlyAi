import { db } from "./db";
import { tickets } from "./db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";

const DAILY_LIMIT = 10;

export async function getTodayTicketCount(clerkUserId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today;
  const tomorrowStart = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(
      and(
        eq(tickets.userId, clerkUserId),
        gte(tickets.createdAt, todayStart),
        lt(tickets.createdAt, tomorrowStart),
      ),
    );

  return result[0]?.count || 0;
}

export async function canGenerateTicket(clerkUserId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const todayCount = await getTodayTicketCount(clerkUserId);
  return {
    allowed: todayCount < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - todayCount),
  };
}

export async function getUsageInfo(clerkUserId: string): Promise<{
  dailyLimit: number;
  todayUsage: number;
}> {
  const todayCount = await getTodayTicketCount(clerkUserId);
  return {
    dailyLimit: DAILY_LIMIT,
    todayUsage: todayCount,
  };
}
