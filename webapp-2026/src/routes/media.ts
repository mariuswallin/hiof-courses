// src/routes/media.ts — upload + cached serving from R2
import { route } from "rwsdk/router";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { storeUpload } from "@/lib/upload";
import { withinLimit, tooManyRequests } from "@/lib/rate-limit";

// POST /api/users/:userId/avatar — upload an avatar.
export const avatarUploadRoute = route(
  "/api/users/:userId/avatar",
  async ({ request, ctx, params }) => {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    // Only a signed-in user can update THEIR own avatar.
    if (!ctx.session?.isAuthenticated || ctx.session.userId !== params.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // After the auth check: a signed-in user can still upload in a loop. Every
    // upload is an R2 Class A operation plus storage that is not freed on its
    // own. Counts on user id, not IP — we already know who it is, and that gives
    // the right limit when several people sit behind the same NAT.
    if (!(await withinLimit(env.UPLOAD_LIMITER, `user:${params.userId}`))) {
      return tooManyRequests();
    }

    if (!env.R2) {
      return Response.json({ error: "storage-unavailable" }, { status: 503 });
    }

    const formData = await request.formData();
    const result = await storeUpload(
      env.R2,
      formData,
      "avatar",
      "avatars",
      params.userId,
    );
    if (!result.ok) {
      return Response.json({ error: result.error.message }, { status: 400 });
    }

    // Read the old key, update the DB, then delete the old object (avoid orphans).
    const existing = await db
      .select({ avatarKey: user.avatarKey })
      .from(user)
      .where(eq(user.id, params.userId))
      .get();
    await db
      .update(user)
      .set({ avatarKey: result.key })
      .where(eq(user.id, params.userId));
    if (existing?.avatarKey && existing.avatarKey !== result.key) {
      await env.R2.delete(existing.avatarKey).catch(() => {});
    }

    return Response.json({ avatarKey: result.key }, { status: 200 });
  },
);

// GET /media/* — serve an R2 object with cache headers.
//
// The wildcard, not `:key`: rwsdk compiles `:param` to `([^/]+)`, which stops
// at the first slash. Every key we produce contains one (`avatars/…`,
// `posts/…`), so a named parameter would 404 on all of them. `*` compiles to
// `(.*)` and lands in `params.$0`.
export const mediaRoute = route("/media/*", async ({ params }) => {
  if (!env.R2) return new Response("Not found", { status: 404 });
  const key = params.$0;
  const object = await env.R2.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      // 30 days + immutable: every upload has a unique key, so the content behind
      // a URL never changes.
      "Cache-Control": "public, max-age=2592000, immutable",
      ETag: object.httpEtag,
    },
  });
});

export const mediaRoutes = [avatarUploadRoute, mediaRoute];
