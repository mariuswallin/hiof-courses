// src/app/services/questionService.ts

import { z } from "zod";
import {
  QuestionCreateSchema,
  QuestionUpdateSchema,
  type QuestionQueryInput,
} from "@/app/lib/schema/questions";
import { questionRepository } from "@/app/api/questions/questionsRepository";
import { ResultHandler } from "@/app/lib/result";
import { Errors } from "@/app/types/errors";
import type { Result } from "@/app/types/result";
import type {
  QuestionRepository,
  QuestionWithAnswers,
} from "@/app/api/questions/questionsRepository";
import type { Pagination } from "@/app/types/api";
import type { CreateQuestionParams } from "@/app/types/question";

// Extended validation schemas for business rules
const createQuestionBusinessSchema = QuestionCreateSchema.refine(
  (data) => {
    // Business rule: Check for inappropriate content
    const inappropriateWords = ["spam", "test123", "dummy"];
    const hasInappropriateContent = inappropriateWords.some((word) =>
      data.question.toLowerCase().includes(word)
    );
    return !hasInappropriateContent;
  },
  {
    message: "Content contains inappropriate words",
  }
);

// A generic interface could enforce the same base methods everywhere.
export interface QuestionService {
  list(params?: QuestionQueryInput): Promise<
    Result<{
      questions: QuestionWithAnswers[];
      pagination: Pagination;
    }>
  >;
  get(id: string): Promise<Result<QuestionWithAnswers>>;
  create(input: CreateQuestionParams): Promise<Result<QuestionWithAnswers>>;
  update(
    id: string,
    input: { question?: string; status?: string }
  ): Promise<Result<QuestionWithAnswers>>;
  remove(id: string): Promise<Result<void>>;
  publish(id: string): Promise<Result<QuestionWithAnswers>>;
}

