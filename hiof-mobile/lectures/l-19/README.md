# l-19 — NativeWind v5 + Tailwind v4

Branch for leksjon 19 i `react-native`. Full omskriv fra v4 → v5.

## Endringer fra v4

| Fil | v4 (gammel) | v5 (ny) |
|---|---|---|
| `babel.config.js` | `["nativewind/babel"]`-preset | Kun `babel-preset-expo` (NW kjører fra Metro) |
| `metro.config.js` | `withNativeWind(config, { input })` | Samme API — NW v5 håndterer plugin internt |
| `app/global.css` | `@tailwind base/components/utilities` | `@import "tailwindcss/theme.css" layer(theme);` osv. |
| `postcss.config.mjs` | (fantes ikke) | NY — krever `@tailwindcss/postcss` |
| `nativewind-env.d.ts` | `<reference types="nativewind/types" />` | + `<reference types="react-native-css/types" />` |
| `tailwind.config.js` | full config | Minimum: `content`-globs + `nativewind/preset` (resten i `@theme` i CSS) |

## Nye pakker

```bash
pnpm add react-native-css
pnpm add -D @tailwindcss/postcss postcss
```

`react-native-css` er motoren NW v5 bruker for å parse Tailwind-direktiver til
RN-stiler. `@tailwindcss/postcss` kreves for Tailwind v4-prosesseringen.

## Kjent issue (pnpm)

Hvis pnpm-builds feiler med "metro can't find nativewind", sjekk at
`.npmrc` har:

```
public-hoist-pattern[]=*metro*
public-hoist-pattern[]=*react*
```

Dette hoister Metro-plugins + react-pakker slik at NW finner dem.

## Verifisering

```bash
pnpm install
pnpm start
# Sjekk at en `<View className="bg-blue-500 p-4 rounded-lg">` rendrer riktig
```

## Stil-eksempler (TW v4-syntaks)

- `shadow-lg` (ny opacity-syntaks i v4)
- `elevation-2` for Android-shadow
- `text-lg/8` for line-height (slash-separator)

Se [`docs/tailwind-v4-changes.md`](https://tailwindcss.com/docs/v4-beta) for full liste.

---

## Oppsett og feilsøking

Før første kjøring:

- Expo Go må være bygget for **SDK 56**. Versjonen i Play Store kan være låst til
  en eldre SDK selv om den sier «nyeste versjon» — last ned APK-en for SDK 56 fra
  [expo.dev/go](https://expo.dev/go).
- Ingen globalt installert `expo-cli`. Sjekk `npm ls -g --depth=0`, fjern med
  `npm uninstall -g expo-cli`, og kjør `npx expo` lokalt i stedet.
- Windows: Developer Mode og lange stier slått på, repoet på kort sti utenfor
  OneDrive.

Full guide, brannmur-feil («Failed to download remote update») og feiltabell:
[`../../OPPSETT.md`](../../OPPSETT.md).
