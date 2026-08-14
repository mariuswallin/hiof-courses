# l-13 — Fetch med arkitektur

Branch for leksjon 13 i `webapp-2025`.

Utvid API-biblioteket med Result pattern, sentralisert HTTP-klient og robust error handling for å transformere applikasjonen fra prototype til production-ready

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/13-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
