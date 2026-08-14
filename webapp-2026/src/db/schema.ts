// src/db/schema.ts — Kvitter's full data model.
//
// Better Auth owns the identity tables (`user`, `session`, `account`,
// `verification`). We extend `user` with Kvitter's domain fields (`username`,
// `displayName`, `bio`, `avatarKey`) instead of adding a separate user table,
// so posts, likes and follows point straight at the authenticated user.
// Fields Better Auth sets at sign-up (`name`, `email`, ...) are notNull; the
// domain fields are nullable and filled in later (seed or profile settings).
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
// Drizzle v1: the validation adapters live in drizzle-orm itself (previously
// the separate `drizzle-zod` package).
import { createInsertSchema } from "drizzle-orm/zod";

// ── Better Auth tables (+ Kvitter domain fields on user) ─────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  // ── Kvitter domain fields ──
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarKey: text("avatar_key"), // R2-nøkkel (L14)
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s','now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s','now'))`,
  ),
});

// ── Domain tables ────────────────────────────────────────────────────────

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  hashtagsJson: text("hashtags_json").notNull().default("[]"),
  imageKey: text("image_key"), // R2-nøkkel for innleggsbilde (L14)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  // Soft delete. Nothing writes this yet: both delete paths (the `deletePost`
  // action and DELETE /api/posts/:id) remove the row outright. The read side is
  // already wired for it — the feed queries filter on `IS NULL` and the nightly
  // job purges old rows — so switching to `set({ deletedAt: new Date() })` is
  // a one-line change when we want undo or moderation review.
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

export const likes = sqliteTable(
  "likes",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const follows = sqliteTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followedId: text("followed_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followedId] })],
);

export const blocks = sqliteTable(
  "blocks",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

/**
 * Snapshot of trending posts, written by the cron job in
 * `src/scheduled/trending.ts`. The point is to compute once in the background
 * instead of on every request: the feed reads finished rows from here.
 */
export const trendingSnapshot = sqliteTable("trending_snapshot", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  likeCount: integer("like_count").notNull(),
  computedAt: integer("computed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

// The relations live in `./relations.ts` (Relations v2 — `defineRelations`
// takes the whole schema as input, so they cannot be defined in this file).

// ── Zod schemas ────────────────────────────────────────────────────────

export const insertPostSchema = createInsertSchema(posts, {
  text: (s) => s.min(1).max(280),
});

export const insertCommentSchema = createInsertSchema(comments, {
  text: (s) => s.min(1).max(1000),
});

// ── Types ──────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
