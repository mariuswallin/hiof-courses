import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/db", () => import("@/test/db-mock"));
vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));
vi.mock("cloudflare:workers", () => import("@/test/env-mock"));

import { db, schema, resetDb } from "@/test/db-mock";
import { makeUser, makeTask, runAs, resetCounter } from "@/test/fixtures";
import {
  editTaskAction,
  type EditTaskState,
} from "@/features/tasks/actions/editTaskAction";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

function initialState(id: string, name: string): EditTaskState {
  return { success: true, data: { id, name } };
}

describe("editTaskAction server action", () => {
  beforeEach(() => {
    resetDb();
    resetCounter();
  });

  it("saves the new name on the task", async () => {
    const user = await makeUser();
    const task = await makeTask(user.id, { name: "Gammelt navn" });

    const result = await runAs({ id: user.id }, () =>
      editTaskAction(
        initialState(task.id, "Gammelt navn"),
        formData({ id: task.id, name: "Nytt navn" })
      )
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe("Nytt navn");

    const rows = await db.select().from(schema.tasks);
    expect(rows[0].name).toBe("Nytt navn");
  });

  it("answers 404 when the task does not exist", async () => {
    const user = await makeUser();

    const result = await runAs({ id: user.id }, () =>
      editTaskAction(
        initialState("finnes-ikke", "X"),
        formData({ id: "finnes-ikke", name: "Nytt navn" })
      )
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe(404);
    // What the user typed comes back so the form can re-render.
    expect(result.state?.name).toBe("Nytt navn");
  });
});
