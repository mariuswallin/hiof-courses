// src/db/index.ts

import { drizzle } from "drizzle-orm/d1";
import type { SQLiteAsyncDatabase } from "drizzle-orm/sqlite-core";
import { env } from "cloudflare:workers";
import * as schema from "./schema";
import { relations } from "./relations";

/**
 * One Drizzle client against Cloudflare D1.
 *
 * Drizzle v1 takes `relations` (Relations v2) here instead of `schema`. The
 * tables are read out of the relations object.
 */
export const db = drizzle(env.DB, { relations });

export { schema, relations };

/**
 * Driver agnostic database type. `db` (D1) in production and a better-sqlite3
 * client in tests are both `SQLiteAsyncDatabase`, so repository code runs
 * against either one.
 */
export type DB = SQLiteAsyncDatabase<any, any, typeof relations>;
