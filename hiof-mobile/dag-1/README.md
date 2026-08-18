# dag-1

Demo-prosjekt fra dag 1 av kurset. Expo + expo-router.

## Komme i gang

```bash
pnpm install
pnpm start
```

Velg target i Expo CLI (iOS simulator / Android emulator / Expo Go).

## Stack

- Expo SDK 56
- React Native 0.85
- React 19.2
- expo-router 56
- TypeScript 6.0

## Mer info

- [Expo-dokumentasjon (no)](https://docs.expo.dev/)
- File-based routing: se `app/`-mappa

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
[`../OPPSETT.md`](../OPPSETT.md).
