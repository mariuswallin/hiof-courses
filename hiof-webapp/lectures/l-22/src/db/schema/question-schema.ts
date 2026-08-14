// src/db/schema/question-schema.ts

import { createId } from "@/app/lib/utils/id";
import {
  sqliteTable,
  text,
  int,
  integer,
  index,
} from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { relations } from "drizzle-orm/relations";
import { answers } from "./answer-schema";

export const questions = sqliteTable(
  "questions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    question: text("question").notNull(),
    authorId: int("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    status: text("status", {
      enum: ["draft", "published", "archived", "deleted"],
    })
      .notNull()
      .default("draft"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
      () => new Date()
    ),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("author_id_idx").on(table.authorId),
    index("status_idx").on(table.status),
    index("deleted_at_idx").on(table.deletedAt),
  ]
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  answers: many(answers),
}));

export type Question = typeof questions.$inferSelect;
export type CreateQuestion = typeof questions.$inferInsert;
