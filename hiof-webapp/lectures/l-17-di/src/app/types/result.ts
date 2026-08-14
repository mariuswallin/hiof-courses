// /app/types/result.ts

import type { Pagination } from "./api";
import { type ErrorCode, type ResultError } from "./errors";

// Successful data response type
export type ResultData<T> = {
  success: true;
  data: T;
  pagination?: Pagination;
};

// Result pattern for API responses
export type Result<T> = ResultData<T> | ResultError;

// Result function type
export type ResultFn = {
  success: <T>(data: T, pagination?: Pagination) => ResultData<T>;
  failure: (error: unknown, code: ErrorCode) => ResultError;
};
