// src/db/schema/user-schema.ts

import { createId } from "@/app/lib/id";

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users, type User } from "./user-schema";
import { relations } from "drizzle-orm/relations";

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    name: text("name").notNull(),
    description: text("description").notNull(),
    dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    completed: integer("completed", { mode: "boolean" }).default(false),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    index("completed_idx").on(table.completed),
  ]
);

export const taskUserRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export type Task = typeof tasks.$inferSelect;
export type CreateTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<CreateTask>;
export type TaskQuery = {
  dueDate?: Date;
  completed?: boolean;
  userId?: number;
};
export type TaskWithUser = Task & { user: User | null };
