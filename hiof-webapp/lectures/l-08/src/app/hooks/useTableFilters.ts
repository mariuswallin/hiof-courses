// app/hooks/useTableFilters.ts

import { useState, useMemo } from "react";
import type {
  FilterActions,
  TableFilters,
  UseTableFiltersReturn,
} from "../types/filters";
import type { Question } from "../types/core";

const DEFAULT_FILTERS: TableFilters = {
  searchTerm: "",
  statusFilter: "all",
};

// Naming convention: use then verb, e.g., useTableFilters
export function useTableFilters(questions: Question[]): UseTableFiltersReturn {
  // State with initial filters
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

  // Memoize filtered questions to optimize performance
  // This avoids recalculating the filtered list on every render
  // and only recalculates when questions or filters change
  // In future version of React this may not be necessary
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Apply search term filter
    if (filters.searchTerm.trim() !== "") {
      result = result.filter((question) =>
        question.question
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.statusFilter !== "all") {
      result = result.filter(
        (question) => question.status === filters.statusFilter
      );
    }

    return result;
  }, [questions, filters]);

  return {
    filters,
    actions,
    filteredQuestions,
    resultCount: filteredQuestions.length,
  };
}
