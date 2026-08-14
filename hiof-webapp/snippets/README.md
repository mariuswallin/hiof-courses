# snippets

Løsrevne TypeScript-eksempler brukt i forelesning. Ikke et prosjekt — ingen
`package.json`, ingen build.

## Krav

- **Node.js 22.12 eller nyere** (24 LTS anbefalt) — sjekk med `node -v`

## Kjøre en snippet

Fra denne mappen. Node 24 kjører TypeScript direkte:

```bash
node as_const.ts
```

På Node 22 må du legge til et flagg:

```bash
node --experimental-strip-types as_const.ts
```

Eller bruk `tsx` (fungerer på alle versjoner, ingen installasjon):

```bash
npx tsx filter.ts
```

## Innhold

| Fil | Tema |
| --- | --- |
| `arr_demo.ts` | Sjekke om en array er tom — hvilke uttrykk som er tydeligst |
| `as_const.ts` | `as const` for å lage union-typer av et objekt |
| `filter.ts` | Filtrering med typede statuser fra `as_const.ts` |
| `imports.ts` | Named export vs. default export |

## Windows

Kommandoene over fungerer uendret i PowerShell.
