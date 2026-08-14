// app/schema/answers.ts

import { z } from "zod";
import { PaginationSchema } from "./pagination";

// Base schemas for answer operations
export const AnswerCreateSchema = z.object({
  answer: z
    .string()
    .min(1, "Answer cannot be empty")
    .max(1000, "Answer cannot exceed 1000 characters")
    .trim(),
  questionId: z.string("Invalid question ID format"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const AnswerUpdateSchema = z.object({
  answer: z
    .string()
    .min(1, "Answer cannot be empty")
    .max(1000, "Answer cannot exceed 1000 characters")
    .trim()
    .optional(),
  updatedAt: z.date().optional(),
});

export const AnswerFilterSchema = z
  .object({
    search: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
    questionId: z.string("Invalid question ID format").optional(),
  })
  .and(PaginationSchema);
