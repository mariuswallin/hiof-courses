// app/types/filters.ts

import type { Question } from "./core";

interface TableFilters {
  searchTerm: string;
  statusFilter: "all" | "draft" | "published" | "archived";
}

interface FilterActions {
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: TableFilters["statusFilter"]) => void;
  clearAllFilters: () => void;
}

interface UseTableFiltersReturn {
  filters: TableFilters;
  actions: FilterActions;
  filteredQuestions: Question[];
  stats: {
    total: number;
    filtered: number;
  };
}

export type { TableFilters, FilterActions, UseTableFiltersReturn };
