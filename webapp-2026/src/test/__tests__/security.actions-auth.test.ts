/**
 * Security invariant: EVERY server action rejects an anonymous caller.
 *
 * Why this test exists, and why it enumerates exports instead of listing them:
 *
 * A server action is not reachable only from the page that renders it. rwsdk
 * dispatches actions on `POST <any-path>?__rsc_action_id=<id>`, and the
 * dispatch happens *after* global middleware but independently of route
 * matching — the router runs pending actions even when no route matched at all
 * (right before returning its 404). So a route interruptor (`requireAuth`) or a
 * guarded layout protects the *page*, never the *action*.
 *
 * rwsdk does enforce same-origin on action POSTs (see
 * `runtime/register/methodEnforcer.ts`), which stops CSRF from a foreign or
 * sibling-subdomain origin. But that is authentication of the *origin*, not of
 * the *user*: any signed-in visitor can invoke any action from the app's own
 * origin, at any path. The only thing standing between them and someone else's
 * data is the check inside the action itself.
 *
 * Hence: the check belongs in the action, and this test fails the moment a new
 * action is added without one.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { resetDb } from "@/test/db-mock";
import { resetEnv } from "@/test/env-mock";
import { clearActor } from "@/test/worker-mock";
import { resetCounter } from "@/test/fixtures";

import * as postActions from "@/actions/posts";
import * as followActions from "@/actions/follows";

/**
 * Every action takes string arguments, so one generic argument list covers all
 * of them — extra arguments are ignored. If a future action needs something
 * else, add it here rather than exempting it from the sweep.
 */
const GENERIC_ARGS = ["some-id", "some text"] as const;

const actionModules: Record<string, Record<string, unknown>> = {
  "@/actions/posts": postActions,
  "@/actions/follows": followActions,
};

function exportedActions(): [string, (...args: unknown[]) => Promise<unknown>][] {
  return Object.entries(actionModules).flatMap(([moduleName, mod]) =>
    Object.entries(mod)
      .filter(([, value]) => typeof value === "function")
      .map(
        ([name, fn]) =>
          [`${moduleName} · ${name}`, fn as (...a: unknown[]) => Promise<unknown>] as [
            string,
            (...args: unknown[]) => Promise<unknown>,
          ],
      ),
  );
}

describe("security · server actions avviser anonyme kallere", () => {
  beforeEach(() => {
    resetDb();
    resetEnv();
    resetCounter();
    clearActor(); // ingen sesjon: dette er angriperen
  });

  it("finner faktisk noen actions å teste (vakt mot at sveipet blir tomt)", () => {
    expect(exportedActions().length).toBeGreaterThanOrEqual(5);
  });

  for (const [label, action] of exportedActions()) {
    it(`${label} avviser uten sesjon`, async () => {
      const result = (await action(...GENERIC_ARGS)) as
        | { ok: boolean; error?: string }
        | undefined;

      // Actionen skal RETURNERE et avslag (kursets { ok }-konvensjon), ikke
      // kaste og ikke lykkes.
      expect(result, `${label} returnerte ingenting`).toBeDefined();
      expect(result!.ok, `${label} slapp en anonym kaller gjennom`).toBe(false);
      expect(typeof result!.error).toBe("string");
    });
  }
});
