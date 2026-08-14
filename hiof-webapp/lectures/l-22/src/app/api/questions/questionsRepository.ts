// src/api/questions/questionsRepository.ts

import { eq, count } from "drizzle-orm";
import type { DB } from "@/db";
import { questions, answers, type Question, type Answer } from "@/db/schema";
import type {
  QuestionCreateInput,
  QuestionUpdateInput,
  QuestionQueryInput,
} from "@/app/lib/schema/questions";
import {
  executeDbOperation,
  executePaginatedDbOperation,
} from "@/app/lib/db/operations";
import {
  normalizePaginationParams,
  createPaginationInfo,
} from "@/app/lib/db/pagination";
import { buildQuestionWhereConditions } from "@/app/lib/db/conditions";
import { buildQuestionOrderBy } from "@/app/lib/db/sorting";
import { getDb } from "@/db";
import type { Result } from "@/app/types/result";
import type { Pagination } from "@/app/types/api";

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface QuestionRepository {
  findMany(
    params?: QuestionQueryInput
  ): Promise<
    Result<{ questions: QuestionWithAnswers[]; pagination: Pagination }>
  >;
  findById(id: string): Promise<Result<QuestionWithAnswers | null>>;
  create(data: QuestionCreateInput): Promise<Result<Question>>;
  update(
    id: string,
    data: QuestionUpdateInput
  ): Promise<Result<Question | null>>;
  remove(id: string): Promise<Result<void>>;
  publish(id: string): Promise<Result<Question | null>>;
}

export function createQuestionRepository(db: DB): QuestionRepository {
  return {
    async findMany(params?: QuestionQueryInput) {
      return executePaginatedDbOperation(async () => {
        const { page, limit, offset } = normalizePaginationParams(
          params?.page,
          params?.limit
        );
        const whereClause = buildQuestionWhereConditions(params);
        const orderBy = buildQuestionOrderBy(params);

        // Get total count and paginated data in parallel
        const [countResult, rows] = await Promise.all([
          db.select({ count: count() }).from(questions).where(whereClause),
          db
            .select({
              question: questions,
              answer: answers,
            })
            .from(questions)
            .leftJoin(answers, eq(answers.questionId, questions.id))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset),
        ]);

        // Group answers by question
        const questionMap = rows.reduce<Record<string, QuestionWithAnswers>>(
          (acc, row) => {
            const question = row.question;
            const answer = row.answer;

            if (!acc[question.id]) {
              acc[question.id] = { ...question, answers: [] };
            }

            if (answer) {
              acc[question.id].answers.push(answer);
            }

            return acc;
          },
          {}
        );

        const totalCount = countResult[0].count;
        const pagination = createPaginationInfo(page, limit, totalCount);

        return {
          questions: Object.values(questionMap),
          pagination,
        };
      });
    },

    async findById(id: string) {
      return executeDbOperation(async () => {
        const question = await db.query.questions.findFirst({
          where: (questions, { eq }) => eq(questions.id, id),
          with: {
            answers: true,
          },
        });

        if (!question) {
          return null;
        }

        return question;
      });
    },

    async create(data: QuestionCreateInput) {
      return executeDbOperation(async () => {
        const [newQuestion] = await db
          .insert(questions)
          .values({
            question: data.question,
            status: data.status || "draft",
            authorId: data.authorId,
          })
          .returning();

        return newQuestion;
      });
    },

    async update(id: string, data: QuestionUpdateInput) {
      return executeDbOperation(async () => {
        const updateData: Partial<typeof questions.$inferInsert> = {};

        if (data.question !== undefined) updateData.question = data.question;
        if (data.status !== undefined) updateData.status = data.status;

        const [updatedQuestion] = await db
          .update(questions)
          .set(updateData)
          .where(eq(questions.id, id))
          .returning();

        return updatedQuestion || null;
      });
    },

    async remove(id: string) {
      return executeDbOperation(async () => {
        const [deleted] = await db
          .delete(questions)
          .where(eq(questions.id, id))
          .returning({ id: questions.id });

        if (!deleted) {
          throw new Error("Question not found");
        }

        return undefined;
      });
    },

    async publish(id: string) {
      return executeDbOperation(async () => {
        const [published] = await db
          .update(questions)
          .set({
            status: "published",
            publishedAt: new Date(),
          })
          .where(eq(questions.id, id))
          .returning();

        return published || null;
      });
    },
  };
}

// Singleton instance for direct use
// Need to await db and ensure that it is initialized
export const questionRepository = createQuestionRepository(await getDb());
