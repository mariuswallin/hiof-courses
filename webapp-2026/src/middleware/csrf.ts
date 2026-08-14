// src/middleware/csrf.ts — Origin validation.
//
// SameSite=Lax on the session cookie (set in src/auth/auth.ts) is the first
// defense against CSRF. This is the second, and it covers Kvitter's OWN
// /api/* routes: Better Auth validates its own endpoints, but
// `POST /api/posts` does not do it by itself.
//
// Note that middleware in rwsdk is a *pipeline* that runs for every request —
// `prefix()` only moves the paths of route definitions, it does not scope
// middleware. So we check the path in here. Without that check we would also
// block server actions, which post to the page's own URL, not to /api.
//
// Server actions are therefore NOT covered by this middleware. rwsdk validates
// them itself: `rscActionHandler` requires the Origin on an action POST to
// match the app's own origin (403 otherwise), which also closes the sibling
// subdomain gap that SameSite=Lax leaves open.
import type { RouteMiddleware } from "rwsdk/router";
import { env } from "cloudflare:workers";

// GET/HEAD/OPTIONS do not change state and need no Origin check.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Better Auth owns /api/auth/* and validates Origin itself.
const PROTECTED_PREFIX = "/api/";
const SKIPPED_PREFIX = "/api/auth/";

export function allowedOrigins(): string[] {
  const origins = ["http://localhost:5173"];
  if (env.BETTER_AUTH_URL) origins.push(env.BETTER_AUTH_URL);
  return origins;
}

/**
 * Safe default: if `Origin` is missing on a state-changing request to /api, we
 * reject it. A new client then has to be added to the list explicitly instead
 * of slipping through by accident.
 */
export const validateOrigin =
  (): RouteMiddleware =>
  ({ request }) => {
    if (SAFE_METHODS.has(request.method)) return;

    const { pathname } = new URL(request.url);
    if (!pathname.startsWith(PROTECTED_PREFIX)) return;
    if (pathname.startsWith(SKIPPED_PREFIX)) return;

    const origin = request.headers.get("Origin");
    if (!origin || !allowedOrigins().includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }
  };
