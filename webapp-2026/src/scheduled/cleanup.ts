// src/scheduled/cleanup.ts — nightly cleanup.
//
// Both jobs are *idempotent*: run them twice and the result is the same. That
// is the requirement for a cron job, because you get no guarantee it runs
// exactly once.
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { db } from "@/db";
import { posts } from "@/db/schema";

const RETENTION_DAYS = 30;

/**
 * Delete soft-deleted posts older than the retention window.
 *
 * A no-op today: nothing sets `posts.deletedAt` yet (see schema.ts). The job is
 * here so the retention policy exists the moment soft delete is turned on.
 */
export async function cleanupSoftDeleted(): Promise<number> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // returning() hands the rows back, so the count is unambiguous and loggable.
  const deleted = await db
    .delete(posts)
    .where(and(isNotNull(posts.deletedAt), lt(posts.deletedAt, cutoff)))
    .returning({ id: posts.id });

  console.log(`[cleanup] Slettet ${deleted.length} myk-slettede innlegg`);
  return deleted.length;
}

/**
 * Remove R2 objects no post points to any more. Without this you pay to store
 * images that are never shown again.
 */
export async function cleanupOrphanedImages(): Promise<number> {
  if (!env.R2) return 0;

  let cursor: string | undefined;
  let removed = 0;

  do {
    // Page through the bucket in chunks — an R2 listing can be arbitrarily large.
    const list = await env.R2.list({ prefix: "posts/", cursor, limit: 100 });
    cursor = list.truncated ? list.cursor : undefined;

    for (const object of list.objects) {
      const match = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.imageKey, object.key))
        .get();

      if (!match) {
        await env.R2.delete(object.key);
        removed += 1;
      }
    }
  } while (cursor);

  console.log(`[cleanup] Fjernet ${removed} foreldreløse R2-objekter`);
  return removed;
}

/** The nightly job: both cleanups in order. */
export async function runNightlyCleanup(): Promise<void> {
  await cleanupSoftDeleted();
  await cleanupOrphanedImages();
}
