// hooks/useTasks.tsx
//
// TanStack Query on top of the provider layer.
//
// The providers return Result<T>; React Query wants a promise that either
// resolves with data or rejects. So each queryFn unwraps the Result and throws
// on failure, which is what lets isError and error work in the components.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend } from "@/providers";
import { useAuth } from "@/context/AuthProvider";
import type { Task, TaskInput, TaskPatch } from "@/types";

// Query keys as a factory, so a typo cannot silently create a second cache
// entry that never gets invalidated.
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: async () => {
      const result = await backend.tasks.list(user!.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(user),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const result = await backend.tasks.getById(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const client = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: TaskInput) => {
      const result = await backend.tasks.create(user!.id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useUpdateTask() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TaskPatch }) => {
      const result = await backend.tasks.update(id, patch);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (task) => {
      client.invalidateQueries({ queryKey: taskKeys.lists() });
      client.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
    },
  });
}

export function useDeleteTask() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await backend.tasks.remove(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

/**
 * Reorders the list.
 *
 * Optimistic: the new order is written into the cache before the request goes
 * out, so the animation runs immediately. If the write fails, onError puts the
 * previous list back, which is what makes the rollback visible to the user.
 */
export function useReorderTasks() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await backend.tasks.reorder(ids);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (ids) => {
      await client.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = client.getQueryData<Task[]>(taskKeys.lists());

      if (previous) {
        const byId = new Map(previous.map((task) => [task.id, task]));
        const next = ids
          .map((id, index) => {
            const task = byId.get(id);
            return task ? { ...task, order: index } : null;
          })
          .filter((task): task is Task => task !== null);
        client.setQueryData(taskKeys.lists(), next);
      }

      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        client.setQueryData(taskKeys.lists(), context.previous);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}
