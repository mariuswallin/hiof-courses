// /app/components/questions/pages/QuestionPage.tsx

"use client";

import { useState, useCallback } from "react";
import { useAsyncData } from "@/app/hooks/useAsyncData";
import { Loading } from "@/app/components/shared/Loading";
import { ErrorState } from "@/app/components/shared/ErrorState";
import { TableFilters } from "../table/QuestionTableFilters";

import { questionsClient } from "@/app/lib/api/question-client";
import { useTableFilters } from "@/app/hooks/useTableFilters";
import type { TableFilters as FilterTypes } from "@/app/types/filters";
import type { Question } from "@/app/types/question";
import { QuestionTable } from "../table/QuestionTable";

interface QuestionsPageProps {
  initialQuestions?: Question[];
  title?: string;
  subtitle?: string;
}

export function QuestionsPage({
  initialQuestions = [],
  title = "Spørsmålshåndtering",
  subtitle = "Administrer og organiser dine spørsmål",
}: QuestionsPageProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 25;

  // Use useTableFilters for client-side filter state management
  const { filters, actions } = useTableFilters();

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

  // Enhanced actions with pagination reset
  const enhancedActions = {
    ...actions,
    setSearch: (search: string) => {
      actions.setSearch(search);
      resetPagination();
    },
    setStatus: (status: FilterTypes["status"]) => {
      actions.setStatus(status);
      resetPagination();
    },
    clearAllFilters: () => {
      actions.clearAllFilters();
      resetPagination();
    },
  };

  // Stable handler for useAsyncData - now includes filter parameters
  const fetchQuestions = useCallback(
    async (signal: AbortSignal) => {
      return await questionsClient.list({
        filters: {
          status: filters.status,
          search: filters.search,
        },
        pagination: {
          page: currentPage,
          limit: itemsPerPage,
        },
        options: {
          signal,
        },
      });
    },
    [currentPage, filters.search, filters.status]
  );

  const {
    data,
    pagination,
    statuses: { isError, isLoading, hasData },
    error,
    execute,
  } = useAsyncData(fetchQuestions, {
    immediate: true,
    retainDataOnError: true,
    dependencies: [currentPage, filters.search, filters.status],
  });

  // Define questions from API response or fallback to initial questions
  const questions = data || initialQuestions;
  const totalQuestions = pagination?.total || questions.length;
  const totalPages =
    pagination?.pages || Math.ceil(questions.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleView = (id: string) => {
    window.location.href = `/${id}`;
    console.log("Viser spørsmål:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Redigerer spørsmål:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Sletter spørsmål:", id);
  };

  // Loading state when no data is available
  if (isLoading && !hasData && initialQuestions.length === 0) {
    return <Loading title="Henter spørsmål..." />;
  }

  // Error state when no data is available and no initial questions
  if (isError && !hasData && initialQuestions.length === 0) {
    return (
      <ErrorState message={error || "En feil oppstod"} onRetry={execute} />
    );
  }

  return (
    <div className="question-table-page">
      <header className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
            <p>
              Viser {questions.length} av {totalQuestions} spørsmål
              {filters.search || filters.status !== "all" ? " (filtrert)" : ""}
            </p>
            {totalPages > 1 && (
              <p>
                Side {currentPage} av {totalPages}
              </p>
            )}
          </div>
        </div>

        {isError && hasData && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            Feil ved oppdatering: {error}. Viser tidligere data.
          </div>
        )}

        {isLoading && hasData && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded mb-4">
            Oppdaterer data...
          </div>
        )}
      </header>

      <TableFilters
        filters={filters}
        actions={enhancedActions}
        totalQuestions={totalQuestions}
        filteredCount={questions.length}
      />

      <QuestionTable
        questions={questions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Forrige
          </button>

          <span className="px-4 py-2 text-sm text-gray-600 self-center">
            Side {currentPage} av {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Neste
          </button>
        </div>
      )}
    </div>
  );
}
