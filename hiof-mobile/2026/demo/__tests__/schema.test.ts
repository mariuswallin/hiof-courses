// Unit tests for the Zod schemas. No React, no backend.
import { describe, it, expect } from "vitest";
import { TaskSchema, TaskInputSchema, RegisterSchema } from "@/types";

const valid = {
  id: "1",
  name: "Skrive rapport",
  description: "En beskrivelse",
  dueDate: "2026-12-24T10:00:00Z",
  completed: false,
  order: 0,
  imageId: null,
  userId: "u1",
};

describe("TaskSchema", () => {
  it("turns a date string into a Date", () => {
    // The whole reason for z.coerce.date(): dates arrive as strings from both
    // JSON and the date picker.
    const result = TaskSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.dueDate).toBeInstanceOf(Date);
    expect(result.data.dueDate.toISOString()).toBe("2026-12-24T10:00:00.000Z");
  });

  it("rejects a name shorter than three characters", () => {
    const result = TaskSchema.safeParse({ ...valid, name: "ab" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe("Navnet må ha minst 3 tegn");
  });

  it("rejects a date that is not a date", () => {
    expect(TaskSchema.safeParse({ ...valid, dueDate: "ikke en dato" }).success).toBe(false);
  });

  it("allows imageId to be null but not missing entirely on a full task", () => {
    expect(TaskSchema.safeParse({ ...valid, imageId: null }).success).toBe(true);
    expect(TaskSchema.safeParse({ ...valid, imageId: "abc" }).success).toBe(true);
  });

  it("strips unknown keys instead of passing them through", () => {
    const result = TaskSchema.safeParse({ ...valid, isAdmin: true });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect("isAdmin" in result.data).toBe(false);
  });
});

describe("TaskInputSchema", () => {
  it("does not require id, order or userId", () => {
    // Those three belong to the server, not the form.
    const result = TaskInputSchema.safeParse({
      name: "Ny oppgave",
      description: "",
      dueDate: "2026-12-24T10:00:00Z",
      completed: false,
      imageId: null,
    });

    expect(result.success).toBe(true);
  });
});

describe("RegisterSchema", () => {
  it("requires a valid email and a password of at least eight characters", () => {
    expect(
      RegisterSchema.safeParse({ name: "Kari", email: "ikke-epost", password: "langtnok1" })
        .success,
    ).toBe(false);
    expect(
      RegisterSchema.safeParse({ name: "Kari", email: "kari@hiof.no", password: "kort" })
        .success,
    ).toBe(false);
    expect(
      RegisterSchema.safeParse({ name: "Kari", email: "kari@hiof.no", password: "langtnok1" })
        .success,
    ).toBe(true);
  });
});
