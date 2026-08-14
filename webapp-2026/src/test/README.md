# src/test/ — testdrivere for integrasjonstester

Oppskriften på én side. Teorien står i leksjon 8a
(`webapp-2026/lessons/08a-fullstack-testing.mdx`).

Integrasjonstestene kjører **server actions mot en ekte database** — bare en
rask, lokal en. Produksjonskoden er uendret; det er bare driveren som byttes.

## Filene

| Fil | Ansvar |
| --- | --- |
| `db-mock.ts` | Drizzle mot in-memory SQLite (`better-sqlite3`) med alle migrasjoner kjørt. Eksporterer `db`, `schema`, `relations`, `resetDb()`, `sqliteHandle`. |
| `worker-mock.ts` | Stubber `rwsdk/worker`: `requestInfo.ctx.session`, `setActor()`, `clearActor()` og `ErrorResponse`. |
| `env-mock.ts` | Stubber `cloudflare:workers`: `env` med ekte objekter for `AI`, `VECTORIZE` og `R2`, pluss `resetEnv()`. |
| `fixtures.ts` | Bygger testdata rett via Drizzle: `makeUser`, `makePost`, `makeComment`, `runAs`, `resetCounter`. |
| `setup-dom.ts` | Kjøres før hver testfil (`vitest.config.ts`). Legger til jest-doms DOM-matchere. |
| `__tests__/` | Selve integrasjonstestene. |

## Malen

Tre `vi.mock` øverst, **før** importen av produksjonskoden:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { eq } from "drizzle-orm";
import { db, schema, resetDb } from "@/test/db-mock";
import { resetEnv } from "@/test/env-mock";
import { makeUser, makePost, runAs, resetCounter } from "@/test/fixtures";
import { createPost, deletePost } from "@/actions/posts";

describe("flow · innlegg", () => {
  beforeEach(() => {
    resetDb();      // tøm alle tabeller, behold skjemaet
    resetEnv();     // tøm Vectorize- og R2-stubbene
    resetCounter(); // forutsigbare id-er per test
  });

  it("oppretter innlegg og finner det i DB", async () => {
    const author = await makeUser({ id: "u1" });

    await runAs(author, () => createPost("Mitt første innlegg!"));

    const rows = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.authorId, author.id));

    expect(rows).toHaveLength(1);
  });
});
```

## Regler som sparer deg for feilsøking

- **Mocken må dekke alt produksjonskoden importerer fra modulen**, ikke bare det
  testen bruker direkte. `worker-mock` har `ErrorResponse` fordi
  `src/middleware/require-auth.ts` importerer den — uten den ryker importen med
  «does not provide an export named».
- **Bindingene i `env-mock` er ekte objekter med ekte metoder**, ikke `undefined`.
  Det er forutsetningen for `vi.spyOn(env.AI, "run")`.
- **Importér `env` fra `@/test/env-mock`**, ikke fra `"cloudflare:workers"`, når
  du skal spionere. Takket være `vi.mock` er det samme objekt, men riktig typet.
- **Bygg «universet» med fixtures, ikke med actionen du tester.** Oppsettet skal
  ikke være avhengig av at koden under test virker.
- **`runAs(user, fn)`** setter sesjonen, kjører `fn`, og rydder opp i `finally`.
  Bruk den per aktør for å teste tilgangskontroll.

## Kjøre

```bash
pnpm test           # hele suiten (enhet + komponent + integrasjon)
pnpm test:watch
pnpm test:coverage
pnpm test:e2e       # Playwright, se e2e/
```
