// scripts/index-existing-posts.ts — batch-index existing posts into
// Vectorize. Run with: pnpm index:posts (rwsdk worker-run).
// Requires the AI and VECTORIZE bindings to be configured (remote).
import { defineScript } from "rwsdk/worker";
import { env } from "cloudflare:workers";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { generateEmbeddings } from "@/lib/ai/embeddings";

export default defineScript(async () => {
  if (!env.AI || !env.VECTORIZE) {
    console.warn("AI/VECTORIZE mangler — kan ikke indeksere.");
    return Response.json({ ok: false, reason: "bindings-missing" });
  }

  const all = await db.select().from(posts).all();
  const batchSize = 100;
  let indexed = 0;

  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const vectors = await generateEmbeddings(
      env.AI,
      batch.map((p) => p.text),
    );
    await env.VECTORIZE.upsert(
      batch.map((post, idx) => ({
        id: post.id,
        values: vectors[idx],
        metadata: { authorId: post.authorId },
      })),
    );
    indexed += batch.length;
  }

  console.log(`Indekserte ${indexed} innlegg`);
  return Response.json({ ok: true, indexed });
});
