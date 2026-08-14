# l-18-contracts — Contract testing + API-versjonering (avansert)

Avansert-branch for leksjon 18. Demonstrerer kontrakthåndhevelse mellom
server/klient og bakoverkompatibilitet via versjonerte mappers.

## Hva som skiller seg fra `l-18`

Følgende filer finnes kun her:

- `src/app/lib/contract-validators.ts` — `validateServerContract`,
  `validateClientContract`, `tryClientContract` (myk variant).
- `src/app/lib/mappers-versioned.ts` — `QuestionDTOV1`/`V2` med
  `mapQuestionByVersion`-velger og `pickVersion`-helper som leser
  `?version=` eller `Accept`-header.
- `src/app/__tests__/contract-tests.test.ts` — vitest-tester for både
  server- og klient-side kontraktoverholdelse.

## Mønstrene

**Server-side validering (innen response sendes)**:
```ts
const dto = mapQuestionToDTO(question);
return validateServerContract(dto, QuestionDTOSchema);
// Kaster 500 hvis serveren bryter sin egen kontrakt
```

**Klient-side validering (når response mottas)**:
```ts
const response = await fetch("/api/v2/questions");
const data = await response.json();
const questions = validateClientContract(data, QuestionDTOSchema);
// Eller bruk tryClientContract for å fall tilbake til standard
```

**Versjonering**:
```ts
const version = pickVersion(request); // "v1" | "v2"
const dto = mapQuestionByVersion(question, version);
```

## Når dette gir verdi

- Når server og klient deployer separat (avvikende versjoner i prod).
- Når flere klienter (web, mobile, partner API) konsumerer samme endepunkt
  og må håndteres uten brytende endringer.
- Når du vil oppdage server-feil i CI før de når frontend.

For monolitter der server og klient deployes sammen — overflødig. DTO-typing
+ TS-kompilator er nok.

## Læringsmål

- Hvorfor contract testing? Catching brutte endringer tidlig.
- Forskjell på server- og klient-side kontraktvalidering.
- API-versjonering uten å fryse fast schema.
- Bakoverkompatibilitet via parallelle mapper-versjoner.

Se leksjon 18 sin avansert-seksjon for utdyping.
