# Kvitter — webapp-2026

Ferdig mikroblogg fra kurset Webapplikasjoner.
RedwoodSDK + Cloudflare Workers + Better Auth + Drizzle/D1 + Workers AI + Vectorize + R2.

---

## Krav

| Verktøy | Versjon | Merknad |
| --- | --- | --- |
| Node.js | **22.12 eller nyere** (24 LTS anbefalt) | Wrangler krever `>=22`, Vite 8 krever `>=22.12`. Sjekk med `node -v`. |
| pnpm | **10.16+** (11.x anbefalt) | `corepack enable pnpm`. Prosjektet bruker `pnpm-lock.yaml` — ikke bland med npm/yarn. |
| Cloudflare-konto | gratis | Trengs for D1, AI, Vectorize og R2. |

---

## Kom i gang

### 1. Installer

```bash
pnpm install
```

### 2. Miljøvariabler

```bash
cp .dev.vars.example .dev.vars
```

Generer `BETTER_AUTH_SECRET` (minst 32 tegn) og lim inn i `.dev.vars`:

```bash
# macOS / Linux / Git Bash
openssl rand -hex 32

# Windows PowerShell (uten openssl)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.dev.vars` er gitignorert. I prod brukes `wrangler secret put BETTER_AUTH_SECRET`.

### 3. Logg inn på Cloudflare

```bash
npx wrangler login
```

Nødvendig fordi `AI` og `VECTORIZE` er satt til `remote: true` i `wrangler.jsonc` — de har ingen lokal emulering og går alltid mot Cloudflare.

### 4. Opprett ressursene

```bash
npx wrangler d1 create kvitter-db
npx wrangler vectorize create kvitter-posts-index --dimensions=768 --metric=cosine
npx wrangler r2 bucket create kvitter-files
npx wrangler r2 bucket create kvitter-files-dev
```

Lim `database_id` fra første kommando inn i `wrangler.jsonc` (erstatter `REPLACE_WITH_D1_ID`).

### 5. Database

Mappen `drizzle/migrations/` ligger **ikke** i repoet — den må genereres først:

```bash
pnpm db:generate      # lager migrasjoner fra src/db/schema.ts
pnpm db:migrate:dev   # kjører dem mot lokal D1
pnpm seed             # demo-brukere og innlegg (valgfritt)
```

### 6. Kjør

```bash
pnpm dev
```

Åpne <http://localhost:5173>. Lag en ekte bruker via `/register` — seed-brukerne kan ikke logge inn.

---

## Hva kan hoppes over?

Appen degraderer pent hvis en binding mangler:

| Mangler | Konsekvens |
| --- | --- |
| `AI` | `/api/ai/hashtags` og AI-søk svarer 503. Resten virker. |
| `VECTORIZE` | Semantisk søk / RAG virker ikke. Resten virker. |
| `R2` | Bilde- og avatar-opplasting virker ikke (404). Resten virker. |
| `DB` | Ingenting virker — D1 er påkrevd. |

Vil du bare se appen kjøre: gjør steg 1, 2, 5 og hopp over Vectorize/R2.

---

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver på :5173 |
| `pnpm build` | Bygger |
| `pnpm preview` | Forhåndsvis bygget versjon |
| `pnpm check` | Genererer worker-typer + typesjekker |
| `pnpm test` | Enhets-, komponent- og integrasjonstester (Vitest) |
| `pnpm test:watch` / `test:coverage` | Watch-modus / dekning |
| `pnpm test:e2e` | Playwright (`pnpm exec playwright install` første gang) |
| `pnpm db:generate` | Ny migrasjon fra skjemaet |
| `pnpm db:migrate:dev` / `:prod` | Kjør migrasjoner lokalt / i prod |
| `pnpm seed` | Demo-data |
| `pnpm index:posts` | Indekser eksisterende innlegg i Vectorize |
| `pnpm lint` / `pnpm format` | Typesjekk uten build / Prettier |
| `pnpm release` | Test → build → migrer prod → deploy (krever bash) |

Om testoppsettet: se [`src/test/README.md`](src/test/README.md).

---

## Deploy

```bash
npx wrangler secret put BETTER_AUTH_SECRET
pnpm db:migrate:prod
npx wrangler deploy
```

Husk å oppdatere `BETTER_AUTH_URL` og `PUBLIC_URL` i `wrangler.jsonc` til prod-URL-en.

---

## Windows

Alt fungerer på Windows, men noen ting må gjøres litt annerledes.

**Før du starter**

- Installer Node med [fnm](https://github.com/Schniz/fnm) eller [nvm-windows](https://github.com/coreybutler/nvm-windows), ikke fra Microsoft Store.
- Får du `pnpm : File ... cannot be loaded because running scripts is disabled` i PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```
- Legg repoet på en kort sti (`C:\dev\...`), ikke i OneDrive. OneDrive-synk låser filer i `node_modules` og `.wrangler`.
- `git config --global core.autocrlf input` — ellers ryker `scripts/release.sh` på CRLF.

**Kommandoer som ikke finnes på Windows**

| I dokumentasjonen | På Windows (PowerShell) |
| --- | --- |
| `openssl rand -hex 32` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `cp .dev.vars.example .dev.vars` | `Copy-Item .dev.vars.example .dev.vars` |
| `rm -rf <mappe>` | `Remove-Item -Recurse -Force <mappe>` |
| `pnpm release` (`bash scripts/release.sh`) | Kjør fra **Git Bash**, eller kjør stegene manuelt: `pnpm test`, `pnpm build`, `pnpm wrangler d1 migrations apply DB --remote`, `pnpm wrangler deploy` |

**Enkleste løsning:** installer [Git for Windows](https://gitforwindows.org/) og kjør alle kommandoer i **Git Bash**. Da fungerer `cp`, `rm -rf`, `openssl` og `.sh`-scriptene som i dokumentasjonen.

**Hvis noe henger seg**

- Legg til `node_modules`, `.wrangler` og `.vite` som unntak i Windows Defender — antivirus-skanning gjør install og dev-server veldig treg.
- Feil under `pnpm install` med `EPERM` eller `ENOENT`: lukk dev-serveren og editoren, slett `node_modules`, kjør `pnpm install` på nytt.

---

## Feilsøking

| Symptom | Årsak / fiks |
| --- | --- |
| `No migrations to apply` | Kjør `pnpm db:generate` først — `drizzle/migrations/` mangler. |
| `D1_ERROR: no such table` | Migrasjonene er ikke kjørt: `pnpm db:migrate:dev`. |
| AI-kall gir 504 | `TIMEOUT_MS` i `src/routes/ai.ts` (20 s). AI-kall går ut på nett også i dev — treg linje gir timeout. |
| Vectorize avviser vektorer | Indeksen må ha `--dimensions=768` (matcher `@cf/google/embeddinggemma-300m`). |
| Innlogging feiler lokalt | `BETTER_AUTH_SECRET` mangler eller er kortere enn 32 tegn i `.dev.vars`. |
| Rar cache-oppførsel i dev | `rm -rf node_modules/.vite` og start på nytt. |
