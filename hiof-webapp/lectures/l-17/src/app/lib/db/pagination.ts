// src/app/lib/db/pagination.ts

import type { Pagination } from "@/app/types/api";

export function normalizePaginationParams(page?: number, limit?: number) {
  const normalizedPage = page && page > 0 ? page : 1;
  const normalizedLimit = limit && limit > 0 && limit <= 500 ? limit : 100;
  const offset = (normalizedPage - 1) * normalizedLimit;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset,
  };
}

export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): Pagination {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages: totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
