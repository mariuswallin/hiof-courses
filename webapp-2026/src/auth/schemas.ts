// src/auth/schemas.ts — Zod schemas for sign-in and sign-up.
//
// This is a quick check on the CLIENT that saves a pointless network call on
// obviously invalid input, and puts the error next to the field right away.
// The real security is on the server: Better Auth validates itself, and server
// actions validate with drizzle-zod (see insertPostSchema).
// Client validation is UX, not security — it can always be bypassed.
import { z } from "zod";

// Length over complexity (NIST 2017): requiring an uppercase letter, a digit
// and a symbol pushes people toward predictable patterns. Must match
// minPasswordLength in auth.ts.
export const PASSWORD_MIN = 12;

export const loginSchema = z.object({
  email: z.email("Ugyldig e-postadresse"),
  password: z.string().min(1, "Passord kreves"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Navn må være minst 3 tegn")
    .max(50, "Navn kan være maks 50 tegn"),
  email: z.email("Ugyldig e-postadresse").toLowerCase(),
  password: z.string().min(PASSWORD_MIN, `Passord må være minst ${PASSWORD_MIN} tegn`),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/** First error message from a Zod result, or null when everything is valid. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Ugyldig input";
}
