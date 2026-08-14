// src/app/features/tasks/forms/TaskForm.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TaskDTO } from "@/app/features/tasks/tasksService";
import { createTaskAction } from "../../tasksActions";
import type { ServerResultError } from "@/app/types/result";

// TODO: Ofte i egen komponent / abstrahert
function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending
        ? isEdit
          ? "Oppdaterer..."
          : "Oppretter..."
        : isEdit
        ? "Oppdater oppgave"
        : "Opprett oppgave"}
    </button>
  );
}

interface TaskFormProps {
  task?: TaskDTO;
  userId?: number;
}

export function TaskForm({ task, userId }: TaskFormProps) {
  const isEdit = !!task;
  const action = isEdit
    ? async () => {
        // TODO: Ikke implementert enda
        return {
          success: false,
          state: {},
          validationErrors: {},
          error: {
            message: "Update action not implemented yet",
            code: 500,
          },
        } as ServerResultError;
      }
    : createTaskAction;

  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: {
      message: "",
    },
    validationErrors: {},
    state: task
      ? {
          id: task.id,
          name: task.name,
          description: task.description,
          dueDate: task.dueDate,
          completed: task.completed,
        }
      : {},
  });

  const isSuccess = state.success;
  const hasValidationError = !state.success && state.validationErrors;
  const hasError = !state.success && state.error.message;
  const stateValues = isSuccess ? state.data : null;

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-48 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-12 rounded"></div>
      </div>
    );
  }

  // TODO: Ofte i egen util / abstrahert
  const values: TaskDTO | null = isEdit
    ? isSuccess
      ? stateValues
      : task
    : stateValues;

  // TODO: Ofte i egen util
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Fjern millisekunder og timezone for datetime-local input
    return date.toISOString().slice(0, 16);
  };

  // TODO: Ofte i egen util
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-4">
      {/*  TODO: Ofte i egen komponent / abstrahert */}
      {hasError && (
        <aside className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Feil:</strong> {state.error.message || "Noe gikk galt."}
        </aside>
      )}

      {/*  TODO: Ofte i egen komponent / abstrahert */}
      {isSuccess && (
        <aside className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {isEdit ? "Oppgave oppdatert!" : "Ny oppgave opprettet!"}
        </aside>
      )}

      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={task?.id} />}
        <input type="hidden" name="userId" value={userId} />

        <fieldset>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Oppgavenavn
          </label>
          {/*  TODO: Ofte i egen komponent / abstrahert */}
          <input
            type="text"
            id="name"
            name="name"
            required
            minLength={3}
            maxLength={200}
            defaultValue={values?.name || ""}
            placeholder="F.eks. Ferdigstill prosjektdokumentasjon"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasValidationError && state.validationErrors?.name
                ? "border-red-300"
                : "border-gray-300"
            }`}
          />

          {/*  TODO: Ofte i egen komponent / abstrahert */}
          {hasValidationError && state.validationErrors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {state.validationErrors.name[0]}
            </p>
          )}
        </fieldset>

        <fieldset>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Beskrivelse
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            defaultValue={values?.description || ""}
            placeholder="Beskriv oppgaven i detalj..."
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              hasValidationError && state.validationErrors?.description
                ? "border-red-300"
                : "border-gray-300"
            }`}
          />
          {hasValidationError && state.validationErrors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.validationErrors.description[0]}
            </p>
          )}
        </fieldset>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Forfallsdato
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            required
            min={getMinDate()}
            defaultValue={formatDateForInput(values?.dueDate)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasValidationError && state.validationErrors?.dueDate
                ? "border-red-300"
                : "border-gray-300"
            }`}
          />
          {hasValidationError && state.validationErrors?.dueDate && (
            <p className="mt-1 text-sm text-red-600">
              {state.validationErrors.dueDate[0]}
            </p>
          )}
        </div>

        {isEdit && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              name="completed"
              defaultChecked={values?.completed || false}
              value="true"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="completed"
              className="ml-2 block text-sm text-gray-700"
            >
              Marker som fullført
            </label>
          </div>
        )}

        <SubmitButton isEdit={isEdit} />
      </form>
    </div>
  );
}
