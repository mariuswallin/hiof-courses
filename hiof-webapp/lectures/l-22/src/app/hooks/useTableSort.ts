// /app/hooks/useTableSort.ts

import { useState, useMemo } from "react";

import type { TableRowData } from "@/app/types/table";
import { sortTableData } from "@/app/lib/utils/sorting";

export interface SortConfig<T> {
  column: keyof T;
  direction: "asc" | "desc";
}

export function useTableSort<T extends TableRowData>(
  data: T[],
  defaultSort?: SortConfig<T> | null
) {
  // State to track current sort configuration
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    defaultSort || null
  );

  // Memoized sorted data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    return sortTableData(data, sortConfig.column, sortConfig.direction);
  }, [data, sortConfig]);

  // Function to handle sorting when a column header is clicked
  const handleSort = (column: keyof T, sortable: boolean = false) => {
    if (!sortable) {
      return;
    }

    setSortConfig((current) => {
      // If no current sort or different column, start with ascending
      if (!current || current.column !== column) {
        return { column, direction: "asc" };
      }

      // If currently ascending, change to descending
      if (current.direction === "asc") {
        return { column, direction: "desc" };
      }

      // If currently descending, remove sorting (third click)
      return null;
    });
  };

  // Function to set sort configuration directly
  const setSortBy = (column: keyof T, direction: "asc" | "desc") => {
    setSortConfig({ column, direction });
  };

  // Function to clear current sorting
  const clearSort = () => {
    setSortConfig(null);
  };

  const actions = {
    handleSort,
    setSortBy,
    clearSort,
  };

  return {
    sortedData,
    sortConfig,
    actions,
  };
}
