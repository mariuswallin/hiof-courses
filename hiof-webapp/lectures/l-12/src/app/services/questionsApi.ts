// /app/services/questionsApi.ts

import type { Question } from "../types/core";
import { questions } from "../data/questions";

// Type for query params for filtering and pagination
interface GetQuestionsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface Pagination {
  limit: number;
  page: number;
  pages: number;
  total: number;
}

// Type for response from getQuestions - ready for pagination and filtering
interface GetQuestionsResponse extends Pagination {
  data: Question[];
}

// Get questions with optional filtering and pagination
export async function listQuestions(
  params: GetQuestionsParams = {},
  signal?: AbortSignal
): Promise<GetQuestionsResponse> {
  return new Promise((resolve, reject) => {
    // Check whether the request was aborted
    if (signal?.aborted) {
      reject(new DOMException("Request was aborted", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(() => {
      // Simulate the API failing
      const shouldFail = Math.random() < 0.1; // 10% chance of failure

      if (shouldFail) {
        reject(new Error("Nettverksfeil: Kunne ikke koble til server"));
        return;
      }

      // Simulate filtering based on the parameters
      let filteredQuestions = questions;

      // Search
      if (params.search) {
        filteredQuestions = filteredQuestions.filter((q) =>
          q.question.toLowerCase().includes((params.search ?? "").toLowerCase())
        );
      }

      // Status filtering
      if (params.status) {
        filteredQuestions = filteredQuestions.filter(
          (q) =>
            q.status?.toLowerCase() ===
            (params.status ? params.status.toLowerCase() : "")
        );
      }

      // Simulate pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

      resolve({
        limit,
        data: paginatedQuestions,
        total: filteredQuestions.length,
        page,
        pages: Math.ceil(filteredQuestions.length / limit),
      });
    }, 1000 + Math.random() * 1000); // 1-2 seconds delay

    // Cleanup on abort
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Request was aborted", "AbortError"));
      });
    }
  });
}

// Get a specific question by ID
export async function getQuestionById(
  id: string,
  signal?: AbortSignal
): Promise<Question> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request was aborted", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(() => {
      // Get the question by ID
      const question = questions.find((q) => q.id === id);

      if (!question) {
        reject(new Error(`Spørsmål med ID ${id} ble ikke funnet`));
        return;
      }

      resolve(question);
    }, 800);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Request was aborted", "AbortError"));
      });
    }
  });
}
