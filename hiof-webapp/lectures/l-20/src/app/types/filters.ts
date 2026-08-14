// app/types/filters.ts

import type { Question } from "./question";

interface TableFilters {
  search: string;
  status: "all" | "draft" | "published" | "archived";
}

interface FilterActions {
  setSearch: (term: string) => void;
  setStatus: (status: TableFilters["status"]) => void;
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
