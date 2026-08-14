/**
 * src/test/worker-mock.ts — replaces `rwsdk/worker` in integration tests.
 *
 *   vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
 *
 * Server actions read `requestInfo.ctx.session` (set by `sessionMiddleware` in
 * production). Here `setActor(...)` sets it instead, so we can run an action
 * "as" a given user without going through Better Auth.
 *
 * `Session` is the same type `src/middleware/session.ts` puts on ctx —
 * imported from there so the mock cannot drift from the production code.
 */
import type { Session } from "@/middleware/session";

export type TestUser = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
};

function anonymousSession(): Session {
  return {
    userId: null,
    name: null,
    username: null,
    email: null,
    isAuthenticated: false,
  };
}

export const requestInfo: { ctx: { session: Session } } = {
  ctx: { session: anonymousSession() },
};

/** Sign in a user for the following action calls. */
export function setActor(user: TestUser): void {
  requestInfo.ctx = {
    session: {
      userId: user.id,
      name: user.name ?? user.id,
      username: user.username ?? user.id,
      email: user.email ?? `${user.id}@test.local`,
      isAuthenticated: true,
    },
  };
}

/** Sign out again — used by `runAs` in `finally`. */
export function clearActor(): void {
  requestInfo.ctx = { session: anonymousSession() };
}

/**
 * `rwsdk/worker` also exports `ErrorResponse`. Modules like
 * `src/middleware/require-auth.ts` import it, so the mock needs it for those
 * imports to resolve.
 */
export class ErrorResponse extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = "ErrorResponse";
  }
}
