// Augmenteringer til den wrangler-genererte Cloudflare.Env. Secrets og
// bindings som ikke ligger i wrangler.jsonc deklareres her så de
// type-sjekkes uten `as any`. `wrangler types` overskriver
// worker-configuration.d.ts ved hver regen, så vi holder vår separat.
declare namespace Cloudflare {
  interface Env {
    /** Better Auth signerings-/cookie-nøkkel. Påkrevd ved oppstart. */
    BETTER_AUTH_SECRET?: string;
  }
}

// IKKE legg `export {}` her — filen MÅ være et script (ikke module) for at
// `declare namespace Cloudflare` skal merge med worker-configuration.d.ts.
