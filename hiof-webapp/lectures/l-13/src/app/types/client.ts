// app/types/client.ts

import type { Result } from "./result";

// Parameters for HTTP client calls
export type ClientParams<T = unknown> = {
  url: string;
  method?: RequestInit["method"];
  options?: Omit<RequestInit, "method" | "body">;
  body?: T | Record<string, unknown> | null;
};

// Generic HTTP client interface
export type HTTPClient<T = unknown, U = Response> = (
  params: ClientParams<T>
) => Promise<U>;

// Response handler for processing HTTP responses - now uses Result<T>
export type ResponseHandler = <T>(
  response: Promise<Response>
) => Promise<Result<T>>;

// Client factory parameters
export type ClientFactoryParams = {
  client: HTTPClient;
  handleResponse: ResponseHandler;
};

type Params<T> = Omit<ClientParams<T>, "method">;

// HTTP client with specific methods - now returns Result<T>
export interface Client {
  get: <T = unknown>(params: Params<T>) => Promise<Result<T>>;
  post: <T = unknown>(params: Params<T>) => Promise<Result<T>>;
  put: <T = unknown>(params: Params<T>) => Promise<Result<T>>;
  delete: <T = unknown>(params: Params<T>) => Promise<Result<T>>;
  patch: <T = unknown>(params: Params<T>) => Promise<Result<T>>;
}

// Factory interface for creating HTTP clients
export type IClientFactory = (params: ClientFactoryParams) => Client;
