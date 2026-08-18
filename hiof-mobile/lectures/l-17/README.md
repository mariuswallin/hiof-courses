# l-17 — Forms del 2 (avansert)

Branch for leksjon 17 i `react-native`. Bygger videre på `l-16` (forms-1) ved å
abstrahere ut gjenbrukbare feltkomponenter.

## Innhold

- `components/forms/FieldError.tsx` — feilvisning basert på TanStack Form-meta
- `components/forms/FieldInput.tsx` — TextInput med validering + feil
- `components/forms/FieldPicker.tsx` — Picker-feltabstraksjon
- `components/forms/DateField.tsx` — DateTimePicker-feltabstraksjon
- `components/forms/StudentForm.tsx` — komplett skjema med Zod-validering
- `components/forms/StudentFormWithTanstackZod.tsx` — referanse-variant fra l-16

## Bibliotekvalg

- `@tanstack/react-form` — skjema-tilstand + validering
- `@react-native-community/datetimepicker` — DateTimePicker
- `@react-native-picker/picker` — Picker
- `zod` — schema-validering

## Fremtid

Expo UI (stable i SDK 56) tilbyr drop-in DateTimePicker og Picker som unngår
disse community-pakkene. Vurder migrering når SDK 56 blir mainline.

## Kjør lokalt

```bash
pnpm install
pnpm start
```

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
