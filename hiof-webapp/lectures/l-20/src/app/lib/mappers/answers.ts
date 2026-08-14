// src/app/lib/mappers/answers.ts

import type { AnswerDetailDTO } from "../schema/answers/dtos";

export const mapAnswerToDTO = (answer: any): AnswerDetailDTO => {
  return {
    id: answer.id,
    questionId: answer.questionId,
    answer: answer.answer,
    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
  };
};
