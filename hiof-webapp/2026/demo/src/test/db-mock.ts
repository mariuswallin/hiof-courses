/**
 * Drop-in replacement for `@/db` in tests.
 *
 * Builds a fresh in-memory SQLite (better-sqlite3) on import and runs the
 * same Drizzle migrations as production, so the test database has exactly the
 * schema D1 has. Production code is unchanged; only the driver is swapped.
 *
 * Used like this in a test file:
 *   vi.mock("@/db", () => import("@/test/db-mock"));
 *
 * `resetDb()` empties every table between tests but keeps the schema.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { relations } from "@/db/relations";

const sqlite = new Database(":memory:");
sqlite.pragma("foreign_keys = ON");

// Drizzle v1 reorganized the migrations folder: each migration is its own
// directory (`<timestamp>_<name>/migration.sql` + `snapshot.json`) instead of
// loose .sql files and a journal.json.
const migrationsDir = path.resolve(process.cwd(), "drizzle/migrations");
const migrationFiles = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(e.name, "migration.sql"))
  .sort();

for (const file of migrationFiles) {
  const raw = readFileSync(path.join(migrationsDir, file), "utf8");
  // Drizzle separates statements with `--> statement-breakpoint`.
  const statements = raw
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    try {
      sqlite.exec(stmt);
    } catch (err) {
      console.error(`Migration ${file} failed on:`, stmt.slice(0, 200));
      throw err;
    }
  }
}

// v1: the client is passed as `client` in the config object, and `schema` is
// replaced by `relations` (Relations v2).
export const db = drizzle({ client: sqlite, relations });

/** The raw SQLite handle, for tests that check the schema directly. */
export const sqliteHandle = sqlite;

/** Empty every table between tests. Keeps the schema. */
export function resetDb(): void {
  sqlite.pragma("foreign_keys = OFF");
  const tables = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all() as { name: string }[];
  for (const t of tables) sqlite.exec(`DELETE FROM "${t.name}"`);
  sqlite.pragma("foreign_keys = ON");
}

export * as schema from "@/db/schema";
export { relations };
