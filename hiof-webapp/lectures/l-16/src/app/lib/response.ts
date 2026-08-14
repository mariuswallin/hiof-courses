// /src/app/lib/response.ts

import type { Pagination } from "../types/api";
import { Errors, type ErrorCode } from "../types/errors";

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

export function methodNotAllowedResponse(allowedMethods: string[]) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: Errors.METHOD_NOT_ALLOWED,
        message: "Method not allowed for this endpoint",
      },
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: allowedMethods.join(", "),
      },
    }
  );
}

export function codeToStatus(code: ErrorCode): number {
  switch (code) {
    case Errors.INTERNAL_SERVER_ERROR:
      return 500;
    case Errors.NOT_FOUND:
      return 404;
    case Errors.BAD_REQUEST:
      return 400;
    case Errors.FORBIDDEN:
      return 403;
    case Errors.NOT_UNIQUE:
      return 409; // Conflict
    case Errors.RATE_LIMITED:
      return 429; // Too Many Requests
    case Errors.UNAUTHORIZED:
      return 401; // Unauthorized
    case Errors.NOT_IMPLEMENTED:
      return 501; // Not Implemented
    default:
      return 500; // Default to internal server error
  }
}
