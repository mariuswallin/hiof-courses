// src/middleware/guards.ts — authorization.
//
// `requireAuth` (require-auth.ts) is middleware that runs BEFORE a route.
// The guards here are called inside a server action or route handler, where
// you are already running and just need the session verified.
//
// Note: none of these are called anywhere yet. Kvitter gets by with inline
// checks (`ctx.session?.isAuthenticated` plus `authorId === session.userId`,
// see `deletePost`), and every page route is public by design. They are here as
// the shape to reach for when the app grows a non-public area: `requireOwner`
// for per-resource ownership, `requireRole` once there is an administrative
// layer — moderating other people's content, closing accounts. Better Auth's
// `admin` plugin then gives the user a `role` field.
import { ErrorResponse, requestInfo } from "rwsdk/worker";
import type { Session } from "@/middleware/session";

/** 401: we do not know who you are. Returns the session when it exists. */
export function requireUser(): Session {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    throw new ErrorResponse(401, "Innlogging kreves");
  }
  return ctx.session;
}

/** 403: we know who you are, but you do not own the resource. */
export function requireOwner(ownerId: string): Session {
  const session = requireUser();
  if (session.userId !== ownerId) {
    throw new ErrorResponse(403, "Du eier ikke denne ressursen");
  }
  return session;
}

/**
 * 403 on role. Requires the session to actually carry a role — in Kvitter it
 * does not yet, so this comes into use once Better Auth's admin plugin is
 * enabled.
 */
export function requireRole(role: string): Session & { role?: string } {
  const session = requireUser() as Session & { role?: string };
  if (session.role !== role) {
    throw new ErrorResponse(403, `Krever rollen «${role}»`);
  }
  return session;
}
