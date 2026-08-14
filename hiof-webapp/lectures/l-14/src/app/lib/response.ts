// /src/app/lib/response.ts

import type { Pagination } from "../types/api";
import { type ErrorCode } from "../types/errors";

// Base headers for API responses
const baseHeaders = {
  "Content-Type": "application/json", // Default content type
  "Cache-Control": "public, max-age=300", // Cache for 5 minutes
  "Access-Control-Allow-Origin": "*", // Allow all origins => meaning everyone can access the API
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Allow these HTTP methods
  "Access-Control-Allow-Credentials": "true", // Allow credentials => cookies, authorization headers, or TLS client certificates
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With", // Allow these headers => content type, authorization, and X-Requested-With
};

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number
): Response {
  const errorResponse: {
    success: false;
    error: {
      code: string;
      message: string;
    };
  } = {
    success: false,
    error: {
      code,
      message,
    },
  };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { ...baseHeaders, "Cache-Control": "no-cache" },
  });
}

export const createSuccessResponse = <T>({
  data,
  pagination,
  status = 200,
  headers = {},
}: {
  data: T;
  pagination?: Pagination;
  status?: Response["status"];
  headers?: RequestInit["headers"];
}) => {
  const response = {
    success: true,
    data,
    pagination,
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { ...baseHeaders, ...headers },
  });
};
