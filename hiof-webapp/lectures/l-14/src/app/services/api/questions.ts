// /app/services/api/questions.ts

import client from "@/app/lib/client";
import { buildQueryString } from "@/app/lib/params";
import { ResultHandler } from "@/app/lib/result";
import type { BaseService, Client } from "@/app/types/client";
import type {
  CreateQuestionParams,
  QuestionFilters,
  Question,
  UpdateQuestionParams,
} from "@/app/types/question";
import type { Result } from "@/app/types/result";

// Could be extracted to a config file.
const URL = "/api/v1/questions";

// Interface for Questions Client

interface IQuestionsClient
  extends BaseService<
    Question,
    QuestionFilters,
    CreateQuestionParams,
    UpdateQuestionParams
  > {}

/**
 * Factory function to create Questions Client
 */
function createQuestionsClient(client: Client): IQuestionsClient {
  return {
    /**
     * Fetch list of questions with pagination and filtering
     */
    async list({ filters, pagination, options }): Promise<Result<Question[]>> {
      try {
        const queryString = buildQueryString({
          ...filters,
          ...pagination,
        });
        const url = `${URL}${queryString}`;

        return client.get<Question[]>({ url, options });
      } catch (error) {
        return ResultHandler.failure(
          error instanceof Error ? error.message : "Unknown error occurred",
          "INTERNAL_SERVER_ERROR"
        );
      }
    },

    /**
     * Fetch single question by ID
     */
    async get({ identifier: id, options }): Promise<Result<Question>> {
      try {
        if (!id) {
          return ResultHandler.failure(
            "Question ID is required",
            "BAD_REQUEST"
          );
        }

        return client.get<Question>({
          url: `${URL}/${id}`,
          options,
        });
      } catch (error) {
        return ResultHandler.failure(
          error instanceof Error ? error.message : "Unknown error occurred",
          "INTERNAL_SERVER_ERROR"
        );
      }
    },

    /**
     * Create a new question
     */
    async create({ data, options }): Promise<Result<Question>> {
      try {
        if (!data.question || !data.status) {
          return ResultHandler.failure(
            "Question and status are required",
            "BAD_REQUEST"
          );
        }

        return client.post<Question>({
          url: URL,
          body: data,
          options,
        });
      } catch (error) {
        return ResultHandler.failure(
          error instanceof Error ? error.message : "Unknown error occurred",
          "INTERNAL_SERVER_ERROR"
        );
      }
    },

    /**
     * Update an existing question
     */
    async update({ identifier: id, data, options }): Promise<Result<Question>> {
      try {
        if (!id) {
          return ResultHandler.failure(
            "Question ID is required",
            "BAD_REQUEST"
          );
        }

        return client.put<Question>({
          url: `${URL}/${id}`,
          body: data,
          options,
        });
      } catch (error) {
        return ResultHandler.failure(
          error instanceof Error ? error.message : "Unknown error occurred",
          "INTERNAL_SERVER_ERROR"
        );
      }
    },

    /**
     * Remove a question
     */
    async remove({ identifier: id, options }): Promise<Result<void>> {
      try {
        if (!id) {
          return ResultHandler.failure(
            "Question ID is required",
            "BAD_REQUEST"
          );
        }

        return await client.delete<void>({
          url: `${URL}/${id}`,
          options,
        });
      } catch (error) {
        return ResultHandler.failure(
          error instanceof Error ? error.message : "Unknown error occurred",
          "INTERNAL_SERVER_ERROR"
        );
      }
    },
  };
}

export const questionsClient = createQuestionsClient(client);

// Export the interface and factory for testing or custom implementations
export { createQuestionsClient, type IQuestionsClient };
