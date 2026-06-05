ALTER TABLE "users" ADD COLUMN "slack_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slack_notify" boolean NOT NULL DEFAULT true;
