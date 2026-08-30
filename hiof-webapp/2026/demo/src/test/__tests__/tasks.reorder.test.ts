import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb } from "@/test/db-mock";
import { makeUser, makeTask, resetCounter } from "@/test/fixtures";
import { tasksService } from "@/features/tasks/tasksService";

describe("tasks reordering", () => {
  beforeEach(() => {
    resetDb();
    resetCounter();
  });

  it("writes the array position as the order of each task", async () => {
    const user = await makeUser();
    const a = await makeTask(user.id, { name: "A" });
    const b = await makeTask(user.id, { name: "B" });
    const c = await makeTask(user.id, { name: "C" });

    const result = await tasksService.reorder([c.id, a.id, b.id]);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((t) => t.name)).toEqual(["C", "A", "B"]);

    const rows = await db.select().from(schema.tasks);
    const byId = Object.fromEntries(rows.map((t) => [t.id, t.order]));
    expect(byId[c.id]).toBe(0);
    expect(byId[a.id]).toBe(1);
    expect(byId[b.id]).toBe(2);
  });

  it("returns the tasks in their stored order from listOrdered", async () => {
    const user = await makeUser();
    const a = await makeTask(user.id, { name: "A" });
    const b = await makeTask(user.id, { name: "B" });

    await tasksService.reorder([b.id, a.id]);
    const result = await tasksService.listOrdered();

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((t) => t.name)).toEqual(["B", "A"]);
  });

  it("answers 404 and writes nothing when an id does not exist", async () => {
    const user = await makeUser();
    const a = await makeTask(user.id, { name: "A" });
    const b = await makeTask(user.id, { name: "B" });
    const before = await db.select().from(schema.tasks);

    const result = await tasksService.reorder([b.id, a.id, "finnes-ikke"]);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(404);

    // The check runs before any write, so the table is untouched.
    const after = await db.select().from(schema.tasks);
    expect(after.map((t) => t.order)).toEqual(before.map((t) => t.order));
  });

  it("answers 400 for duplicate ids", async () => {
    const user = await makeUser();
    const a = await makeTask(user.id);

    const result = await tasksService.reorder([a.id, a.id]);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(400);
  });

  it("answers 400 for an empty list", async () => {
    const result = await tasksService.reorder([]);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(400);
  });

  it("gives the first task position 0", async () => {
    const user = await makeUser();

    const result = await tasksService.create({
      name: "First ever",
      description: "d",
      dueDate: new Date("2026-01-01T00:00:00Z"),
      userId: user.id,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.order).toBe(0);
  });

  it("puts each new task at the end of the list", async () => {
    const user = await makeUser();

    for (const name of ["A", "B", "C"]) {
      await tasksService.create({
        name,
        description: "d",
        // Descending due dates, so a wrong sort would show up as C, B, A.
        dueDate: new Date(`2026-0${4 - ["A", "B", "C"].indexOf(name)}-01`),
        userId: user.id,
      });
    }

    const list = await tasksService.listOrdered();
    expect(list.success).toBe(true);
    if (!list.success) return;
    expect(list.data.map((t) => t.name)).toEqual(["A", "B", "C"]);
    expect(list.data.map((t) => t.order)).toEqual([0, 1, 2]);
  });

  it("keeps positions unique after a task in the middle is deleted", async () => {
    const user = await makeUser();
    const a = await makeTask(user.id, { name: "A" });
    const b = await makeTask(user.id, { name: "B" });
    const c = await makeTask(user.id, { name: "C" });
    await tasksService.reorder([a.id, b.id, c.id]);

    await tasksService.remove(b.id);

    // Two rows left but the highest position is still 2. COUNT would hand out
    // 2 again and collide with C; MAX + 1 gives 3.
    const created = await tasksService.create({
      name: "D",
      description: "d",
      dueDate: new Date("2026-01-01T00:00:00Z"),
      userId: user.id,
    });

    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.data.order).toBe(3);

    const rows = await db.select().from(schema.tasks);
    const orders = rows.map((t) => t.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("respects an order given explicitly, which is what the seed does", async () => {
    const user = await makeUser();

    const result = await tasksService.create({
      name: "Pinned",
      description: "d",
      dueDate: new Date("2026-01-01T00:00:00Z"),
      userId: user.id,
      order: 42,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.order).toBe(42);
  });

  it("still sorts findMany by dueDate, not by order", async () => {
    const user = await makeUser();
    const early = await makeTask(user.id, {
      name: "Early",
      dueDate: new Date("2026-01-01T00:00:00Z"),
    });
    const late = await makeTask(user.id, {
      name: "Late",
      dueDate: new Date("2026-06-01T00:00:00Z"),
    });

    // Put the late one first in the drag order.
    await tasksService.reorder([late.id, early.id]);

    const list = await tasksService.list({ published: "true" });
    expect(list.success).toBe(true);
    if (!list.success) return;
    // list() is deliberately unaffected by the drag order.
    expect(list.data.map((t) => t.name)).toEqual(["Early", "Late"]);
  });
});
