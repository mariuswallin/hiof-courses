// src/auth/auth.ts
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { createDatabase } from "@/db";
import { users, sessions, accounts, verifications } from "@/db/schema";

if (!env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET er ikke satt. Konfigurer i .dev.vars (lokalt) " +
      "eller som Cloudflare-secret (prod) med `wrangler secret put BETTER_AUTH_SECRET`."
  );
}

export const auth = betterAuth({
  // better-auth looks tables up by model name (user, session, ...), while our
  // schema exports them in plural (users, sessions, ...). Map them explicitly.
  database: drizzleAdapter(createDatabase(env.DB), {
    provider: "sqlite",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dager
    updateAge: 60 * 60 * 24, // forleng cookie dagvis ved aktivitet
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
