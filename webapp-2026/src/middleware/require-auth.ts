// src/middleware/require-auth.ts — HTML gets a redirect, API gets 401
//
// Guards ROUTES only. Server actions bypass it entirely (the caller picks the
// path, and rwsdk runs actions even on unmatched paths), so each action checks
// `ctx.session` itself — see src/actions/posts.ts.
//
// It *returns* the rejection instead of throwing, because that is the rwsdk
// middleware contract: a returned Response short-circuits the pipeline cleanly,
// while a thrown one escapes the router and gets logged as an unhandled error.
// Same shape as `enforceLimit` in lib/rate-limit.ts, so both read alike:
//
//   const denied = await requireAuth(requestInfo);
//   if (denied) return denied;
import type { RequestInfo } from "rwsdk/worker";

export async function requireAuth({
  ctx,
  request,
}: Pick<RequestInfo, "ctx" | "request">): Promise<Response | undefined> {
  if (ctx.session?.isAuthenticated) return;

  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    // Browser navigation — send them to login, and back here afterwards.
    return new Response(null, {
      status: 302,
      headers: { Location: `/login?from=${encodeURIComponent(request.url)}` },
    });
  }
  // API call (fetch from a client component, or curl).
  return new Response("Login required", { status: 401 });
}
