/**
 * Negative testing: hostile input must be treated as *data*, never as
 * commands. These tests guard against regression — the moment someone swaps a
 * Drizzle query for a raw, concatenated `sql` string, they break.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb, sqliteHandle } from "@/test/db-mock";
import { resetEnv } from "@/test/env-mock";
import { makeUser, makePost, runAs, resetCounter } from "@/test/fixtures";
import { createPost, addComment } from "@/actions/posts";
import { getFeedByHashtag, getProfileByUsername } from "@/db/queries";
import type { Db } from "@/db";

const testDb = db as unknown as Db;

function tableExists(name: string): boolean {
  const row = sqliteHandle
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(name);
  return row !== undefined;
}

describe("sikkerhet · injeksjon og fiendtlig input", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
  });

  it("SQL i innleggsteksten lagres som ren tekst", async () => {
    const author = await makeUser({ id: "u1" });
    const evil = "'); DROP TABLE posts; --";

    await runAs(author, () => createPost(evil));

    // The table still exists, and the text is stored literally: Drizzle sends the
    // template and the data separately (parameterized queries).
    expect(tableExists("posts")).toBe(true);
    const rows = await db.select().from(schema.posts);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text).toBe(evil);
  });

  it("SQL i en kommentar lagres som ren tekst", async () => {
    const author = await makeUser({ id: "u1" });
    const post = await makePost({ authorId: author.id });
    const evil = "x'; DELETE FROM comments WHERE '1'='1";

    await runAs(author, () => addComment(post.id, evil));

    expect(tableExists("comments")).toBe(true);
    const rows = await db.select().from(schema.comments);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text).toBe(evil);
  });

  it("' OR '1'='1 i brukernavn-oppslaget gir ingen treff", async () => {
    await makeUser({ id: "u1", username: "alice" });

    const profile = await getProfileByUsername(testDb, "' OR '1'='1");

    expect(profile).toBeNull();
  });

  it("LIKE-jokertegn i hashtag-søk matcher ikke alt", async () => {
    const author = await makeUser({ id: "u1" });
    await runAs(author, () => createPost("noe om #drizzle"));
    await runAs(author, () => createPost("noe om #react"));

    // `%` is a wildcard in LIKE. The search builds its own pattern around a
    // JSON-serialized tag, so the user's `%` becomes part of the string being
    // searched for — not a wildcard that drags in every post.
    const wildcard = await getFeedByHashtag(testDb, "%");
    expect(wildcard).toHaveLength(0);

    const real = await getFeedByHashtag(testDb, "drizzle");
    expect(real).toHaveLength(1);
  });

  it("XSS-nyttelast lagres uskadelig (escaping skjer ved rendring)", async () => {
    const author = await makeUser({ id: "u1" });
    const payload = "<script>alert('xss')</script>";

    await runAs(author, () => createPost(payload));

    const [row] = await db.select().from(schema.posts);
    // Stored literally — React escapes it when rendering.
    expect(row!.text).toBe(payload);
  });
});
