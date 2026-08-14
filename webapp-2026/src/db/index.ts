// src/db/index.ts
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import type { SQLiteAsyncDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";
import { relations } from "./relations";

/**
 * One Drizzle client backed by Cloudflare D1. Used for everything — Better
 * Auth, sessions, posts, likes, follows. Import `db` directly from here.
 *
 * Drizzle v1 takes `relations` (Relations v2) here instead of `schema`; the
 * tables are read out of the relations object.
 */
export const db = drizzle(env.DB, { relations });
export { schema, relations };

/**
 * Driver-agnostic database type. `db` (D1) in production and a better-sqlite3
 * client in tests are both `SQLiteAsyncDatabase` (the v1 name for what was
 * `BaseSQLiteDatabase` in v0), so the query functions in `queries.ts` can run
 * against either.
 */
export type Db = SQLiteAsyncDatabase<any, any, typeof relations>;
