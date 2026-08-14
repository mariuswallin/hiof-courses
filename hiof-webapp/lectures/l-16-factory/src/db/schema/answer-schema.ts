// src/db/schema/answer-schema.ts

import { createId } from "@/app/lib/utils/id";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { questions } from "./question-schema";
import { relations } from "drizzle-orm";

// Answers table
export const answers = sqliteTable("answers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  answer: text("answer").notNull(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
    () => new Date()
  ),
});

export const answerRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export type Answer = typeof answers.$inferSelect;
export type CreateAnswer = typeof answers.$inferInsert;
