import type { RequestInfo } from "rwsdk/worker";
import { ErrorResponse } from "rwsdk/worker";
import { tasksService, type TaskService } from "./tasksService";
import {
  createTaskSchema,
  updateTaskSchema,
  toValidationErrors,
} from "./tasksSchema";
import {
  toCreateTask,
  toUpdateTask,
  toTaskDto,
  toTaskListDto,
  toTaskWithUserDto,
} from "./tasksMappers";

// The controller takes the service as an argument so it can be tested with a
// stub:
//
//   const taskServiceMock = { list: async () => ({ success: true, data: [] }), ... };
//   const dummyTaskController = createTaskController(taskServiceMock);
//
// Its job is the HTTP layer only: read the request, call the service, and
// turn a failed Result into an ErrorResponse.

export function createTaskController(taskService: TaskService) {
  return {
    // GET /api/v1/tasks - List all tasks
    // GET /api/v1/tasks?search=foo - Search tasks
    async listTasks(context: RequestInfo) {
      const searchParams = new URL(context.request.url).searchParams;
      const searchEntries = Object.fromEntries(searchParams.entries());
      const dataFromService = await taskService.list(searchEntries);

      if (!dataFromService.success) {
        // Thrown on to `except()` in src/worker.tsx, which turns it into a
        // JSON response with the right status code.
        throw new ErrorResponse(
          dataFromService.error.code ?? 500,
          dataFromService.error.message
        );
      }

      return Response.json({
        success: true,
        data: toTaskListDto(dataFromService.data),
        params: searchEntries,
      });
    },

    async getTask(context: RequestInfo) {
      const { id } = context.params;
      const serviceResult = await taskService.getById(id);

      if (!serviceResult.success) {
        throw new ErrorResponse(
          serviceResult.error.code ?? 500,
          serviceResult.error.message
        );
      }

      // The out mapper is what drops the user email the query selected.
      return Response.json({
        success: true,
        data: toTaskWithUserDto(serviceResult.data),
      });
    },

    async createTask(context: RequestInfo) {
      // Never trust the body. safeParse returns a result instead of throwing,
      // which fits the Result pattern the rest of the layers use.
      const parsed = createTaskSchema.safeParse(await context.request.json());

      if (!parsed.success) {
        return Response.json(
          {
            success: false,
            error: { message: "Validation failed", code: 400 },
            validationErrors: toValidationErrors(parsed.error),
          },
          { status: 400 }
        );
      }

      const serviceResult = await taskService.create(toCreateTask(parsed.data));

      if (!serviceResult.success) {
        throw new ErrorResponse(
          serviceResult.error.code ?? 500,
          serviceResult.error.message
        );
      }

      return Response.json(
        { success: true, data: toTaskDto(serviceResult.data) },
        { status: 201 }
      );
    },

    async updateTask(context: RequestInfo) {
      const { id } = context.params;
      const parsed = updateTaskSchema.safeParse(await context.request.json());

      if (!parsed.success) {
        return Response.json(
          {
            success: false,
            error: { message: "Validation failed", code: 400 },
            validationErrors: toValidationErrors(parsed.error),
          },
          { status: 400 }
        );
      }

      const serviceResult = await taskService.update(
        id,
        toUpdateTask(parsed.data)
      );

      if (!serviceResult.success) {
        throw new ErrorResponse(
          serviceResult.error.code ?? 500,
          serviceResult.error.message
        );
      }

      return Response.json({
        success: true,
        data: toTaskDto(serviceResult.data),
      });
    },

    async deleteTask(context: RequestInfo) {
      const { id } = context.params;
      const serviceResult = await taskService.remove(id);

      if (!serviceResult.success) {
        throw new ErrorResponse(
          serviceResult.error.code ?? 500,
          serviceResult.error.message
        );
      }

      // 204 No Content: the delete succeeded and there is nothing to return.
      return new Response(null, { status: 204 });
    },
  };
}

export const tasksController = createTaskController(tasksService);
