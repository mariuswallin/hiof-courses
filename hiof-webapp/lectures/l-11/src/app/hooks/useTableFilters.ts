// app/hooks/useTableFilters.ts

import { useState, useMemo } from "react";
import type { Question } from "../types/core";
import type {
  TableFilters,
  FilterActions,
  UseTableFiltersReturn,
} from "../types/filters";

interface UseTableFiltersProps {
  questions: Question[]; // Data is injected as a prop
}

const DEFAULT_FILTERS: TableFilters = {
  searchTerm: "",
  statusFilter: "all",
};

export function useTableFilters({
  questions,
}: UseTableFiltersProps): UseTableFiltersReturn {
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);

  const setSearchTerm = (searchTerm: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      searchTerm,
    }));
  };

  const setStatusFilter = (statusFilter: TableFilters["statusFilter"]) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      statusFilter,
    }));
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Group actions together for better organization
  const actions: FilterActions = {
    setSearchTerm,
    setStatusFilter,
    clearAllFilters,
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      // Search in question text
      const matchesSearch =
        filters.searchTerm === "" ||
        question.question
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus =
        filters.statusFilter === "all" ||
        question.status === filters.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [questions, filters.searchTerm, filters.statusFilter]);

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
