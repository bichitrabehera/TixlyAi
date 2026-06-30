import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

const statements = [
  sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;`,
  sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ai_encrypted_key" text;`,
  sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ai_provider" text;`,
  sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_email" text DEFAULT 'off';`,
  sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "razorpay_subscription_id" text;`,
  sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "razorpay_customer_id" text;`,
];

for (const stmt of statements) {
  try {
    await stmt;
    console.log("OK");
  } catch (e) {
    console.error("FAIL:", e.message);
  }
}

console.log("Migration complete");
process.exit(0);
