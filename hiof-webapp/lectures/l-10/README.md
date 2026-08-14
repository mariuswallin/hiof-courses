# l-10 — Konfigurerbare komponenter - bygge gjenbrukbare tabeller for forskjellige datatyper

Branch for leksjon 10 i `webapp-2025`.

Lær å designe fleksible React-komponenter som balanserer enkelhet og konfigurerbarhet. Implementer kolonner, handlinger og sortering som fungerer på tvers av forskjellige datatyper.

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/10-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
