// app/lib/schema/questions.ts

import { QuestionStatus } from "@/app/types/question";
import { z } from "zod";
import { PaginationSchema } from "./pagination";

// Base schemas for question operations
export const QuestionCreateSchema = z
  .object({
    question: z
      .string()
      .min(1, "Question cannot be empty")
      .max(500, "Question cannot exceed 500 characters")
      .trim(),
    status: z.enum(QuestionStatus).default("draft"),
    updatedAt: z.date().optional(),
    deletedAt: z.date().optional(),
    publishedAt: z.date().optional(),
  })
  .refine((data) => {
    // If status is published, publishedAt must be set
    if (data.status === "published" && !data.publishedAt) {
      return false;
    }
    // If status is deleted, deletedAt must be set
    if (data.status === "deleted" && !data.deletedAt) {
      return false;
    }
    return true;
  });

export const QuestionUpdateSchema = z
  .object({
    question: z
      .string()
      .min(1, "Question cannot be empty")
      .max(500, "Question cannot exceed 500 characters")
      .trim()
      .optional(),
    status: z.enum(QuestionStatus).optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().optional(),
    publishedAt: z.date().optional(),
  })
  .refine((data) => {
    // If status is published publishedAt must be set
    if (data.status === "published" && !data.publishedAt) {
      return false;
    }
    // If status is deleted deletedAt must be set
    if (data.status === "deleted" && !data.deletedAt) {
      return false;
    }
    return true;
  });

export const SortQuestionSchema = z.object({
  sortBy: z
    .enum(["createdAt", "question", "status", "publishedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const QuestionFilterSchema = z
  .object({
    search: z
      .string()
      .optional()
      .transform((val) => val?.trim() || undefined),
    status: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        // Support comma-separated status values
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }),
  })
  .and(PaginationSchema)
  .and(SortQuestionSchema)
  .optional();

// ID parameter validation
export const QuestionParamsSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
});

// TypeScript types derived from Zod schemas
export type QuestionCreateInput = z.infer<typeof QuestionCreateSchema>;
export type QuestionUpdateInput = z.infer<typeof QuestionUpdateSchema>;
export type QuestionQueryInput = Partial<z.infer<typeof QuestionFilterSchema>>;
export type QuestionParamsInput = z.infer<typeof QuestionParamsSchema>;
