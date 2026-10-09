// Tests for the provider layer: the Result pattern, error mapping, and the
// in-memory backend the app falls back to.
import { describe, it, expect, beforeEach, vi } from "vitest";

import { AppwriteException } from "react-native-appwrite";
import { z } from "zod";
import { asyncWrapper, handleError } from "@/providers/lib";
import { mockBackend, resetMock } from "@/providers/mock";

describe("handleError", () => {
  it("maps Appwrite status codes to readable messages", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(handleError(new AppwriteException("x", 401)).error).toBe("Ikke tilgang");
    expect(handleError(new AppwriteException("x", 404)).error).toBe("Ikke funnet");
    expect(handleError(new AppwriteException("x", 409)).error).toBe(
      "E-postadressen er allerede i bruk",
    );
  });

  it("takes the first message out of a Zod error", () => {
    const result = z.object({ n: z.string().min(3, "For kort") }).safeParse({ n: "a" });
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(handleError(result.error).error).toBe("For kort");
  });

  it("always returns success false, never throws", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(handleError("noe rart").success).toBe(false);
  });
});

describe("asyncWrapper", () => {
  it("wraps a resolved value in a Success", async () => {
    expect(await asyncWrapper(async () => 42)).toEqual({ success: true, data: 42 });
  });

  it("turns a thrown error into a Failure instead of propagating it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await asyncWrapper(async () => {
      throw new Error("gikk galt");
    });

    expect(result).toEqual({ success: false, error: "gikk galt" });
  });
});

// The mock backend is not only a fallback for running without Appwrite. It is
// also what the tests run against, so they need no network and no credentials.
describe("mock backend", () => {
  beforeEach(() => resetMock());

  it("lists only the tasks belonging to the user, sorted by order", async () => {
    const result = await mockBackend.tasks.list("demo-user");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((t) => t.order)).toEqual([0, 1, 2]);
    expect(await mockBackend.tasks.list("noen-andre")).toEqual({
      success: true,
      data: [],
    });
  });

  it("puts a new task at the end using MAX + 1", async () => {
    const created = await mockBackend.tasks.create("demo-user", {
      name: "Ny oppgave",
      description: "",
      dueDate: new Date("2026-06-01"),
      completed: false,
      imageId: null,
    });

    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.data.order).toBe(3);
  });

  it("keeps positions unique after a task in the middle is deleted", async () => {
    await mockBackend.tasks.remove("2");
    const created = await mockBackend.tasks.create("demo-user", {
      name: "Etter sletting",
      description: "",
      dueDate: new Date("2026-06-01"),
      completed: false,
      imageId: null,
    });

    expect(created.success).toBe(true);
    if (!created.success) return;
    // COUNT would give 2, which is still taken by the last row. MAX + 1 gives 3.
    expect(created.data.order).toBe(3);
  });

  it("rejects an invalid task with a readable message", async () => {
    const result = await mockBackend.tasks.create("demo-user", {
      name: "ab",
      description: "",
      dueDate: new Date(),
      completed: false,
      imageId: null,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBe("Navnet må ha minst 3 tegn");
  });

  it("writes the array position as the order when reordering", async () => {
    const result = await mockBackend.tasks.reorder(["3", "1", "2"]);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((t) => t.id)).toEqual(["3", "1", "2"]);
    expect(result.data.map((t) => t.order)).toEqual([0, 1, 2]);
  });

  it("refuses to reorder when an id does not exist, without writing", async () => {
    const before = await mockBackend.tasks.list("demo-user");
    const result = await mockBackend.tasks.reorder(["3", "1", "finnes-ikke"]);

    expect(result.success).toBe(false);

    const after = await mockBackend.tasks.list("demo-user");
    expect(before.success && after.success).toBe(true);
    if (!before.success || !after.success) return;
    expect(after.data.map((t) => t.id)).toEqual(before.data.map((t) => t.id));
  });

  it("refuses duplicate ids", async () => {
    const result = await mockBackend.tasks.reorder(["1", "1", "2"]);
    expect(result.success).toBe(false);
  });
});
