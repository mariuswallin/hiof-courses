// /src/api/questions/questionsHandler.ts

import { createErrorResponse, createSuccessResponse } from "../../lib/response";
import { Errors } from "../../types/errors";
import { questions } from "../../data/questions";
import { parsePaginationParams, parseQueryParams } from "../../lib/params";
import type { RequestInfo } from "rwsdk/worker";
import { QuestionStatus, type Question } from "@/app/types/question";

// GET: /api/v1/questions => List all questions
export async function listQuestions({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);

    // Validate pagination parameters
    const { page, limit } = parsePaginationParams(url);

    // Parse query parameters
    const queryParams = parseQueryParams(url.searchParams, [
      "search",
      "status",
    ]);

    const { search, status } = queryParams;

    let filteredQuestions = questions;

    // For more complex filtering, use an object of handlers or a switch instead.

    // Apply search filter
    if (search && search.length > 0) {
      const searchTerm = search[0].toLowerCase();
      filteredQuestions = filteredQuestions.filter((q) =>
        q.question.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (status && status.length > 0) {
      filteredQuestions = filteredQuestions.filter(
        (q) => status.includes(q.status) || status.includes("all")
      );
    }

    // Calculate pagination
    const total = filteredQuestions.length;
    const offset = (page - 1) * limit;
    const paginatedQuestions = filteredQuestions.slice(offset, offset + limit);

    // Use the standardized success response
    return createSuccessResponse({
      data: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(`Error in getQuestionsHandler:`, error);
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
    const { params } = ctx;
    const { id } = params;

    if (!id) {
      return createErrorResponse(
        Errors.BAD_REQUEST,
        "Question ID is required",
        400
      );
    }

    const question = questions.find((q) => q.id === id);

    if (!question) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    return createSuccessResponse({ data: question });
  } catch (error) {
    console.error(`Error in getQuestionByIdHandler:`, error);
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
    const { request } = ctx;
    // Not validated yet — should use a Zod schema.
    const data = (await request.json()) as Partial<Question>;

    if (!data || !data.question) {
      return createErrorResponse(
        Errors.BAD_REQUEST,
        "Question content is required",
        400
      );
    }

    // Create a new question object
    const newQuestion = {
      id: crypto.randomUUID(),
      question: data.question,
      status: data.status ?? QuestionStatus.DRAFT,
      createdAt: new Date(),
      answers: [],
    };

    questions.push(newQuestion);

    return createSuccessResponse({ data: newQuestion, status: 201 });
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
    const { request, params } = ctx;
    const { id } = params;

    if (!id) {
      return createErrorResponse(
        Errors.BAD_REQUEST,
        "Question ID is required",
        400
      );
    }

    const questionIndex = questions.findIndex((q) => q.id === id);

    if (questionIndex === -1) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    const data = (await request.json()) as Partial<Question>;

    // Update the question with the provided data
    const updatedQuestion = {
      ...questions[questionIndex],
      ...data,
      updatedAt: new Date(),
    };

    questions[questionIndex] = updatedQuestion;

    return createSuccessResponse({ data: updatedQuestion });
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
    const { params } = ctx;
    const { id } = params;

    if (!id) {
      return createErrorResponse(
        Errors.BAD_REQUEST,
        "Question ID is required",
        400
      );
    }

    const question = questions.find((q) => q.id === id);
    if (!question) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    // Soft delete the question by setting the deletedAt field
    question.deletedAt = new Date();
    question.status = QuestionStatus.DELETED;

    return createSuccessResponse({
      data: { message: "Question deleted successfully" },
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
    const { params } = ctx;
    const { id } = params;

    if (!id) {
      return createErrorResponse(
        Errors.BAD_REQUEST,
        "Question ID is required",
        400
      );
    }

    const questionIndex = questions.findIndex((q) => q.id === id);

    if (questionIndex === -1) {
      return createErrorResponse(Errors.NOT_FOUND, "Question not found", 404);
    }

    // Update the question status to PUBLISHED
    questions[questionIndex].status = QuestionStatus.PUBLISHED;
    questions[questionIndex].publishedAt = new Date();

    return createSuccessResponse({ data: questions[questionIndex] });
  } catch (error) {
    console.error(`Error in publishQuestionHandler:`, error);
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      500
    );
  }
}
