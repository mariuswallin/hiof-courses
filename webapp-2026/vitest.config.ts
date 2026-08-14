import { defineConfig } from "vitest/config";

/**
 * Vitest-config for Kvitter. Tre nivåer kjører i samme suite:
 *
 *  - enhet:        rene funksjoner i `src/lib/*` og `src/db/queries.ts`
 *  - komponent:    React-komponenter i `src/app/components/__tests__/*`
 *                  (L5a — DOM slås på per fil med `// @vitest-environment happy-dom`)
 *  - integrasjon:  server actions mot mocket DB i `src/test/__tests__/*`
 *                  (L8a — se `src/test/README.md`)
 *
 * Hele appen i nettleser (E2E) dekkes av Playwright, se `e2e/`.
 *
 * `globals: true` gjør at Testing Library kan registrere sin egen `cleanup`
 * i `afterEach`. Testfilene importerer likevel `describe`/`it`/`expect`
 * eksplisitt — det er tydeligere å lese.
 *
 * Alias `@/*` matcher `paths` i tsconfig.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    globals: true,
    // Node som standard; komponenttestene overstyrer til happy-dom per fil.
    environment: "node",
    setupFiles: ["./src/test/setup-dom.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", "dist", ".wrangler", "e2e"],
    coverage: {
      // `pnpm test:coverage`
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/__tests__/**", "src/client.tsx", "src/**/*.d.ts"],
    },
  },
});
