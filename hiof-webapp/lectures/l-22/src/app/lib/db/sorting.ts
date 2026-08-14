// src/app/lib/db/sorting.ts

import { questions } from "@/db/schema";
import { asc, desc } from "drizzle-orm";

type SortBy = "createdAt" | "question" | "status" | "publishedAt";
type SortOrder = "asc" | "desc";

const sortByOptions = {
  createdAt: questions.createdAt,
  question: questions.question,
  status: questions.status,
  publishedAt: questions.publishedAt,
} as const;

export function buildQuestionOrderBy(
  params: {
    sortBy?: string;
    sortOrder?: string;
  } = {
    sortBy: "createdAt",
    sortOrder: "desc",
  }
) {
  const sortBy =
    params.sortBy && isValidSortBy(params.sortBy) ? params.sortBy : "createdAt";
  const column = sortByOptions[sortBy];

  return params.sortOrder === "asc" ? asc(column) : desc(column);
}

export function isValidSortBy(value: string): value is SortBy {
  return Object.keys(sortByOptions).includes(value);
}

export function isValidSortOrder(value: string): value is SortOrder {
  return ["asc", "desc"].includes(value);
}
