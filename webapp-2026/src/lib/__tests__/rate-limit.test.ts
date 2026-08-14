/** Tests for the abuse throttle (src/lib/rate-limit.ts). */
import { describe, it, expect, vi } from "vitest";
import {
  clientKey,
  withinLimit,
  tooManyRequests,
  enforceLimit,
} from "@/lib/rate-limit";

function limiter(success: boolean) {
  return { limit: vi.fn(async () => ({ success })) };
}

describe("clientKey", () => {
  it("bruker CF-Connecting-IP, som Cloudflare setter og klienten ikke kan forfalske", () => {
    const req = new Request("https://kvitter.test/", {
      headers: { "CF-Connecting-IP": "203.0.113.7" },
    });
    expect(clientKey(req)).toBe("203.0.113.7");
  });

  it("ignorerer X-Forwarded-For — den kan settes av klienten", () => {
    const req = new Request("https://kvitter.test/", {
      headers: { "X-Forwarded-For": "1.2.3.4" },
    });
    expect(clientKey(req)).toBe("local");
  });
});

describe("withinLimit", () => {
  it("slipper gjennom under grensen", async () => {
    expect(await withinLimit(limiter(true), "k")).toBe(true);
  });

  it("stopper over grensen", async () => {
    expect(await withinLimit(limiter(false), "k")).toBe(false);
  });

  it("feiler ÅPENT når bindingen mangler — en manglende brems skal ikke ta ned appen", async () => {
    expect(await withinLimit(undefined, "k")).toBe(true);
  });

  it("sender nøkkelen videre uendret", async () => {
    const l = limiter(true);
    await withinLimit(l, "user:abc");
    expect(l.limit).toHaveBeenCalledWith({ key: "user:abc" });
  });
});

describe("tooManyRequests", () => {
  it("svarer 429 med Retry-After så klienter kan vente riktig", async () => {
    const res = tooManyRequests(30);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    expect(await res.json()).toMatchObject({ error: "rate-limited" });
  });
});

describe("enforceLimit", () => {
  const req = new Request("https://kvitter.test/", {
    headers: { "CF-Connecting-IP": "203.0.113.7" },
  });

  it("returnerer null når kallet er innenfor grensen", async () => {
    expect(await enforceLimit(limiter(true), req)).toBeNull();
  });

  it("returnerer en 429-respons når grensen er nådd", async () => {
    const res = await enforceLimit(limiter(false), req);
    expect(res?.status).toBe(429);
  });

  it("teller på klient-IP", async () => {
    const l = limiter(true);
    await enforceLimit(l, req);
    expect(l.limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
  });
});
