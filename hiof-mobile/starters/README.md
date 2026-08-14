# starters/ — utgangspunkt for live-demo

To ferdig konfigurerte apper å kode i foran klassen. Begge er pinnet til samme
SDK 56-versjoner som resten av repoet, og begge typesjekker rent.

| Mappe | Bruk | Inneholder |
| --- | --- | --- |
| `starter-basic` | Uke 1–3 | Blank TypeScript-app + `SafeAreaProvider`/`useSafeAreaInsets`. Ingen navigasjon, ingen NativeWind. |
| `starter-advanced` | Uke 4 og utover | Expo Router + NativeWind v5 + `@/`-alias + `Theme` + `cn()`. |

Begge har `data/students.ts` med testdata, så du slipper å skrive inn studenter live.

## Komme i gang

```bash
cd starters/starter-basic     # eller starter-advanced
npm install
npx expo start
```

Trykk `i` for iOS Simulator, `a` for Android Emulator, eller skann QR-koden med
Expo Go. Merk at Expo Go for SDK 56 ikke ligger i app-butikkene — se leksjon 5.

Kopier mappa før du koder, så beholder du et rent utgangspunkt:

```bash
cp -R starters/starter-basic ~/demo-uke1
```

## Hva starter-basic bevisst IKKE har

Ingen `components/`-innhold, ingen navigasjon, ingen liste. Poenget er at
`StudentCard`, `StudentItem` og `StudentList` bygges live i uke 2, og `FlatList`
i uke 3. Den ferdige koden for hvor du skal ende opp: `../student-liste/`.

## Hva starter-advanced har satt opp

Det som er kjedelig å konfigurere foran klassen, og som gir kryptiske feil hvis
noe mangler:

- `app/_layout.tsx` med `Stack` og `SafeAreaProvider`, og `import "./global.css"`
- `app/global.css` med Tailwind v4-direktiver **og en `@theme`-blokk**. Uten
  `@theme` finnes ikke `bg-primary`, og du får ingen feilmelding — bare manglende farge.
- `babel.config.js` med `nativewind/babel` (men uten `jsxImportSource`, som er v4-syntaks)
- `metro.config.js` med `withNativeWind(config)` uten `{ input }`
- `postcss.config.mjs`, `nativewind-env.d.ts`, `types/assets.d.ts`
- `tsconfig.json` med `@/*`-alias

`Theme` i `constants/theme.ts` har samme verdier som `@theme` i CSS-en, slik at
StyleSheet-kode og NativeWind-klasser gir samme farger.

## Verifisere at de fortsatt virker

Fra repo-rota:

```bash
node scripts/check-syntax.mjs starters      # sekunder, ingen install
./scripts/check-types.sh starters/starter-basic starters/starter-advanced
```
