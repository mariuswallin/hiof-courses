# l-14 — Utvide API-klient med AbortController, caching og logging

Branch for leksjon 14 i `webapp-2025`.

Utvid eksisterende API-arkitektur med AbortController-støtte, sammenlign parameter-utvidelse med wrapper-pattern for nye features som caching og logging

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/14-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
