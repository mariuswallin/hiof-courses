// src/auth/auth.ts — Better Auth with production hardening
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/db";

if (!env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET er ikke satt. Konfigurer i .dev.vars (lokalt) " +
      "eller som Cloudflare-secret (prod) med " +
      "`wrangler secret put BETTER_AUTH_SECRET`.",
  );
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Long passphrases beat short ones with special characters (NIST 2017).
    minPasswordLength: 12,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dager
    updateAge: 60 * 60 * 24, // forleng cookie dagvis ved aktivitet
  },
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        },
      },
    },
    generateId: () => crypto.randomUUID(),
  },
});

export type AuthInstance = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
