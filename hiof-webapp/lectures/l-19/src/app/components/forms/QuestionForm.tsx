// src/app/components/forms/QuestionForm.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type {
  QuestionDetailDTO,
  QuestionDTO,
} from "@/app/lib/schema/questions/dtos";
import {
  createQuestionAction,
  updateQuestionAction,
} from "@/app/api/questions/questionServerActions";

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {pending
        ? isEdit
          ? "Oppdaterer..."
          : "Oppretter..."
        : isEdit
        ? "Oppdater spørsmål"
        : "Opprett spørsmål"}
    </button>
  );
}

interface QuestionFormProps {
  question?: QuestionDetailDTO; // For edit mode
  // onSuccess: () => void; // Would fail since we can not pass function from server to client
}

// This component could be optimized.
export function QuestionForm({ question }: QuestionFormProps) {
  const isEdit = !!question;
  const action = isEdit ? updateQuestionAction : createQuestionAction;

  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: "",
    fieldErrors: {},
    state: question
      ? {
          id: question.id,
          question: question.question,
          status: question.status,
          createdAt: question.createdAt,
        }
      : {},
  });

  const isSuccess = state.success;
  const hasValidationError = !state.success && state.fieldErrors;
  const stateValues = isSuccess ? state.data : null;

  if (isPending) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded"></div>;
  }

  // A general handler would cover this.
  const values: QuestionDTO | null = isEdit
    ? isSuccess
      ? stateValues
      : question
    : stateValues;

  return (
    <div className="space-y-4">
      {/* Error message */}
      {!isSuccess && state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Hidden ID field for edit */}
        {isEdit && <input type="hidden" name="id" value={question?.id} />}

        {/* Question Text */}
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Spørsmålstekst
          </label>
          <textarea
            id="question"
            name="question"
            required
            defaultValue={values?.question || ""}
            className={`mt-1 w-full px-3 py-2 border rounded-md ${
              hasValidationError && state.fieldErrors?.question
                ? "border-red-300"
                : "border-gray-300"
            }`}
            rows={3}
          />
          {hasValidationError && state.fieldErrors?.question && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.question[0]}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={values?.status || "draft"}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="draft">Utkast</option>
            <option value="published">Publisert</option>
          </select>
        </div>

        <SubmitButton isEdit={isEdit} />
      </form>
    </div>
  );
}
