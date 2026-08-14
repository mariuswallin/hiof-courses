// src/routes/posts.ts — REST API for posts, backed by D1
import { route, prefix } from "rwsdk/router";
import { ErrorResponse } from "rwsdk/worker";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getFeed, getPostsByAuthor } from "@/db/queries";
import { validatePost } from "@/lib/validation";
import { extractHashtags } from "@/lib/hashtag";
import { requireAuth } from "@/middleware/require-auth";
import { indexPost } from "@/lib/ai/rag";

export const postsRoutes = prefix("/api/posts", [
  route("/", async ({ request, ctx }) => {
    if (request.method === "GET") {
      const author = new URL(request.url).searchParams.get("author");
      const feed = author
        ? await getPostsByAuthor(db, author)
        : await getFeed(db);
      return Response.json({ posts: feed });
    }

    if (request.method === "POST") {
      const denied = await requireAuth({ ctx, request });
      if (denied) return denied;
      const body = (await request.json()) as { text?: string };
      const text = body.text ?? "";
      const v = validatePost(text);
      if (!v.ok) throw new ErrorResponse(400, v.error);

      const post = {
        id: crypto.randomUUID(),
        text,
        authorId: ctx.session.userId!,
        hashtagsJson: JSON.stringify(extractHashtags(text)),
      };
      await db.insert(posts).values(post);
      await indexPost(env, post);
      return Response.json({ post }, { status: 201 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }),

  route("/:id", async ({ request, params, ctx }) => {
    // Note: no `deletedAt IS NULL` filter here, unlike the feed queries. Moot
    // while nothing soft-deletes (see schema.ts), but add it together with
    // soft delete or this route will serve "deleted" posts.
    const existing = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.id))
      .get();
    if (!existing) throw new ErrorResponse(404, "Not found");

    if (request.method === "GET") {
      return Response.json({ post: existing });
    }

    if (request.method === "DELETE") {
      const denied = await requireAuth({ ctx, request });
      if (denied) return denied;
      if (existing.authorId !== ctx.session.userId) {
        throw new ErrorResponse(403, "Not your post");
      }
      if (existing.imageKey && env.R2) {
        await env.R2.delete(existing.imageKey).catch(() => {});
      }
      await db.delete(posts).where(eq(posts.id, params.id));
      return new Response(null, { status: 204 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }),
]);
