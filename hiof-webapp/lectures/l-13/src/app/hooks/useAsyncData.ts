// /app/hooks/useAsyncData.ts

import { useState, useEffect, useCallback } from "react";
import { Result } from "../types/result";

/**
 * Loading states for async operations
 */
export type Status = "idle" | "loading" | "success" | "error";

/**
 * Complete async state structure
 */
export interface AsyncState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

/**
 * Custom hook for handling async data fetching
 * Encapsulates all logic for loading, error and success states
 */
export function useAsyncData<T>({
  handler,
  fetchOnMount = true,
}: {
  handler: () => Promise<Result<T>>;
  fetchOnMount?: boolean;
}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    status: "idle",
    error: null,
  });

  // Execute function that fetches data and updates state
  const execute = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
    }));

    try {
      const result = await handler();

      if (result.success) {
        setState({
          data: result.data,
          status: "success",
          error: null,
        });
        return result.data;
      }

      setState((prev) => ({
        ...prev,
        status: "error",
        error: result.error.message,
      }));

      return null;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }));
    }
  }, []);

  // Fetch data on mount if specified
  useEffect(() => {
    if (fetchOnMount) execute();
  }, [execute]);

  const isEmpty =
    state.status === "success" &&
    (!state.data || (Array.isArray(state.data) && state.data.length === 0));

  return {
    ...state,
    states: {
      isPending: state.status === "idle" || state.status === "loading",
      isError: state.status === "error",
      isSuccess: state.status === "success",
      isEmpty,
    },
    execute,
  };
}
