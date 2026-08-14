// /app/components/table/TableHeader.tsx

import type { ColumnConfig, TableRowData } from "../../types/table";

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

  const headerClasses = [
    "border-b border-gray-300 p-3 font-semibold text-gray-900",
    column.align === "center"
      ? "text-center"
      : column.align === "right"
      ? "text-right"
      : "text-left",
    column.sortable ? "cursor-pointer hover:bg-gray-100 select-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <th
      className={headerClasses}
      style={{ width: column.width }}
      onClick={() => onSort(column.key, column.sortable || false)}
      title={column.sortable ? "Click to sort" : undefined}
    >
      <div className="flex items-center gap-2">
        <span>{column.header}</span>
        {column.sortable && <SortIndicator direction={sortDirection} />}
      </div>
    </th>
  );
}

function SortIndicator({ direction }: { direction: "asc" | "desc" | null }) {
  return (
    <span
      className={`text-xs ${direction ? "text-blue-600" : "text-gray-400"}`}
    >
      {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "⇅"}
    </span>
  );
}
