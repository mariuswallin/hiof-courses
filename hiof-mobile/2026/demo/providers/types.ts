// providers/types.ts
//
// The Result pattern used across every provider. Same discriminated union the
// lectures use, and the same idea as in the Redwood webapp demo: a failed call
// is a value you handle, not an exception you catch somewhere far away.
//
// Checking `success` narrows the type, so TypeScript knows `data` exists in one
// branch and `error` in the other.

export type Success<T> = {
  success: true;
  data: T;
};

export type Failure = {
  success: false;
  error: string;
};

export type Result<T> = Success<T> | Failure;
