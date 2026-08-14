// src/app/api/questions/questionsController.ts

import {
  QuestionFilterSchema,
  QuestionParamsSchema,
  QuestionUpdateSchema,
} from "@/app/lib/schema/questions";
import {
  createSuccessResponse,
  createErrorResponse,
  codeToStatus,
} from "@/app/lib/utils/response";
import { Errors } from "@/app/types/errors";
import type { RequestInfo } from "rwsdk/worker";
import { questionService, type QuestionService } from "./questionsService";
import z from "zod";
import { CreateQuestionDTOSchema } from "@/app/lib/schema/questions/question-dtos";

export function createQuestionController(questionService: QuestionService) {
  return {
    // GET: /api/v1/questions => List all questions
    async listQuestions(context: RequestInfo) {
      try {
        // Parse and validate HTTP query parameters
        const url = new URL(context.request.url);
        const queryParams = Object.fromEntries(url.searchParams);
        // Could live in the service, but keeping it here gives IntelliSense on the types.
        const validatedParams = QuestionFilterSchema.parse(queryParams);

        // Delegate to service layer
        const result = await questionService.list(validatedParams);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return createErrorResponse(
            code || Errors.INTERNAL_SERVER_ERROR,
            message,
            codeToStatus(code)
          );
        }

        // Format HTTP response
        return createSuccessResponse({
          data: result.data.questions,
          pagination: result.data.pagination,
        });
      } catch (error) {
        console.error(`Error in listQuestions:`, error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
          return createErrorResponse(
            Errors.VALIDATION_ERROR,
            "Invalid query parameters",
            400
          );
        }

        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred. Please try again later.",
          500
        );
      }
    },

    // GET: /api/v1/questions/:id => Get a specific question by ID
    async getQuestionById(ctx: RequestInfo) {
      try {
        // Extract and validate route parameters
        const validatedParams = QuestionParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        // Delegate to service layer
        const result = await questionService.get(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return createErrorResponse(
            code || Errors.INTERNAL_SERVER_ERROR,
            message,
            codeToStatus(code)
          );
        }

        // Format HTTP response
        return createSuccessResponse({ data: result.data });
      } catch (error) {
        console.error(`Error in getQuestionById:`, error);
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred. Please try again later.",
          500
        );
      }
    },

    // POST: /api/v1/questions => Create a new question
    async createQuestion(ctx: RequestInfo) {
      try {
        // Parse and validate HTTP request body
        const requestData = await ctx.request.json();
        // Could live in the service, but keeping it here gives IntelliSense on the types.
        const validatedData = CreateQuestionDTOSchema.parse(requestData);

        // Delegate to service layer
        // Service already returns validated data through mappers
        const result = await questionService.create(validatedData);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return createErrorResponse(
            code || Errors.INTERNAL_SERVER_ERROR,
            message,
            codeToStatus(code)
          );
        }

        // Could verify the agreed contract in controller

        //  try {
        //    validateServerContract(result.data, QuestionDTOSchema);
        //  } catch (contractError) {
        //    console.error(
        //      "Contract violation in createQuestion:",
        //      contractError
        //    );
        //    return createErrorResponse(
        //      Errors.INTERNAL_SERVER_ERROR,
        //      "Internal data format error",
        //      500
        //    );
        //  }

        // Format HTTP response for creation
        return createSuccessResponse({ data: result.data, status: 201 });
      } catch (error) {
        console.error(`Error in createQuestion:`, error);

        // Handle JSON parsing errors. Could be generalized.
        if (error instanceof SyntaxError) {
          return createErrorResponse(
            Errors.VALIDATION_ERROR,
            "Invalid JSON in request body",
            400
          );
        }

        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred. Please try again later.",
          500
        );
      }
    },

    // PUT/PATCH: /api/v1/questions/:id => Update a specific question
    async updateQuestion(ctx: RequestInfo) {
      try {
        // Extract route parameters
        const validatedParams = QuestionParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        // Parse request body
        const requestData = await ctx.request.json();
        const validatedData = QuestionUpdateSchema.parse(requestData);

        // Delegate to service layer
        const result = await questionService.update(id, validatedData);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return createErrorResponse(
            code || Errors.INTERNAL_SERVER_ERROR,
            message,
            codeToStatus(code)
          );
        }

        // Format HTTP response
        return createSuccessResponse({ data: result.data });
      } catch (error) {
        console.error(`Error in updateQuestion:`, error);
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred. Please try again later.",
          500
        );
      }
    },

    // DELETE: /api/v1/questions/:id => Delete a specific question
    async deleteQuestion(ctx: RequestInfo) {
      try {
        // Extract route parameters
        const validatedParams = QuestionParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        // Delegate to service layer
        const result = await questionService.remove(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return createErrorResponse(
            code || Errors.INTERNAL_SERVER_ERROR,
            message,
            codeToStatus(code)
          );
        }

        // 204 No Content for successful deletion
        return createSuccessResponse({ data: null, status: 204 });
      } catch (error) {
        console.error(`Error in deleteQuestion:`, error);
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred. Please try again later.",
          500
        );
      }
    },

    // POST: /api/v1/questions/:id/publish => Publish a specific question
    async publishQuestion(ctx: RequestInfo) {
      try {
        // Extract route parameters
        const validatedParams = QuestionParamsSchema.parse(ctx.params);
        const { id } = validatedParams;

        // Delegate to service layer
        const result = await questionService.publish(id);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return createErrorResponse(
            code || Errors.INTERNAL_SERVER_ERROR,
            message,
            codeToStatus(code)
          );
        }

        // Format HTTP response
        return createSuccessResponse({ data: result.data });
      } catch (error) {
        console.error(`Error in publishQuestion:`, error);
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred. Please try again later.",
          500
        );
      }
    },
  };
}

export const questionController = createQuestionController(questionService);
