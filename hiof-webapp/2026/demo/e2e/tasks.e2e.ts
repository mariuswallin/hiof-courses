// Playwright end to end tests. Run: pnpm test:e2e
//
// Needs a migrated local D1 (`pnpm migrate:dev`). The tests seed themselves
// through POST /api/seed, so they do not depend on `pnpm seed` having run.
//
// What they cover is what Vitest cannot reach: that the framework really runs
// the server action in the browser, and that the change is stored when a
// different route reads it afterwards.
import { test, expect } from "@playwright/test";

// Matches SEED_TOKEN in wrangler.jsonc.
const SEED_TOKEN = "12345";

/** Empties and refills the database before each test. */
test.beforeEach(async ({ request }) => {
  const response = await request.post("/api/seed", {
    headers: { "x-seed-token": SEED_TOKEN },
  });
  expect(response.ok()).toBe(true);
});

test.describe("tasks", () => {
  test("edits a task with a server action and stores the change", async ({
    page,
  }) => {
    await page.goto("/tasks/1/edit");
    // Wait until the client bundle has hydrated the form. Without this
    // Playwright clicks a button React has not taken over yet, and the browser
    // does a plain form submit instead of running the action.
    await page.waitForLoadState("networkidle");

    // The form is filled with the name from the database.
    const nameField = page.getByLabel("Name:");
    await expect(nameField).toHaveValue("Task 1");

    // Submit the form. This goes through `editTaskAction` on the server.
    await nameField.fill("Oppdatert via e2e");
    await page.getByRole("button", { name: "Save" }).click();

    // The action answers with success and the new name. This is the h2 in
    // the form; the h1 above it belongs to MainLayout and shows the user.
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "Oppdatert via e2e"
    );

    // And the change really is stored: the RSC page reads the database again.
    await page.goto("/tasks/rsc/1");
    await expect(page.locator("body")).toContainText("Oppdatert via e2e");

    // The same answer through the REST API.
    const api = await page.request.get("/api/v1/tasks/1");
    expect(api.status()).toBe(200);
    const body = (await api.json()) as { data: { name: string } };
    expect(body.data.name).toBe("Oppdatert via e2e");
  });

  test("edits a task with the older fetch pattern", async ({ page }) => {
    await page.goto("/tasks/old/1/edit");
    await page.waitForLoadState("networkidle");

    // The form is filled by useEffect and fetch, not by the server.
    const nameField = page.getByLabel("Name:");
    await expect(nameField).toHaveValue("Task 1");

    await nameField.fill("Endret med fetch");
    await page.getByRole("button", { name: "Save" }).click();

    // The PUT has to hit /api/v1/tasks/1. If it goes to .../null nothing is
    // stored and this assertion fails.
    await expect
      .poll(async () => {
        const res = await page.request.get("/api/v1/tasks/1");
        return ((await res.json()) as { data: { name: string } }).data.name;
      })
      .toBe("Endret med fetch");
  });

  test("reorders tasks with the keyboard and stores the new order", async ({
    page,
  }) => {
    await page.goto("/tasks/sortable");
    await page.waitForLoadState("networkidle");

    const ids = () =>
      page
        .locator('[data-testid="task-row"]')
        .evaluateAll((rows) => rows.map((row) => row.dataset.taskId));

    expect(await ids()).toEqual(["1", "2", "3"]);

    // dnd-kit ships a keyboard sensor by default: Space lifts the item, the
    // arrow keys move it, Space drops it. This is also the accessible path.
    await page.getByRole("button", { name: "Reorder Task 1" }).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");

    await expect.poll(ids).toEqual(["2", "1", "3"]);

    // Reload to prove the order was persisted and is not just optimistic
    // client state.
    await page.reload({ waitUntil: "networkidle" });
    expect(await ids()).toEqual(["2", "1", "3"]);
  });

  test("reorders tasks by dragging with the mouse", async ({ page }) => {
    await page.goto("/tasks/sortable");
    await page.waitForLoadState("networkidle");

    const ids = () =>
      page
        .locator('[data-testid="task-row"]')
        .evaluateAll((rows) => rows.map((row) => row.dataset.taskId));

    const handle = page.getByRole("button", { name: "Reorder Task 1" });
    const target = page.locator('[data-task-id="2"]');
    const from = await handle.boundingBox();
    const to = await target.boundingBox();
    if (!from || !to) throw new Error("Could not measure the rows");

    // Move in steps. A single jump does not look like a drag to the pointer
    // sensor, which waits for movement past its activation threshold.
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2, to.y + to.height, {
      steps: 10,
    });
    await page.mouse.up();

    await expect.poll(ids).toEqual(["2", "1", "3"]);

    await page.reload({ waitUntil: "networkidle" });
    expect(await ids()).toEqual(["2", "1", "3"]);
  });

  test("shows tasks in the list", async ({ page }) => {
    await page.goto("/tasks");

    // MainLayout shows the user from ctx.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Test User"
    );
    await expect(page.locator("body")).toContainText("Task 2");
  });

  test("returns every task when no published parameter is given", async ({ request }) => {
    // The seed data has two published tasks (ids 1 and 3) and one draft
    // (id 2). Task 3 is the one that is deliberately past its due date, for
    // the cron job — see "Cron" in README.md.
    const alle = await request.get("/api/v1/tasks");
    const body = (await alle.json()) as { data: { id: string }[] };
    expect(body.data.map((t) => t.id).sort()).toEqual(["1", "2", "3"]);

    const publisert = await request.get("/api/v1/tasks?published=true");
    expect(
      ((await publisert.json()) as { data: { id: string }[] }).data.map(
        (t) => t.id
      )
      // Not sorted here on purpose: findMany orders by due_date, and task 3 is
      // the overdue one, so it comes first. The assertion documents that.
    ).toEqual(["3", "1"]);

    const kladd = await request.get("/api/v1/tasks?published=false");
    expect(
      ((await kladd.json()) as { data: { id: string }[] }).data.map((t) => t.id)
    ).toEqual(["2"]);
  });

  test("deletes a task and it is really gone", async ({ request }) => {
    const slettet = await request.delete("/api/v1/tasks/1");
    expect(slettet.status()).toBe(204);

    // It is gone from the database ...
    expect((await request.get("/api/v1/tasks/1")).status()).toBe(404);

    // ... but the other one is still there.
    expect((await request.get("/api/v1/tasks/2")).status()).toBe(200);

    // Deleting the same one again gives 404, not a false 204.
    const igjen = await request.delete("/api/v1/tasks/1");
    expect(igjen.status()).toBe(404);
  });

  test("parses a dueDate string from JSON instead of failing on it", async ({
    request,
  }) => {
    const existing = await (
      await request.get("/api/v1/tasks/1")
    ).json();
    const userId = (existing as { data: { userId: number } }).data.userId;

    const response = await request.post("/api/v1/tasks", {
      data: {
        name: "Task with a date",
        description: "A description",
        // A plain JSON string. Without z.coerce.date() this reaches Drizzle
        // as a string and fails with "value.getTime is not a function".
        dueDate: "2026-12-24T10:00:00Z",
        userId,
      },
    });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as { data: { dueDate: string } };
    expect(body.data.dueDate).toBe("2026-12-24T10:00:00.000Z");
  });

  test("answers 400 with per field messages for an invalid body", async ({
    request,
  }) => {
    const response = await request.post("/api/v1/tasks", {
      data: { name: "ab", description: "", userId: -1 },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as {
      validationErrors: Record<string, string[]>;
    };
    expect(Object.keys(body.validationErrors).sort()).toEqual([
      "description",
      "name",
      "userId",
    ]);
  });

  test("does not expose the user email on a single task", async ({
    request,
  }) => {
    const response = await request.get("/api/v1/tasks/1");
    const body = (await response.json()) as {
      data: { user: Record<string, unknown> };
    };

    // The relational query selects every user column. The out mapper is what
    // keeps the email off the wire.
    expect(Object.keys(body.data.user).sort()).toEqual(["id", "name"]);
  });

  test("answers 404 from except() for an unknown task", async ({ request }) => {
    const response = await request.get("/api/v1/tasks/finnes-ikke");

    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { message: "Task not found", code: 404 },
    });
  });

  test("seed route rejects a request without a valid token", async ({
    request,
  }) => {
    expect((await request.post("/api/seed")).status()).toBe(401);
    expect(
      (
        await request.post("/api/seed", {
          headers: { "x-seed-token": "wrong" },
        })
      ).status()
    ).toBe(401);

    // GET is not defined on the route at all, so the router answers 405.
    expect((await request.get("/api/seed")).status()).toBe(405);
  });

  test("answers 405 for a verb that is not defined", async ({ request }) => {
    const response = await request.delete("/api/v1/tasks/1/publish");

    expect(response.status()).toBe(405);
  });
});
