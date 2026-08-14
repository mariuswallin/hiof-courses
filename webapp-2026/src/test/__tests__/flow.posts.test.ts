/**
 * Integration test: the full post flow — server action against the database,
 * with access control.
 *
 * Three mocks are swapped in before any production module is imported:
 *   @/db                → in-memory SQLite with the prod migrations
 *   rwsdk/worker        → requestInfo.ctx.session + setActor
 *   cloudflare:workers  → env stub (AI, VECTORIZE, R2)
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { eq } from "drizzle-orm";
import { db, schema, resetDb } from "@/test/db-mock";
import { env, vectorize, r2, resetEnv } from "@/test/env-mock";
import { makeUser, makePost, runAs, resetCounter } from "@/test/fixtures";
import { createPost, deletePost } from "@/actions/posts";

describe("flow · innlegg", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
    vi.restoreAllMocks();
  });

  it("createPost lagrer innlegget i databasen", async () => {
    const author = await makeUser({ id: "u1" });

    const result = await runAs(author, () =>
      createPost("Hei fra integrasjonstesten!"),
    );

    expect(result.ok).toBe(true);

    const rows = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.authorId, author.id));

    expect(rows).toHaveLength(1);
    expect(rows[0]!.text).toBe("Hei fra integrasjonstesten!");
  });

  it("createPost lagrer hashtags utledet fra teksten", async () => {
    const author = await makeUser({ id: "u1" });

    await runAs(author, () => createPost("Lærer #RedwoodSDK og #Drizzle i dag"));

    const [row] = await db.select().from(schema.posts);
    expect(JSON.parse(row!.hashtagsJson)).toEqual(["redwoodsdk", "drizzle"]);
  });

  it("avviser innlegg fra en utlogget bruker (401-stien)", async () => {
    // No runAs — the session is anonymous.
    const result = await createPost("Skal ikke lagres");

    expect(result).toEqual({ ok: false, error: "Login required" });
    expect(await db.select().from(schema.posts)).toHaveLength(0);
  });

  it("avviser tom tekst og tekst over 280 tegn", async () => {
    const author = await makeUser({ id: "u1" });

    const empty = await runAs(author, () => createPost(""));
    const tooLong = await runAs(author, () => createPost("a".repeat(281)));

    expect(empty.ok).toBe(false);
    expect(tooLong.ok).toBe(false);
    expect(await db.select().from(schema.posts)).toHaveLength(0);
  });

  it("indekserer innlegget i Vectorize via Workers AI", async () => {
    const author = await makeUser({ id: "u1" });
    const runSpy = vi.spyOn(env.AI, "run");

    const result = await runAs(author, () => createPost("semantisk søk"));

    expect(result.ok).toBe(true);
    expect(runSpy).toHaveBeenCalledOnce();
    // We test the invariant "the post was indexed under its own id", not which
    // numbers the model made up.
    expect(result.ok && vectorize.store.has(result.post.id)).toBe(true);
  });

  it("lagrer innlegget selv om AI-indekseringen feiler (best-effort)", async () => {
    const author = await makeUser({ id: "u1" });
    vi.spyOn(env.AI, "run").mockRejectedValue(new Error("Workers AI nede"));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await runAs(author, () => createPost("skal fortsatt lagres"));

    expect(result.ok).toBe(true);
    expect(await db.select().from(schema.posts)).toHaveLength(1);
    expect(vectorize.store.size).toBe(0);
  });

  it("eieren kan slette sitt eget innlegg", async () => {
    const author = await makeUser({ id: "u1" });
    const post = await makePost({ authorId: author.id, text: "mitt innlegg" });

    const result = await runAs(author, () => deletePost(post.id));

    expect(result.ok).toBe(true);
    expect(await db.select().from(schema.posts)).toHaveLength(0);
  });

  it("kan ikke slette andres innlegg (eierskapsstien)", async () => {
    const author = await makeUser({ id: "u1" });
    const other = await makeUser({ id: "u2" });
    const post = await makePost({ authorId: author.id, text: "mitt innlegg" });

    const result = await runAs(other, () => deletePost(post.id));

    expect(result).toEqual({ ok: false, error: "Not your post" });
    expect(await db.select().from(schema.posts)).toHaveLength(1);
  });

  it("rydder bildet i R2 når innlegget slettes", async () => {
    const author = await makeUser({ id: "u1" });
    await r2.put("posts/bilde.jpg", "bytes");
    const post = await makePost({
      authorId: author.id,
      imageKey: "posts/bilde.jpg",
    });

    await runAs(author, () => deletePost(post.id));

    expect(r2.store.has("posts/bilde.jpg")).toBe(false);
  });
});
