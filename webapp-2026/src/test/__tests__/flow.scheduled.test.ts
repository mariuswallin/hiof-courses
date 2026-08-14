/**
 * Integration test of the cron jobs. The jobs are ordinary functions over `db`
 * and `env`, so they use exactly the same three mocks as server actions.
 *
 * What matters here is *idempotency*: run a cron job twice and the result
 * should be the same. You get no guarantee that it runs exactly once.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb } from "@/test/db-mock";
import { r2, resetEnv } from "@/test/env-mock";
import { makeUser, makePost, runAs, resetCounter } from "@/test/fixtures";
import { cleanupSoftDeleted, cleanupOrphanedImages } from "@/scheduled/cleanup";
import { computeTrendingPosts } from "@/scheduled/trending";
import { toggleLike } from "@/actions/posts";
import { getTrendingPosts } from "@/db/queries";
import type { Db } from "@/db";

const testDb = db as unknown as Db;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe("cron · cleanupSoftDeleted", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("sletter myk-slettede innlegg eldre enn 30 dager", async () => {
    const author = await makeUser({ id: "u1" });
    await makePost({ authorId: author.id, id: "gammel", deletedAt: daysAgo(40) });
    await makePost({ authorId: author.id, id: "fersk", deletedAt: daysAgo(3) });
    await makePost({ authorId: author.id, id: "aktiv" });

    const removed = await cleanupSoftDeleted();

    expect(removed).toBe(1);
    const remaining = (await db.select().from(schema.posts)).map((p) => p.id);
    expect(remaining.sort()).toEqual(["aktiv", "fersk"]);
  });

  it("er idempotent — andre kjøring sletter ingenting nytt", async () => {
    const author = await makeUser({ id: "u1" });
    await makePost({ authorId: author.id, deletedAt: daysAgo(40) });

    expect(await cleanupSoftDeleted()).toBe(1);
    expect(await cleanupSoftDeleted()).toBe(0);
  });
});

describe("cron · cleanupOrphanedImages", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("fjerner R2-objekter ingen innlegg peker på", async () => {
    const author = await makeUser({ id: "u1" });
    await makePost({ authorId: author.id, imageKey: "posts/brukt.jpg" });
    await r2.put("posts/brukt.jpg", "bytes");
    await r2.put("posts/foreldrelos.jpg", "bytes");

    const removed = await cleanupOrphanedImages();

    expect(removed).toBe(1);
    expect(r2.store.has("posts/brukt.jpg")).toBe(true);
    expect(r2.store.has("posts/foreldrelos.jpg")).toBe(false);
  });

  it("rører ikke objekter utenfor posts/-prefikset", async () => {
    await r2.put("avatars/u1-1.jpg", "bytes");

    await cleanupOrphanedImages();

    expect(r2.store.has("avatars/u1-1.jpg")).toBe(true);
  });
});

describe("cron · computeTrendingPosts", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("rangerer innlegg etter likes siste døgn og lagrer et snapshot", async () => {
    const author = await makeUser({ id: "u1" });
    const a = await makeUser({ id: "u2" });
    const b = await makeUser({ id: "u3" });
    const popular = await makePost({ authorId: author.id, id: "populaer" });
    await makePost({ authorId: author.id, id: "stille" });

    await runAs(a, () => toggleLike(popular.id));
    await runAs(b, () => toggleLike(popular.id));

    await computeTrendingPosts();

    const trending = await getTrendingPosts(testDb);
    expect(trending[0]!.id).toBe("populaer");
    expect(trending[0]!.likeCount).toBe(2);
  });

  it("er idempotent — snapshotet erstattes, ikke dupliseres", async () => {
    const author = await makeUser({ id: "u1" });
    await makePost({ authorId: author.id });

    await computeTrendingPosts();
    await computeTrendingPosts();

    const rows = await db.select().from(schema.trendingSnapshot);
    expect(rows).toHaveLength(1);
  });

  it("gir tom trending-liste når det ikke finnes innlegg", async () => {
    await computeTrendingPosts();

    expect(await getTrendingPosts(testDb)).toEqual([]);
  });
});
