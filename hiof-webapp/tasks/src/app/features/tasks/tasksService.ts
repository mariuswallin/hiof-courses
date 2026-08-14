"use server";

// src/app/features/tasks/tasksService.ts

import { z } from "zod";
import { taskRepository, type TaskRepository } from "./tasksRepository";
import type { Result } from "@/app/types/result";
import type {
  CreateTask,
  Task,
  TaskQuery,
  TaskWithUser,
  UpdateTask,
} from "@/db/schema";

// TODO: Tas ofte ut i en egen funksjon / fil
export interface TaskDTO {
  id: string;
  name: string;
  description: string;
  dueDate: string; // ISO string for å serialisere dato
  userId: number;
  completed: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// TODO: Tas ofte ut i en egen funksjon / fil
export const createTaskSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  dueDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Due date must be in the future",
  }),
  userId: z.number().positive(),
  completed: z.boolean().optional(),
});

// TODO: Tas ofte ut i en egen funksjon / fil
export const updateTaskSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(1000).optional(),
  dueDate: z.date().optional(),
  completed: z.boolean().optional(),
});

export interface TaskService {
  list(params?: TaskQuery): Promise<Result<TaskDTO[]>>;
  get(id: string): Promise<Result<TaskDTO>>;
  getUserTasks(userId: number): Promise<Result<TaskDTO[]>>;
  create(input: CreateTask): Promise<Result<Task>>;
  update(id: string, input: UpdateTask): Promise<Result<Task>>;
  remove(id: string): Promise<Result<void>>;
  markComplete(id: string): Promise<Result<Task>>;
  markIncomplete(id: string): Promise<Result<Task>>;
}

// TODO: Tas ofte ut i en egen funksjon / fil
function mapTaskToDTO(task: TaskWithUser): TaskDTO {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    dueDate: task.dueDate.toISOString(),
    userId: task.userId,
    completed: task.completed ?? false,
    user: task.user
      ? {
          id: task.user.id,
          name: task.user.name,
          email: task.user.email,
        }
      : undefined,
  };
}

