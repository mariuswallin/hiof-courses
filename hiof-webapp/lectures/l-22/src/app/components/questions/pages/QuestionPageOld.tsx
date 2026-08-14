// /app/components/questions/pages/QuestionPage.tsx


"use client";

// No longer in use.
import { useTableFilters } from "@/app/hooks/useTableFilters";
import { TableFilters } from "../table/QuestionTableFilters";

import type { Question } from "@/app/types/question";
import { useEffect, useState, useRef } from "react";
import { Loading } from "@/app/components/shared/Loading";
import { ErrorState } from "@/app/components/shared/ErrorState";

// Import API functions

interface QuestionsPageProps {
  initialQuestions?: Question[];
  title?: string;
  subtitle?: string;
}

type Status = "idle" | "loading" | "error" | "success";

export function QuestionsPage({
  initialQuestions,
  title = "Spørsmålshåndtering",
  subtitle = "Administrer og organiser dine spørsmål",
}: QuestionsPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [status, setStatus] = useState<Status>(
    initialQuestions ? "success" : "loading"
  );

  const [
    {
      data: questions,
      total: totalQuestions,
      page: currentPage,
      pages: totalPages,
      limit: itemsPerPage,
    },
    setData,
  ] = useState<{
    data: Question[];
    total: number;
    page: number;
    pages: number;
    limit: number;
  }>({
    data: initialQuestions || [],
    total: initialQuestions ? initialQuestions.length : 0,
    page: 1,
    pages: Math.ceil((initialQuestions ? initialQuestions.length : 0) / 10),
    limit: 10,
  });

  const isLoading = status === "loading";
  const isError = error || status === "error";
  const isSuccess = status === "success";

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuestions = async (page = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setStatus("loading");
      setError(null);

      // Get questions with pagination and filtering
      const searchResults = await listQuestions(
        {
          ...filters,
          limit: 25, // Set a reasonable limit for initial load
          page,
        },
        abortController.signal
      );

      // Update state with fetched data
      if (!abortController.signal.aborted) {
        setData(searchResults);
        setRetryCount(0);
        setStatus("success");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);

      if (!abortController.signal.aborted) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Kunne ikke hente spørsmål";

        setError(errorMessage);
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    if (!initialQuestions) {
      fetchQuestions();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Not flexible enough for different data structures.
  const { filters, filteredQuestions, actions } = useTableFilters({
    questions,
  });

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

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchQuestions();
  };

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      fetchQuestions(newPage);
    }
  };

  if (isLoading) {
    return <Loading title="Henter spørsmål..." />;
  }

  if (isError && error) {
    const errorMessage =
      retryCount > 0 ? `${error} (Forsøk ${retryCount + 1})` : error;
    return <ErrorState message={errorMessage} onRetry={handleRetry} />;
  }

  return (
    <div className="question-table-page">
      <header className="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <p>
          Viser {totalQuestions > 0 ? itemsPerPage : 0} av {totalQuestions}
        </p>
        {totalPages > 1 && (
          <p>
            Side {currentPage} av {totalPages}
          </p>
        )}
      </header>

      <TableFilters
        filters={filters}
        actions={actions}
        totalQuestions={totalQuestions}
        filteredCount={filteredQuestions.length}
      />

      <QuestionTable
        questions={filteredQuestions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Simple pagination */}
      {totalPages > 1 && (
        <div
          className="pagination"
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ccc",
              backgroundColor: currentPage === 1 ? "#f5f5f5" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Forrige
          </button>

          <span style={{ padding: "0.5rem 1rem", alignSelf: "center" }}>
            Side {currentPage} av {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ccc",
              backgroundColor: currentPage === totalPages ? "#f5f5f5" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Neste
          </button>
        </div>
      )}
    </div>
  );
}
