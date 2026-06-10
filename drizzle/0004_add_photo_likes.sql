CREATE TABLE IF NOT EXISTS "photo_likes" (
  "photo_id" uuid NOT NULL REFERENCES "photos"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("photo_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "photo_likes_photo_idx" ON "photo_likes" ("photo_id");
