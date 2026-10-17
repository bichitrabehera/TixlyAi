import { and, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { tickets, type Ticket } from "./schema";
import { TICKET_HISTORY_PAGE_SIZE } from "@/lib/constants";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listTicketsForUser(
  clerkUserId: string,
  limit: number = TICKET_HISTORY_PAGE_SIZE,
): Promise<Ticket[]> {
  return db
    .select()
    .from(tickets)
    .where(eq(tickets.userId, clerkUserId))
    .orderBy(sql`${tickets.createdAt} DESC`)
    .limit(limit);
}

export async function getTicketForUser(
  id: string,
  clerkUserId: string,
): Promise<Ticket | null> {
  if (!UUID_RE.test(id)) return null;

  const [row] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.userId, clerkUserId)))
    .limit(1);

  return row ?? null;
}
