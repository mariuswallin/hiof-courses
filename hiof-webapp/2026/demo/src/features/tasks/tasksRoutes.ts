import { route } from "rwsdk/router";
import { ErrorResponse } from "rwsdk/worker";
import { tasksController } from "./tasksController";

/**
 * rwsdk 1.7 supports method based routing: `route(path, { get, post, ... })`.
 * The framework answers 405 Method Not Allowed for verbs that are not
 * defined, so no `switch (request.method)` is needed.
 *
 * Errors are thrown as `ErrorResponse` and caught by `except()` in
 * src/worker.tsx.
 */

// Example interruptor. It runs before the handler and stops the chain if it
// throws. Enable it by putting it first in an array: `[isAdmin, handler]`.
export function isAdmin({ ctx }: { ctx: { user?: { isAdmin?: boolean } } }) {
  if (!ctx.user?.isAdmin) {
    throw new ErrorResponse(403, "Forbidden");
  }
}

export const taskRoutes = [
  route("/", {
    // GET /api/v1/tasks and GET /api/v1/tasks?search=x
    get: tasksController.listTasks,
    // POST /api/v1/tasks
    post: tasksController.createTask,
  }),

  route("/:id", {
    // GET /api/v1/tasks/:id
    get: tasksController.getTask,
    // PUT/PATCH /api/v1/tasks/:id
    put: tasksController.updateTask,
    patch: tasksController.updateTask,
    // DELETE /api/v1/tasks/:id
    delete: tasksController.deleteTask,
  }),

  route("/:id/publish", {
    // Only POST and PUT are defined. GET, PATCH and DELETE give 405.
    post: ({ params }) =>
      Response.json({ data: `Task with id ${params.id} published`, success: true }),
    put: ({ params }) =>
      Response.json({ data: `Task with id ${params.id} published`, success: true }),
  }),

  route("/:id/tags/:tagId", {
    get: ({ params }) =>
      Response.json({
        data: `Task with id ${params.id} and tag ${params.tagId}`,
        success: true,
      }),
  }),
];
