# tasks

RedwoodSDK + Drizzle/D1 + Tailwind. Kan kjøres **i Docker** (anbefalt, likt
oppsett for alle) eller **direkte med pnpm**.

---

## Krav

| Verktøy | Versjon | Merknad |
| --- | --- | --- |
| Node.js | **22.12 eller nyere** | Kun for pnpm-varianten. `node -v` |
| pnpm | **10.16+** | `corepack enable pnpm` |
| Docker | nyeste | Kun for Docker-varianten |

Ingen Cloudflare-konto nødvendig for lokal utvikling — D1 kjører som en lokal
SQLite-fil under `.wrangler/`.

---

## Alternativ 1: pnpm (enklest)

```bash
pnpm install
pnpm migrate:dev   # kjører drizzle/-migrasjonene mot lokal D1
pnpm seed          # valgfritt
pnpm dev
```

Åpne <http://localhost:5173>.

---

## Alternativ 2: Docker

Installer Docker — se [docker.com](https://www.docker.com/get-started/).
På Mac anbefales [OrbStack](https://orbstack.dev/), som er lettere og raskere
enn Docker Desktop.

```bash
docker compose up --build
```

Legg til `-d` for å kjøre i bakgrunnen, og stopp med `docker compose down`.
Etter første gang holder det med `docker compose up`.

**Hvis buildet feiler:** `.wrangler/`-mappen må finnes før containeren starter.
Kjør pnpm-varianten over én gang, og prøv Docker på nytt.

---

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver på :5173 |
| `pnpm build` | Bygger |
| `pnpm preview` | Forhåndsviser bygget versjon |
| `pnpm migrate:new` | Ny migrasjon fra `src/db/schema` |
| `pnpm migrate:dev` / `migrate:prod` | Kjør migrasjoner lokalt / i prod |
| `pnpm seed` | Seed-data |
| `pnpm clean` | Tømmer Vite-cachen |
| `pnpm release` | clean → build → `wrangler deploy` |

## Stack

RedwoodSDK 1.7 · React 19.2 (React Compiler) · Drizzle ORM 0.45 + Cloudflare D1 ·
TailwindCSS 4.3 · Vite 8 · TypeScript 7

Se `package.json` for nøyaktige versjoner.

---

## Windows

**Docker:** krever Docker Desktop med **WSL2-backend** (velges under
installasjon). Legg prosjektet på Windows-disken (`C:\dev\...`), ikke inne i
WSL-filsystemet — bind-mounten i `docker-compose.yml` blir ellers svært treg.

**pnpm:** `pnpm clean` bruker `rm -rf` og feiler i PowerShell/cmd:

```powershell
Remove-Item -Recurse -Force node_modules\.vite
```

— eller kjør alt i **Git Bash**, der scriptet fungerer uendret.

Resten av oppsettet: se [felles Windows-oppsett](../README.md#windows).

---

## Feilsøking

| Symptom | Fiks |
| --- | --- |
| `D1_ERROR: no such table` | `pnpm migrate:dev` |
| Docker-build feiler | Kjør pnpm-varianten én gang først (lager `.wrangler/`) |
| Vil nullstille databasen | Slett `.wrangler/`, kjør `pnpm migrate:dev` på nytt |
| Rar cache-oppførsel | `pnpm clean` og start på nytt |
