// /app/services/api/questions.ts

// imports the client created in the lib folder based on clientFactory
import client from "@/app/lib/client";
import { buildQueryString } from "@/app/lib/params";
import { ResultHandler } from "@/app/lib/result";
import type { Client } from "@/app/types/client";
import type {
  CreateQuestionParams,
  GetQuestionsParams,
  Question,
  UpdateQuestionParams,
} from "@/app/types/question";
import type { Result } from "@/app/types/result";

// Could be extracted to a config file.
const URL = "/api/v1/questions";

// Interface for Questions Client
interface IQuestionsClient {
  list(params?: GetQuestionsParams): Promise<Result<Question[]>>;
  getById(id: string): Promise<Result<Question>>;
  create(params: CreateQuestionParams): Promise<Result<Question>>;
  update(id: string, params: UpdateQuestionParams): Promise<Result<Question>>;
  delete(id: string): Promise<Result<void>>;
}

/**
 * Factory function to create Questions Client
 */
function createQuestionsClient(client: Client): IQuestionsClient {
  return {
    /**
     * Fetch list of questions with pagination and filtering
     */
    async list(params): Promise<Result<Question[]>> {
      try {
        const queryString = buildQueryString(params ?? {});
        const url = `${URL}${queryString}`;

        return client.get<Question[]>({ url });
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
    async getById(id): Promise<Result<Question>> {
      try {
        if (!id) {
          return ResultHandler.failure(
            "Question ID is required",
            "BAD_REQUEST"
          );
        }

        return client.get<Question>({
          url: `${URL}/${id}`,
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
    async create(params): Promise<Result<Question>> {
      try {
        if (!params.question || !params.status) {
          return ResultHandler.failure(
            "Question and status are required",
            "BAD_REQUEST"
          );
        }

        return client.post<Question>({
          url: URL,
          body: params,
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
    async update(
      id: string,
      params: UpdateQuestionParams
    ): Promise<Result<Question>> {
      try {
        if (!id) {
          return ResultHandler.failure(
            "Question ID is required",
            "BAD_REQUEST"
          );
        }

        return client.put<Question>({
          url: `${URL}/${id}`,
          body: params,
        });
      } catch (error) {
        return ResultHandler.failure(
          error instanceof Error ? error.message : "Unknown error occurred",
          "INTERNAL_SERVER_ERROR"
        );
      }
    },

    /**
     * Delete a question
     */
    async delete(id: string): Promise<Result<void>> {
      try {
        if (!id) {
          return ResultHandler.failure(
            "Question ID is required",
            "BAD_REQUEST"
          );
        }

        return await client.delete<void>({
          url: `${URL}/${id}`,
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

// Create and export the default questions client instance
export const questionsClient = createQuestionsClient(client);

// Export the interface and factory for testing or custom implementations
export { createQuestionsClient, type IQuestionsClient };
