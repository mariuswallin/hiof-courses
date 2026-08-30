import type { CreateTask, Task, TaskWithUser, UpdateTask } from "@/db/schema";
import type { CreateTaskInput, UpdateTaskInput } from "./tasksSchema";

/**
 * Mappers between the wire format and the database.
 *
 * Two directions, two different jobs:
 *
 *   in    Validated input to a database row. The parsing already happened in
 *         tasksSchema, so this is only about shape.
 *   out   Database row to what the client is allowed to see. This is where
 *         fields get dropped.
 *
 * Without an out mapper you send whatever the query happened to select. The
 * relational query in `findById` uses `with: { user: true }`, which selects
 * every user column including the email address. The `TaskWithUser` type
 * claims the user is only `{ id, name }`, but a type is erased at runtime and
 * cannot remove anything. The mapper is what actually makes the response match
 * the type.
 */

/** What a task looks like on the wire. */
export type TaskDto = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  userId: number;
  completed: boolean;
  published: boolean;
  order: number;
};

export type TaskWithUserDto = TaskDto & {
  user: { id: number; name: string };
};

// ---------------------------------------------------------------- in

export function toCreateTask(input: CreateTaskInput): CreateTask {
  return {
    name: input.name,
    description: input.description,
    dueDate: input.dueDate ?? new Date(),
    userId: input.userId,
    completed: input.completed ?? false,
    published: input.published ?? false,
    ...(input.order === undefined ? {} : { order: input.order }),
  };
}

export function toUpdateTask(input: UpdateTaskInput): UpdateTask {
  // Only the keys actually present are copied, so a PATCH never overwrites a
  // column with undefined.
  const patch: UpdateTask = {};

  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
  if (input.completed !== undefined) patch.completed = input.completed;
  if (input.published !== undefined) patch.published = input.published;
  if (input.order !== undefined) patch.order = input.order;

  return patch;
}

// --------------------------------------------------------------- out

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    // Date to ISO string, done here rather than left to JSON.stringify, so
    // the wire format is decided in one place.
    dueDate: task.dueDate.toISOString(),
    userId: task.userId,
    completed: task.completed ?? false,
    published: task.published ?? false,
    order: task.order,
  };
}

export function toTaskListDto(tasks: Task[]): TaskDto[] {
  return tasks.map(toTaskDto);
}

export function toTaskWithUserDto(task: TaskWithUser): TaskWithUserDto {
  return {
    ...toTaskDto(task),
    // Only id and name. The email the query selected stops here.
    user: { id: task.user.id, name: task.user.name },
  };
}
