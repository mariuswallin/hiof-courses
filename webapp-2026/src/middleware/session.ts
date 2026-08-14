// src/middleware/session.ts — Better Auth session on ctx
import type { RequestInfo } from "rwsdk/worker";
import { auth } from "@/auth/auth";

export type Session = {
  userId: string | null;
  name: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
};

declare module "rwsdk/worker" {
  interface DefaultAppContext {
    session: Session;
  }
}

export async function sessionMiddleware({ request, ctx }: RequestInfo) {
  const result = await auth.api.getSession({ headers: request.headers });
  if (result?.user) {
    ctx.session = {
      userId: result.user.id,
      name: result.user.name,
      // Derived display name; the profile fields are read from the DB where they
      // are needed (they are not in the Better Auth session by default).
      username: result.user.email.split("@")[0],
      email: result.user.email,
      isAuthenticated: true,
    };
  } else {
    ctx.session = {
      userId: null,
      name: null,
      username: null,
      email: null,
      isAuthenticated: false,
    };
  }
}
