// src/db/schema/task-schema.ts

import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { createId } from "@/lib/id";

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
    published: integer("published", { mode: "boolean" }).default(false),
    // Position in the sortable list, written by the reorder action.
    // The column is named sort_order because `order` is a reserved word in
    // SQL. Drizzle quotes identifiers, so `order` would work, but raw SQL in
    // migrations and hand written queries would need quoting too.
    order: integer("sort_order").notNull().default(0),
    // When the overdue reminder for this task was e-mailed, or NULL if it has
    // not been sent. This column is what makes the cron job in
    // src/scheduled/overdueReminders.ts idempotent: the job only picks rows
    // where it is NULL, and stamps it as soon as the mail goes out. Without
    // it, every run would mail the same overdue task again.
    reminderSentAt: integer("reminder_sent_at", { mode: "timestamp" }),
  },
  (table) => [
    index("idx_tasks_user_id").on(table.userId),
    index("completed_idx").on(table.completed),
    index("sort_order_idx").on(table.order),
    // The cron job filters on exactly these two columns. Without the index it
    // would scan the whole table on every run.
    index("due_date_reminder_idx").on(table.dueDate, table.reminderSentAt),
  ]
);

// Relations are no longer declared per table. From Drizzle v1 they live in a
// single `defineRelations` call in src/db/relations.ts (Relations v2).

// Types derived from the table, so they cannot drift from the schema.
// `Task` is a row as read, `CreateTask` a row as inserted (defaults optional).
export type Task = typeof tasks.$inferSelect;
export type CreateTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<CreateTask>;
export type TaskQueryParams = {
  search?: string;
  published?: string;
};
// What `findById` returns: the row plus the joined user from `with: { user: true }`.
export type TaskWithUser = Task & { user: { id: number; name: string } };
