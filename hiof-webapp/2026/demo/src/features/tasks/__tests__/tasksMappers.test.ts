// Unit tests for the mappers. Pure functions, no database.
import { describe, it, expect } from "vitest";
import {
  toCreateTask,
  toUpdateTask,
  toTaskDto,
  toTaskListDto,
  toTaskWithUserDto,
} from "../tasksMappers";
import type { Task, TaskWithUser } from "@/db/schema";

const row: Task = {
  id: "t1",
  name: "Write the report",
  description: "A description",
  dueDate: new Date("2026-12-24T10:00:00Z"),
  userId: 7,
  completed: false,
  published: true,
  order: 3,
};

describe("mapping in", () => {
  it("fills in the defaults the client left out", () => {
    const result = toCreateTask({
      name: "New",
      description: "d",
      userId: 7,
    });

    expect(result.completed).toBe(false);
    expect(result.published).toBe(false);
    expect(result.dueDate).toBeInstanceOf(Date);
  });

  it("leaves order out so the repository can pick the next one", () => {
    const result = toCreateTask({ name: "New", description: "d", userId: 7 });

    expect("order" in result).toBe(false);
  });

  it("keeps an order that was given explicitly", () => {
    const result = toCreateTask({
      name: "New",
      description: "d",
      userId: 7,
      order: 5,
    });

    expect(result.order).toBe(5);
  });

  it("copies only the keys a patch actually contains", () => {
    const result = toUpdateTask({ name: "Renamed" });

    expect(result).toEqual({ name: "Renamed" });
    // An undefined value would overwrite the column, so absent has to stay absent.
    expect("description" in result).toBe(false);
    expect("published" in result).toBe(false);
  });

  it("can patch a field to false", () => {
    // false is falsy but present, so it must survive the copy.
    const result = toUpdateTask({ published: false });

    expect(result).toEqual({ published: false });
  });
});

describe("mapping out", () => {
  it("serialises dueDate as an ISO string", () => {
    expect(toTaskDto(row).dueDate).toBe("2026-12-24T10:00:00.000Z");
  });

  it("turns the nullable columns into plain booleans", () => {
    const result = toTaskDto({ ...row, completed: null, published: null });

    expect(result.completed).toBe(false);
    expect(result.published).toBe(false);
  });

  it("maps a whole list", () => {
    expect(toTaskListDto([row, { ...row, id: "t2" }]).map((t) => t.id)).toEqual([
      "t1",
      "t2",
    ]);
  });

  it("drops the user email the query selected", () => {
    // `with: { user: true }` selects every user column. The type says the user
    // is only id and name, but a type cannot remove anything at runtime, so
    // the email really is on the object.
    const joined = {
      ...row,
      user: { id: 7, name: "Kari", email: "kari@test.local" },
    } as unknown as TaskWithUser;

    const result = toTaskWithUserDto(joined);

    expect(result.user).toEqual({ id: 7, name: "Kari" });
    expect("email" in result.user).toBe(false);
  });
});
