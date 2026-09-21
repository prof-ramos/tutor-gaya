CREATE TABLE IF NOT EXISTS "disciplines" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "name" text NOT NULL,
  "name_key" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_logs" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "discipline_id" integer NOT NULL REFERENCES "disciplines"("id"),
  "date" text NOT NULL,
  "correct" integer NOT NULL CHECK ("correct" >= 0),
  "wrong" integer NOT NULL CHECK ("wrong" >= 0),
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CHECK ("correct" + "wrong" > 0)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_logs_discipline_date_idx" ON "question_logs" ("discipline_id", "date");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discursive_attempts" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "kind" text NOT NULL,
  "command" text NOT NULL,
  "criteria" text NOT NULL,
  "reference_answer" text DEFAULT '' NOT NULL,
  "answer" text NOT NULL,
  "feedback" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
