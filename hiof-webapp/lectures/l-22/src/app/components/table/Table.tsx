// /app/components/table/Table.tsx

import type { TableRowData, TableConfig } from "@/app/types/table";
import { useTableSort } from "@/app/hooks/useTableSort";
import { TableHeader } from "./TableHeader";
import { TableActions } from "./TableActions";
import { cn } from "@/app/lib/utils/cn";

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
  emptyMessage = "Ingen data tilgjengelig",
}: TableProps<T>) {
  const { sortedData, sortConfig, actions } = useTableSort(
    data,
    config.defaultSort || null
  );

  // Empty state with Tailwind utilities
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 text-gray-300">
          {/* Placeholder icon for empty state */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ingen data å vise
        </h3>
        <p className="text-gray-600 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Dynamic table classes based on config
  const tableClasses = [
    // Base table classes
    "w-full border-separate border-spacing-0 bg-white shadow-sm rounded-lg overflow-hidden",
    // Conditional styling based on config
    config.striped ? "[&>tbody>tr:nth-child(even)]:bg-gray-50" : "",
    config.hoverable !== false
      ? "[&>tbody>tr]:hover:bg-blue-50 [&>tbody>tr]:transition-colors [&>tbody>tr]:duration-150"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="overflow-x-auto border border-border rounded-lg"
      role="region"
      aria-label="Tabell med horisontal rulling"
      tabIndex={0}
    >
      <table
        className={tableClasses}
        role="table"
        aria-label={config.caption || "Datatabell"}
      >
        <caption className="sr-only">
          {config.caption || `Tabell med ${data.length} rader`}
        </caption>
        {config.showHeader !== false && (
          <thead className="bg-gray-50">
            <tr>
              {config.columns.map((column) => (
                <TableHeader
                  key={String(column.key)}
                  column={column}
                  sortConfig={sortConfig}
                  onSort={actions.handleSort}
                />
              ))}
              {config.actions && config.actions.length > 0 && (
                <th
                  scope="col"
                  className="border-b border-border px-4 py-3 text-left font-semibold text-gray-900 bg-gray-50"
                >
                  <span className="sr-only">Tilgjengelige handlinger</span>
                  Handlinger
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row) => (
            <tr
              key={row.id}
              className="group transition-colors duration-150 hover:bg-blue-50"
              data-testid={`table-row-item`}
            >
              {config.columns.map((column) => {
                const value = row[column.key];
                const content = column.render
                  ? column.render(value, row)
                  : String(value || "");

                const cellClasses = cn([
                  "px-4 py-3 border-b border-gray-200 last:border-r-0",
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left",
                ]);

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
              {config.actions && config.actions.length > 0 && (
                <td className="px-4 py-3 border-b border-gray-200">
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
