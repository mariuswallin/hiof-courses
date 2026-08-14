"use server";

// src/app/features/tasks/tasks.actions.ts

import { createTaskSchema, taskService } from "./tasksService";

import type { TaskDTO } from "./tasksService";

import z from "zod";
import { requestInfo } from "rwsdk/worker";
import type {
  ResultData,
  ServerResult,
  ServerResultError,
} from "@/app/types/result";

export async function createTaskAction(
  prevState: any,
  formData: FormData
): Promise<ServerResult<TaskDTO>> {
  try {
    const { ctx } = requestInfo;

    // Extract raw form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate") as string,
      // Use userId from form, or fall back to authenticated user
      userId: formData.get("userId")
        ? parseInt(formData.get("userId") as string)
        : ctx?.user?.id,
      completed: formData.get("completed") === "true",
    };

    const validation = createTaskSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: {
          message: "Validation failed",
          code: 404,
        },
        validationErrors: z.flattenError(validation.error).fieldErrors,
        state: rawData, // Preserve form state for re-rendering
      } as ServerResultError;
    }

    const validatedData = validation.data;

    const result = await taskService.create({
      name: validatedData.name,
      description: validatedData.description,
      dueDate: validatedData.dueDate,
      userId: validatedData.userId,
      completed: validatedData.completed,
    });

    if (!result.success) {
      return {
        ...result,
        success: false,
        state: rawData,
      } as ServerResultError;
    }

    const taskDTO: TaskDTO = {
      id: result.data.id,
      name: result.data.name,
      description: result.data.description,
      dueDate: result.data.dueDate.toISOString(),
      userId: result.data.userId,
      completed: result.data.completed ?? false,
    };

    return {
      success: true,
      data: taskDTO,
    } as ResultData<TaskDTO>;
  } catch (error) {
    console.error("Error in createTaskAction:", error);
    return {
      success: false,
      error: {
        message: "An unexpected error occurred. Please try again later.",
        code: 500,
      },
      state: Object.fromEntries(formData.entries()),
    };
  }
}

export async function completeTaskAction(
  taskId: string
): Promise<ServerResult<TaskDTO | null>> {
  try {
    const result = await taskService.markComplete(taskId);

    if (!result.success) {
      return {
        ...result,
        success: false,
      } as ServerResultError;
    }

    const taskDTO: TaskDTO = {
      id: result.data.id,
      name: result.data.name,
      description: result.data.description,
      dueDate: result.data.dueDate.toISOString(),
      userId: result.data.userId,
      completed: result.data.completed ?? false,
    };

    return {
      success: true,
      data: taskDTO,
    } as ResultData<TaskDTO>;
  } catch (error) {
    console.error("Error in completeTaskAction:", error);
    return {
      success: false,
      error: {
        message: "An unexpected error occurred. Please try again later.",
        code: 500,
      },
    };
  }
}

// TODO: Mangler flere actions
