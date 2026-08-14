// src/app/lib/schema/answers/answer-dtos.ts

import { z } from "zod";

export const CreateAnswerDTOSchema = z.object({
  questionId: z.string().min(1, "Question ID er påkrevd"),
  answer: z
    .string()
    .min(1, "Svar kan ikke være tomt")
    .max(500, "Svar kan ikke være lengre enn 500 tegn"),
});

export const AnswerDetailDTOSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  answer: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateAnswerDTO = z.infer<typeof CreateAnswerDTOSchema>;
export type AnswerDetailDTO = z.infer<typeof AnswerDetailDTOSchema>;
