// /app/components/table/TableHeader.tsx

import { cn } from "@/app/lib/utils/cn";
import type { ColumnConfig, TableRowData } from "@/app/types/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface TableHeaderProps<T extends TableRowData> {
  column: ColumnConfig<T>;
  sortConfig: { column: keyof T; direction: "asc" | "desc" } | null;
  onSort: (column: keyof T, sortable: boolean) => void;
}

export function TableHeader<T extends TableRowData>({
  column,
  sortConfig,
  onSort,
}: TableHeaderProps<T>) {
  const isSorted = sortConfig?.column === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;

  const headerClasses = cn([
    "px-4 py-3 border-b border-border font-semibold text-gray-900 bg-gray-50",
    column.align === "center"
      ? "text-center"
      : column.align === "right"
      ? "text-right"
      : "text-left",
    column.sortable
      ? "cursor-pointer hover:bg-gray-100 select-none transition-colors duration-150"
      : "",
    isSorted ? "bg-blue-50 text-blue-900" : "",
  ]);

  return (
    <th
      scope="col"
      className={headerClasses}
      style={{ width: column.width }}
      onClick={() => onSort(column.key, column.sortable || false)}
      title={column.sortable ? "Klikk for å sortere" : undefined}
      aria-sort={
        sortConfig?.column === column.key
          ? sortConfig.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">{column.header}</span>
        {column.sortable && (
          <SortIndicator direction={sortDirection} isActive={isSorted} />
        )}
      </div>
    </th>
  );
}

function SortIndicator({
  direction,
  isActive,
}: {
  direction: "asc" | "desc" | null;
  isActive: boolean;
}) {
  const iconProps = {
    size: 16,
    className: cn(
      "transition-all duration-200",
      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
    ),
    strokeWidth: 2,
  };

  if (direction === "asc") {
    return <ChevronUp {...iconProps} />;
  }

  if (direction === "desc") {
    return <ChevronDown {...iconProps} />;
  }

  return <ChevronsUpDown {...iconProps} />;
}
