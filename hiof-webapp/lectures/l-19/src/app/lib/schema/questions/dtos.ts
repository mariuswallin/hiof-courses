// src/app/lib/schema/questions/dtos.ts

import { z } from "zod";

// API response DTO schemas that extend our existing schemas
export const QuestionDTOSchema = z.object({
  id: z.string(),
  question: z.string(),
  createdAt: z.string(),
  answersCount: z.number().int().min(0),
  status: z.enum(["draft", "published", "archived", "deleted"]),
  authorId: z.coerce.number().optional(),
});

export const QuestionDetailDTOSchema = QuestionDTOSchema.extend({
  answers: z.array(
    z.object({
      id: z.string(),
      answer: z.string(),
      createdAt: z.string(),
    })
  ),
});

// Input DTO for API requests - builds on our existing CreateSchema
export const CreateQuestionDTOSchema = z.object({
  question: z.string().min(1).max(500),
  status: z.enum(["draft", "published"]).default("draft"),
  // metadata: z.record(z.unknown()).optional(), // Flexible metadata as JSON (not applicable for us)
  authorId: z.coerce.number().optional(), // Optional author ID, can be set by the API
});

export const UpdateQuestionDTOSchema = CreateQuestionDTOSchema.extend({
  id: z.string().min(1, "ID er påkrevd"),
});

// API response wrapper built on our existing response pattern.
// Could be moved somewhere more suitable.
export const ApiResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    })
    .optional(),
});

// TypeScript types derived from the Zod schemas
export type QuestionDTO = z.infer<typeof QuestionDTOSchema>;
export type QuestionDetailDTO = z.infer<typeof QuestionDetailDTOSchema>;
export type CreateQuestionDTO = z.infer<typeof CreateQuestionDTOSchema>;
export type UpdateQuestionDTO = z.infer<typeof UpdateQuestionDTOSchema>;
export type ApiResponse<T> = z.infer<typeof ApiResponseSchema> & {
  data: T;
};
