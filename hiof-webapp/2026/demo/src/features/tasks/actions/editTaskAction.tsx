"use server";

import { requestInfo } from "rwsdk/worker";
import { tasksService } from "../tasksService";
import type { ServerResult } from "@/types/result";

/** The fields the form sends, and what is rendered back on failure. */
export type EditTaskFields = { id: string; name: string };

/**
 * The return type is `ServerResult`: the same Result pattern as the service
 * and repository layers, plus `state` so the form can re-render without the
 * user losing what they typed.
 *
 * "use server" at the top of the file marks these exports as server actions.
 * React calls them over the network; the body never runs in the browser.
 *
 * The first argument is the previous state, which is what `useActionState`
 * passes in. The second is the submitted FormData.
 */
export type EditTaskState = ServerResult<EditTaskFields, EditTaskFields>;

export async function editTaskAction(
  prevState: EditTaskState,
  formData: FormData
): Promise<EditTaskState> {
  const rawData: EditTaskFields = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
  };

  try {
    // Use ctx to validate user permissions if needed.
    const { ctx } = requestInfo;

    const taskItem = await tasksService.getById(rawData.id);

    // TODO: Validate input data.

    if (!taskItem.success) {
      return {
        success: false,
        error: { message: "Task not found", code: 404 },
        state: rawData,
      };
    }

    const result = await tasksService.update(rawData.id, {
      name: rawData.name,
    });

    if (!result.success) {
      return { ...result, state: rawData };
    }

    return {
      success: true,
      data: { id: result.data.id, name: result.data.name },
    };
  } catch (error) {
    console.error("Error in editTaskAction:", error);
    return {
      success: false,
      error: {
        message: "An unexpected error occurred. Please try again later.",
        code: 500,
      },
      state: rawData,
    };
  }
}
