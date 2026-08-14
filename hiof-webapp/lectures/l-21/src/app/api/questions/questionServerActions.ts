"use server";

// src/app/api/questions/questionServerActions.ts

import {
  mapCreateQuestionDTOToDomain,
  mapQuestionToDTO,
} from "@/app/lib/mappers/questions";
import {
  CreateQuestionDTOSchema,
  type QuestionDTO,
} from "@/app/lib/schema/questions/dtos";
import { Errors } from "@/app/types/errors";
import type { ServerResult } from "@/app/types/result";

import { questionService } from "./questionsService";
import z from "zod";
import { QuestionUpdateSchema } from "@/app/lib/schema/questions";
import { getDb } from "@/db";

import { answers } from "@/db/schema";
import type { AnswerDetailDTO } from "@/app/lib/schema/answers/dtos";
import { mapAnswerToDTO } from "@/app/lib/mappers/answers";

// Create Question Action
export async function createQuestionAction(
  prevState: any,
  formData: FormData
): Promise<ServerResult<QuestionDTO>> {
  try {
    // Parse form data
    const rawData = {
      question: formData.get("question") as string,
      status: (formData.get("status") as string) || "draft",
      authorId: formData.get("authorId"),
    };

    // Validate with Zod
    const validation = CreateQuestionDTOSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: "Valideringsfeil",
        code: Errors.VALIDATION_ERROR,
        fieldErrors: z.flattenError(validation.error).fieldErrors,
        state: rawData,
      };
    }

    const dto = validation.data;
    const domainInput = mapCreateQuestionDTOToDomain(dto);
    const result = await questionService.create(domainInput);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.code,
        state: rawData,
      };
    }

    const mappedResult = mapQuestionToDTO(result.data);

    return {
      success: true,
      data: mappedResult,
    };
  } catch (error) {
    console.error("Error in createQuestionAction:", error);
    return {
      success: false,
      error: "Failed to create question",
      code: Errors.INTERNAL_SERVER_ERROR,
      state: Object.fromEntries(formData.entries()),
    };
  }
}

// Update Question Action (for edit)
export async function updateQuestionAction(
  prevState: any,
  formData: FormData
): Promise<ServerResult<QuestionDTO>> {
  try {
    const id = formData.get("id") as string;

    const rawData = {
      id,
      question: formData.get("question") as string,
      status: formData.get("status") as string,
    };
    const isPublishing =
      rawData.status === "published" && prevState?.status !== rawData.status;

    // Validate with Zod
    const validation = QuestionUpdateSchema.safeParse(
      isPublishing ? { ...rawData, publishedAt: new Date() } : rawData
    );

    if (!validation.success) {
      return {
        success: false,
        error: "Valideringsfeil",
        code: Errors.VALIDATION_ERROR,
        fieldErrors: z.flattenError(validation.error).fieldErrors,
        state: rawData,
      };
    }

    const data = validation.data;

    const result = await questionService.update(id, data);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.code,
        state: rawData,
      };
    }

    const mappedResult = mapQuestionToDTO(result.data);

    return { success: true, data: mappedResult };
  } catch (error) {
    console.error("Error in updateQuestionAction:", error);
    return {
      success: false,
      error: "Failed to update question",
      code: Errors.INTERNAL_SERVER_ERROR,
      state: Object.fromEntries(formData.entries()),
    };
  }
}

// Delete Question Action
export async function deleteQuestionAction(
  formData: FormData
): Promise<ServerResult<void>> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return {
        success: false,
        error: "Question ID is required",
        code: Errors.VALIDATION_ERROR,
      };
    }

    await questionService.remove(id);
    return {
      success: true,
      data: undefined, // No data to return on delete
    };
  } catch (error) {
    console.error("Error in deleteQuestionAction:", error);
    return {
      success: false,
      error: "Failed to delete question",
      code: Errors.INTERNAL_SERVER_ERROR,
    };
  }
}

// Create Answer Action

// Belongs in its own file, with proper DTO mapping.

export async function createAnswerAction(
  prevState: any,
  formData: FormData
): Promise<ServerResult<AnswerDetailDTO>> {
  try {
    const rawData = {
      questionId: formData.get("questionId") as string,
      answer: formData.get("answer") as string,
      authorId: formData.get("authorId"),
    };

    // ... validate with dto
    // ... use service
    const db = await getDb();
    const [result] = await db
      .insert(answers)
      .values({
        questionId: rawData.questionId,
        answer: rawData.answer,
        authorId: Number(rawData.authorId),
      })
      .returning();

    const data = mapAnswerToDTO(result);

    return { success: true, data };
  } catch (error) {
    console.error("Error in createAnswerAction:", error);
    return {
      success: false,
      error: "Failed to create answer",
      code: Errors.INTERNAL_SERVER_ERROR,
      state: Object.fromEntries(formData.entries()),
    };
  }
}
