// src/lib/ai/embeddings.ts — Workers AI embeddings
//
// Multilingual model (Norwegian plus 100 more languages), 768 dimensions —
// matches the Vectorize index `kvitter-posts-index`. Change the model and the
// index dimensions must match, and everything must be re-indexed.
export const EMBEDDING_MODEL = "@cf/google/embeddinggemma-300m";

type AiBinding = {
  run: (model: string, input: Record<string, unknown>) => Promise<any>;
};

/**
 * Embeds a list of texts in one call. Returns one vector (number[]) per text.
 * Workers AI accepts a list, which is much faster than one at a time.
 */
export async function generateEmbeddings(
  ai: AiBinding,
  texts: string[],
): Promise<number[][]> {
  const response = await ai.run(EMBEDDING_MODEL, { text: texts });
  return response.data as number[][];
}
