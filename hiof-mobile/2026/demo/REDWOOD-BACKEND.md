# Alternativ backend: Redwood-demoen

`hiof-webapp/2026/demo` er den samme oppgavemodellen på Cloudflare Workers med
Drizzle og D1. Den kan i prinsippet brukes som backend for denne appen i stedet
for Appwrite.

Denne siden er ærlig om hva det koster: **den er ikke klar som den står**, og
det er tre hull som må tettes først.

---

## Hva som allerede passer

Domenemodellen er nesten identisk. Begge har `id`, `name`, `description`,
`dueDate`, `completed` og `order`, og begge bruker `MAX(order) + 1` når en ny
oppgave opprettes.

Redwood-demoen har allerede et REST-API som ligner det appen trenger:

| Endepunkt | Gjør |
| --- | --- |
| `GET /api/v1/tasks` | Lister alle |
| `GET /api/v1/tasks/:id` | Henter én |
| `POST /api/v1/tasks` | Oppretter, validert med Zod |
| `PUT` og `PATCH /api/v1/tasks/:id` | Oppdaterer |
| `DELETE /api/v1/tasks/:id` | Sletter |

Den validerer med Zod og former svarene med mappere, akkurat som denne appen
gjør på klientsiden.

---

## De tre hullene

### 1. Ingen autentisering

Redwood-demoen har `fakeSetUserContext` i `src/worker.tsx`, som hardkoder én
bruker:

```ts
ctx.user = { id: 1, name: "Test User", email: "test@example.com", isAdmin: false };
```

Det finnes ingen innlogging, ingen sesjon og ingen `userId` på tasks. Alle ser
alt. Denne appen forutsetter at hver bruker har sine egne oppgaver, så noe må
inn: en ekte sesjon, en `userId`-kolonne, og et filter i spørringene.

### 2. Ingen CORS

Workeren setter sikkerhetsheadere i `src/app/headers.ts`, men ingen
`Access-Control-Allow-Origin`. En React Native-app er ikke en nettleser og
rammes ikke av CORS på samme måte, men kjører du appen på web via Expo, stopper
det der. Skal begge deler virke, må headerne på plass.

### 3. Ingen filopplasting

`wrangler.jsonc` deklarerer en `R2`-binding, men **den brukes ikke i koden i
det hele tatt**. Det finnes ingen opplastingsrute og ingen `imageId` på
oppgaven. Bildefunksjonen i denne appen ville ikke ha noe å snakke med.

---

## Hva som må gjøres

I `hiof-webapp/2026/demo`:

1. Legg til autentisering. Enten en enkel token-basert løsning, eller
   `better-auth`, som `webapp-2026` allerede bruker.
2. Legg til `userId` på `tasks`-tabellen, med migrasjon, og filtrer på den i
   `tasksRepository.findMany`.
3. Legg til CORS-headere for opphavet appen kjører fra.
4. Ta i bruk `R2`-bindingen: en `POST /api/v1/tasks/:id/image` som lagrer
   filen og skriver `imageId` på raden.

I denne appen:

5. Skriv en `providers/redwood/`-mappe som implementerer `Backend` fra
   `providers/contract.ts`. Det er hele poenget med det grensesnittet: resten
   av appen ser ingen forskjell.
6. Utvid valget i `providers/index.ts` til å velge mellom tre backender i
   stedet for to.

---

## Hvorfor Appwrite er standard likevel

Appwrite gir autentisering, database og fillagring ferdig, og er det
leksjon 25 til 28 faktisk underviser. Redwood-veien er interessant fordi den
viser **det samme API-et brukt fra to klienter**, men den er et prosjekt i seg
selv, ikke et konfigurasjonsvalg.

`providers/contract.ts` er der nettopp for at valget skal være mulig senere
uten å rive opp appen.
