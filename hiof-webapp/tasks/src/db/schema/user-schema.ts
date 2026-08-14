// src/db/schema/user-schema.ts

import { relations } from "drizzle-orm/relations";
import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { tasks, type Task } from "./task-schema";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserWithTasks = User & { tasks: Task[] };
