// src/lib/ai/rag.ts — semantic search + RAG over Kvitter posts
import { generateEmbeddings } from "./embeddings";

export const CHAT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

// Thin adapter types: kept loose (any params) so they accept both the real
// Cloudflare bindings (Ai, VectorizeIndex) and mocks in tests.
type AiBinding = {
  run: (model: string, input: Record<string, unknown>) => Promise<any>;
};

type VectorizeBinding = {
  upsert: (vectors: any[]) => Promise<any>;
  query: (
    vector: any,
    opts: any,
  ) => Promise<{ matches: Array<{ id: string; score?: number }> }>;
};

export type RagEnv = {
  AI?: AiBinding;
  VECTORIZE?: VectorizeBinding;
};

/**
 * Index one post: build an embedding and upsert it to Vectorize under the
 * post's id. Best-effort — Vectorize/AI have no local emulation, so if the
 * binding is missing (or the call fails) we skip it without failing the write
 * of the post itself.
 */
export async function indexPost(
  env: RagEnv,
  post: { id: string; text: string; authorId: string },
): Promise<boolean> {
  if (!env.AI || !env.VECTORIZE) return false;
  try {
    const [values] = await generateEmbeddings(env.AI, [post.text]);
    await env.VECTORIZE.upsert([
      {
        id: post.id,
        values,
        metadata: { authorId: post.authorId },
      },
    ]);
    return true;
  } catch (err) {
    console.warn("indexPost: Vectorize/AI utilgjengelig, hopper over", err);
    return false;
  }
}

/** Find the ids of the `topK` most semantically similar posts. */
export async function querySimilarPostIds(
  env: RagEnv,
  query: string,
  topK = 5,
): Promise<{ id: string; score: number }[]> {
  if (!env.AI || !env.VECTORIZE) return [];
  const [vector] = await generateEmbeddings(env.AI, [query]);
  const results = await env.VECTORIZE.query(vector, {
    topK,
    returnMetadata: "all",
  });
  return results.matches.map((m) => ({ id: m.id, score: m.score ?? 0 }));
}

/**
 * Generate a RAG answer: given a question and the retrieved posts as context,
 * let the LLM answer ONLY from that context.
 */
export async function generateRagAnswer(
  env: RagEnv,
  question: string,
  context: { username: string | null; name: string; text: string }[],
): Promise<string> {
  if (!env.AI) return "KI er ikke tilgjengelig akkurat nå.";
  const contextBlock = context
    .map((p) => `@${p.username ?? p.name}: "${p.text}"`)
    .join("\n");

  const response = await env.AI.run(CHAT_MODEL, {
    messages: [
      {
        role: "system",
        content: `Du er en hjelpsom assistent for Kvitter, en mikroblogg-plattform.
Svar på spørsmål basert KUN på innleggene nedenfor.
Hvis innleggene ikke inneholder relevant informasjon, si det ærlig.

Relevante innlegg:
${contextBlock}`,
      },
      { role: "user", content: question },
    ],
  });

  return (response.response as string) ?? "";
}
