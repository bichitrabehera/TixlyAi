CREATE TABLE "ai_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"provider" text NOT NULL,
	"encrypted_key" text NOT NULL,
	"key_hint" text,
	"status" text DEFAULT 'valid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_keys" ADD CONSTRAINT "ai_keys_clerk_user_id_users_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_keys_user_provider_idx" ON "ai_keys" USING btree ("clerk_user_id","provider");--> statement-breakpoint
INSERT INTO "ai_keys" ("clerk_user_id", "provider", "encrypted_key", "status", "created_at", "updated_at")
SELECT "clerk_user_id", "ai_provider", "ai_encrypted_key", 'valid', now(), now()
FROM "users"
WHERE "ai_encrypted_key" IS NOT NULL AND "ai_provider" IS NOT NULL
ON CONFLICT DO NOTHING;