# l-22 — Client-side autentisering med Context og UI-komponenter

Context-basert auth-state, custom hooks og UI-komponenter som snakker med
server-side authentication. RedwoodSDK + Drizzle/D1 + Tailwind.

---

## Krav

| Verktøy | Versjon | Merknad |
| --- | --- | --- |
| Node.js | **22.12 eller nyere** (24 LTS anbefalt) | Wrangler krever `>=22`, Vite 8 krever `>=22.12`. Sjekk med `node -v`. |
| pnpm | **10.16+** (11.x anbefalt) | `corepack enable pnpm`. |
| Cloudflare-konto | gratis | Trengs bare for deploy og R2 — **ikke** for lokal utvikling. |

---

## Kom i gang

```bash
pnpm install
pnpm migrate:dev   # kjører drizzle/-migrasjonene mot lokal D1
pnpm dev
```

Åpne <http://localhost:5173>.

Lokal D1 er en SQLite-fil under `.wrangler/` — du trenger **ikke** Cloudflare-konto
eller å fylle inn `database_id` for å komme i gang.

### Valgfritt: koble mot ekte Cloudflare-ressurser

Bare nødvendig hvis du skal deploye eller kjøre `drizzle-kit` mot remote:

```bash
cp .env.example .env
npx wrangler login
npx wrangler d1 create hiof-webapp     # lim database_id inn i wrangler.jsonc
npx wrangler r2 bucket create hiof-webapp
```

`ACCOUNT_ID` finner du i URL-en i Cloudflare-dashbordet.
`CLOUDFLARE_D1_TOKEN` lager du på <https://dash.cloudflare.com/profile/api-tokens>
med rettighetene `D1:Edit` og `Account Settings:Read`.

---

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver på :5173 |
| `pnpm build` | Bygger |
| `pnpm preview` | Forhåndsvis bygget versjon |
| `pnpm test` | Vitest (jsdom + Testing Library), én kjøring |
| `pnpm test:watch` | Vitest i watch-modus |
| `pnpm migrate:new` | Ny migrasjon fra `src/db/schema` |
| `pnpm migrate:dev` / `migrate:prod` | Kjør migrasjoner lokalt / i prod |
| `pnpm db:seed` | Seed-data |
| `pnpm clean` | Tømmer Vite-cachen |
| `pnpm release` | clean → build → `wrangler deploy` |

---

## Stack

RedwoodSDK 1.7 · React 19.2 · Drizzle ORM 0.45 + Cloudflare D1 · TailwindCSS 4.3 ·
Vite 8 · Vitest 4 · TypeScript 7

Se `package.json` for nøyaktige versjoner.

---

## Windows

To scripts i `package.json` bruker Unix-syntaks og feiler i PowerShell og cmd:

```jsonc
"dev":  "NODE_ENV=${NODE_ENV:-development} vite dev",
"test": "NODE_ENV=test vitest run",
"clean:vite": "rm -rf ./node_modules/.vite"
```

**Enkleste løsning:** installer [Git for Windows](https://gitforwindows.org/) og
kjør alle kommandoer i **Git Bash**. Da fungerer `pnpm dev`, `pnpm test` og
`pnpm clean` uendret.

**Alternativt, i PowerShell:**

| I stedet for | Kjør |
| --- | --- |
| `pnpm dev` | `$env:NODE_ENV="development"; pnpm exec vite dev` |
| `pnpm test` | `$env:NODE_ENV="test"; pnpm exec vitest run` |
| `pnpm clean` | `Remove-Item -Recurse -Force node_modules\.vite` |
| `cp .env.example .env` | `Copy-Item .env.example .env` |

`$env:`-variabler gjelder kun i det terminalvinduet — sett dem på nytt i hvert
nytt vindu.

**Ellers på Windows**

- Installer Node med [fnm](https://github.com/Schniz/fnm) eller
  [nvm-windows](https://github.com/coreybutler/nvm-windows), ikke fra Microsoft Store.
- `pnpm : running scripts is disabled` → `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- Legg repoet på kort sti (`C:\dev\...`) og ikke i OneDrive — synk låser filer i
  `node_modules` og `.wrangler`.
- Treg install eller dev-server? Legg `node_modules`, `.wrangler` og `.vite` som
  unntak i Windows Defender.

---

## Feilsøking

| Symptom | Fiks |
| --- | --- |
| `D1_ERROR: no such table` | `pnpm migrate:dev` |
| `No migrations to apply` | Migrasjonene ligger i `drizzle/` — sjekk `migrations_dir` i `wrangler.jsonc`. |
| Rar cache-oppførsel | `pnpm clean` og start på nytt |
| Vil nullstille databasen | Slett `.wrangler/`, kjør `pnpm migrate:dev` på nytt |
