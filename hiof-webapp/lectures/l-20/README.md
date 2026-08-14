# l-20 — Server-side autentisering med better-auth

Branch for leksjon 20 i `webapp-2025`. Bygger videre på `l-19` (Server Actions) ved å
introdusere `better-auth` som auth-bibliotek.

## Læringsmål

- Forstå forskjellen mellom autentisering og autorisering
- Konfigurere `better-auth` med Drizzle og Cloudflare D1
- Mounte `auth.handler` på `/api/auth/*`
- Skrive `authMiddleware` som setter `ctx.user` og `ctx.session`
- Skrive Server Actions for login og register via `auth.api.signInEmail` / `signUpEmail`
- Bruke `requireUser()` / `requireAdmin()` som guards

## Nye filer

```
src/auth/auth.ts                        better-auth-konfig + admin-plugin
src/auth/middleware.ts                  authMiddleware som setter ctx.user
src/db/schema/auth-schema.ts            user / session / account / verification tabeller
src/db/schema/user-schema.ts            re-eksport av users + relasjoner til questions
src/features/auth/actions/auth.ts       login / register / logout Server Actions
src/shared/lib/guards.ts                requireUser / requireAdmin
src/worker.tsx                          authMiddleware + /api/auth/* mounted
```

## Endringer fra l-19

- `db/schema/question-schema.ts`: `authorId` byttet fra `integer` til `text` (better-auth IDs er strenger)
- `db/schema/user-schema.ts`: tabellen flyttet til `auth-schema.ts`; denne fila har relasjoner
- `worker.tsx`: la til `authMiddleware` + `/api/auth/*` handler-route

## Lokal kjøring

```bash
# .dev.vars må inneholde:
# BETTER_AUTH_SECRET=<minimum 32 tegn tilfeldig>
# BETTER_AUTH_URL=http://localhost:5173

pnpm install
pnpm db:generate
pnpm db:migrate:dev
pnpm dev
```

## Verifisering

- `POST /api/auth/sign-in/email` med `{ email, password }` returnerer 200 + session-cookie
- `GET /api/auth/get-session` med cookien returnerer session+user
- En route som kaller `requireAdmin()` returnerer 403 for vanlige brukere

## Avansert: bygge auth selv

Se `l-21` for hele auth-stacken implementert manuelt (sessions, scrypt-hashing, cookies).
