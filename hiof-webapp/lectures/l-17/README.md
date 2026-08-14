# l-17 — Service og Controller Separation med N-Layer Arkitektur

Branch for leksjon 17 i `webapp-2025`.

Refaktorere API-struktur til separate ansvarslag for bedre testbarhet og vedlikeholdbarhet

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/17-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
