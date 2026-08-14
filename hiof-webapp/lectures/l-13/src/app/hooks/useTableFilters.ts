// app/hooks/useTableFilters.ts

import { useState, useMemo } from "react";
import type { Question } from "../types/question";
import type {
  TableFilters,
  FilterActions,
  UseTableFiltersReturn,
} from "../types/filters";

interface UseTableFiltersProps {
  questions: Question[]; // Data is injected as a prop
}

const DEFAULT_FILTERS: TableFilters = {
  search: "",
  status: "all",
};

export function useTableFilters({
  questions,
}: UseTableFiltersProps): UseTableFiltersReturn {
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);

  const setSearch = (search: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      search,
    }));
  };

  const setStatus = (status: TableFilters["status"]) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      status,
    }));
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Group actions together for better organization
  const actions: FilterActions = {
    setSearch,
    setStatus,
    clearAllFilters,
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      // Search in question text
      const matchesSearch =
        filters.search === "" ||
        question.question.toLowerCase().includes(filters.search.toLowerCase());

      // Filter by status
      const matchesStatus =
        filters.status === "all" || question.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [questions, filters.search, filters.status]);

  return {
    filters,
    filteredQuestions,
    actions,
    stats: {
      total: questions.length,
      filtered: filteredQuestions.length,
    },
  };
}
