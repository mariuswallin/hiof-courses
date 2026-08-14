// src/actions/follows.ts — follow / unfollow
"use server";
import { requestInfo } from "rwsdk/worker";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { follows } from "@/db/schema";

export async function toggleFollow(followedId: string) {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    return { ok: false as const, error: "Login required" };
  }
  const followerId = ctx.session.userId!;
  if (followerId === followedId) {
    return { ok: false as const, error: "Kan ikke følge deg selv" };
  }

  const existing = await db
    .select()
    .from(follows)
    .where(
      and(eq(follows.followerId, followerId), eq(follows.followedId, followedId)),
    )
    .get();

  if (existing) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followedId, followedId),
        ),
      );
    return { ok: true as const, following: false };
  }
  await db
    .insert(follows)
    .values({ followerId, followedId })
    .onConflictDoNothing();
  return { ok: true as const, following: true };
}
