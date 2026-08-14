// src/lib/__tests__/upload.test.ts — server-side upload validation.
// `storeUpload` takes the R2 bucket as a parameter, so we pass an in-memory
// stub and avoid both Cloudflare and the network.
import { describe, it, expect, vi } from "vitest";
import { storeUpload, MAX_SIZE, type R2Like } from "@/lib/upload";

function fakeR2() {
  const store = new Map<string, unknown>();
  const bucket: R2Like & { store: typeof store } = {
    store,
    put: vi.fn(async (key: string, body: unknown) => {
      store.set(key, body);
      return { key };
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
  return bucket;
}

function formWith(file?: File): FormData {
  const fd = new FormData();
  if (file) fd.set("avatar", file);
  return fd;
}

const image = (opts: { type?: string; size?: number } = {}) =>
  new File([new Uint8Array(opts.size ?? 10)], "bilde.jpg", {
    type: opts.type ?? "image/jpeg",
  });

describe("storeUpload", () => {
  it("avviser når feltet mangler", async () => {
    const r2 = fakeR2();

    const result = await storeUpload(r2, formWith(), "avatar", "avatars", "u1");

    expect(result).toEqual({
      ok: false,
      error: { kind: "no-file", message: "Ingen fil mottatt" },
    });
    expect(r2.put).not.toHaveBeenCalled();
  });

  it("avviser en filtype som ikke er tillatt", async () => {
    const r2 = fakeR2();
    const evil = new File(["#!/bin/sh"], "skript.sh", { type: "text/x-sh" });

    const result = await storeUpload(r2, formWith(evil), "avatar", "avatars", "u1");

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error.kind).toBe("bad-type");
    expect(r2.put).not.toHaveBeenCalled();
  });

  it("avviser filer over størrelsesgrensen", async () => {
    const r2 = fakeR2();
    const huge = image({ size: MAX_SIZE + 1 });

    const result = await storeUpload(r2, formWith(huge), "avatar", "avatars", "u1");

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error.kind).toBe("too-large");
    expect(r2.put).not.toHaveBeenCalled();
  });

  it("lagrer gyldig fil under en nøkkel med eier og prefiks", async () => {
    const r2 = fakeR2();

    const result = await storeUpload(r2, formWith(image()), "avatar", "avatars", "u1");

    expect(result.ok).toBe(true);
    expect(result.ok === true && result.key).toMatch(/^avatars\/u1-\d+\.jpeg$/);
    expect(r2.put).toHaveBeenCalledOnce();
    // Content-Type is carried along, otherwise the image is served as application/octet-stream.
    expect(vi.mocked(r2.put).mock.calls[0]![2]).toEqual({
      httpMetadata: { contentType: "image/jpeg" },
    });
  });

  it("gir unike nøkler så to opplastinger ikke overskriver hverandre", async () => {
    const r2 = fakeR2();
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    const first = await storeUpload(r2, formWith(image()), "avatar", "avatars", "u1");
    const second = await storeUpload(r2, formWith(image()), "avatar", "avatars", "u1");

    expect(first.ok && second.ok && first.key).not.toBe(second.ok && second.key);
    vi.restoreAllMocks();
  });
});
