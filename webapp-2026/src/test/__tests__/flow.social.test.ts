/**
 * Integration test: likes, comments, follows — and that the feed queries read
 * back what the actions wrote. This is the seam between the layers that the
 * unit tests in `src/lib/` and `src/db/` do not catch on their own.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb } from "@/test/db-mock";
import { resetEnv } from "@/test/env-mock";
import { makeUser, makePost, runAs, resetCounter } from "@/test/fixtures";
import { toggleLike, addComment, createPost } from "@/actions/posts";
import { toggleFollow } from "@/actions/follows";
import { getFeed, getFeedForUser } from "@/db/queries";
import type { Db } from "@/db";

// `db` from db-mock is the better-sqlite3 driver; the query functions take a
// driver-agnostic `Db` (BaseSQLiteDatabase), which D1 and better-sqlite3 both are.
const testDb = db as unknown as Db;

describe("flow · likes og kommentarer", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
  });

  it("toggleLike legger til og fjerner igjen", async () => {
    const author = await makeUser({ id: "u1" });
    const reader = await makeUser({ id: "u2" });
    const post = await makePost({ authorId: author.id });

    const first = await runAs(reader, () => toggleLike(post.id));
    expect(first).toEqual({ ok: true, liked: true });
    expect(await db.select().from(schema.likes)).toHaveLength(1);

    const second = await runAs(reader, () => toggleLike(post.id));
    expect(second).toEqual({ ok: true, liked: false });
    expect(await db.select().from(schema.likes)).toHaveLength(0);
  });

  it("krever innlogging for å like", async () => {
    const author = await makeUser({ id: "u1" });
    const post = await makePost({ authorId: author.id });

    const result = await toggleLike(post.id);

    expect(result).toEqual({ ok: false, error: "Login required" });
  });

  it("addComment lagrer kommentaren på innlegget", async () => {
    const author = await makeUser({ id: "u1" });
    const reader = await makeUser({ id: "u2" });
    const post = await makePost({ authorId: author.id });

    const result = await runAs(reader, () => addComment(post.id, "Bra skrevet"));

    expect(result.ok).toBe(true);
    const rows = await db.select().from(schema.comments);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text).toBe("Bra skrevet");
    expect(rows[0]!.authorId).toBe(reader.id);
  });

  it("teller likes og kommentarer i feeden", async () => {
    const author = await makeUser({ id: "u1" });
    const reader = await makeUser({ id: "u2" });
    const post = await makePost({ authorId: author.id });

    await runAs(reader, () => toggleLike(post.id));
    await runAs(reader, () => addComment(post.id, "Enig"));

    const feed = await getFeed(testDb);
    expect(feed).toHaveLength(1);
    expect(feed[0]!.likeCount).toBe(1);
    expect(feed[0]!.commentCount).toBe(1);
  });
});

describe("flow · følging", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
  });

  it("toggleFollow følger og slutter å følge", async () => {
    const follower = await makeUser({ id: "u1" });
    const followed = await makeUser({ id: "u2" });

    expect(await runAs(follower, () => toggleFollow(followed.id))).toEqual({
      ok: true,
      following: true,
    });
    expect(await db.select().from(schema.follows)).toHaveLength(1);

    expect(await runAs(follower, () => toggleFollow(followed.id))).toEqual({
      ok: true,
      following: false,
    });
    expect(await db.select().from(schema.follows)).toHaveLength(0);
  });

  it("kan ikke følge seg selv", async () => {
    const user = await makeUser({ id: "u1" });

    const result = await runAs(user, () => toggleFollow(user.id));

    expect(result).toEqual({ ok: false, error: "Kan ikke følge deg selv" });
    expect(await db.select().from(schema.follows)).toHaveLength(0);
  });

  it("den personlige feeden viser egne innlegg og de man følger", async () => {
    const me = await makeUser({ id: "u1" });
    const followed = await makeUser({ id: "u2" });
    const stranger = await makeUser({ id: "u3" });

    await runAs(me, () => createPost("mitt eget"));
    await runAs(followed, () => createPost("fra en jeg følger"));
    await runAs(stranger, () => createPost("fra en fremmed"));
    await runAs(me, () => toggleFollow(followed.id));

    const feed = await getFeedForUser(testDb, me.id);
    const texts = feed.map((p) => p.text);

    expect(texts).toContain("mitt eget");
    expect(texts).toContain("fra en jeg følger");
    expect(texts).not.toContain("fra en fremmed");
  });
});
