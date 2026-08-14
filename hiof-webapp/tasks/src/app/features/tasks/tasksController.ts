// src/app/features/tasks/tasks.controller.ts

import type { RequestInfo } from "rwsdk/worker";
import {
  createTaskSchema,
  taskService,
  updateTaskSchema,
  type TaskService,
} from "./tasksService";
import z from "zod";

// TODO: Ofte tas disse ut i en egen fil / modul
const TaskParamsSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});

// TODO: Ofte tas disse ut i en egen fil / modul og har ofte pagination
const TaskFilterSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  completed: z.coerce.boolean().optional(),
});

export function createTaskController(taskService: TaskService) {
  return {
    // GET: /api/v1/tasks => List all tasks with optional filters
    async listTasks(context: RequestInfo) {
      try {
        const url = new URL(context.request.url);
        const queryParams = Object.fromEntries(url.searchParams);
        const validatedParams = TaskFilterSchema.parse(queryParams);

        const result = await taskService.list(validatedParams);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          // TODO: Lag en hjelpefunksjon for dette og ha som felles funksjon
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // TODO: Lag en hjelpefunksjon for dette og ha som felles funksjon
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in listTasks:`, error);
        if (error instanceof z.ZodError) {
          return new Response(
            JSON.stringify({
              error: `Validation failed: ${z.flattenError(error).fieldErrors}`,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // GET: /api/v1/tasks/:id => Get a specific task by ID
    async getTaskById(ctx: RequestInfo) {
      try {
        // TODO: Kan generalisere denne valideringen og feilhåndteringen
        const validatedParams = TaskParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        const result = await taskService.get(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in getTaskById:`, error);
        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // GET: /api/v1/tasks/user/:userId => Get all tasks for a specific user
    async getUserTasks(ctx: RequestInfo) {
      try {
        const userId = parseInt(ctx.params?.userId as string);

        if (isNaN(userId)) {
          return new Response(
            JSON.stringify({ error: "Invalid userId parameter" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const result = await taskService.getUserTasks(userId);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in getUserTasks:`, error);
        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // POST: /api/v1/tasks => Create a new task
    async createTask(ctx: RequestInfo) {
      try {
        const requestData = await ctx.request.json();
        const validatedData = createTaskSchema.parse(requestData);

        const result = await taskService.create(validatedData);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in createTask:`, error);

        if (error instanceof SyntaxError) {
          return new Response(
            JSON.stringify({ error: "Invalid JSON in request body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (error instanceof z.ZodError) {
          return new Response(
            JSON.stringify({
              error: `Validation failed: ${z.flattenError(error).fieldErrors}`,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // PUT/PATCH: /api/v1/tasks/:id => Update a specific task
    async updateTask(ctx: RequestInfo) {
      try {
        // Extract route parameters
        const validatedParams = TaskParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        const requestData = await ctx.request.json();
        const validatedData = updateTaskSchema.parse(requestData);

        const result = await taskService.update(id, validatedData);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in updateTask:`, error);

        if (error instanceof z.ZodError) {
          return new Response(
            JSON.stringify({
              error: `Validation failed: ${z.flattenError(error).fieldErrors}`,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // DELETE: /api/v1/tasks/:id => Delete a specific task
    async deleteTask(ctx: RequestInfo) {
      try {
        const validatedParams = TaskParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        const result = await taskService.remove(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(null, { status: 204 });
      } catch (error) {
        console.error(`Error in deleteTask:`, error);
        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // POST: /api/v1/tasks/:id/complete => Mark a task as complete
    async completeTask(ctx: RequestInfo) {
      try {
        const validatedParams = TaskParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        const result = await taskService.markComplete(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Format HTTP response
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in completeTask:`, error);
        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },

    // POST: /api/v1/tasks/:id/incomplete => Mark a task as incomplete
    async incompleteTask(ctx: RequestInfo) {
      try {
        const validatedParams = TaskParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        const result = await taskService.markIncomplete(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in incompleteTask:`, error);
        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },
  };
}

export const taskController = createTaskController(taskService);
