/**
 * Replaces `rwsdk/worker` in tests.
 *
 *   vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
 *
 * Server actions and RSC pages read `requestInfo.ctx.user`, which
 * `fakeSetUserContext` sets in production. Here `setActor(...)` sets it
 * instead, so a call can run as a given user.
 *
 * The mock has to cover everything production code imports from the module,
 * not just what the test uses directly. That is why `ErrorResponse` (tasks
 * controller) and `defineScript` (src/db/seed.ts) are both here.
 */
import type { User } from "@/db/schema";

export type TestUser = Partial<User> & { id: number; isAdmin?: boolean };

export const requestInfo: { ctx: { user: TestUser | undefined } } = {
  ctx: { user: undefined },
};

/** Sign in a user for the calls that follow. */
export function setActor(user: TestUser): void {
  requestInfo.ctx = { user };
}

/** Sign out again. Used by `runAs` in its `finally`. */
export function clearActor(): void {
  requestInfo.ctx = { user: undefined };
}

export class ErrorResponse extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message);
    this.name = "ErrorResponse";
  }
}

/** src/db/seed.ts imports this. Without it the import fails. */
export const defineScript =
  (fn: (args: { env: unknown }) => Promise<unknown>) =>
  () =>
    fn({ env: undefined });
