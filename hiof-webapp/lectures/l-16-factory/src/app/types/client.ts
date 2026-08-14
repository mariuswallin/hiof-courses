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

// Response handler for processing HTTP responses
export type ResponseHandler = <T>(
  response: Promise<Response>
) => Promise<Result<T>>;

// Client factory parameters
export type ClientFactoryParams = {
  client: HTTPClient;
  handleResponse: ResponseHandler;
};

export type BaseParams<T> = Omit<ClientParams<T>, "method">;
export type Options = Omit<RequestInit, "method" | "body">;

// HTTP client with specific methods
export type Client = {
  get: <T = unknown>(params: BaseParams<T>) => Promise<Result<T>>;
  post: <T = unknown>(params: BaseParams<T>) => Promise<Result<T>>;
  put: <T = unknown>(params: BaseParams<T>) => Promise<Result<T>>;
  delete: <T = unknown>(params: BaseParams<T>) => Promise<Result<T>>;
  patch: <T = unknown>(params: BaseParams<T>) => Promise<Result<T>>;
};

export interface BaseService<
  TData,
  TFilters = Record<string, unknown>,
  TCreateParams = Record<string, unknown>,
  TUpdateParams = Record<string, unknown>
> {
  list({
    filters,
    options,
  }: {
    filters?: Partial<TFilters>;
    pagination?: {
      page: number;
      limit: number;
    };
    options?: Options;
  }): Promise<Result<TData[]>>;
  get({
    identifier,
    options,
  }: {
    identifier: string;
    options?: Options;
  }): Promise<Result<TData>>;
  create({
    data,
    options,
  }: {
    data: Partial<TCreateParams>;
    options?: Options;
  }): Promise<Result<TData>>;
  update({
    identifier,
    data,
    options,
  }: {
    identifier: string;
    data: Partial<TUpdateParams>;
    options?: Options;
  }): Promise<Result<TData>>;
  remove({
    identifier,
    options,
  }: {
    identifier: string;
    options?: Options;
  }): Promise<Result<void>>;
}

// Factory interface for creating HTTP clients
export type IClientFactory = (params: ClientFactoryParams) => Client;
