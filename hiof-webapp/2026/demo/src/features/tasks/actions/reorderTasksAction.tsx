"use server";

import { tasksService } from "../tasksService";
import type { ServerResult } from "@/types/result";
import type { Task } from "@/db/schema";

/**
 * Persists a new task order.
 *
 * Unlike editTaskAction this takes plain arguments instead of FormData,
 * because it is called straight from the drag handler and not from a form
 * submit. A server action is a normal async function to the caller; the
 * "use server" directive is what makes React run it on the server.
 *
 * `ids` is the full list in its new order. The position of each id becomes
 * that task's `order`.
 */
export async function reorderTasksAction(
  ids: string[]
): Promise<ServerResult<Task[]>> {
  try {
    const result = await tasksService.reorder(ids);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error in reorderTasksAction:", error);
    return {
      success: false,
      error: {
        message: "An unexpected error occurred. Please try again later.",
        code: 500,
      },
    };
  }
}
