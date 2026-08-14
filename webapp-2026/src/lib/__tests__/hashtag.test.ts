// src/lib/__tests__/hashtag.test.ts
import { describe, it, expect } from "vitest";
import { extractHashtags } from "@/lib/hashtag";

describe("extractHashtags", () => {
  it("returnerer tom array uten hashtags", () => {
    expect(extractHashtags("ingen hashtags her")).toEqual([]);
  });

  it("finner én hashtag", () => {
    expect(extractHashtags("hei #kvitter")).toEqual(["kvitter"]);
  });

  it("lowercaser hashtags", () => {
    expect(extractHashtags("#TEST")).toEqual(["test"]);
  });

  it("fjerner duplikater (case-insensitivt)", () => {
    expect(extractHashtags("#hei #Hei #HEI")).toEqual(["hei"]);
  });

  it("returnerer maks 5", () => {
    expect(extractHashtags("#a #b #c #d #e #f #g")).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("ignorerer # midt i ord", () => {
    expect(extractHashtags("abc#tag")).toEqual([]);
  });

  it("bevarer innfaller-rekkefølge", () => {
    expect(extractHashtags("#c #a #b")).toEqual(["c", "a", "b"]);
  });
});
