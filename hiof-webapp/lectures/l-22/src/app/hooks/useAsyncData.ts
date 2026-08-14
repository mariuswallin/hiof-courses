// /app/hooks/useAsyncData.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Result } from "@/app/types/result";
import type { Pagination } from "@/app/types/api";

export type Status = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  pagination: Pagination | null;
  status: Status;
  error: string | null;
  isAborted: boolean;
}

export interface UseAsyncDataOptions {
  immediate?: boolean;
  retainDataOnError?: boolean;
  dependencies?: unknown[];
}

/**
 * Custom hook for managing asynchronous data fetching with cancellation support.
 */
export function useAsyncData<T>(
  handler: (abortSignal: AbortSignal) => Promise<Result<T>>,
  options: UseAsyncDataOptions = {}
) {
  const {
    immediate = true,
    retainDataOnError = true,
    dependencies = [],
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    status: "idle",
    error: null,
    isAborted: false,
    pagination: null,
  });

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    // Abort previous request
    // User types in search box rapidly
    // execute(); // Request A starts
    // execute(); // Request B starts (should cancel A)
    // execute(); // Request C starts (should cancel B)

    // Without cancellation: A, B, C all complete
    // Result: Whichever finishes last wins (could be stale data)

    // With cancellation: Only C completes
    // Result: Always the latest data
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
      isAborted: false,
    }));

    try {
      const result = await handler(controller.signal);

      if (result.success) {
        setState({
          data: result.data,
          pagination: result.pagination || null,
          status: "success",
          error: null,
          isAborted: false,
        });
        return result.data;
      }

      setState((prev) => ({
        data: retainDataOnError ? prev.data : null,
        status: "error",
        error: result.error.message,
        isAborted: false,
        pagination: null,
      }));

      return null;
    } catch (error) {
      if (!mountedRef.current) return null;

      // Special handling for abort errors
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Async operation aborted:", error);
        setState((prev) => ({
          ...prev,
          status: prev.data ? "success" : "idle",
          isAborted: true,
        }));
        return null;
      }

      setState((prev) => ({
        data: retainDataOnError ? prev.data : null,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        isAborted: false,
        pagination: null,
      }));

      return null;
    }
  }, [retainDataOnError, ...dependencies]);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup on unmount
    return () => {
      // Prevent state updates if the component is unmounted => meaning mountedRef is false
      mountedRef.current = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [execute, immediate]);

  const isIdle = state.status === "idle";
  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";
  const hasData = state.data !== null;
  const isAborted = state.isAborted;
  const isError = state.status === "error" && !isAborted;

  const statuses = {
    isIdle,
    isLoading,
    isSuccess,
    isError,
    isAborted,
    hasData,
  };

  return {
    ...state,
    statuses,
    execute,
    abort,
  };
}
