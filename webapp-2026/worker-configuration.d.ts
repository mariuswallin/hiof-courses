/* eslint-disable */
// Håndskrevet stub som speiler bindingene i wrangler.jsonc. Kjør
// `pnpm generate` (wrangler types --include-runtime false) for å
// regenerere denne mot den faktiske konfigurasjonen.
interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    AI: Ai;
    VECTORIZE: VectorizeIndex;
    R2: R2Bucket;
    BETTER_AUTH_URL: string;
    PUBLIC_URL: string;
    BETTER_AUTH_SECRET: string;
    // Rate limiting-bindinger (wrangler.jsonc → ratelimits).
    AI_LIMITER?: RateLimit;
    UPLOAD_LIMITER?: RateLimit;
    AUTH_LIMITER?: RateLimit;
  }
}
interface Env extends Cloudflare.Env {}
