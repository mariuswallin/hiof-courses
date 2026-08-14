# hiof-webapp

Kode fra webapplikasjoner-kurset: forelesningsprosjekter, demoer og startere.

Hvert prosjekt er selvstendig — du installerer og kjører i **prosjektmappen**,
ikke her i roten.

| Mappe | Hva det er | Krever |
| --- | --- | --- |
| [`dag-1/`](dag-1) | HTML/CSS/JS-intro med Vite | Node |
| [`quiz-manager/`](quiz-manager) | TypeScript-typer og grunnleggende TS | Node |
| [`snippets/`](snippets) | Løsrevne TS-eksempler til forelesning | Node |
| [`task-manager/`](task-manager) | RedwoodSDK + Tailwind demo | Node |
| [`student-dashboard/`](student-dashboard) | RedwoodSDK + Tailwind demo | Node |
| [`tasks/`](tasks) | RedwoodSDK + Drizzle/D1, kjøres i Docker | Node + Docker |
| [`lectures/`](lectures) | Én mappe per forelesning (`l-0`, `l-06` … `l-22`) | Node, lokal D1 fra `l-06` |

---

## Felles krav

| Verktøy | Versjon | Merknad |
| --- | --- | --- |
| Node.js | **22.12 eller nyere** (24 LTS anbefalt) | Wrangler krever `>=22`, Vite 8 krever `>=22.12`. Sjekk med `node -v`. |
| pnpm | **10.16+** (11.x anbefalt) | `corepack enable pnpm`. Bruk pnpm — ikke bland med npm/yarn i samme prosjekt. |
| Cloudflare-konto | gratis | Kun for prosjekter med D1/R2, og kun ved deploy. Lokal utvikling går uten. |

Standard oppstart i et hvilket som helst prosjekt:

```bash
cd <prosjektmappe>
pnpm install
pnpm dev
```

Åpne adressen som vises i terminalen (typisk `http://localhost:5173`).

---

## Windows

Alt fungerer på Windows, men noen kommandoer må skrives annerledes.

**Enkleste løsning:** installer [Git for Windows](https://gitforwindows.org/) og
kjør alle kommandoer i **Git Bash**. Da fungerer `cp`, `rm -rf`, `openssl` og
scripts med `NODE_ENV=...` akkurat som i dokumentasjonen.

**Oppsett**

1. Installer Node med [fnm](https://github.com/Schniz/fnm) eller
   [nvm-windows](https://github.com/coreybutler/nvm-windows) — ikke fra Microsoft Store.
2. `corepack enable pnpm`
3. Får du `pnpm : File ... cannot be loaded because running scripts is disabled`:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```
4. Legg repoet på kort sti (`C:\dev\...`) og **ikke i OneDrive** — synk låser
   filer i `node_modules` og `.wrangler`.
5. `git config --global core.autocrlf input` — ellers ryker `.sh`-scripts på CRLF.

**Oversettelsestabell (PowerShell)**

| I dokumentasjonen | På Windows |
| --- | --- |
| `cp a b` | `Copy-Item a b` |
| `rm -rf <mappe>` | `Remove-Item -Recurse -Force <mappe>` |
| `NODE_ENV=test pnpm exec vitest run` | `$env:NODE_ENV="test"; pnpm exec vitest run` |
| `openssl rand -hex 32` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Noen `package.json`-scripts har `NODE_ENV=...` eller `rm -rf` innebygd (bl.a.
`lectures/l-22`). De feiler i PowerShell/cmd — se prosjektets egen README for
erstatningskommandoen.

**Hvis noe er tregt eller henger**

- Legg `node_modules`, `.wrangler` og `.vite` som unntak i Windows Defender.
- `EPERM`/`ENOENT` under `pnpm install`: lukk dev-server og editor, slett
  `node_modules`, kjør `pnpm install` på nytt.
