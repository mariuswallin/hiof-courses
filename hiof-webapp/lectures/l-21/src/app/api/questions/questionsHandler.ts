// src/api/questions/questionsHandler.ts

import { questionRepository } from "./questionsRepository";

import {
  QuestionFilterSchema,
  QuestionParamsSchema,
  QuestionCreateSchema,
  QuestionUpdateSchema,
} from "@/app/lib/schema/questions";
import {
  createSuccessResponse,
  createErrorResponse,
  codeToStatus,
} from "@/app/lib/response";
import { Errors } from "@/app/types/errors";
import type { RequestInfo } from "rwsdk/worker";

// GET: /api/v1/questions => List all questions
export async function listQuestions(ctx: RequestInfo) {
  try {
    const url = new URL(ctx.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = QuestionFilterSchema.parse(queryParams);

    const result = await questionRepository.findMany(validatedParams);

    if (!result.success) {
      const { error } = result;
      const { message, code } = error;
      return createErrorResponse(
        code || Errors.INTERNAL_SERVER_ERROR,
        message,
        codeToStatus(code)
      );
    }

    const { data } = result;
    const { pagination, questions } = data;

    return createSuccessResponse({ data: questions, pagination });
  } catch (error) {
    console.error(`Error in listQuestions:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}

// GET: /api/v1/questions/:id => Get a specific question by ID
export async function getQuestionById(ctx: RequestInfo) {
  try {
    const validatedParams = QuestionParamsSchema.parse(ctx.params);
    const { id } = validatedParams;

    const result = await questionRepository.findById(id);

    if (!result.success) {
      const { error } = result;
      const { message, code } = error;
      return createErrorResponse(
        code || Errors.INTERNAL_SERVER_ERROR,
        message,
        codeToStatus(code)
      );
    }

    if (!result.data) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error(`Error in getQuestionById:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}

// POST: /api/v1/questions => Create a new question
export async function createQuestionsHandler(ctx: RequestInfo) {
  try {
    const requestData = await ctx.request.json();
    const validatedData = QuestionCreateSchema.parse(requestData);

    const result = await questionRepository.create(validatedData);

    if (!result.success) {
      const { error } = result;
      const { message, code } = error;
      return createErrorResponse(
        code || Errors.INTERNAL_SERVER_ERROR,
        message,
        codeToStatus(code)
      );
    }

    return createSuccessResponse({ data: result.data, status: 201 });
  } catch (error) {
    console.error(`Error in createQuestionsHandler:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}

// PUT/PATCH: /api/v1/questions/:id => Update a specific question
export async function updateQuestionHandler(ctx: RequestInfo) {
  try {
    const validatedParams = QuestionParamsSchema.parse(ctx.params);
    const { id } = validatedParams;

    const requestData = await ctx.request.json();
    const validatedData = QuestionUpdateSchema.parse(requestData);

    const result = await questionRepository.update(id, validatedData);

    if (!result.success) {
      const { error } = result;
      const { message, code } = error;
      return createErrorResponse(
        code || Errors.INTERNAL_SERVER_ERROR,
        message,
        codeToStatus(code)
      );
    }

    if (!result.data) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error(`Error in updateQuestionHandler:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}

// DELETE: /api/v1/questions/:id => Delete a specific question
export async function deleteQuestionHandler(ctx: RequestInfo) {
  try {
    const validatedParams = QuestionParamsSchema.parse(ctx.params);
    const { id } = validatedParams;

    const result = await questionRepository.remove(id);

    if (!result.success) {
      const { error } = result;
      const { message, code } = error;
      return createErrorResponse(
        code || Errors.INTERNAL_SERVER_ERROR,
        message,
        codeToStatus(code)
      );
    }

    return createSuccessResponse({
      data: null,
      status: 204,
    });
  } catch (error) {
    console.error(`Error in deleteQuestionHandler:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}

// POST: /api/v1/questions/:id/publish => Publish a specific question
export async function publishQuestionHandler(ctx: RequestInfo) {
  try {
    const validatedParams = QuestionParamsSchema.parse(ctx.params);
    const { id } = validatedParams;

    const result = await questionRepository.publish(id);

    if (!result.success) {
      const { error } = result;
      const { message, code } = error;
      return createErrorResponse(
        code || Errors.INTERNAL_SERVER_ERROR,
        message,
        codeToStatus(code)
      );
    }

    if (!result.data) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error(`Error in publishQuestionHandler:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}
