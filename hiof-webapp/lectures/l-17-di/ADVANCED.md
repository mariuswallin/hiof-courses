# l-17-di — Dependency Injection-containere (avansert)

Avansert-branch for leksjon 17. Demonstrerer formell IoC-container og
cursor-paginering som alternativ til factory-funksjoner + OFFSET.

## Hva som skiller seg fra `l-17`

Følgende filer finnes kun her:

- `src/app/lib/container.ts` — minimal IoC-container med `register`/`resolve`,
  uten å trekke inn tsyringe/Inversify/Awilix.
- `src/app/lib/container.example.ts` — eksempel som registrerer hele
  question-stacken (db → repository → service) i containeren.
- `src/app/lib/cursor-pagination.ts` — cursor-basert paginering med
  base64-kodede `{ createdAt, id }`-cursors, tie-breaker på `id`.

## Når dette gir verdi

**IoC-container**:
- Store applikasjoner med mange tjenester og komplekse avhengighetsgrafer.
- Auto-resolving av nested deps (containeren bygger grafen for deg).
- Per-request livssykluser (scoped services).

**Cursor-paginering**:
- Datasett > 50k rader hvor OFFSET er for trege.
- Real-time-data der innsetting/sletting kan forskyve sidene.
- UI med infinite scroll i stedet for sidetall.

For mindre prosjekter er begge overkill — `createQuestionService(repo)` og
OFFSET-paginering holder lenge.

## Læringsmål

- Hvorfor DI? Test-baility, gjenbruk, livssyklus-håndtering.
- Når DI er overkill — for små apper kan direkte instansiering være bedre.
- Sammenligning: IoC-container vs Factory vs DI via funksjonsargumenter.
- Cursor- vs offset-paginering trade-offs.

Se leksjon 17 sin avansert-seksjon for utdyping.
