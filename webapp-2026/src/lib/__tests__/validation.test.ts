// src/lib/__tests__/validation.test.ts
import { describe, it, expect } from "vitest";
import { validatePost, validateUsername } from "@/lib/validation";

describe("validatePost", () => {
  it("godtar et gyldig innlegg", () => {
    expect(validatePost("Hei Kvitter")).toEqual({ ok: true });
  });

  it("avslår tom streng", () => {
    expect(validatePost("")).toEqual({
      ok: false,
      error: "Innlegg kan ikke være tomt",
    });
  });

  it("avslår bare whitespace", () => {
    expect(validatePost("   ")).toEqual({
      ok: false,
      error: "Innlegg kan ikke være bare whitespace",
    });
  });

  it("avslår innlegg over 280 tegn", () => {
    const tooLong = "a".repeat(281);
    expect(validatePost(tooLong).ok).toBe(false);
  });

  it("godtar nøyaktig 280 tegn", () => {
    const exact = "a".repeat(280);
    expect(validatePost(exact)).toEqual({ ok: true });
  });

  it("godtar innlegg med emoji", () => {
    expect(validatePost("Heia! 🚀").ok).toBe(true);
  });
});

describe("validateUsername", () => {
  it("godtar gyldig brukernavn", () => {
    expect(validateUsername("ola_n")).toEqual({ ok: true });
  });

  it("avslår for kort", () => {
    expect(validateUsername("ab").ok).toBe(false);
  });

  it("avslår for langt", () => {
    expect(validateUsername("a".repeat(21)).ok).toBe(false);
  });

  it("avslår whitespace", () => {
    expect(validateUsername("ola nordmann").ok).toBe(false);
  });

  it("avslår æøå", () => {
    expect(validateUsername("åse").ok).toBe(false);
  });

  it("avslår spesialtegn", () => {
    expect(validateUsername("ola!").ok).toBe(false);
  });

  it("avslår reserverte navn (case-insensitivt)", () => {
    expect(validateUsername("Admin").ok).toBe(false);
    expect(validateUsername("ROOT").ok).toBe(false);
  });

  it("godtar tall og understrek", () => {
    expect(validateUsername("ola_42").ok).toBe(true);
  });
});
