# l-07 — Refaktorering med custom hooks - separasjon av ansvarsområder

Branch for leksjon 07 i `webapp-2025`.

Lær å separere filtreringslogikk fra UI ved å bygge gjenbrukbare custom hooks. Forbedre arkitekturen mens all funksjonalitet bevares og testbarheten øker betydelig.

## Læringsmål

Se leksjonen i [`data/courses/webapp-2025/lessons/07-*.mdx`](../../../data/courses/webapp-2025/lessons/) for fullstendige læringsmål og oppgaver.

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
