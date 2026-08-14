// src/routes/auth.ts — catch-all that lets Better Auth handle
// /api/auth/* (sign-up, sign-in, sign-out, get-session, ...).
import { route } from "rwsdk/router";
import { env } from "cloudflare:workers";
import { auth } from "@/auth/auth";
import { enforceLimit } from "@/lib/rate-limit";

// State-changing auth calls (sign-in, sign-up) are the ones worth attacking:
// every attempt costs D1 reads, and sign-up creates rows. `get-session` runs
// on every page view and must NOT be throttled.
const GUARDED = ["sign-in", "sign-up", "forget-password", "reset-password"];

export const authRoute = route("/api/auth/*", async ({ request }) => {
  const { pathname } = new URL(request.url);
  const isGuarded =
    request.method === "POST" && GUARDED.some((p) => pathname.includes(p));

  if (isGuarded) {
    const limited = await enforceLimit(env.AUTH_LIMITER, request);
    if (limited) return limited;
  }

  return auth.handler(request);
});
