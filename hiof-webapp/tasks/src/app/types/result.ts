// Successful data response type
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

// Result pattern for API responses
export type Result<T> = ResultData<T> | ResultError;

export type ServerResultError<U extends Record<string, unknown> = {}> =
  ResultError & {
    validationErrors?: Record<string, string[]>;
    state?: U;
  };

export type ServerResult<T, U extends Record<string, unknown> = {}> =
  | ResultData<T>
  | ServerResultError<U>;
