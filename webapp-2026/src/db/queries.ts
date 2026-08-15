// src/db/queries.ts
import { desc, eq, inArray, sql, isNull, and, type SQL } from "drizzle-orm";
import type { Db } from "./index";
import {
  posts,
  user,
  likes,
  follows,
  comments,
  trendingSnapshot,
} from "./schema";

export type FeedAuthor = {
  id: string;
  username: string | null;
  displayName: string | null;
  name: string;
  avatarKey: string | null;
};

export type FeedItem = {
  id: string;
  text: string;
  createdAt: Date;
  hashtags: string[];
  imageKey: string | null;
  author: FeedAuthor;
  likeCount: number;
  commentCount: number;
  /**
   * Has the signed-in viewer liked this post? `false` for signed-out users.
   * This must come from the server: the heart is part of the first render, so
   * the client cannot guess it — see PostActions.tsx.
   */
  likedByMe: boolean;
};

/**
 * Shared select shape for feed rows, so every feed query maps the same way.
 * `viewerId` er den som ser på feeden (null = utlogget).
 */
function feedSelect(viewerId: string | null) {
  return {
    id: posts.id,
    text: posts.text,
    createdAt: posts.createdAt,
    hashtagsJson: posts.hashtagsJson,
    imageKey: posts.imageKey,
    authorId: user.id,
    authorUsername: user.username,
    authorDisplayName: user.displayName,
    authorName: user.name,
    authorAvatarKey: user.avatarKey,
    likeCount: sql<number>`(
      SELECT COUNT(*) FROM ${likes} WHERE ${likes.postId} = ${posts.id}
    )`,
    commentCount: sql<number>`(
      SELECT COUNT(*) FROM ${comments} WHERE ${comments.postId} = ${posts.id}
    )`,
    // EXISTS gir 0/1 i SQLite. For not logged-in users, we return 0 (false) for likedByMe.
    likedByMe: viewerId
      ? sql<number>`EXISTS (
          SELECT 1 FROM ${likes}
          WHERE ${likes.postId} = ${posts.id} AND ${likes.userId} = ${viewerId}
        )`
      : sql<number>`0`,
  };
}

type FeedRow = {
  id: string;
  text: string;
  createdAt: Date;
  hashtagsJson: string;
  imageKey: string | null;
  authorId: string;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorName: string;
  authorAvatarKey: string | null;
  likeCount: number;
  commentCount: number;
  likedByMe: number;
};

function toFeedItem(r: FeedRow): FeedItem {
  return {
    id: r.id,
    text: r.text,
    createdAt: r.createdAt,
    hashtags: JSON.parse(r.hashtagsJson) as string[],
    imageKey: r.imageKey,
    author: {
      id: r.authorId,
      username: r.authorUsername,
      displayName: r.authorDisplayName,
      name: r.authorName,
      avatarKey: r.authorAvatarKey,
    },
    likeCount: Number(r.likeCount),
    commentCount: Number(r.commentCount),
    likedByMe: Number(r.likedByMe) === 1,
  };
}

// Shared feed query: same select/join/order, only the WHERE varies.
async function runFeedQuery(
  db: Db,
  where: SQL | undefined,
  limit: number,
  viewerId: string | null,
): Promise<FeedItem[]> {
  const rows = (await db
    .select(feedSelect(viewerId))
    .from(posts)
    .innerJoin(user, eq(user.id, posts.authorId))
    .where(where)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .all()) as FeedRow[];
  return rows.map(toFeedItem);
}

/** Global feed — newest first, excludes soft-deleted posts. */
export async function getFeed(
  db: Db,
  viewerId: string | null = null,
  limit = 50,
): Promise<FeedItem[]> {
  return runFeedQuery(db, isNull(posts.deletedAt), limit, viewerId);
}

/**
 * Personal feed — own posts plus posts from people you follow. Her er `userId`
 * både filteret og leseren, så den trenger ingen egen `viewerId`.
 */
export async function getFeedForUser(
  db: Db,
  userId: string,
  limit = 50,
): Promise<FeedItem[]> {
  const followedRows = await db
    .select({ id: follows.followedId })
    .from(follows)
    .where(eq(follows.followerId, userId))
    .all();
  const followedIds = [
    userId,
    ...followedRows.map((f: { id: string }) => f.id),
  ];
  return runFeedQuery(
    db,
    and(isNull(posts.deletedAt), inArray(posts.authorId, followedIds)),
    limit,
    userId,
  );
}

/**
 * Escape LIKE wildcards in user input. Parameterization protects against SQL
 * injection, but not against the user's own `%`/`_` being read as wildcards —
 * a search for "%" would otherwise match everything.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Posts containing a given hashtag (stored in hashtags_json). */
export async function getFeedByHashtag(
  db: Db,
  tag: string,
  viewerId: string | null = null,
  limit = 50,
): Promise<FeedItem[]> {
  const needle = `%${escapeLike(JSON.stringify(tag.toLowerCase()))}%`;
  return runFeedQuery(
    db,
    and(
      isNull(posts.deletedAt),
      sql`${posts.hashtagsJson} LIKE ${needle} ESCAPE '\\'`,
    ),
    limit,
    viewerId,
  );
}

/** Posts from a single author (profile feed). */
export async function getPostsByAuthor(
  db: Db,
  authorId: string,
  viewerId: string | null = null,
  limit = 50,
): Promise<FeedItem[]> {
  return runFeedQuery(
    db,
    and(isNull(posts.deletedAt), eq(posts.authorId, authorId)),
    limit,
    viewerId,
  );
}

/**
 * Trending posts from the latest snapshot, written by the cron job in
 * `src/scheduled/trending.ts`. The feed reads finished rows instead of
 * aggregating over all likes on every request.
 */
export async function getTrendingPosts(
  db: Db,
  viewerId: string | null = null,
  limit = 10,
): Promise<FeedItem[]> {
  const ranked = await db
    .select({ postId: trendingSnapshot.postId })
    .from(trendingSnapshot)
    .orderBy(trendingSnapshot.rank)
    .limit(limit)
    .all();
  if (ranked.length === 0) return [];

  const ids: string[] = ranked.map((r: { postId: string }) => r.postId);
  const items = await runFeedQuery(
    db,
    and(isNull(posts.deletedAt), inArray(posts.id, ids)),
    limit,
    viewerId,
  );
  // Keep the snapshot order — the SQL above returns newest first.
  const order = new Map<string, number>(ids.map((id, index) => [id, index]));
  return items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export type Profile = {
  id: string;
  username: string | null;
  displayName: string | null;
  name: string;
  bio: string | null;
  avatarKey: string | null;
  followerCount: number;
  followingCount: number;
};

/** Profile by username (falls back to id when username is missing). */
export async function getProfileByUsername(
  db: Db,
  username: string,
): Promise<Profile | null> {
  const row = await db
    .select({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      name: user.name,
      bio: user.bio,
      avatarKey: user.avatarKey,
      followerCount: sql<number>`(
        SELECT COUNT(*) FROM ${follows} WHERE ${follows.followedId} = ${user.id}
      )`,
      followingCount: sql<number>`(
        SELECT COUNT(*) FROM ${follows} WHERE ${follows.followerId} = ${user.id}
      )`,
    })
    .from(user)
    .where(eq(user.username, username))
    .get();
  if (!row) return null;
  return {
    ...row,
    followerCount: Number(row.followerCount),
    followingCount: Number(row.followingCount),
  };
}
