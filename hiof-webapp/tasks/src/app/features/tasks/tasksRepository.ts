// src/app/features/tasks/tasks-repository.ts

import { eq, and } from "drizzle-orm";
import type { DB } from "@/db";
import {
  tasks,
  users,
  type CreateTask,
  type Task,
  type TaskQuery,
  type TaskWithUser,
  type UpdateTask,
} from "@/db/schema";
import { getDb } from "@/db";
import type { Result } from "@/app/types/result";

export interface TaskRepository {
  findMany(params?: TaskQuery): Promise<Result<TaskWithUser[]>>;
  findById(id: string): Promise<Result<TaskWithUser | null>>;
  findByUserId(userId: number): Promise<Result<TaskWithUser[]>>;
  create(data: CreateTask): Promise<Result<Task>>;
  update(id: string, data: UpdateTask): Promise<Result<Task>>;
  remove(id: string): Promise<Result<void>>;
  markComplete(id: string): Promise<Result<Task>>;
  markIncomplete(id: string): Promise<Result<Task>>;
}

export function createTaskRepository(db: DB): TaskRepository {
  return {
    async findMany(params?: TaskQuery) {
      try {
        // Build where conditions based on filters
        const conditions = [];

        if (params?.userId !== undefined) {
          conditions.push(eq(tasks.userId, params.userId));
        }

        if (params?.completed !== undefined) {
          conditions.push(eq(tasks.completed, params.completed));
        }

        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db
          .select({
            task: tasks,
            user: users,
          })
          .from(tasks)
          .leftJoin(users, eq(users.id, tasks.userId))
          .where(whereClause)
          .orderBy(tasks.dueDate);

        const tasksWithUser: TaskWithUser[] = result.map(({ task, user }) => ({
          ...task,
          user,
        }));

        return {
          success: true,
          data: tasksWithUser,
        };
      } catch (error) {
        return {
          success: false,
          error: { message: (error as Error).message, code: 500 },
        };
      }
    },

    async findById(id: string) {
      const task = await db.query.tasks.findFirst({
        where: (tasks, { eq }) => eq(tasks.id, id),
        with: {
          user: true,
        },
      });

      return { success: true, data: task ?? null };
    },

    async findByUserId(userId: number) {
      const userTasks = await db.query.tasks.findMany({
        where: (tasks, { eq }) => eq(tasks.userId, userId),
        with: {
          user: true,
        },
        orderBy: (tasks, { asc }) => [asc(tasks.dueDate)],
      });

      return { success: true, data: userTasks };
    },

    async create(data: CreateTask) {
      // TODO: Validate fields as needed
      const [newTask] = await db
        .insert(tasks)
        .values({
          name: data.name,
          description: data.description,
          dueDate: data.dueDate,
          userId: data.userId,
          completed: data.completed ?? false,
        })
        .returning();

      return {
        success: true,
        data: newTask,
      };
    },

    async update(id: string, data: UpdateTask) {
      // TODO: Validate fields as needed

      const [updatedTask] = await db
        .update(tasks)
        .set(data)
        .where(eq(tasks.id, id))
        .returning();

      return {
        success: true,
        data: updatedTask,
      };
    },

    async remove(id: string) {
      const [deleted] = await db
        .delete(tasks)
        .where(eq(tasks.id, id))
        .returning({ id: tasks.id });

      if (!deleted) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        data: undefined,
      };
    },

    async markComplete(id: string) {
      const [completedTask] = await db
        .update(tasks)
        .set({ completed: true })
        .where(eq(tasks.id, id))
        .returning();

      return {
        success: true,
        data: completedTask || null,
      };
    },

    async markIncomplete(id: string) {
      const [incompletedTask] = await db
        .update(tasks)
        .set({ completed: false })
        .where(eq(tasks.id, id))
        .returning();

      return {
        success: true,
        data: incompletedTask || null,
      };
    },
  };
}

// Singleton instance for direct use
export const taskRepository = createTaskRepository(await getDb());
