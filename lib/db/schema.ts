import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  email: text("email").notNull(),
  plan: text("plan").notNull().default("free"),
  planStartedAt: timestamp("plan_started_at"),
  slackEncryptedToken: text("slack_encrypted_token"),
  slackUserId: text("slack_user_id"),
  linearEncryptedKey: text("linear_encrypted_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.clerkUserId),
  screenshotUrl: text("screenshot_url"),
  inputText: text("input_text"),
  generatedTicket: text("generated_ticket").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type NewUser = typeof users.$inferInsert;
