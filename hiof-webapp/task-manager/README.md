# task-manager

Demo-prosjekt på RedwoodSDK: server actions, optimistiske oppdateringer og
Suspense. Ingen database — data ligger i minne, så oppsettet er minimalt.

## Krav

- **Node.js 22.12 eller nyere** (24 LTS anbefalt) — sjekk med `node -v`
- **pnpm 10.16+** — `corepack enable pnpm`

Ingen Cloudflare-konto nødvendig for lokal utvikling.

## Kom i gang

```bash
pnpm install
pnpm dev
```

Åpne adressen i terminalen (typisk `http://localhost:5173`).

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver |
| `pnpm build` | Bygger |
| `pnpm preview` | Forhåndsviser bygget versjon |
| `pnpm clean` | Tømmer Vite-cachen |
| `pnpm release` | clean → build → `wrangler deploy` (krever Cloudflare-konto) |

## Stack

RedwoodSDK 1.7 · React 19.2 (React Compiler) · Vite 8 · TypeScript 7 · Wrangler 4
Styling er ren CSS i `src/app/styles.css` — ingen Tailwind.

Se `package.json` for nøyaktige versjoner.

## Windows

`pnpm clean` bruker `rm -rf` og feiler i PowerShell/cmd. Bruk i stedet:

```powershell
Remove-Item -Recurse -Force node_modules\.vite
```

— eller kjør alt i **Git Bash**, der scriptet fungerer uendret.

Resten av oppsettet: se [felles Windows-oppsett](../README.md#windows).
