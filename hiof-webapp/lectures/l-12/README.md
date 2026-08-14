# l-12 — API-bibliotek - fra spredt datahenting til sentralisert løsning

Branch for leksjon 12 i `webapp-2025`.

Lær å organisere API-kall i et gjenbrukbart bibliotek som gjør kodebasen lettere å vedlikeholde og teste, med fokus på GET-operasjoner og enkle abstraksjoner.

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/12-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
