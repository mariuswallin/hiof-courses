# lectures

Én mappe per forelesning (`l-0`, `l-06` … `l-22`). Mapper med suffiks
(`l-10-cov`, `l-16-factory`, `l-17-di`, `l-18-contracts`, `l-14-advanced`) er
utvidede varianter av samme leksjon — se `ADVANCED.md` i mappen.

`starters/` inneholder tomme utgangspunkt du kan kopiere.
`l-0/` er ren HTML/CSS/JS uten `package.json` — se dens egen README.

Hvert prosjekt er selvstendig. Installer og kjør **inne i leksjonsmappen**.

---

## Krav

- **Node.js 22.12 eller nyere** (24 LTS anbefalt) — sjekk med `node -v`
- **pnpm 10.16+** — `corepack enable pnpm`
- Cloudflare-konto: **kun** hvis du skal deploye eller bruke remote D1/R2

---

## Kom i gang

```bash
cd l-22            # eller den leksjonen du skal jobbe med
pnpm install
pnpm migrate:dev   # kun i leksjoner med database (l-06 og oppover)
pnpm dev
```

Åpne <http://localhost:5173>.

Lokal D1 er en SQLite-fil under `.wrangler/` — du trenger **verken**
Cloudflare-konto eller å fylle inn `database_id` i `wrangler.jsonc` for å komme
i gang. Vil du nullstille databasen: slett `.wrangler/` og kjør `pnpm migrate:dev`
på nytt.

Tester (fra `l-07` og oppover):

```bash
pnpm test
```

---

## Koble mot ekte Cloudflare-ressurser

Bare nødvendig ved deploy, eller hvis du skal kjøre `drizzle-kit` mot remote.

### 1. Lag konfigfilene i rot av leksjonsmappen

Begge er gitignorert:

```bash
cd l-17
cp .env.example .env
touch .dev.vars
```

`.env` leses av `drizzle-kit`, `.dev.vars` av Wrangler under `pnpm dev`.

### 2. Opprett ressursene

```bash
npx wrangler login
npx wrangler d1 create my-database
```

Lim `database_id` fra svaret inn i `wrangler.jsonc`. Bruker du R2 eller andre
tjenester, opprett dem på samme måte og legg dem inn i `wrangler.jsonc`.

### 3. Fyll ut `.env`

```bash
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_D1_TOKEN=
NODE_ENV=development
```

- **ACCOUNT_ID** står i URL-en i Cloudflare-dashbordet:
  `https://dash.cloudflare.com/[ACCOUNT_ID]/home/domains`
- **DATABASE_ID** fikk du fra `wrangler d1 create`
- **D1_TOKEN** lager du på <https://dash.cloudflare.com/profile/api-tokens>
  med rettighetene `D1:Edit` og `Account Settings:Read`

---

## Windows

Se [felles Windows-oppsett](../README.md#windows) for Node, pnpm og
PowerShell-oppsett.

Noen scripts bruker Unix-syntaks og feiler i PowerShell og cmd:

- `"clean:vite": "rm -rf ./node_modules/.vite"` — i **alle** leksjoner
- `"test": "NODE_ENV=test vitest run"` — fra **l-16** og oppover
- `"dev": "NODE_ENV=${NODE_ENV:-development} vite dev"` — kun i **l-22**

**Enkleste løsning:** kjør alle kommandoer i **Git Bash**, da fungerer de
uendret. Alternativt i PowerShell:

| I stedet for | Kjør |
| --- | --- |
| `pnpm test` | `$env:NODE_ENV="test"; pnpm exec vitest run` |
| `pnpm dev` (l-22) | `$env:NODE_ENV="development"; pnpm exec vite dev` |
| `pnpm clean` | `Remove-Item -Recurse -Force node_modules\.vite` |
| `cp .env.example .env` | `Copy-Item .env.example .env` |
| `touch .dev.vars` | `New-Item .dev.vars -ItemType File` |

`$env:`-variabler gjelder kun i det terminalvinduet — sett dem på nytt i hvert
nytt vindu.
