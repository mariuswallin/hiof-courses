// src/lib/ai/__tests__/hashtag-suggester.test.ts
import { describe, it, expect, vi } from "vitest";
import {
  parseHashtagResponse,
  suggestHashtags,
} from "@/lib/ai/hashtag-suggester";

describe("parseHashtagResponse", () => {
  it("parser standard-format", () => {
    expect(parseHashtagResponse("matlaging, bærekraft, rester")).toEqual([
      "matlaging",
      "bærekraft",
      "rester",
    ]);
  });

  it("fjerner # som modellen kan legge på", () => {
    expect(parseHashtagResponse("#mat, #kos, #helg")).toEqual([
      "mat",
      "kos",
      "helg",
    ]);
  });

  it("kutter til 3", () => {
    expect(parseHashtagResponse("a, b, c, d, e")).toEqual(["a", "b", "c"]);
  });

  it("filtrerer bort ugyldig tegn", () => {
    expect(parseHashtagResponse("hei!, mat, kos 🍕")).toEqual(["mat"]);
  });
});

describe("suggestHashtags", () => {
  const aiOk = {
    run: vi.fn(async () => ({ response: "matlaging, bærekraft, rester" })),
  };
  const aiEmpty = { run: vi.fn(async () => ({ response: "" })) };
  const aiJunk = { run: vi.fn(async () => ({ response: "!!! ???" })) };
  const aiThrows = {
    run: vi.fn(async () => {
      throw new Error("network");
    }),
  };

  it("returnerer ok ved gyldig svar", async () => {
    const r = await suggestHashtags("Lagde middag", aiOk as any);
    expect(r).toEqual({
      ok: true,
      value: ["matlaging", "bærekraft", "rester"],
    });
  });

  it("returnerer empty-response", async () => {
    const r = await suggestHashtags("hei", aiEmpty as any);
    expect(r).toEqual({ ok: false, error: { kind: "empty-response" } });
  });

  it("returnerer no-valid-tags ved gibberish", async () => {
    const r = await suggestHashtags("hei", aiJunk as any);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe("no-valid-tags");
  });

  it("returnerer ai-failed når begge modellene feiler", async () => {
    const r = await suggestHashtags("hei", aiThrows as any);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe("ai-failed");
    // Primary model + fallback: two attempts before giving up.
    expect(aiThrows.run).toHaveBeenCalledTimes(2);
  });

  it("faller tilbake til reservemodellen når den første feiler", async () => {
    let calls = 0;
    const aiFlaky = {
      run: vi.fn(async () => {
        calls += 1;
        if (calls === 1) throw new Error("capacity exceeded");
        return { response: "mat, kos, helg" };
      }),
    };

    const r = await suggestHashtags("hei", aiFlaky as any);

    expect(r).toEqual({ ok: true, value: ["mat", "kos", "helg"] });
    expect(aiFlaky.run).toHaveBeenCalledTimes(2);
  });

  it("returnerer timeout ved abort, og prøver ikke reservemodellen", async () => {
    const controller = new AbortController();
    const aiAborts = {
      run: vi.fn(async () => {
        controller.abort();
        throw Object.assign(new Error("aborted"), { name: "AbortError" });
      }),
    };

    const r = await suggestHashtags("hei", aiAborts as any, {
      signal: controller.signal,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe("timeout");
    // The deadline is spent — trying another model would not help.
    expect(aiAborts.run).toHaveBeenCalledTimes(1);
  });
});
