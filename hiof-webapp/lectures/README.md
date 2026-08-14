# Setup

Når du kommer til database-delen må du lage disse i rot på prosjektet.
Dette da vi trenger systemkonfigurasjonen for å koble oss til databasen.

.dev.vars
.env

Eks:

```bash
./l-17/.dev.vars
./l-17/.env
```

Kan bruke disse kommandoene for å logge inn og opprette databasen.
Dette forutsetter at du har satt opp en Cloudflare-konto.

```bash
npx wrangler login
npx wrangler d1 create my-database
```

Her må du legge inn konfigurasjonen for databasen din, som for eksempel.

ACCOUNT_ID finner du i Cloudflare-dashbordet ditt i url-en.

```bash
https://dash.cloudflare.com/[ACCOUNT_ID]/home/domains
```

DATABASE_ID får du tilbake fra kommando over.
D1_TOKEN må du lage ved å gå til <https://dash.cloudflare.com/profile/api-tokens>
Lager da en ny token med `D1:Edit, Account Settings:Read` rettigheter.

```bash
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_D1_TOKEN=
NODE_ENV=development
```

Om du bruker R2 eller annet må du også legge til dette
