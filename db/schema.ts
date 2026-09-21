import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Preserve the starter table until the example CRUD is retired.
export const todosTable = sqliteTable("todos", {
  id: integer().primaryKey({ autoIncrement: true }),
  description: text().notNull(),
  completed: integer({ mode: "boolean" }).notNull().default(false),
});

export const disciplines = sqliteTable("disciplines", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  nameKey: text("name_key").notNull().unique(),
});

export const questionLogs = sqliteTable("question_logs", {
  id: integer().primaryKey({ autoIncrement: true }),
  disciplineId: integer("discipline_id").notNull().references(() => disciplines.id),
  date: text().notNull(),
  correct: integer().notNull(),
  wrong: integer().notNull(),
  createdAt: text("created_at").notNull().default(sql.raw("CURRENT_TIMESTAMP")),
});

export const discursiveAttempts = sqliteTable("discursive_attempts", {
  id: integer().primaryKey({ autoIncrement: true }),
  kind: text().notNull(),
  command: text().notNull(),
  criteria: text().notNull(), // JSON array: training rubric supplied by the user.
  referenceAnswer: text("reference_answer").notNull().default(""),
  answer: text().notNull(),
  feedback: text(), // Structured JSON, only visible when status = completed.
  status: text().notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql.raw("CURRENT_TIMESTAMP")),
});
