// src/app/components/forms/AnswerForm.tsx
"use client";

import { createAnswerAction } from "@/app/api/questions/questionServerActions";
import type { AnswerDetailDTO } from "@/app/lib/schema/answers/dtos";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? "Legger til..." : "Legg til svar"}
    </button>
  );
}

interface AnswerFormProps {
  questionId: string;
}

// This component could be optimized.
export function AnswerForm({ questionId }: AnswerFormProps) {
  const [state, formAction, isPending] = useActionState(createAnswerAction, {
    success: false,
    error: "",
    fieldErrors: {},
    state: {},
  });

  const isSuccess = state.success;
  const hasValidationError = !state.success && state.fieldErrors;
  const values: AnswerDetailDTO | null = isSuccess ? state.data : null;

  if (isPending) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded"></div>;
  }

  return (
    <div className="bg-gray-50 p-4 rounded">
      <h3 className="text-lg font-medium mb-4">Legg til nytt svar</h3>

      {!state.success && state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="questionId" value={questionId} />

        <div>
          <label
            htmlFor="answer"
            className="block text-sm font-medium text-gray-700"
          >
            Svar
          </label>
          <textarea
            id="answer"
            name="answer"
            required
            defaultValue={values?.answer || ""}
            className={`mt-1 w-full px-3 py-2 border rounded-md ${
              hasValidationError && state.fieldErrors?.answer
                ? "border-red-300"
                : "border-gray-300"
            }`}
            rows={2}
          />
          {hasValidationError && state.fieldErrors?.answer && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.answer[0]}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
