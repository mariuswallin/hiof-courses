import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { eq } from "drizzle-orm";
import { db, schema, resetDb } from "@/test/db-mock";
import { makeUser, makeTask, resetCounter } from "@/test/fixtures";
import { tasksService } from "@/features/tasks/tasksService";

describe("tasks edge cases", () => {
  beforeEach(() => {
    resetDb();
    resetCounter();
  });

  it("returns an empty list, not an error, when the database is empty", async () => {
    const result = await tasksService.list();

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual([]);
  });

  it("applies defaults when only the required fields are given", async () => {
    const user = await makeUser();

    const result = await tasksService.create({
      name: "Uten valgfrie felter",
      description: "Beskrivelse",
      userId: user.id,
    } as never);

    expect(result.success).toBe(true);
    if (!result.success) return;
    // completed and published default to false in the schema, and the
    // repository fills in dueDate when it is missing.
    expect(result.data.completed).toBe(false);
    expect(result.data.published).toBe(false);
    expect(result.data.dueDate).toBeInstanceOf(Date);
  });

  it("returns a Result, not a thrown exception, for an invalid userId", async () => {
    // userId 9999 does not exist, so the foreign key rejects the insert.
    const result = await tasksService.create({
      name: "Foreldreløs",
      description: "Beskrivelse",
      dueDate: new Date(),
      userId: 9999,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(500);
  });

  it("answers 400, not 500, when the update is empty", async () => {
    const user = await makeUser();
    const task = await makeTask(user.id, { name: "Uendret" });

    const result = await tasksService.update(task.id, {});

    // Without the guard Drizzle throws "No values to set", and that internal
    // message would reach the client as a 500.
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(400);

    const uendret = await tasksService.getById(task.id);
    expect(uendret.success && uendret.data.name).toBe("Uendret");
  });

  it("deletes tasks along with the user through ON DELETE CASCADE", async () => {
    const user = await makeUser();
    await makeTask(user.id);
    await makeTask(user.id);

    await db.delete(schema.users).where(eq(schema.users.id, user.id));

    const rows = await db.select().from(schema.tasks);
    expect(rows).toEqual([]);
  });

  it("treats an id containing SQL as data, not as code", async () => {
    const user = await makeUser();
    await makeTask(user.id);

    const result = await tasksService.getById("1'; DROP TABLE tasks; --");

    // Parameterised queries: the id is just a string that matches nothing.
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(404);

    // The table is still there.
    const rows = await db.select().from(schema.tasks);
    expect(rows).toHaveLength(1);
  });

  it("preserves unicode and quotes through a save and read", async () => {
    const user = await makeUser();
    const navn = 'Møte "på" tirsdag – 90 % ferdig';

    const opprettet = await tasksService.create({
      name: navn,
      description: "Beskrivelse",
      dueDate: new Date(),
      userId: user.id,
    });
    expect(opprettet.success).toBe(true);
    if (!opprettet.success) return;

    const hentet = await tasksService.getById(opprettet.data.id);
    expect(hentet.success).toBe(true);
    if (!hentet.success) return;
    expect(hentet.data.name).toBe(navn);
  });

  it("keeps tasks from different users apart", async () => {
    const kari = await makeUser({ name: "Kari" });
    const ola = await makeUser({ name: "Ola" });
    const karisTask = await makeTask(kari.id);
    await makeTask(ola.id);

    const result = await tasksService.getById(karisTask.id);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.user.name).toBe("Kari");
  });
});
