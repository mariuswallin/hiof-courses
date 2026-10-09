# Appwrite-oppsett

Appen kjører på mock-data uten dette. Denne guiden setter opp en ekte backend.

Alt kan gjøres i [Appwrite Cloud](https://cloud.appwrite.io) gratis. Har du en
egen server, gjelder de samme stegene.

---

## 1. Prosjekt og plattform

1. Lag et prosjekt. Noter **Project ID** fra **Settings**.
2. Noter **API Endpoint** samme sted, typisk `https://fra.cloud.appwrite.io/v1`.
3. Under **Settings → Platforms**, legg til en **React Native**-plattform.
   Bundle-ID-en må matche `app.json`:

   ```
   no.hiof.tasksdemo
   ```

Uten plattformen avviser Appwrite alle kall fra appen.

---

## 2. Database og tabell

Appwrite la til **TablesDB** i versjon 1.8.0. Den gamle `Databases`-tjenesten
er ikke fjernet, men dokumentmetodene er merket i SDK-en:

```
@deprecated This API has been deprecated since 1.8.0.
Please use `TablesDB.listRows` instead.
```

Navnene endret seg med den:

| Før | Nå |
| --- | --- |
| Collection | Table |
| Document | Row |
| Attribute | Column |

Koden i `providers/appwrite/tasks.ts` bruker `listRows`, `getRow`, `createRow`,
`updateRow` og `deleteRow`, alle i objekt-formen. SDK-en har også en eldre
posisjonell form (`listRows(databaseId, tableId, queries)`), men den er merket
`@deprecated` til fordel for objektet.

### Steg

1. **Databases → Create database**. Noter **Database ID**.
2. Lag en tabell som heter `tasks`. Noter **Table ID**.
3. Legg inn kolonnene:

| Kolonne | Type | Størrelse | Påkrevd | Standard |
| --- | --- | --- | --- | --- |
| `name` | String | 200 | Ja | |
| `description` | String | 1000 | Nei | `""` |
| `dueDate` | Datetime | | Ja | |
| `completed` | Boolean | | Nei | `false` |
| `order` | Integer | | Ja | `0` |
| `imageId` | String | 64 | Nei | |
| `userId` | String | 64 | Ja | |

`order` er posisjonen i lista. `imageId` er fil-ID-en fra Storage, eller tom.

### Indekser

Lista filtrerer på bruker og sorterer på posisjon, så begge trenger indeks:

| Navn | Type | Kolonner |
| --- | --- | --- |
| `userId_idx` | Key | `userId` (ASC) |
| `order_idx` | Key | `order` (ASC) |

Uten dem virker appen, men blir treg så snart tabellen vokser.

### Tilganger

Under **Settings → Permissions** på tabellen, huk av **Document security**.
Sett så på tabellnivå:

| Rolle | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| `Users` | Ja | Nei | Nei | Nei |

Radene får sine egne tilganger når de opprettes, slik at hver bruker bare ser
sine egne.

> Merk at spørringen `Query.equal("userId", ...)` i koden er der for å slippe å
> hente unødige rader. Den er **ikke** sikkerhet. Det er tilgangene her som er
> sikkerheten. En klient kan alltid endre sin egen spørring.

---

## 3. Storage

1. **Storage → Create bucket**. Noter **Bucket ID**.
2. Sett **Maximum file size** til noe fornuftig, for eksempel 10 MB.
3. Tillatte filtyper: `jpg`, `jpeg`, `png`.
4. Tilganger: `Users` skal ha Create og Read.

---

## 4. Miljøvariabler

Kopier `.env.example` til `.env` og fyll inn:

```bash
EXPO_PUBLIC_API_URL=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_PROJECT_ID=...
EXPO_PUBLIC_PLATFORM_ID=no.hiof.tasksdemo
EXPO_PUBLIC_DATABASE_ID=...
EXPO_PUBLIC_TASKS_TABLE_ID=...
EXPO_PUBLIC_BUCKET_ID=...
```

Start Metro på nytt etterpå:

```bash
pnpm start --clear
```

Appen bytter automatisk fra mock til Appwrite når `EXPO_PUBLIC_PROJECT_ID`,
`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_DATABASE_ID` og
`EXPO_PUBLIC_TASKS_TABLE_ID` alle er satt. Se `constants/keys.ts`.

Er `.env` riktig, forsvinner det gule merket øverst i appen.

---

## Om EXPO_PUBLIC_

Alt med dette prefikset havner i app-bundelen og kan leses av hvem som helst
som laster ned appen. Det er greit for endepunkt og ID-er, som ikke er
hemmeligheter. **Legg aldri en API-nøkkel her.** Trenger du en, må den bo på en
server appen kaller.

---

## Om SDK-versjonen

Prosjektet bruker `react-native-appwrite@0.32.0`, samme som leksjonene.

0.33.0 og 0.34.0 finnes, men er sjekket og gir ingenting her: metodene på
`Account`, `TablesDB` og `Storage` er identiske. Det eneste tillegget er tre
vektorsøk-spørringer (`Query.vectorDot`, `vectorCosine`, `vectorEuclidean`),
som denne appen ikke bruker.

Alle tre versjonene har dessuten samme avhengighet til `expo-file-system: 18.*`,
så patchen i `patches/` trengs uansett. Patchen er låst til 0.32.0 og må
regenereres om du oppgraderer.

---

## Feilsøking

| Symptom | Sannsynlig årsak |
| --- | --- |
| «Ikke tilgang» ved innlogging | Plattformen mangler, eller bundle-ID stemmer ikke |
| Tom liste selv om rader finnes | `userId` på radene matcher ikke innlogget bruker |
| «Ugyldige data» ved lagring | En kolonne mangler, eller typen er feil |
| Bildet vises ikke | Bucket-tilganger mangler Read for `Users` |
| Endringer i `.env` gir ingen effekt | Metro må startes med `--clear` |
