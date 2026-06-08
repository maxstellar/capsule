CREATE TABLE IF NOT EXISTS "whitelist" (
	"slack_id" text PRIMARY KEY NOT NULL,
	"invited_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"invited_at" timestamp with time zone NOT NULL DEFAULT now()
);
