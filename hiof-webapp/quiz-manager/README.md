# quiz-manager

TypeScript-introduksjon: typer, interfaces, unions og `as const`. Vite + TS,
ingen rammeverk.

## Krav

- **Node.js 22.12 eller nyere** (24 LTS anbefalt) — sjekk med `node -v`
- **pnpm 10.16+** — `corepack enable pnpm`

## Kom i gang

```bash
pnpm install
pnpm dev
```

Åpne adressen i terminalen (typisk `http://localhost:5173`). Koden ligger i
`src/main.ts`.

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver |
| `pnpm build` | Typesjekker (`tsc`) og bygger til `dist/` |
| `pnpm preview` | Forhåndsviser bygget versjon |

> `pnpm dev` typesjekker **ikke** — Vite stripper bare typene. Kjør
> `pnpm build` (eller se feilene i editoren) for å fange typefeil.

## Windows

Ingen spesielle steg — alle scriptene er plattformuavhengige.
Se [felles Windows-oppsett](../README.md#windows) hvis `pnpm` ikke vil kjøre i
PowerShell.
