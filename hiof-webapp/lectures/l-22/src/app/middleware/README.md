# Info

This is the authorization middleware: route interruptors (`requireAuth`, `requireRole`, `requireAdmin`) that return a Response when the user may not see the route.

Authentication itself (setting `ctx.user` and `ctx.session`) comes from better-auth in `src/auth/middleware.ts`, copied from `l-20`.
