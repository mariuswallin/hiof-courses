import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb } from "@/test/db-mock";
import { makeUser, makeTask, resetCounter } from "@/test/fixtures";
import { tasksService } from "@/features/tasks/tasksService";

describe("tasks service and repository", () => {
  beforeEach(() => {
    resetDb();
    resetCounter();
  });

  it("lists only published tasks when published is true", async () => {
    const user = await makeUser();
    await makeTask(user.id, { name: "Publisert", published: true });
    await makeTask(user.id, { name: "Kladd", published: false });

    const result = await tasksService.list({ published: "true" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Publisert");
  });

  it("includes every task when published is not given", async () => {
    const user = await makeUser();
    await makeTask(user.id, { name: "Publisert", published: true });
    await makeTask(user.id, { name: "Kladd", published: false });

    const result = await tasksService.list();

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(2);
  });

  it("includes every task when published is an empty string", async () => {
    const user = await makeUser();
    await makeTask(user.id, { published: true });
    await makeTask(user.id, { published: false });

    // This is what ?published= looks like: present but empty.
    const result = await tasksService.list({ published: "" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(2);
  });

  it("lists only drafts when published is false", async () => {
    const user = await makeUser();
    await makeTask(user.id, { name: "Publisert", published: true });
    await makeTask(user.id, { name: "Kladd", published: false });

    const result = await tasksService.list({ published: "false" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Kladd");
  });

  it("sorts the list by dueDate", async () => {
    const user = await makeUser();
    await makeTask(user.id, {
      name: "Sist",
      dueDate: new Date("2026-03-01T00:00:00Z"),
    });
    await makeTask(user.id, {
      name: "Først",
      dueDate: new Date("2026-01-01T00:00:00Z"),
    });

    const result = await tasksService.list({ published: "true" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((t) => t.name)).toEqual(["Først", "Sist"]);
  });

  it("rejects a search containing haxxor with 400", async () => {
    const result = await tasksService.list({ search: "haxxor drop table" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(400);
  });

  it("loads a single task with its user through the relation", async () => {
    const user = await makeUser({ name: "Kari" });
    const task = await makeTask(user.id);

    const result = await tasksService.getById(task.id);

    expect(result.success).toBe(true);
    if (!result.success) return;
    // Relations v2: `with: { user: true }` i repositoryet.
    expect(result.data.user.name).toBe("Kari");
  });

  it("answers 404 when the task does not exist", async () => {
    const result = await tasksService.getById("finnes-ikke");

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(404);
  });

  it("creates a task and stores it in the database", async () => {
    const user = await makeUser();

    const result = await tasksService.create({
      name: "Ny task",
      description: "Beskrivelse",
      dueDate: new Date("2026-06-01T00:00:00Z"),
      userId: user.id,
      published: true,
    });

    expect(result.success).toBe(true);

    const rows = await db.select().from(schema.tasks);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Ny task");
  });

  it("updates the name on an existing task", async () => {
    const user = await makeUser();
    const task = await makeTask(user.id, { name: "Gammelt navn" });

    const result = await tasksService.update(task.id, { name: "Nytt navn" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe("Nytt navn");
  });

  it("answers 404 when updating a task that does not exist", async () => {
    const result = await tasksService.update("finnes-ikke", { name: "X" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(404);
  });

  it("deletes the task from the database", async () => {
    const user = await makeUser();
    const task = await makeTask(user.id);
    const annen = await makeTask(user.id);

    const result = await tasksService.remove(task.id);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBe(task.id);

    // Only that one row went away.
    const rows = await db.select().from(schema.tasks);
    expect(rows.map((t) => t.id)).toEqual([annen.id]);
  });

  it("answers 404 when deleting a task that does not exist", async () => {
    const result = await tasksService.remove("finnes-ikke");

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(404);
  });
});
