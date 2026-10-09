// src/auth/middleware.ts
import type { RouteMiddleware } from "rwsdk/router";
import { ErrorResponse } from "rwsdk/worker";

import { auth, type Session } from "./auth";

declare module "rwsdk/worker" {
  interface DefaultAppContext {
    session: Session["session"] | null;
    user: Session["user"] | null;
  }
}

/**
 * Sets `ctx.session` and `ctx.user` on every request from the Cookie header.
 * Anonymous requests get `null` — guards in routes/actions decide whether that
 * is acceptable.
 */
export const authMiddleware: RouteMiddleware = async ({ request, ctx }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    ctx.session = session?.session ?? null;
    ctx.user = session?.user ?? null;
  } catch (error) {
    if (error instanceof ErrorResponse) throw error;
    ctx.session = null;
    ctx.user = null;
  }
};
