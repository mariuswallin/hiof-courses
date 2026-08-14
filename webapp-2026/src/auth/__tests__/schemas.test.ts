/**
 * Client-side validation for sign-in and sign-up.
 * It is UX, not security — but it must be correct, and it must not reject
 * valid input.
 */
import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  PASSWORD_MIN,
  firstIssue,
} from "@/auth/schemas";

describe("loginSchema", () => {
  it("godtar gyldig e-post og passord", () => {
    expect(
      loginSchema.safeParse({ email: "kari@example.com", password: "x" })
        .success,
    ).toBe(true);
  });

  it("avviser ugyldig e-post", () => {
    const result = loginSchema.safeParse({
      email: "ikke-epost",
      password: "x",
    });

    expect(result.success).toBe(false);
    expect(!result.success && firstIssue(result.error)).toMatch(/e-post/i);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Kari Nordmann",
    email: "Kari@Example.com",
    password: "et-langt-passord",
  };

  it("normaliserer e-post til små bokstaver", () => {
    const result = registerSchema.safeParse(valid);

    expect(result.success && result.data.email).toBe("kari@example.com");
  });

  it(`krever minst ${PASSWORD_MIN} tegn i passordet`, () => {
    const result = registerSchema.safeParse({ ...valid, password: "kort" });

    expect(result.success).toBe(false);
    expect(!result.success && firstIssue(result.error)).toContain(
      String(PASSWORD_MIN),
    );
  });

  it("godtar et langt passord uten spesialtegn (lengde > kompleksitet)", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "riktig hest batteri stift",
    });

    expect(result.success).toBe(true);
  });

  it("avviser for kort navn", () => {
    expect(registerSchema.safeParse({ ...valid, name: "Ka" }).success).toBe(
      false,
    );
  });
});
