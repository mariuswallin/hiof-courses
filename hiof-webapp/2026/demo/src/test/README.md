# src/test/ — testdrivere

Testene kjører **mot en ekte database** — bare en rask, lokal en. Produksjons-
koden er uendret; det er bare driveren som byttes.

## Filene

| Fil | Ansvar |
| --- | --- |
| `db-mock.ts` | Drizzle mot in-memory SQLite (`better-sqlite3`) med alle migrasjoner kjørt. Eksporterer `db`, `schema`, `relations`, `resetDb()`, `sqliteHandle`. |
| `worker-mock.ts` | Stubber `rwsdk/worker`: `requestInfo.ctx.user`, `setActor()`, `clearActor()`, `ErrorResponse` og `defineScript`. |
| `env-mock.ts` | Stubber `cloudflare:workers`. Demoen bruker bare `env.DB`, som uansett erstattes av `db-mock`. |
| `fixtures.ts` | Bygger testdata rett via Drizzle: `makeUser`, `makeTask`, `runAs`, `resetCounter`. |
| `setup-dom.ts` | Kjøres før hver testfil (`vitest.config.ts`). Legger til jest-doms DOM-matchere. |
| `__tests__/` | Integrasjonstestene mot databasen. |

Enhets- og komponenttestene ligger ved siden av koden de tester, i
`__tests__/`-mapper:

| Fil | Viser |
| --- | --- |
| `src/lib/__tests__/id.test.ts` | Enhetstest av en ren funksjon (`createId`) |
| `src/app/lib/__tests__/cn.test.ts` | Enhetstest av `cn()` — at siste Tailwind-klasse vinner |
| `src/features/tasks/components/__tests__/TaskEditAction.test.tsx` | Skjemainput, handlinger og timing (`isPending`) |
| `src/features/tasks/pages/__tests__/TaskDetailOld.test.tsx` | Asynkron henting med `useEffect` + `fetch` |
| `src/features/tasks/pages/__tests__/TaskEditOld.test.tsx` | Kontrollert skjema (`value` + `onChange`) og submit med `fetch` |
| `src/features/tasks/components/__tests__/TaskSortableList.test.tsx` | Drag and drop-lista: rendring, tilgjengelige håndtak, optimistisk oppdatering og tilbakerulling |
| `src/features/tasks/__tests__/tasksSchema.test.ts` | Zod-parsing: dato-coercion, lengdegrenser, ukjente nøkler |
| `src/features/tasks/__tests__/tasksMappers.test.ts` | Mapping inn og ut, inkludert at e-post fjernes |

Integrasjonstestene i `src/test/__tests__/`:

| Fil | Dekker |
| --- | --- |
| `tasks.service.test.ts` | Service og repository: lister, filtre, CRUD |
| `tasks.action.test.ts` | `editTaskAction` mot databasen |
| `tasks.edge-cases.test.ts` | Tom database, defaults, fremmednøkkel, cascade, SQL i id-er |
| `tasks.reorder.test.ts` | Reordering: posisjoner, `MAX + 1`, 404 ved ukjent id, 400 ved duplikater |
| `tasks.scheduled.test.ts` | Cron-jobben: filtrene, idempotens, retry ved feilet e-post. Se «Cron» i [`README.md`](../../README.md) |

## Malen

`vi.mock`-kallene øverst, **før** importen av produksjonskoden:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb } from "@/test/db-mock";
import { makeUser, makeTask, resetCounter } from "@/test/fixtures";
import { tasksService } from "@/features/tasks/tasksService";

describe("tasks · service", () => {
  beforeEach(() => {
    resetDb();      // tøm alle tabeller, behold skjemaet
    resetCounter(); // forutsigbare id-er per test
  });

  it("lister publiserte tasks", async () => {
    const user = await makeUser();
    await makeTask(user.id, { published: true });

    const result = await tasksService.list({ published: "true" });

    expect(result.success).toBe(true);
  });
});
```

## Regler som sparer deg for feilsøking

- **Mocken må dekke alt produksjonskoden importerer fra modulen**, ikke bare det
  testen bruker direkte. `worker-mock` har `ErrorResponse` fordi
  `tasksController.ts` importerer den, og `defineScript` fordi `src/db/seed.ts`
  gjør det — uten dem ryker importen med «does not provide an export named».
- **Bygg «universet» med fixtures, ikke med koden du tester.** Oppsettet skal
  ikke være avhengig av at det du tester virker.
- **`runAs(user, fn)`** setter brukeren på `ctx`, kjører `fn`, og rydder opp i
  `finally`. Bruk den per aktør for å teste tilgangskontroll.
- **Komponenttester trenger DOM.** Legg `// @vitest-environment happy-dom`
  øverst i filen — resten av suiten kjører i node.

## Komponenttester

Legg `// @vitest-environment happy-dom` øverst i filen — resten av suiten
kjører i node.

**Handlinger og skjemainput** med `userEvent` (ikke `fireEvent`: `userEvent`
gjør det en ekte bruker gjør — fokus, tastetrykk, change-events):

```tsx
const bruker = userEvent.setup();
render(<TaskEditAction task={task} />);

const input = screen.getByLabelText("Name:");
await bruker.clear(input);
await bruker.type(input, "Nytt navn");
await bruker.click(screen.getByRole("button", { name: "Save" }));
```

**Timing** — når du skal observere en tilstand *mens* noe er underveis, styr
selv når løftet fullfører:

```tsx
let ferdigstill: (verdi: unknown) => void = () => {};
editTaskAction.mockImplementation(
  () => new Promise((resolve) => (ferdigstill = resolve))
);

await bruker.click(screen.getByRole("button", { name: "Save" }));
// Her er isPending true — skjemaet er byttet ut med skjelettet.
await waitFor(() =>
  expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument()
);

ferdigstill({ success: true, data: { id: "t1", name: "Ferdig" } });
expect(await screen.findByLabelText("Name:")).toHaveValue("Ferdig");
```

**Asynkron henting** — bruk `findBy*` (venter), ikke `getBy*` (ser bare på
første render):

```tsx
vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ data: task }) })));
render(<TaskDetailOld params={{ taskId: "t1" }} />);

expect(await screen.findByText(/Skriv ferdig oppgaven/)).toBeInTheDocument();
```

Husk `vi.unstubAllGlobals()` i `afterEach` når du stubber `fetch`.

## Kjøre

```bash
pnpm test           # hele suiten
pnpm test:watch
pnpm test:coverage
```
