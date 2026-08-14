/**
 * Origin validation. The middleware is a pure function of the request, so we
 * can call it directly — no worker, no browser.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { validateOrigin } from "@/middleware/csrf";

const middleware = validateOrigin();

function call(
  url: string,
  init: { method?: string; origin?: string } = {},
): Response | void {
  const headers = new Headers();
  if (init.origin) headers.set("Origin", init.origin);
  const request = new Request(url, { method: init.method ?? "POST", headers });
  return middleware({ request } as never) as Response | void;
}

describe("validateOrigin", () => {
  it("slipper gjennom med tillatt Origin", () => {
    expect(
      call("http://localhost:5173/api/posts", {
        origin: "http://localhost:5173",
      }),
    ).toBeUndefined();
  });

  it("avviser fremmed Origin med 403", () => {
    const res = call("http://localhost:5173/api/posts", {
      origin: "https://angriper.example",
    });

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it("avviser når Origin mangler helt (trygg default)", () => {
    const res = call("http://localhost:5173/api/posts");

    expect((res as Response).status).toBe(403);
  });

  it("rører ikke GET — den endrer ingen tilstand", () => {
    expect(
      call("http://localhost:5173/api/posts", { method: "GET" }),
    ).toBeUndefined();
  });

  it("rører ikke sider og server actions utenfor /api", () => {
    // Server actions post to the page's own URL. Block them here and the whole
    // app stops working.
    expect(call("http://localhost:5173/")).toBeUndefined();
  });

  it("hopper over /api/auth/* — Better Auth validerer selv", () => {
    expect(
      call("http://localhost:5173/api/auth/sign-in/email"),
    ).toBeUndefined();
  });
});
