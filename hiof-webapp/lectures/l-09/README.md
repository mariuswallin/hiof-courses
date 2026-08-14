# l-09 — Data-separasjon - bygge fleksible og testbare React-komponenter

Branch for leksjon 09 i `webapp-2025`.

Lær å løsrive komponenter fra hardkodet data gjennom props-basert data injection, skape klare TypeScript-kontrakter og implementere Dependency Injection-prinsippet for økt gjenbrukbarhet og testbarhet.

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/09-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
