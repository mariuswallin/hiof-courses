// src/scheduled/trending.ts — compute trending posts in the background.
//
// Why a cron and not per request: the query aggregates over all likes. Run it
// on every page view and every user pays for it. Run it every 4 hours and
// nobody does.
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, likes, trendingSnapshot } from "@/db/schema";

const TRENDING_LIMIT = 20;

export async function computeTrendingPosts(): Promise<number> {
  // Top 20 posts by likes in the last 24 hours. `likes` has a composite
  // primary key (post_id, user_id) and no id column, so we count postId.
  const trending = await db
    .select({
      postId: posts.id,
      likeCount: sql<number>`COUNT(${likes.postId})`
        .mapWith(Number)
        .as("like_count"),
    })
    .from(posts)
    .leftJoin(
      likes,
      sql`${likes.postId} = ${posts.id} AND ${likes.createdAt} > unixepoch('now', '-1 day')`,
    )
    .where(sql`${posts.deletedAt} IS NULL`)
    .groupBy(posts.id)
    .orderBy(desc(sql`like_count`))
    .limit(TRENDING_LIMIT)
    .all();

  // Replace the whole snapshot. Batch insert (one values() call with the full
  // array) instead of one insert per row.
  await db.delete(trendingSnapshot);
  if (trending.length > 0) {
    await db.insert(trendingSnapshot).values(
      trending.map((row, index) => ({
        id: crypto.randomUUID(),
        postId: row.postId,
        rank: index + 1,
        likeCount: row.likeCount,
      })),
    );
  }

  console.log(`[trending] Skrev ${trending.length} rader`);
  return trending.length;
}
