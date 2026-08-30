// Unit tests for the Zod schemas. No DOM and no database, so these run in the
// node environment.
import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  toValidationErrors,
} from "../tasksSchema";

const valid = {
  name: "Write the report",
  description: "A description",
  userId: 1,
};

describe("createTaskSchema", () => {
  it("accepts a minimal valid body", () => {
    const result = createTaskSchema.safeParse(valid);

    expect(result.success).toBe(true);
  });

  it("turns a dueDate string into a Date", () => {
    // This is the whole point: JSON has no date type, and Drizzle calls
    // getTime() on whatever it is handed.
    const result = createTaskSchema.safeParse({
      ...valid,
      dueDate: "2026-12-24T10:00:00Z",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.dueDate).toBeInstanceOf(Date);
    expect(result.data.dueDate?.toISOString()).toBe("2026-12-24T10:00:00.000Z");
  });

  it("rejects a dueDate that is not a date at all", () => {
    const result = createTaskSchema.safeParse({
      ...valid,
      dueDate: "not a date",
    });

    expect(result.success).toBe(false);
  });

  it("enforces the same name length as the form", () => {
    expect(createTaskSchema.safeParse({ ...valid, name: "ab" }).success).toBe(
      false
    );
    expect(
      createTaskSchema.safeParse({ ...valid, name: "a".repeat(201) }).success
    ).toBe(false);
    expect(createTaskSchema.safeParse({ ...valid, name: "abc" }).success).toBe(
      true
    );
  });

  it("rejects a userId that is not a positive integer", () => {
    expect(createTaskSchema.safeParse({ ...valid, userId: -1 }).success).toBe(
      false
    );
    expect(createTaskSchema.safeParse({ ...valid, userId: 1.5 }).success).toBe(
      false
    );
  });

  it("strips unknown keys instead of passing them through", () => {
    const result = createTaskSchema.safeParse({ ...valid, isAdmin: true });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect("isAdmin" in result.data).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("accepts a partial body", () => {
    const result = updateTaskSchema.safeParse({ name: "Only the name" });

    expect(result.success).toBe(true);
  });

  it("accepts an empty body, which the service rejects later", () => {
    // Emptiness is a business rule, not a shape rule, so it belongs in the
    // service and not here.
    expect(updateTaskSchema.safeParse({}).success).toBe(true);
  });
});

describe("toValidationErrors", () => {
  it("groups the messages by field", () => {
    const result = createTaskSchema.safeParse({
      name: "ab",
      description: "",
      userId: -1,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = toValidationErrors(result.error);

    expect(Object.keys(errors).sort()).toEqual([
      "description",
      "name",
      "userId",
    ]);
    expect(errors.name?.length).toBeGreaterThan(0);
  });
});
