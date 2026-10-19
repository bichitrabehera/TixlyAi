import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  email: text("email").notNull(),
  slackEncryptedToken: text("slack_encrypted_token"),
  slackUserId: text("slack_user_id"),
  linearEncryptedKey: text("linear_encrypted_key"),
  name: text("name"),
  aiEncryptedKey: text("ai_encrypted_key"),
  aiProvider: text("ai_provider"),
  notificationEmail: text("notification_email").default("off"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiKeys = pgTable(
  "ai_keys",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    clerkUserId: text("clerk_user_id")
      .notNull()
      .references(() => users.clerkUserId, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    encryptedKey: text("encrypted_key").notNull(),
    keyHint: text("key_hint"),
    status: text("status").notNull().default("valid"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("ai_keys_user_provider_idx").on(
      table.clerkUserId,
      table.provider,
    ),
  ],
);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.clerkUserId),
    ticketType: text("ticket_type"),
    screenshotUrl: text("screenshot_url"),
    inputText: text("input_text"),
    generatedTicket: text("generated_ticket").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("tickets_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type AiKeyRow = typeof aiKeys.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type NewUser = typeof users.$inferInsert;
