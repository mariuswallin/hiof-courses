// Successful result.
export type ResultData<T> = {
  success: true;
  data: T;
};

export type ResultError = {
  success: false;
  error: {
    message: string;
    code?: number;
  };
};

// The Result pattern used across the repository and service layers.
// Discriminating on `success` narrows to `data` or `error` in TypeScript.
export type Result<T> = ResultData<T> | ResultError;

// Server actions add validation errors and the previous form state, so the
// form can re-render without losing what the user typed.
export type ServerResultError<U extends Record<string, unknown> = {}> =
  ResultError & {
    validationErrors?: Record<string, string[]>;
    state?: U;
  };

export type ServerResult<T, U extends Record<string, unknown> = {}> =
  | ResultData<T>
  | ServerResultError<U>;
