// src/api/questions/questionsRepository.ts

import { and, asc, count, desc, eq, isNull, like } from "drizzle-orm";

import { db, type DB } from "@/db";
import {
  questions,
  answers,
  type Question,
  type Answer,
} from "@/db/schema";
import type {
  QuestionCreateInput,
  QuestionUpdateInput,
  QuestionQueryInput,
} from "@/app/lib/schema/questions";
import { ResultHandler } from "@/app/lib/result";
import { Errors } from "@/app/types/errors";
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
      try {
        const page = params?.page && params.page > 0 ? params.page : 1;
        const limit =
          params?.limit && params.limit > 0 && params.limit <= 500
            ? params.limit
            : 100;
        const offset = (page - 1) * limit;

        const conditions = [isNull(questions.deletedAt)];
        if (params?.search) {
          conditions.push(like(questions.question, `%${params.search}%`));
        }
        const whereClause = and(...conditions);
        const orderBy =
          params?.sortOrder === "asc"
            ? asc(questions.createdAt)
            : desc(questions.createdAt);

        const [countResult, rows] = await Promise.all([
          db.select({ count: count() }).from(questions).where(whereClause),
          db
            .select({ question: questions, answer: answers })
            .from(questions)
            .leftJoin(answers, eq(answers.questionId, questions.id))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset),
        ]);

        const questionMap = rows.reduce<Record<string, QuestionWithAnswers>>(
          (acc, row) => {
            const q = row.question;
            if (!acc[q.id]) acc[q.id] = { ...q, answers: [] };
            if (row.answer) acc[q.id].answers.push(row.answer);
            return acc;
          },
          {}
        );

        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);

        return ResultHandler.success({
          questions: Object.values(questionMap),
          pagination: {
            page,
            limit,
            total,
            pages: totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      } catch (error) {
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async findById(id) {
      try {
        const rows = await db
          .select({ question: questions, answer: answers })
          .from(questions)
          .leftJoin(answers, eq(answers.questionId, questions.id))
          .where(eq(questions.id, id));

        if (rows.length === 0) return ResultHandler.success(null);

        const question = rows[0].question;
        const questionAnswers = rows
          .map((r) => r.answer)
          .filter((a): a is Answer => a !== null);

        return ResultHandler.success({
          ...question,
          answers: questionAnswers,
        });
      } catch (error) {
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async create(data) {
      try {
        const [newQuestion] = await db
          .insert(questions)
          .values({
            question: data.question,
            status: data.status || "draft",
          })
          .returning();
        return ResultHandler.success(newQuestion);
      } catch (error) {
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async update(id, data) {
      try {
        const updateData: Partial<typeof questions.$inferInsert> = {};
        if (data.question !== undefined) updateData.question = data.question;
        if (data.status !== undefined) updateData.status = data.status;

        const [updated] = await db
          .update(questions)
          .set(updateData)
          .where(eq(questions.id, id))
          .returning();
        return ResultHandler.success(updated ?? null);
      } catch (error) {
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async remove(id) {
      try {
        const [deleted] = await db
          .delete(questions)
          .where(eq(questions.id, id))
          .returning({ id: questions.id });
        if (!deleted) {
          return ResultHandler.failure("Question not found", Errors.NOT_FOUND);
        }
        return ResultHandler.success(undefined);
      } catch (error) {
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async publish(id) {
      try {
        const [published] = await db
          .update(questions)
          .set({ status: "published", publishedAt: new Date() })
          .where(eq(questions.id, id))
          .returning();
        return ResultHandler.success(published ?? null);
      } catch (error) {
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
      }
    },
  };
}

// Singleton — uses the `db` export directly (no factory/setupDb here).
export const questionRepository = createQuestionRepository(db);
