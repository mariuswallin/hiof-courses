// src/app/lib/db/condition.ts

import { questions } from "@/db/schema";
import { eq, like, and, isNull, inArray } from "drizzle-orm";
import type { QuestionQueryInput } from "@/app/lib/schema/questions";

export function buildQuestionWhereConditions(params?: QuestionQueryInput) {
  if (!params) return undefined;

  const conditions = [];

  // Always exclude soft-deleted records
  conditions.push(isNull(questions.deletedAt));

  if (params.search) {
    conditions.push(like(questions.question, `%${params.search}%`));
  }

  if (
    params.status &&
    params.status.length > 0 &&
    !params.status.includes("all")
  ) {
    // @ts-ignore - inArray has type issues with enum arrays
    conditions.push(inArray(questions.status, params.status));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export function buildAnswerWhereConditions(questionId?: string) {
  const conditions = [];

  if (questionId) {
    conditions.push(eq(questions.id, questionId));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
