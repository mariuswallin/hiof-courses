// /app/components/table/Table.tsx

import type { TableRowData, TableConfig } from "../../types/table";
import { useTableSort } from "../../hooks/useTableSort";
import { TableHeader } from "./TableHeader";
import { TableActions } from "./TableActions";

interface TableProps<T extends TableRowData> {
  data: T[];
  config: TableConfig<T>;
  className?: string;
  emptyMessage?: string;
}

export function Table<T extends TableRowData>({
  data,
  config,
  className = "",
  emptyMessage = "Ingen data",
}: TableProps<T>) {
  // Use custom hook for sorting logic - much cleaner separation of concerns
  const { sortedData, sortConfig, actions } = useTableSort(
    data,
    config.defaultSort || null
  );

  // Early return for empty state - no need to render table structure
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="empty-state">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // Build table CSS classes based on configuration
  const tableClasses = [
    "w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg overflow-hidden",
    config.striped ? "striped-table" : "",
    config.hoverable !== false ? "hoverable-table" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses} data-testid="flexible-table">
        {/* Conditional header rendering */}
        {config.showHeader !== false && (
          <thead>
            <tr className="bg-gray-50">
              {config.columns.map((column) => (
                <TableHeader
                  key={String(column.key)}
                  column={column}
                  sortConfig={sortConfig}
                  onSort={actions.handleSort}
                />
              ))}
              {/* Action column header if actions are configured */}
              {config.actions && config.actions.length > 0 && (
                <th className="border-b border-gray-300 p-3 text-left font-semibold text-gray-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-gray-50">
              {/* Render each configured column */}
              {config.columns.map((column) => {
                const value = row[column.key];

                // Use custom render function if provided, otherwise convert to string
                const content = column.render
                  ? column.render(value, row)
                  : String(value || "");

                // Build cell classes based on alignment configuration
                const cellClasses = [
                  "border-b border-gray-200 p-3",
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left",
                ].join(" ");

                return (
                  <td
                    key={String(column.key)}
                    className={cellClasses}
                    style={{ width: column.width }}
                  >
                    {content}
                  </td>
                );
              })}
              {/* Action buttons column if configured */}
              {config.actions && config.actions.length > 0 && (
                <td className="border-b border-gray-200 p-3">
                  <TableActions row={row} actions={config.actions} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
