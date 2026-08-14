// src/app/lib/mappers/questions.ts
// These types belong in a shared types folder, to avoid importing from the
// repository layer.

import {
  QuestionDTOSchema,
  type CreateQuestionDTO,
  type QuestionDetailDTO,
  type QuestionDTO,
} from "../schema/questions/dtos";
import { ResultHandler } from "../result";
import { Errors } from "@/app/types/errors";
import type { QuestionWithAnswers } from "@/app/types/question";

// Manual mapping - Full control over transformation
export function mapQuestionToDTO(question: QuestionWithAnswers): QuestionDTO {
  const { createdAt, updatedAt, publishedAt, deletedAt } = question;

  // Handle timestamp conversion
  const createdAtValue =
    createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  const updatedAtValue =
    updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
  const publishedAtValue =
    publishedAt instanceof Date ? publishedAt.toISOString() : publishedAt;
  const deletedAtValue =
    deletedAt instanceof Date ? deletedAt.toISOString() : deletedAt;

  return {
    id: question.id,
    question: question.question,
    createdAt: createdAtValue,
    answersCount: question.answers?.length ?? 0,
    status: question.status,
    // Include optional timestamp fields if they exist
    ...(updatedAtValue && { updatedAt: updatedAtValue }),
    ...(publishedAtValue && { publishedAt: publishedAtValue }),
    ...(deletedAtValue && { deletedAt: deletedAtValue }),
    // authorId is integer in schema
    ...(question.authorId && { authorId: question.authorId }),
  };
}

// Maps a question to its detailed DTO representation
export function mapQuestionToDetailDTO(
  question: QuestionWithAnswers
): QuestionDetailDTO {
  const baseQuestion = mapQuestionToDTO(question);

  return {
    ...baseQuestion,
    answers: question.answers.map((answer) => ({
      id: answer.id,
      answer: answer.answer,
      createdAt:
        answer.createdAt instanceof Date
          ? answer.createdAt.toISOString()
          : answer.createdAt,
    })),
  };
}

// Zod-based mapper
export function mapQuestionToDTOWithValidation(question: QuestionWithAnswers) {
  try {
    const mapped = mapQuestionToDTO(question);
    const validated = QuestionDTOSchema.parse(mapped);
    return ResultHandler.success(validated);
  } catch (error) {
    return ResultHandler.failure(
      `Failed to map question to DTO: ${error}`,
      Errors.INTERNAL_SERVER_ERROR
    );
  }
}

// Maps a CreateQuestionDTO to its domain model representation
export function mapCreateQuestionDTOToDomain(dto: CreateQuestionDTO) {
  const now = new Date();

  return {
    question: dto.question.trim(),
    status: dto.status,
    createdAt: now,
    updatedAt: now,
    // publishedAt should only be set when status is 'published'
    ...(dto.status === "published" && { publishedAt: now }),
    // authorId is integer in schema
    ...(dto.authorId && { authorId: dto.authorId }),
  };
}

// Maps a database record to a QuestionDTO
export function mapDatabaseToQuestionDTO(dbQuestion: any): QuestionDTO {
  return {
    id: dbQuestion.id,
    question: dbQuestion.question,
    createdAt:
      dbQuestion.createdAt instanceof Date
        ? dbQuestion.createdAt.toISOString()
        : dbQuestion.createdAt,
    status: dbQuestion.status,
    // Include optional fields if they exist
    ...(dbQuestion.updatedAt && {
      updatedAt:
        dbQuestion.updatedAt instanceof Date
          ? dbQuestion.updatedAt.toISOString()
          : dbQuestion.updatedAt,
    }),
    ...(dbQuestion.publishedAt && {
      publishedAt:
        dbQuestion.publishedAt instanceof Date
          ? dbQuestion.publishedAt.toISOString()
          : dbQuestion.publishedAt,
    }),
    ...(dbQuestion.deletedAt && {
      deletedAt:
        dbQuestion.deletedAt instanceof Date
          ? dbQuestion.deletedAt.toISOString()
          : dbQuestion.deletedAt,
    }),
    ...(dbQuestion.authorId && { authorId: dbQuestion.authorId }),
    // Handle answers count if available
    answersCount: dbQuestion.answers?.length ?? 0,
  };
}

// Batch mapper for collections
export function mapQuestionsToDTO(
  questions: QuestionWithAnswers[]
): QuestionDTO[] {
  return questions.map(mapQuestionToDTO);
}

// Safe mapper with error handling that uses our Result pattern
export function safeMapQuestionToDTO(question: unknown) {
  try {
    // Type guard validation
    if (!isValidQuestionModel(question)) {
      return ResultHandler.failure(
        "Invalid question data structure",
        Errors.VALIDATION_ERROR
      );
    }

    const mapped = mapQuestionToDTO(question);
    return ResultHandler.success(mapped);
  } catch (error) {
    return ResultHandler.failure(
      `Mapping failed: ${error}`,
      Errors.INTERNAL_SERVER_ERROR
    );
  }
}

// Enhanced type guard helper that validates against schema structure
function isValidQuestionModel(data: unknown): data is QuestionWithAnswers {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "question" in data &&
    "status" in data &&
    "createdAt" in data &&
    // Validate status enum values
    ["draft", "published", "archived", "deleted"].includes(
      (data as any).status
    ) &&
    // Validate authorId is string if present (better-auth user IDs)
    (!("authorId" in data) || typeof (data as any).authorId === "string")
  );
}

// Helper function to handle soft-deleted questions
export function filterActiveQuestions(
  questions: QuestionWithAnswers[]
): QuestionWithAnswers[] {
  return questions.filter((question) => !question.deletedAt);
}

// Helper function to check if question is published
export function isQuestionPublished(question: QuestionWithAnswers): boolean {
  return question.status === "published" && question.publishedAt !== null;
}
