# hiof-mobile

Kode til mobil-delen av kurset. Expo SDK 56 / React Native 0.85 / TypeScript 6.

## Start her

**[`OPPSETT.md`](./OPPSETT.md)** — Node/pnpm, Expo Go-versjoner, Windows-oppsett
og feilsøking. Les den før du kjører noe for første gang.

De fire tingene som feiler oftest:

1. Expo Go fra Play Store er bygget for **feil SDK** — hent APK-en for SDK 56 fra
   [expo.dev/go](https://expo.dev/go).
2. Globalt installert `expo-cli` ødelegger for `npx expo` — avinstaller den.
3. Brannmur blokkerer Metro → `Failed to download remote update`.
4. Windows uten Developer Mode / lange stier → install feiler.

## Mapper

| Mappe | Hva |
| --- | --- |
| `lectures/l-01` … `l-30` | Én mappe per leksjon, ferdig kode |
| `starters/` | Utgangspunkt for live-demo (`starter-basic`, `starter-advanced`) |
| `dag-1/` | Demo fra dag 1 |
| `shop*/`, `student-*/` | Demoprosjekter brukt underveis |
| `scripts/` | `check-syntax.mjs`, `check-types.sh` |

Hver mappe har sin egen README med det som er spesielt for den.

## Kjør et prosjekt

```bash
cd lectures/l-XX
pnpm install
npx expo install --check   # verifiserer at pakkeversjonene matcher SDK 56
pnpm start
```

Trykk `i` for iOS-simulator, `a` for Android-emulator, eller skann QR-koden med
Expo Go (SDK 56). Enkelte prosjekter krever development build i stedet for
Expo Go — det står i prosjektets README.
