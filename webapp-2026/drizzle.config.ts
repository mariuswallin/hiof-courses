import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "drizzle/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  // For migrasjons-generering trengs ikke credentials — `dialect: sqlite`
  // er nok for `drizzle-kit generate`. Verdiene under brukes kun ved
  // remote push/introspect.
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
