"use server";
// src/actions/posts.ts — server actions for posts, including embedding
// indexing and R2 cleanup.
//
// NB: "use server" må stå først i fila. rwsdk leter bare i de første 512
// tegnene, så et langt kommentarblokk foran direktivet gjør at fila ikke
// registreres som server-modul.
//
// Every action below checks the session itself, and that is not redundant with
// the `requireAuth` middleware. An action is dispatched as
// `POST <path>?__rsc_action_id=…` with the path chosen by the caller, and rwsdk
// runs pending actions even when no route matched (just before its 404). No
// route means no interruptor, so a route guard never protects an action.
// rwsdk does reject action POSTs from a foreign origin, but that is CSRF
// defense, not authorization: any signed-in caller gets through it.
// Enforced by src/test/__tests__/security.actions-auth.test.ts.
import { requestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  posts,
  likes,
  comments,
  insertPostSchema,
  insertCommentSchema,
} from "@/db/schema";
import { extractHashtags } from "@/lib/hashtag";
import { indexPost } from "@/lib/ai/rag";

export async function createPost(text: string) {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    return { ok: false as const, error: "Login required" };
  }
  const candidate = {
    id: crypto.randomUUID(),
    text,
    authorId: ctx.session.userId!,
    hashtagsJson: JSON.stringify(extractHashtags(text)),
  };
  // Validate on the server — never trust the client.
  const parsed = insertPostSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }
  await db.insert(posts).values(candidate);

  // Best-effort semantic indexing. Does not fail the write when Vectorize/AI
  // is unavailable (for example locally without remote bindings).
  await indexPost(env, candidate);

  return { ok: true as const, post: candidate };
}

export async function deletePost(postId: string) {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    return { ok: false as const, error: "Login required" };
  }
  const existing = await db
    .select({ authorId: posts.authorId, imageKey: posts.imageKey })
    .from(posts)
    .where(eq(posts.id, postId))
    .get();
  if (!existing) return { ok: false as const, error: "Not found" };
  if (existing.authorId !== ctx.session.userId) {
    return { ok: false as const, error: "Not your post" };
  }

  // Clean up R2 before deleting the DB row, otherwise the image is orphaned.
  if (existing.imageKey && env.R2) {
    await env.R2.delete(existing.imageKey).catch(() => {});
  }

  await db.delete(posts).where(eq(posts.id, postId));
  return { ok: true as const };
}

export async function toggleLike(postId: string) {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    return { ok: false as const, error: "Login required" };
  }
  const userId = ctx.session.userId!;
  const existing = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
    .get();

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    return { ok: true as const, liked: false };
  }
  await db.insert(likes).values({ postId, userId }).onConflictDoNothing();
  return { ok: true as const, liked: true };
}

export async function addComment(postId: string, text: string) {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    return { ok: false as const, error: "Login required" };
  }
  const candidate = {
    id: crypto.randomUUID(),
    postId,
    authorId: ctx.session.userId!,
    text,
  };
  const parsed = insertCommentSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }
  await db.insert(comments).values(candidate);
  return { ok: true as const, comment: candidate };
}
