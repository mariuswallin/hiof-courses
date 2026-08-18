# Oppsett og feilsøking — mobil

Gjelder alle prosjektene i `hiof-mobile/` (`lectures/`, `starters/`, `dag-1/`,
`shop-*`, `student-*`). Alt er pinnet til **Expo SDK 56**.

Les denne før du melder fra om at «det virker ikke». De fire punktene under
står for nesten alle feilene vi har sett.

---

## 1. Expo Go må være bygget for SDK 56

Expo Go er låst til én SDK-versjon. Versjonen i **Play Store og App Store er
ofte en annen enn den vi bruker** — Play Store kan si «du har nyeste versjon»
og likevel gi deg en app for SDK 54. Å avinstallere og installere på nytt fra
butikken hjelper ikke, du får samme versjon tilbake.

**Android:** last ned APK-en for SDK 56 fra
[expo.dev/go](https://expo.dev/go) — velg SDK 56, last ned, installer.
Ikke fra Play Store.

**iOS:** App Store har bare én versjon. Matcher den ikke SDK 56, bygg en
development build i stedet:

```bash
npx expo run:ios
```

Symptom på feil versjon: appen åpner og krasjer med en melding om at prosjektet
krever en annen SDK-versjon, eller «Project is incompatible with this version of
Expo Go».

> **Merk:** noen prosjekter kan uansett ikke kjøres i Expo Go fordi de bruker
> native moduler (`expo-dev-client`, kamera, Appwrite). Det står i prosjektets
> egen README — f.eks. `lectures/l-30/`. Der må du bygge dev-klient.

---

## 2. Ingen globalt installert `expo-cli`

Den gamle globale `expo-cli` kaprer `expo`-kommandoen og gir uforståelige feil:
feil SDK, bundling som ikke starter, moduler som ikke finnes. Den er utdatert og
skal ikke være installert.

Sjekk:

```bash
npm ls -g --depth=0
pnpm ls -g --depth=0    # hvis du har installert noe globalt med pnpm
```

Avinstaller alt du finner av dette:

```bash
npm uninstall -g expo-cli
npm uninstall -g @expo/cli
npm uninstall -g expo
```

Kjør alltid CLI-en lokalt i prosjektet i stedet:

```bash
npx expo start
```

---

## 3. Brannmur / nettverk

Telefonen laster JS-bundlen fra Metro på maskinen din, over port **8081**.
Blir det blokkert får du:

```
Uncaught Error: java.io.IOException: Failed to download remote update
```

Sjekk, i denne rekkefølgen:

1. Telefon og maskin på **samme wifi**. Gjestenett og skolenett har ofte
   klient-isolering — da når ikke telefonen maskinen uansett.
2. **Windows Defender Firewall**: Node må ha lov til å kommunisere på private
   nettverk. Kom det en dialog første gang du kjørte `expo start` og du trykket
   «Avbryt», ligger den nå som en blokkering. Innstillinger → Nettverk og
   Internett → Windows-brannmur → Tillat en app.
3. Bedrifts-VPN eller antivirus med egen brannmur: skru av midlertidig og test.
4. Fungerer ingenting: tunnel gjennom nettet i stedet for lokalnettet
   ```bash
   npx expo start --tunnel
   ```
   (Expo spør om å installere `@expo/ngrok` første gang — si ja.)
5. Android på USB-kabel: rut porten direkte, da er wifi irrelevant
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

---

## 4. Full nullstilling

Når noe henger igjen i cache er rekkefølgen viktig — cache både på maskinen og
**på telefonen**:

```bash
# 1. stopp Metro (Ctrl+C)
# 2. rydd prosjektet
rm -rf node_modules
rm -f pnpm-lock.yaml        # kun hvis du har rotet med pakkeversjoner

# 3. på telefonen: Expo Go → app-info → Lagring → Slett data + cache
#    (eller avinstaller Expo Go og installer APK-en på nytt)

# 4. installer og start med tom cache
pnpm install
pnpm start --clear
```

Windows uten Git Bash:

```powershell
Remove-Item -Recurse -Force node_modules
```

---

## Node og pakkebehandler

| Verktøy | Versjon | Merknad |
| --- | --- | --- |
| Node.js | **22.12+** (24 LTS anbefalt) | `node -v` |
| pnpm | **10.16+** | `corepack enable pnpm` |

Installer Node med [fnm](https://github.com/Schniz/fnm) eller
[nvm-windows](https://github.com/coreybutler/nvm-windows) — **ikke** fra
Microsoft Store. Store-versjonen har rettighetsproblemer med globale mapper.

Noen prosjekter (bl.a. `lectures/l-30/`) krever pnpm fordi de har patcher og
`node-linker=hoisted` i `.npmrc`. Bruker du npm eller yarn der, krasjer appen
ved oppstart. Sjekk prosjektets egen README.

---

## Windows

**iOS er ikke mulig på Windows.** Bruk Android-emulator eller en fysisk
Android-enhet. Alt annet fungerer.

### Oppsett

1. Node via fnm eller nvm-windows (se over).
2. [Android Studio](https://developer.android.com/studio) → SDK Manager →
   installer Android SDK + en emulator-image.
3. Sett `ANDROID_HOME` (typisk `C:\Users\<deg>\AppData\Local\Android\Sdk`) og
   legg `platform-tools` i `PATH`.
4. **Slå på Developer Mode** (Innstillinger → System → For utviklere). Metro og
   pnpm bruker symlinks — uten dette feiler install og bundling.
5. **Slå på lange stier.** React Native har svært dype mapper og sprenger
   260-tegnsgrensen:
   ```powershell
   # PowerShell som administrator
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1
   git config --global core.longpaths true
   ```
6. Legg repoet på **kort sti** (`C:\dev\...`) og **ikke i OneDrive**. OneDrive
   synkroniserer `node_modules` og låser filer midt i en install.
7. Installer [Git for Windows](https://gitforwindows.org/) og kjør kommandoene i
   **Git Bash**. Da fungerer `cp`, `rm -rf` og resten som i dokumentasjonen.

### Vanlige Windows-feil

| Symptom | Fiks |
| --- | --- |
| `pnpm : running scripts is disabled` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` i PowerShell |
| `cp .env.example .env` finnes ikke | `Copy-Item .env.example .env`, eller bruk Git Bash |
| `ENAMETOOLONG` / `EPERM` under install | Lange stier + Developer Mode ikke slått på (punkt 4 og 5) |
| `EPERM: operation not permitted` på tilfeldige filer | Repoet ligger i OneDrive, eller antivirus skanner `node_modules` |
| Install/build er ekstremt tregt | Legg til `node_modules` og `android` som unntak i Windows Defender |
| Emulator svarer ikke | `adb devices` — start emulatoren fra Android Studio først |

---

## Feilsøkingstabell

| Symptom | Sannsynlig årsak | Fiks |
| --- | --- | --- |
| «Project is incompatible with this version of Expo Go» | Expo Go bygget for feil SDK | Punkt 1 — APK fra expo.dev/go |
| Play Store sier «nyeste versjon», men SDK-en er feil | Butikkversjonen er låst til eldre SDK | Punkt 1 |
| `java.io.IOException: Failed to download remote update` | Brannmur / feil nett | Punkt 3 |
| Rare SDK- eller bundling-feil rett etter install | Global `expo-cli` | Punkt 2 |
| Metro finner ikke moduler | Cache | `pnpm start --clear`, ev. punkt 4 |
| Appen krasjer ved oppstart etter install | Feil pakkebehandler (npm/yarn i et pnpm-prosjekt) | Punkt 4 + `pnpm install` |
| «Native module not found» | Ny native pakke krever nytt build | `npx expo run:ios` / `run:android` |
| Feil pakkeversjoner | Drift mot SDK 56 | `npx expo install --check` og godta forslagene |
