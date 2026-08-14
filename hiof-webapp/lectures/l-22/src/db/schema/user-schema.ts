// src/db/schema/user-schema.ts

import { createId } from "@/app/lib/utils/id";
import { sqliteTable, text, int, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { questions } from "./question-schema";
import { answers } from "./answer-schema";

// Users table with role support
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
    () => new Date()
  ),
});

// Sessions table for server-side session management
export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type CreateSession = typeof sessions.$inferInsert;
export type UserRole = "admin" | "user";

// Safe user type without password hash
export type SafeUser = Omit<User, "passwordHash">;
