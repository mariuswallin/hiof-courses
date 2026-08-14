# l-16-factory — Factory Pattern + database-utilities

Avansert-mappe for leksjon 16 (dekkes av dybde-leksjonen 16a i kurset).

## Hva som skiller seg fra `l-16`

Følgende mønstre finnes kun her:

- `src/db/index.ts` — factory-oppsettet: `createDatabase()` (konstruerer
  Drizzle-instansen), `setupDb(d1Database)` og `getDb()` med dependency
  injection, pluss `type DB`. I `l-16` eksporteres `db` direkte uten factory.
- `src/app/lib/db/` — gjenbrukbare database-utilities som repositoryet
  bygger på:
  - `conditions.ts` — bygger where-betingelser (`buildQuestionWhereConditions`)
  - `sorting.ts` — bygger orderBy (`buildQuestionOrderBy`)
  - `pagination.ts` — limit/offset-hjelpere
  - `operations.ts` — felles CRUD-operasjoner
- `src/app/api/questions/questionsRepository.ts` bruker utilities-laget;
  i `l-16` bruker samme fil Drizzle direkte.

## Læringsmål

- Factory-funksjoner for å konstruere DB-instanser med riktig adapter
- Utility-funksjoner for vanlige spørringsbyggesteiner
- Når Factory er overkill vs nødvendig

Se dybde-leksjonen 16a («Utilities og repository») for utdyping.
