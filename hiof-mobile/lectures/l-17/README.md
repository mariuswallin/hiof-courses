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
