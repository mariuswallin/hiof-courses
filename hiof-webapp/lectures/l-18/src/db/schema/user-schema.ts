// src/db/schema/user-schema.ts

import { relations } from "drizzle-orm/relations";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { questions } from "./question-schema";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export const userRelations = relations(users, ({ many }) => ({
  questions: many(questions),
}));

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
