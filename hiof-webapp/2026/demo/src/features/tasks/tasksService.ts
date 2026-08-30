import type { Result } from "@/types/result";
import { taskRepository, type TaskRepository } from "./tasksRepository";
import type {
  CreateTask,
  Task,
  TaskQueryParams,
  TaskWithUser,
  UpdateTask,
} from "@/db/schema";

export interface TaskService {
  list(params?: TaskQueryParams): Promise<Result<Task[]>>;
  listOrdered(): Promise<Result<Task[]>>;
  getById(id: string): Promise<Result<TaskWithUser>>;
  create(data: CreateTask): Promise<Result<Task>>;
  update(id: string, data: UpdateTask): Promise<Result<Task>>;
  remove(id: string): Promise<Result<Task>>;
  reorder(ids: string[]): Promise<Result<Task[]>>;
}

export function createTaskService(taskRepository: TaskRepository): TaskService {
  return {
    async list(params = {}) {
      const { search = "" } = params;
      // TODO: Add real search logic here.
      if (search.includes("haxxor")) {
        return {
          success: false,
          error: {
            message: "Invalid search term",
            code: 400,
          },
        };
      }

      const repositoryResult = await taskRepository.findMany(params);

      if (!repositoryResult.success) {
        return repositoryResult;
      }

      const { data } = repositoryResult;

      return {
        success: true,
        data: data || [],
      };
    },
    async getById(id: string) {
      const repositoryResult = await taskRepository.findById(id);

      if (!repositoryResult.success) {
        return repositoryResult;
      }

      const { data } = repositoryResult;

      return {
        success: true,
        data,
      };
    },
    async create(data: CreateTask) {
      return taskRepository.create(data);
    },
    async update(id: string, data: UpdateTask) {
      // Drizzle throws "No values to set" on an empty patch. That is a client
      // error, so we catch it here instead of letting it surface as a 500.
      if (Object.keys(data).length === 0) {
        return {
          success: false as const,
          error: { code: 400, message: "No fields to update" },
        };
      }

      return taskRepository.update(id, data);
    },
    async remove(id: string) {
      return taskRepository.remove(id);
    },
    async listOrdered() {
      return taskRepository.findManyOrdered();
    },
    async reorder(ids: string[]) {
      // Input validation lives in the service, next to the search check above.
      if (ids.length === 0) {
        return {
          success: false as const,
          error: { code: 400, message: "No tasks to reorder" },
        };
      }

      if (new Set(ids).size !== ids.length) {
        return {
          success: false as const,
          error: { code: 400, message: "Duplicate task ids" },
        };
      }

      return taskRepository.reorder(ids);
    },
  };
}

export const tasksService = createTaskService(taskRepository);
