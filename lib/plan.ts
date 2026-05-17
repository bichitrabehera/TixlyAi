import { db } from "./db";
import { tickets } from "./db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { redis } from "./redis";
import { DAILY_LIMIT } from "./constants";

function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

function dailyKey(clerkUserId: string): string {
  return `daily:tickets:${clerkUserId}`;
}

export async function getTodayTicketCount(clerkUserId: string): Promise<number> {
  const cached = await redis.get<number>(dailyKey(clerkUserId));
  if (cached !== null) return cached;

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

  const count = result[0]?.count || 0;

  if (count > 0) {
    await redis.set(dailyKey(clerkUserId), count, { ex: secondsUntilMidnight() });
  }

  return count;
}

export async function incrementTodayTicketCount(clerkUserId: string): Promise<number> {
  const key = dailyKey(clerkUserId);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, secondsUntilMidnight());
  }
  return count;
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
