// e2e/kvitter.e2e.ts — Playwright happy path. Run: pnpm test:e2e
// Needs a running app (webServer in playwright.config.ts starts pnpm dev)
// against a migrated local D1.
import { test, expect } from "@playwright/test";

test.describe("Kvitter happy path", () => {
  test("registrer → post → like → logout", async ({ page }) => {
    const email = `test+${Date.now()}@kvitter.no`;
    const password = "langtnokpassord12";

    // Register
    await page.goto("/register");
    await page.fill('input[type="text"]', "Test Bruker");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Write a post
    await page.fill("textarea", "Min første e2e-post!");
    await page.click('button:has-text("Post")');
    await expect(page.locator("text=Min første e2e-post!")).toBeVisible();

    // Like (heart button on the first post)
    const likeButton = page.getByRole("button", { name: /[♡♥]/ }).first();
    await likeButton.click();
    await expect(page.getByRole("button", { name: /♥/ }).first()).toBeVisible();

    // /settings is reachable while signed in
    await page.goto("/settings");
    await expect(page.locator("h1")).toHaveText("Innstillinger");

    // Log out
    await page.click('button:has-text("Logg ut")');
    await expect(page.locator('text=Logg inn')).toBeVisible();
  });

  // The route guard is the only auth check Vitest cannot reach (importing
  // `rwsdk/router` fails outside the Workers runtime), so it is proven here.
  test("/settings sender anonyme til /login", async ({ page }) => {
    await page.goto("/settings");

    await expect(page).toHaveURL(/\/login\?from=/);
  });

  test("feeden er åpen uten innlogging", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("Feed");
  });
});
