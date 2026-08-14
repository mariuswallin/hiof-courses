// src/lib/rate-limit.ts — abuse throttle on the endpoints that cost money.
//
// Uses Cloudflare's Rate Limiting binding. That is a *runtime* binding, not a
// zone feature, so it also works on `<worker>.workers.dev` — where WAF (rate
// limiting rules, custom rules, Bot Fight Mode) does not exist at all.
// See DEPLOY.md §10.
//
// Two properties of the binding are easy to misread:
//   1. The counter is local per Cloudflare location and eventually
//      consistent. A distributed attack will get over the limit. This is a
//      brake on cheap abuse, not exact quota accounting.
//   2. `period` must be 10 or 60 seconds. Other values are rejected by
//      wrangler at deploy time.

// Loose adapter type so tests can pass in a stub.
export type RateLimiterLike = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

/**
 * The key we count on. `CF-Connecting-IP` is set by Cloudflare and cannot be
 * forged by the client — unlike `X-Forwarded-For`.
 *
 * Falls back to a shared key when the header is missing (local `pnpm dev`).
 * That makes all local calls share one bucket, which is the right behaviour:
 * it surfaces misuse early instead of hiding it until prod.
 */
export function clientKey(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "local";
}

/**
 * Check one request against a limiter.
 *
 * If the binding is missing (local development, or not deployed yet) we let
 * the request through. That is a deliberate fail-open: a missing brake must
 * not take the app down.
 */
export async function withinLimit(
  limiter: RateLimiterLike | undefined,
  key: string,
): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit({ key });
  return success;
}

/** 429 with `Retry-After`, so clients can back off properly instead of hammering. */
export function tooManyRequests(retryAfterSeconds = 60): Response {
  return Response.json(
    { error: "rate-limited", message: "For mange forespørsler. Prøv igjen om litt." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/**
 * Shorthand for the common pattern: check the limiter, return 429 if the
 * limit is reached, otherwise `null` so the caller can continue.
 *
 *   const limited = await enforceLimit(env.AI_LIMITER, request);
 *   if (limited) return limited;
 */
export async function enforceLimit(
  limiter: RateLimiterLike | undefined,
  request: Request,
  retryAfterSeconds = 60,
): Promise<Response | null> {
  const ok = await withinLimit(limiter, clientKey(request));
  return ok ? null : tooManyRequests(retryAfterSeconds);
}
