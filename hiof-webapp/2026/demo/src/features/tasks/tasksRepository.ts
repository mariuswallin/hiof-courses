import { db, type DB } from "@/db";
import {
  tasks,
  type Task,
  type CreateTask,
  type TaskQueryParams,
  type TaskWithUser,
  type UpdateTask,
} from "@/db/schema";
import { createId } from "@/lib/id";
import type { Result } from "@/types/result";
import { asc, eq, inArray, max } from "drizzle-orm";

export interface TaskRepository {
  findMany(params?: TaskQueryParams): Promise<Result<Task[]>>;
  findManyOrdered(): Promise<Result<Task[]>>;
  findById(id: string): Promise<Result<TaskWithUser>>;
  create(data: CreateTask): Promise<Result<Task>>;
  update(id: string, data: UpdateTask): Promise<Result<Task>>;
  remove(id: string): Promise<Result<Task>>;
  reorder(ids: string[]): Promise<Result<Task[]>>;
}

export function createTaskRepository(db: DB): TaskRepository {
  return {
    async findMany(params = {}) {
      try {
        // No `published` parameter means every task. The filter is built
        // conditionally: `where(undefined)` emits no WHERE clause.
        const publishedQuery =
          params.published === undefined || params.published === ""
            ? undefined
            : eq(tasks.published, params.published === "true");

        const result = await db
          .select()
          .from(tasks)
          .where(publishedQuery)
          .orderBy(tasks.dueDate);

        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message:
              (error as Error)?.message ?? "Failed to fetch tasks from DB",
          },
        };
      }
    },
    async findManyOrdered() {
      try {
        // Sorts by the drag and drop position. due_date is the tiebreak for
        // rows that share a position, such as freshly seeded data.
        const result = await db
          .select()
          .from(tasks)
          .orderBy(asc(tasks.order), asc(tasks.dueDate));

        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message:
              (error as Error)?.message ?? "Failed to fetch tasks from DB",
          },
        };
      }
    },
    async findById(id: string) {
      try {
        // Relations v2: `where` takes a filter object, not `eq(...)`.
        const task = await db.query.tasks.findFirst({
          where: { id },
          with: { user: true },
        });

        if (!task) {
          return {
            success: false,
            error: { code: 404, message: "Task not found" },
          };
        }

        return { success: true, data: task };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message:
              (error as Error)?.message ?? "Failed to fetch task from DB",
          },
        };
      }
    },
    async create(data: CreateTask) {
      try {
        // New tasks go to the end of the sortable list.
        //
        // MAX + 1 rather than COUNT, because the two diverge as soon as a row
        // is deleted: after removing the middle of 0, 1, 2 the count is 2 but
        // 2 is still taken, so COUNT would hand out a duplicate position.
        //
        // An explicit order in `data` wins, which is what the seed relies on.
        const nextOrder =
          data.order ??
          (await db
            .select({ value: max(tasks.order) })
            .from(tasks)
            .then(([row]) => (row?.value ?? -1) + 1));

        const [newTask] = await db
          .insert(tasks)
          .values({
            id: createId(),
            name: data.name,
            description: data.description,
            dueDate: data.dueDate ?? new Date(),
            userId: data.userId,
            completed: data.completed ?? false,
            published: data.published ?? false,
            order: nextOrder,
          })
          .returning();

        return { success: true, data: newTask };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message: (error as Error)?.message ?? "Failed to create task in DB",
          },
        };
      }
    },
    async update(id, data) {
      try {
        const [updatedTask] = await db
          .update(tasks)
          .set(data)
          .where(eq(tasks.id, id))
          .returning();

        if (!updatedTask) {
          return {
            success: false,
            error: { code: 404, message: "Task not found" },
          };
        }

        return { success: true, data: updatedTask };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message: (error as Error)?.message ?? "Failed to update task in DB",
          },
        };
      }
    },
    async remove(id: string) {
      try {
        // `.returning()` yields the row that was actually deleted. An empty
        // list means the task did not exist, which is a 404 and not a 204.
        const [deletedTask] = await db
          .delete(tasks)
          .where(eq(tasks.id, id))
          .returning();

        if (!deletedTask) {
          return {
            success: false,
            error: { code: 404, message: "Task not found" },
          };
        }

        return { success: true, data: deletedTask };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message: (error as Error)?.message ?? "Failed to delete task in DB",
          },
        };
      }
    },
    async reorder(ids: string[]) {
      try {
        // Check that every id exists before writing anything. A client with a
        // stale list would otherwise leave the table half reordered.
        const existing = await db
          .select({ id: tasks.id })
          .from(tasks)
          .where(inArray(tasks.id, ids));

        if (existing.length !== ids.length) {
          return {
            success: false,
            error: { code: 404, message: "One or more tasks were not found" },
          };
        }

        // A sequential loop rather than db.batch(). batch() exists on the D1
        // driver but not on better-sqlite3, which is what the tests run, and
        // one code path for both drivers is worth more here than the speed.
        //
        // Performance: this rewrites every row on every drop, so a move costs
        // N writes. Fine for a list you can see on one screen. Lists big
        // enough to care use fractional ranks (a position between the two
        // neighbours) so a move touches a single row, at the cost of needing
        // to renormalise when the fractions run out of precision.
        for (const [index, id] of ids.entries()) {
          await db.update(tasks).set({ order: index }).where(eq(tasks.id, id));
        }

        const result = await db
          .select()
          .from(tasks)
          .orderBy(asc(tasks.order), asc(tasks.dueDate));

        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 500,
            message:
              (error as Error)?.message ?? "Failed to reorder tasks in DB",
          },
        };
      }
    },
  };
}

export const taskRepository = createTaskRepository(db);
