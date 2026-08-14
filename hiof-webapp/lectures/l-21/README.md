# l-21 — Avansert dybde: Bygg auth selv (sessions, password hashing, middleware)

Branch for leksjon 21 i `webapp-2025`.

Avansert dybde-leksjon: implementér hele auth-stacken selv — sessions, scrypt/bcrypt-hashing, custom middleware og role guards. Ikke nødvendig for å fullføre kurset, men gir innsikt i hva auth-biblioteker som better-auth gjør under panseret.

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/21-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

## Kjør lokalt

```bash
pnpm install
pnpm db:migrate:dev  # hvis Drizzle er konfigurert
pnpm dev
```

## Stack

- RedwoodSDK 1.3+
- React 19.2
- Drizzle ORM + Cloudflare D1
- TailwindCSS 4.3
- TypeScript 6
- Vite 8

Se `package.json` for nøyaktige versjoner.
