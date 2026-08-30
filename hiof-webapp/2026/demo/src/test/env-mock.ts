/**
 * Replaces `cloudflare:workers` in tests.
 *
 *   vi.mock("cloudflare:workers", () => import("@/test/env-mock"));
 *
 * `cloudflare:workers` only exists inside the Workers runtime, so it has to
 * be stubbed in Node. The demo only uses `env.DB`, and that is replaced by
 * `@/test/db-mock` anyway, so an empty binding is enough.
 */
export const env: { DB: unknown } = {
  DB: undefined,
};