const delayFn = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function createTaskService(taskRepository: TaskRepository): TaskService {
  return {
    async list(params?: TaskQuery) {
      await delayFn(2000); // Simulerer nettverksforsinkelse
      const result = await taskRepository.findMany(params);

      if (!result.success) {
        // TODO: Ofte abstrakteres til en ResultHandler eller lignende
        return {
          success: false,
          error: {
            message: result.error,
            code: 500,
          },
        };
      }

      // Tas ofte ut i en egen funksjon / fil
      const taskDTOs = result.data.map(mapTaskToDTO);

      // TODO: Ofte abstrakteres til en ResultHandler eller lignende
      return { success: true, data: taskDTOs };
    },

    async get(id: string) {
      // TODO: Validere ID format
      if (id.length < 1) {
        return {
          success: false,
          error: {
            message: "Invalid ID format",
            code: 400,
          },
        };
      }

      const result = await taskRepository.findById(id);
      console.log("Fetched task:", id, result);

      if (!result.success) {
        return {
          success: false,
          error: {
            message: result.error,
            code: 500,
          },
        };
      }

      if (!result.data) {
        return {
          success: false,
          error: { message: "Task not found", code: 404 },
        };
      }

      const taskDTO = mapTaskToDTO(result.data);

      return { success: true, data: taskDTO };
    },

    async getUserTasks(userId: number) {
      const result = await taskRepository.findByUserId(userId);

      if (!result.success) {
        return {
          success: false,
          error: { message: result.error, code: 500 },
        };
      }

      const taskDTOs = result.data.map(mapTaskToDTO);

      return { success: true, data: taskDTOs };
    },

    async create(input: CreateTask) {
      try {
        // Validere formatet på input (kan også gjøres høyre opp i stacken)
        const validatedInput = createTaskSchema.parse(input);

        // Eks. på forretningsregel: Maks 10 ufullførte oppgaver per bruker
        const userTasksResult = await taskRepository.findByUserId(
          validatedInput.userId
        );

        if (userTasksResult.success) {
          const incompleteTasks = userTasksResult.data.filter(
            (t) => !t.completed
          );

          // Eks. på forretningsregel: Maks 10 ufullførte oppgaver per bruker
          if (incompleteTasks.length >= 10) {
            return {
              success: false,
              error: {
                message:
                  "User has reached maximum number of incomplete tasks (10). Please complete some tasks before creating new ones.",
                code: 400,
              },
            };
          }
        }

        // Create the task
        const result = await taskRepository.create(validatedInput);

        if (!result.success) {
          return {
            success: false,
            error: {
              message: result.error,
              code: 500,
            },
          };
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: {
              message: `Validation failed: ${
                z.flattenError(error).fieldErrors
              }`,
              code: 400,
            },
          };
        }
        return {
          success: false,
          error: { message: "Failed to create task", code: 500 },
        };
      }
    },

    async update(id: string, input: UpdateTask) {
      try {
        // Forretningsregel: Sjekk om task eksisterer
        const existingResult = await taskRepository.findById(id);
        if (!existingResult.success || !existingResult.data) {
          return {
            success: false,
            error: {
              message: "Task not found",
              code: 404,
            },
          };
        }

        // Validate update input
        const validatedData = updateTaskSchema.parse(input);

        // Forretningsregel: Kan ikke endre forfallsdato hvis oppgaven allerede er fullført
        if (existingResult.data.completed && validatedData.dueDate) {
          return {
            success: false,
            error: {
              message: "Cannot change due date of a completed task",
              code: 400,
            },
          };
        }

        // Forretningsregel: Hvis forfallsdato oppdateres, må den fortsatt være i fremtiden og større enn tidligere dato
        if (
          validatedData.dueDate &&
          (validatedData.dueDate <= existingResult.data.dueDate ||
            validatedData.dueDate <= new Date())
        ) {
          return {
            success: false,
            error: {
              message:
                "Due date must be in the future and greater than the current due date",
              code: 400,
            },
          };
        }

        const result = await taskRepository.update(id, validatedData);

        if (!result.success) {
          return {
            success: false,
            error: { message: result.error, code: 500 },
          };
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: {
              message: `Validation failed: ${
                z.flattenError(error).fieldErrors
              }`,
              code: 400,
            },
          };
        }

        return {
          success: false,
          error: { message: "Failed to update task", code: 500 },
        };
      }
    },

    async remove(id: string) {
      // Forretningsregel: Sjekk om task eksisterer
      const existingResult = await taskRepository.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: { message: "Task not found", code: 404 },
        };
      }

      // Forretningsregel: Tillat sletting bare hvis oppgaven ikke er fullført eller ble fullført nylig
      if (existingResult.data.completed) {
        // TODO: Implementere logikk for å tillate sletting av fullførte oppgaver
      }

      const result = await taskRepository.remove(id);

      if (!result.success) {
        return {
          success: false,
          error: { message: "Failed to delete task", code: 500 },
        };
      }

      return { success: true, data: undefined };
    },

    async markComplete(id: string) {
      // Forretningsregel: Sjekk om task eksisterer
      const existingResult = await taskRepository.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: { message: "Task not found", code: 404 },
        };
      }

      // Forretningsregel: Oppgave må ikke allerede være fullført
      if (existingResult.data.completed) {
        return {
          success: false,
          error: { message: "Task is already completed", code: 400 },
        };
      }

      const result = await taskRepository.markComplete(id);

      if (!result.success) {
        return {
          success: false,
          error: { message: result.error, code: 500 },
        };
      }

      return { success: true, data: result.data };
    },

    async markIncomplete(id: string) {
      // Forretningsregel: Sjekk om task eksisterer
      const existingResult = await taskRepository.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: { message: "Task not found", code: 404 },
        };
      }

      // Forretningsregel: Oppgave må være fullført for å merke som ufullstendig
      if (!existingResult.data.completed) {
        return {
          success: false,
          error: { message: "Task is not completed", code: 400 },
        };
      }

      const result = await taskRepository.markIncomplete(id);

      if (!result.success) {
        return {
          success: false,
          error: { message: result.error, code: 500 },
        };
      }

      return { success: true, data: result.data };
    },
  };
}

export const taskService = createTaskService(taskRepository);
