// providers/contract.ts
//
// The shape every backend must implement. Appwrite is the real one; the mock
// is an in-memory stand-in so the app runs without a backend.
//
// Everything returns Result<T> instead of throwing, so the calling code always
// has to deal with the failure case.

import type { Result } from "./types";
import type { Credentials, RegisterInput, Task, TaskInput, TaskPatch, User } from "@/types";

export type AuthProviderApi = {
  register(input: RegisterInput): Promise<Result<User>>;
  login(input: Credentials): Promise<Result<User>>;
  logout(): Promise<Result<null>>;
  currentUser(): Promise<Result<User | null>>;
};

export type TasksProviderApi = {
  list(userId: string): Promise<Result<Task[]>>;
  getById(id: string): Promise<Result<Task>>;
  create(userId: string, input: TaskInput): Promise<Result<Task>>;
  update(id: string, patch: TaskPatch): Promise<Result<Task>>;
  remove(id: string): Promise<Result<Task>>;
  /** Writes the array position of each id as its `order`. */
  reorder(ids: string[]): Promise<Result<Task[]>>;
};

export type FilesProviderApi = {
  /** Uploads a local file uri and returns the stored file id. */
  upload(uri: string): Promise<Result<string>>;
  /** A url the app can render, or null when there is no file. */
  previewUrl(fileId: string | null): string | null;
  remove(fileId: string): Promise<Result<null>>;
};

export type Backend = {
  name: "appwrite" | "mock";
  auth: AuthProviderApi;
  tasks: TasksProviderApi;
  files: FilesProviderApi;
};
