// src/routes/ai.ts — Workers AI endpoints
//   POST /api/ai/hashtags  — hashtag suggestions
//   POST /api/ai/search    — semantic search + RAG answer
//
// These are the only routes in the app that cost money per call, so they are
// rate limited (`rate-limit.ts`) and capped on input size. See DEPLOY.md §10.
//
// Deliberately unauthenticated: search and hashtag suggestions work for
// anonymous visitors, like the rest of the public feed. The trade-off is that
// anyone can spend the AI budget, held back only by AI_LIMITER (10/min per IP,
// and fail-open if the binding is missing). Require a session here if the app
// ever goes public with a real budget attached.
import { route, prefix } from "rwsdk/router";
import { env } from "cloudflare:workers";
import { suggestHashtags } from "@/lib/ai/hashtag-suggester";
import { match } from "@/lib/result";
import { db } from "@/db";
import { posts, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { querySimilarPostIds, generateRagAnswer } from "@/lib/ai/rag";
import { enforceLimit } from "@/lib/rate-limit";

// The AI binding always runs against Cloudflare (no local emulation), so in
// `pnpm dev` the call goes out over the network from your own machine. A cold
// start on the model plus a slow network eats several seconds — 5 s gave
// false timeouts.
const TIMEOUT_MS = 20_000;

// suggestHashtags separates a timeout from a real model error; the status
// code should mirror that, so the client can say something sensible.
const STATUS_BY_KIND: Record<string, number> = {
  timeout: 504,
  "ai-failed": 502,
  "empty-response": 422,
  "no-valid-tags": 422,
};

// Max text length into the model. Rate limiting throttles the *number* of
// calls; this caps the cost per call. Without the cap, one call with a
// megabyte of text can cost as much as a hundred normal ones.
const MAX_INPUT_CHARS = 2_000;

export const aiRoutes = prefix("/api/ai", [
  route("/hashtags", async ({ request }) => {
    const limited = await enforceLimit(env.AI_LIMITER, request);
    if (limited) return limited;

    if (!env.AI) {
      return Response.json({ error: "ai-unavailable" }, { status: 503 });
    }
    const { text } = (await request.json()) as { text?: string };
    if (!text || text.trim().length === 0) {
      return Response.json({ error: "text required" }, { status: 400 });
    }
    if (text.length > MAX_INPUT_CHARS) {
      return Response.json({ error: "text-too-long" }, { status: 413 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const result = await suggestHashtags(text, env.AI, {
        signal: controller.signal,
      });
      return match(result, {
        ok: (tags) => Response.json({ hashtags: tags }),
        err: (error) =>
          Response.json(
            { error: error.kind },
            { status: STATUS_BY_KIND[error.kind] ?? 502 },
          ),
      });
    } finally {
      clearTimeout(timeout);
    }
  }),

  route("/search", async ({ request }) => {
    const limited = await enforceLimit(env.AI_LIMITER, request);
    if (limited) return limited;

    const { query } = (await request.json()) as { query?: string };
    if (!query || query.trim().length === 0) {
      return Response.json({ error: "query required" }, { status: 400 });
    }
    if (query.length > MAX_INPUT_CHARS) {
      return Response.json({ error: "query-too-long" }, { status: 413 });
    }

    // 1. Retrieval — find semantically similar posts via Vectorize.
    const matches = await querySimilarPostIds(env, query, 5);
    if (matches.length === 0) {
      return Response.json({
        answer: "Fant ingen relevante innlegg (eller søk er ikke konfigurert).",
        sources: [],
      });
    }

    // 2. Load the posts from D1 and keep the Vectorize order (score).
    const ids = matches.map((m) => m.id);
    const rows = await db
      .select({
        id: posts.id,
        text: posts.text,
        username: user.username,
        name: user.name,
      })
      .from(posts)
      .innerJoin(user, eq(posts.authorId, user.id))
      .where(inArray(posts.id, ids))
      .all();
    const scoreMap = new Map(matches.map((m) => [m.id, m.score]));
    const sources = rows.sort(
      (a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0),
    );

    // 3. Augment + generate — the LLM answers ONLY from the context.
    const answer = await generateRagAnswer(env, query, sources);
    return Response.json({ answer, sources });
  }),
]);
