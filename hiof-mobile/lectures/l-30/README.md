# l-30 — Testing

Leksjon 30 i mobil-kurset: testing av React Native-appen (`student_id_app`).
Expo Router + NativeWind + TanStack Query/Form, med Appwrite som backend.

---

## Krav

| Verktøy | Versjon | Merknad |
| --- | --- | --- |
| Node.js | **22.12 eller nyere** (24 LTS anbefalt) | Sjekk med `node -v`. |
| pnpm | **10.16+** (11.x anbefalt) | `corepack enable pnpm`. |
| Xcode | 16+ | Kun macOS, for iOS-simulator. |
| Android Studio | nyeste | For Android-emulator (Windows/macOS/Linux). |
| Appwrite-prosjekt | — | Se «Miljøvariabler» under. |

> **Bruk pnpm — ikke npm eller yarn.**
> Prosjektet har en patch på `react-native-appwrite` (`patches/`) og
> `node-linker=hoisted` i `.npmrc`. Med npm/yarn linkes to kopier av
> `expo-file-system` og appen krasjer ved oppstart.

---

## Kom i gang

### 1. Installer

```bash
pnpm install
npx expo install --check   # verifiserer at pakkeversjonene matcher SDK 56
```

### 2. Miljøvariabler

```bash
cp .env.example .env
```

Fyll inn verdiene fra ditt Appwrite-prosjekt (`.env` er gitignorert):

| Nøkkel | Hvor du finner den |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Appwrite → Settings → API Endpoint |
| `EXPO_PUBLIC_PROJECT_ID` | Appwrite → Settings → Project ID |
| `EXPO_PUBLIC_PLATFORM_ID` | Bundle-id, må matche `app.json` → `dev.example.studentid` |
| `EXPO_PUBLIC_DATABASE_ID` | Appwrite → Databases |
| `EXPO_PUBLIC_STUDENT_COLLECTION_ID` | Appwrite → Databases → Collections |
| `EXPO_PUBLIC_PROFILE_COLLECTION_ID` | Appwrite → Databases → Collections |

Alle nøkler må ha prefikset `EXPO_PUBLIC_` for å nå klienten. Endrer du `.env`
må du starte Metro på nytt med `pnpm start --clear`.

### 3. Bygg en dev-klient

Appen bruker `expo-camera` og `expo-media-library`, så **Expo Go fungerer ikke**.
Du må bygge en development build én gang:

```bash
npx expo run:ios       # macOS + Xcode
npx expo run:android   # Android Studio + emulator/enhet
```

Dette genererer `ios/` og `android/` (begge gitignorert) og installerer appen.

### 4. Kjør

Etter første build holder det med:

```bash
pnpm start
```

Trykk `i` for iOS, `a` for Android. Kun JS-endringer? Da trenger du ikke bygge
på nytt. Legger du til en native pakke må du kjøre `expo run:*` igjen.

---

## Testing

```bash
pnpm test              # jest --watchAll (watch-modus)
pnpm exec jest         # kjør én gang, f.eks. i CI
pnpm exec jest __tests__/components
```

Oppsettet er `jest-expo` + `@testing-library/react-native`, med `msw` for å
stubbe nettverkskall. Testene ligger i `__tests__/components/` og
`__tests__/integrations/`. `dotenv/config` lastes automatisk, så testene ser
`.env`.

---

## Scripts

| Kommando | Gjør |
| --- | --- |
| `pnpm start` | Metro dev-server |
| `pnpm ios` / `pnpm android` | Bygger og kjører native |
| `pnpm web` | Kjører i nettleser (kamera/media virker ikke) |
| `pnpm test` | Jest i watch-modus |

---

## Stack

Expo SDK 56 · React Native 0.85 · React 19.2 · expo-router 56 · TypeScript 6 ·
NativeWind 5 (preview) · TanStack Query 5 / Form 1 · Zod 4 · Appwrite

Se `package.json` for nøyaktige versjoner.

---

## Windows

**iOS er ikke mulig på Windows.** Bruk Android-emulator eller en fysisk
Android-enhet. Alt annet fungerer.

**Oppsett**

1. Installer Node med [fnm](https://github.com/Schniz/fnm) eller
   [nvm-windows](https://github.com/coreybutler/nvm-windows) — ikke fra Microsoft Store.
2. Installer [Android Studio](https://developer.android.com/studio), åpne
   SDK Manager og installer Android SDK + en emulator-image.
3. Sett `ANDROID_HOME` (typisk `C:\Users\<deg>\AppData\Local\Android\Sdk`) og
   legg `platform-tools` i `PATH`.
4. **Slå på Developer Mode** (Innstillinger → System → For utviklere). Metro og
   pnpm bruker symlinks, og uten dette feiler install/bundling.
5. **Slå på lange stier** — React Native har svært dype mapper og sprenger
   260-tegnsgrensen:
   ```powershell
   # PowerShell som administrator
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1
   git config --global core.longpaths true
   ```
6. Legg repoet på kort sti (`C:\dev\...`) og **ikke i OneDrive**.

**Vanlige feil**

| Symptom | Fiks |
| --- | --- |
| `pnpm : running scripts is disabled` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` i PowerShell |
| `cp .env.example .env` finnes ikke | `Copy-Item .env.example .env`, eller bruk Git Bash |
| `ENAMETOOLONG` / `EPERM` under install | Lange stier + Developer Mode ikke slått på (punkt 4 og 5) |
| Metro finner ikke moduler | `pnpm start --clear` |
| Emulator svarer ikke | `adb devices` — start emulatoren fra Android Studio først |
| Install/build er ekstremt tregt | Legg til `node_modules` og `android` som unntak i Windows Defender |

**Tips:** installer [Git for Windows](https://gitforwindows.org/) og kjør
kommandoene i **Git Bash** — da fungerer `cp`, `rm -rf` og resten som i
dokumentasjonen.

---

## Feilsøking

| Symptom | Fiks |
| --- | --- |
| Appen krasjer ved oppstart etter install | Du brukte npm/yarn. Slett `node_modules` + lockfil, kjør `pnpm install`. |
| «Native module not found» | Ny native pakke krever nytt build: `npx expo run:ios` / `run:android`. |
| Tomme data fra Appwrite | Sjekk at `.env` er fylt ut og at Metro er startet på nytt (`pnpm start --clear`). |
| Feil pakkeversjoner | `npx expo install --check` og godta forslagene. |
| Rar iOS-build | `rm -rf ios/build` og `npx expo run:ios` på nytt. |
