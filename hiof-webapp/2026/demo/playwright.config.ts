import { defineConfig, devices } from "@playwright/test";

/**
 * E2E setup. `pnpm test:e2e` starts the dev server itself and runs everything
 * in `e2e/` against it.
 *
 * Override the port when 5173 is already taken:
 *   E2E_PORT=5199 pnpm test:e2e
 *
 * Set `E2E_BASE_URL` to target an already running app or a deployed URL.
 * Playwright then starts no server of its own.
 */
const PORT = process.env.E2E_PORT ?? "5173";
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  // The tests share one database, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm dev --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
