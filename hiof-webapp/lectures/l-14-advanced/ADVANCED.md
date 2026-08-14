# l-14-advanced — Avanserte API-klient-mønstre

Avansert-branch for leksjon 14. Inneholder avanserte mønstre for å bygge
API-klient med caching, logging, og funksjonell komposisjon.

## Hva som skiller seg fra `l-14`

Følgende filer skal kun eksistere her (cleanup-TODO for `l-14`):

- `src/app/lib/extensions/cache.ts` — `withCaching` decorator + ohash-basert nøkkel
- `src/app/lib/extensions/logger.ts` — `withLogging` decorator
- `src/app/lib/utils/compose.ts` — `pipe()` / `compose()` for å kombinere decorators
- `src/app/services/api/questions.ts` — bruker `withCaching` + `withLogging` + `pipe`

> ✅ Cleanup utført 2026-05-22: `l-14` har fått fjernet `cache.ts`, `logger.ts`, og
> `compose.ts`. Servicen `services/api/questions.ts` bruker nå klient-en direkte uten
> dekoratorer.

## Læringsmål

- Higher-order-funksjoner som decorator-mønster
- Funksjonell komposisjon (`pipe`, `compose`)
- Cache med TTL og bounded size
- Logging-wrapper uten å mutere business-logic
- Race-conditions ved samtidige requests

Se leksjon 14 sin avansert-seksjon for utdyping.
