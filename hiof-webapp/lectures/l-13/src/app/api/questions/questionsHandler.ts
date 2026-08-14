// /src/api/questions/questionsHandler.ts

import { createErrorResponse, createSuccessResponse } from "../../lib/response";
import { Errors } from "../../types/errors";
import { questions } from "../../data/questions";
import { parsePaginationParams, parseQueryParams } from "../../lib/params";

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

export async function getQuestionById({ params }: { params: { id: string } }) {
  try {
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