export function createQuestionService(
  questionRepository: QuestionRepository
): QuestionService {
  return {
    async list(params?: QuestionQueryInput) {
      // Business logic: Apply default filtering rules
      const result = await questionRepository.findMany(params);

      if (!result.success) {
        return ResultHandler.failure(
          result.error,
          Errors.INTERNAL_SERVER_ERROR
        );
      }

      // Business logic - validate user permissions (may need UserService)
      // Business logic - validate question visibility
      // Business logic - validate question meta rules (if any)

      return ResultHandler.success({
        questions: result.data.questions,
        pagination: result.data.pagination,
      });
    },

    async get(id: string) {
      // Validate ID format
      if (id.length < 1) {
        return ResultHandler.failure(
          "Invalid question ID",
          Errors.VALIDATION_ERROR
        );
      }

      const result = await questionRepository.findById(id);

      if (!result.success) {
        return ResultHandler.failure(
          result.error,
          Errors.INTERNAL_SERVER_ERROR
        );
      }

      if (!result.data) {
        return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
      }

      // Business logic: Check if question is accessible (not really needed since we exclude deleted)
      if (result.data.status === "deleted") {
        return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
      }

      return ResultHandler.success(result.data);
    },

    async create(input: { question: string; status?: string }) {
      try {
        // Validate input with business rules
        const validatedInput = createQuestionBusinessSchema.parse(input);

        // Business rule: Check for duplicate questions

        const existingQuestions = await questionRepository.findMany({
          search: validatedInput.question,
          limit: 100,
        });

        // Could use AI to judge similarity, or strip stop words, sort by length and
        // compare.
        const isDuplicateQuestion = (
          questions: QuestionWithAnswers[],
          question: string,
          threshold = 3
        ) => {
          const questionsTexts = questions.map((q) =>
            q.question.toLowerCase().trim().split(" ").sort()
          );
          const bText = question.toLowerCase().trim().split(" ").sort();
          let matches = 0;

          for (const words of questionsTexts) {
            for (const [index, word] of words.entries()) {
              if (bText[index] === word) {
                matches++;
              }
            }
          }

          return matches > threshold;
        };

        if (existingQuestions.success) {
          const isDuplicate = isDuplicateQuestion(
            existingQuestions.data.questions,
            validatedInput.question
          );

          if (isDuplicate) {
            return ResultHandler.failure(
              "A question with similar text already exists",
              Errors.CONFLICT
            );
          }
        }

        const result = await questionRepository.create(validatedInput);

        if (!result.success) {
          return ResultHandler.failure(
            result.error,
            Errors.INTERNAL_SERVER_ERROR
          );
        }

        // Convert to QuestionWithAnswers format
        const questionWithAnswers: QuestionWithAnswers = {
          ...result.data,
          answers: [],
        };

        return ResultHandler.success(questionWithAnswers);
      } catch (error) {
        // Could be generalized.
        if (error instanceof z.ZodError) {
          return ResultHandler.failure(
            `Validation failed: ${z.flattenError(error)}`,
            Errors.BAD_REQUEST
          );
        }
        return ResultHandler.failure(
          "Failed to create question",
          Errors.INTERNAL_SERVER_ERROR
        );
      }
    },

    async update(id: string, input: { question?: string; status?: string }) {
      try {
        // Business rule: Check if question exists first
        const existingResult = await questionRepository.findById(id);
        if (!existingResult.success || !existingResult.data) {
          return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
        }

        // Business rule: Prevent updating deleted questions
        if (existingResult.data.status === "deleted") {
          return ResultHandler.failure(
            "Cannot update deleted question",
            Errors.VALIDATION_ERROR
          );
        }

        const validatedData = QuestionUpdateSchema.parse(input);

        // Validate update input if question text is being changed
        // Verify if isDuplicate

        const result = await questionRepository.update(id, validatedData);

        if (!result.success) {
          return ResultHandler.failure(
            result.error,
            Errors.INTERNAL_SERVER_ERROR
          );
        }

        if (!result.data) {
          return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
        }

        // Convert to QuestionWithAnswers format
        const questionWithAnswers: QuestionWithAnswers = {
          ...result.data,
          answers: existingResult.data.answers, // Keep existing answers
        };

        return ResultHandler.success(questionWithAnswers);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return ResultHandler.failure(
            `Validation failed: ${z.flattenError(error)}`,
            Errors.BAD_REQUEST
          );
        }
        return ResultHandler.failure(
          "Failed to update question",
          Errors.INTERNAL_SERVER_ERROR
        );
      }
    },

    async remove(id: string) {
      // Business rule: Check if question exists
      const existingResult = await questionRepository.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
      }

      // Business rule: prevent deletion of published questions with many answers.
      // Could be extracted into a rules object for reuse.
      if (
        existingResult.data.status === "published" &&
        existingResult.data.answers.length > 5
      ) {
        return ResultHandler.failure(
          "Cannot delete published questions with more than 5 answers",
          Errors.VALIDATION_ERROR
        );
      }

      const result = await questionRepository.remove(id);

      if (!result.success) {
        return ResultHandler.failure(
          result.error,
          Errors.INTERNAL_SERVER_ERROR
        );
      }

      return ResultHandler.success(undefined);
    },

    async publish(id: string) {
      // Business rule: Check if question exists and is ready for publishing
      const existingResult = await questionRepository.findById(id);
      if (!existingResult.success || !existingResult.data) {
        return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
      }

      // Business rule: Question must be in draft status to publish
      if (existingResult.data.status !== "draft") {
        return ResultHandler.failure(
          "Only draft questions can be published",
          Errors.VALIDATION_ERROR
        );
      }

      // Business rule: Question must have author to be published
      if (!existingResult.data.authorId) {
        return ResultHandler.failure(
          "Question must have an author to be published",
          Errors.BAD_REQUEST
        );
      }

      if (existingResult.data.answers.length < 3) {
        return ResultHandler.failure(
          "Question must have at least 3 answers to be published",
          Errors.BAD_REQUEST
        );
      }

      const result = await questionRepository.publish(id);

      if (!result.success) {
        return ResultHandler.failure(
          result.error,
          Errors.INTERNAL_SERVER_ERROR
        );
      }

      if (!result.data) {
        return ResultHandler.failure(
          "Failed to publish question",
          Errors.INTERNAL_SERVER_ERROR
        );
      }

      return ResultHandler.success({
        ...existingResult.data,
        publishedAt: result.data.publishedAt,
      });
    },
  };
}

// Singleton instance
export const questionService = createQuestionService(questionRepository);
