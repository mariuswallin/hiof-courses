/**
 * src/test/env-mock.ts — replaces `cloudflare:workers` in integration tests.
 *
 *   vi.mock("cloudflare:workers", () => import("@/test/env-mock"));
 *
 * `cloudflare:workers` only exists inside the Workers runtime, so in Node it
 * has to be stubbed. We do not need the D1 binding (we mock `@/db` separately),
 * but actions read `env.AI`, `env.VECTORIZE` and `env.R2`.
 *
 * Important: the bindings are real objects with real methods, not `undefined`.
 * That is what makes `vi.spyOn(env.AI, "run")` work in tests — spy on something
 * that does not exist and Vitest throws "Cannot spy on undefined".
 *
 * Import `env` from `@/test/env-mock` in test files (not from
 * `cloudflare:workers`): it is exactly the same object the action sees, and it
 * avoids casting away Cloudflare's own binding types.
 */

/** Number of dimensions in `@cf/google/embeddinggemma-300m` (see lib/ai/embeddings.ts). */
const EMBEDDING_DIMS = 768;

/** Deterministic "embedding" — enough for the surrounding code to be tested. */
function fakeVector(seed: number): number[] {
  return Array.from({ length: EMBEDDING_DIMS }, (_, i) =>
    Math.sin((seed + 1) * (i + 1)),
  );
}

export type AiRunInput = Record<string, unknown>;

/**
 * Workers AI stub. Embedding models answer `{ data: number[][] }`, chat models
 * `{ response: string }` — we return both fields, so `generateEmbeddings` and
 * `generateRagAnswer` both get something usable.
 * Override per test with `vi.spyOn(env.AI, "run").mockResolvedValue(...)`.
 */
export const ai = {
  async run(_model: string, input: AiRunInput) {
    const texts = Array.isArray(input.text)
      ? (input.text as string[])
      : typeof input.text === "string"
        ? [input.text as string]
        : [];
    return {
      data: texts.map((_t, i) => fakeVector(i)),
      response: "",
    };
  },
};

/** Vectorize stub: keeps the vectors in a Map so tests can read them. */
export const vectorize = {
  store: new Map<string, { values: number[]; metadata?: unknown }>(),
  async upsert(vectors: { id: string; values: number[]; metadata?: unknown }[]) {
    for (const v of vectors) {
      vectorize.store.set(v.id, { values: v.values, metadata: v.metadata });
    }
    return { count: vectors.length };
  },
  async query(_vector: number[], opts: { topK?: number } = {}) {
    const matches = [...vectorize.store.keys()]
      .slice(0, opts.topK ?? 5)
      .map((id, i) => ({ id, score: 1 - i * 0.01 }));
    return { matches };
  },
};

/** R2 stub: in-memory bucket, so uploads and cleanup can be verified. */
export const r2 = {
  store: new Map<string, unknown>(),
  async put(key: string, body: unknown) {
    r2.store.set(key, body);
    return { key };
  },
  async get(key: string) {
    return r2.store.has(key) ? { key, body: r2.store.get(key) } : null;
  },
  async delete(key: string) {
    r2.store.delete(key);
  },
  /**
   * Paginated listing, like the real R2 binding. The cron job in
   * `src/scheduled/cleanup.ts` pages with `cursor`, so the stub has to do the
   * same — otherwise we test a simpler world than production.
   */
  async list(opts: { prefix?: string; cursor?: string; limit?: number } = {}) {
    const keys = [...r2.store.keys()]
      .filter((key) => !opts.prefix || key.startsWith(opts.prefix))
      .sort();
    const start = opts.cursor ? Number(opts.cursor) : 0;
    const limit = opts.limit ?? 1000;
    const page = keys.slice(start, start + limit);
    const end = start + page.length;
    return {
      objects: page.map((key) => ({ key })),
      truncated: end < keys.length,
      cursor: String(end),
    };
  },
};

export const env: {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  AI: typeof ai;
  VECTORIZE: typeof vectorize;
  R2: typeof r2;
} = {
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:5173",
  AI: ai,
  VECTORIZE: vectorize,
  R2: r2,
};

/** Clear the bindings' state between tests (call together with `resetDb()`). */
export function resetEnv(): void {
  vectorize.store.clear();
  r2.store.clear();
}
