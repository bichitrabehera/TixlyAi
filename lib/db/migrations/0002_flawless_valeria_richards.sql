ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_encrypted_key" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_provider" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_email" text DEFAULT 'off';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "razorpay_subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "razorpay_customer_id" text;