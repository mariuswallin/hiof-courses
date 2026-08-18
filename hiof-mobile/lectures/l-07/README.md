# l-07 — Styling i React Native

Branch for leksjon 07 i `react-native`. Demonstrasjon av StyleSheet API,
Flexbox-layout og design-tokens.

## Innhold

- `theme.ts` — design-tokens (colors, spacing, radius, typography)
- `components/StyledCard.tsx` — gjenbrukbar Card med StyleSheet + Flexbox + Platform.select
- `App.tsx` — viser flere StyledCard-eksempler

## Kjør lokalt

```bash
pnpm install
pnpm start
```

## Stack

- Expo SDK 56
- React Native 0.85
- React 19.2
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
