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

Nødvendig fordi `AI` og `VECTORIZE` er satt til `remote: true` i `wrangler.jsonc` — de har ingen lokal emulering og går alltid mot Cloudflare. Alternativt må de kommenteres ut for lokal utvikling i `wrangler.jsonc`:

```jsonc
  // "ai": {
  //   "binding": "AI",
  //   "remote": true
  // },
  // "vectorize": [
  //   {
  //     "binding": "VECTORIZE",
  //     "index_name": "kvitter-posts-index",
  //     "remote": true
  //   }
  // ],
```
Da trenger du heller ikke å logge inn.

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
```

```bash
# demo-brukere og innlegg (valgfritt)
# Mac / linux
pnpm seed           
# Windows
pnpm seed:windows
```

### 6. Kjør

```bash
pnpm dev
```

Verify at dev-serveren kjører på <http://localhost:5174>. Hvis den kjører på en annen må BETTER_AUTH_URL i `.dev.vars` oppdateres tilsvarende ellers får du ikke laget bruker / logget inn.

Åpne <http://localhost:5174>. Lag en ekte bruker via `/register` — seed-brukerne kan ikke logge inn.

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

## WSL (Windows Subsystem for Linux. Valgfritt)

Dersom du bruker Windows, kan det fra tid til annen dukke opp problemer 
med RedwoodSDK. Det anbefales, for dere som ønsker å teste applikasjonens 
AI-søk og semantiske søk, å kjøre applikasjonen via WSL i stedet for 
direkte i Windows.

### Installering av WSL

```bash
wsl --install # Kjør via cmd eller PowerShell som administrator
```

Dette installerer WSL2 samt en Ubuntu-distribusjon på maskinen din 
(standard distro, du kan velge et annet distro ved behov). 
Når installasjonen er ferdig, må du restarte maskinen.

Når maskinen starter opp igjen, åpnes en terminal som ber deg opprette 
et brukernavn og passord for WSL-kontoen din. Dette brukernavnet/passordet 
er lokalt for WSL og trenger ikke være det samme som Windows-kontoen din.

### Verifisere installasjonen

For å sjekke at alt er satt opp riktig, kan du kjøre:

```bash
wsl -l -v
```

### Oppdatere pakker

Åpne Wsl:

```bash 
wsl # I cmd eller powershell
```

Første gang du åpner Ubuntu-terminalen, anbefales det å oppdatere 
pakkelisten:

```bash
sudo apt update && sudo apt upgrade -y
```

### Installere Node i WSL

Når man bruker WSL anbefales det å installere Node via NVM
(Node Version Manager) inne i WSL, i stedet for å bruke en Windows-installasjon:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### Åpne prosjektet i WSL med VSCode

1. Installer utvidelsen WSL i VSCode.
2. Klon eller flytt prosjektet ditt til hjemmeområdet i WSL 
   (f.eks. `~/prosjekter/`), ikke under `/mnt/c/...`. Dette gir 
   betydelig bedre filsystem-ytelse.

```bash 
cd # Sender deg til rot filen av WSL maskinen "~$"
mkdir prosjekter # Lager en mappe for prosjektene dine
cd prosjekter # Sender deg inn i mappa
git clone https://github.com/mariuswallin/hiof-courses.git
# Når repository er klonet kan du gå til webapp-2026 mappen
cd hiof-courses/webapp-2026
# Herfra, dersom du gjør følgende kommando:
ls
# Vil du se at vi har prosjekt mappen klar.
```

3. Nå som du er i prosjekt mappen skriv:

```bash
code .
```
Dette åpner VS Code koblet direkte mot WSL miljøet.
Dersom du nå leser README direkte fra en annen plass du klonet
prosjektet kan du stenge dette vinduet. Du vil se nede i
venstre hjørnet av VSCode at du er koblet til 
WSL i riktig code editor.

### WSL ferdig installert
Nå som du har installert WSL kan du gå tilbake til
toppen av README for instruks på hvordan du setter i gang
prosjektet.


### Vanlige feil og løsninger

- **Treg ytelse / lang installasjonstid:** Sjekk at prosjektet ligger i 
  WSL sitt eget filsystem (f.eks. `~$/prosjekter/hiof-courses`) og ikke på 
  `/mnt/c/prosjekter/hiof-courses`, som er tregere å lese/skrive til.

- **`localhost` fungerer ikke i nettleseren:** WSL2 videresender som 
  regel `localhost` automatisk til Windows. Fungerer det ikke, prøv å 
  bruke IP-adressen WSL oppgir (kjør `hostname -I` inne i WSL), eller 
  restart WSL med `wsl --shutdown` etterfulgt av at du åpner terminalen på nytt.

- **Feil Node-versjon:** Sjekk med `node -v` at du kjører Node inne i 
  WSL og ikke en Windows-installasjon som "lekker" inn via PATH.

- **Maskinen ble treg etter installasjon av WSL:** Husk å skru av WSL etter bruk.
  WSL er en virituel maskin som tar ganske store ressurser for å kjøre.
  Så når du er ferdig for dagen, kjør kommandoen `wsl --shutdown`.

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm dev` | Utviklingsserver på :5174 |
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

Alt fungerer på Windows, men noen ting kan det hende du må gjøres litt annerledes.

**Før du starter**

- Installer Node 22.12+ (LTS anbefalt) og pnpm 10.16+ (11.x anbefalt). Sjekk med `node -v` og `pnpm -v`
- For å installere pnpm google / KI dette for å se relevante ressurser
- Får du `pnpm : File ... cannot be loaded because running scripts is disabled` i PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```
- Legg repoet på en kort sti (`C:\dev\...`), ikke i OneDrive. OneDrive-synk låser filer i `node_modules` og `.wrangler`.
- `git config --global core.autocrlf input` — ellers ryker `scripts/release.sh` på CRLF.

**Kommandoer som ikke finnes på Windows**

Ikke verifisert av meg da jeg ikke har Windows, men her er noen forslag (fra KI)

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
