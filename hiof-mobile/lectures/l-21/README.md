# l-21 — Kamera del 2 - avansert

Branch for leksjon 21 i `react-native`.

Avanserte kamerafunksjoner og bildebehandling.

## Læringsmål

Se leksjonen i [`data/courses/react-native/lessons/21-*.mdx`](../../../data/courses/react-native/lessons/) for fullstendige læringsmål og oppgaver.

## Kjør lokalt

```bash
pnpm install
npx expo install --check
pnpm start
```

For native builds:

```bash
npx expo run:ios
npx expo run:android
```

## Stack

- Expo SDK 56
- React Native 0.85
- React 19.2
- expo-router 56
- NativeWind 5
- TypeScript 6.0

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
