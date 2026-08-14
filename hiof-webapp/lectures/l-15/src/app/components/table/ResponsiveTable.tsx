// /app/components/table/ResponsiveTable.tsx

import { useState } from "react";
import type { TableRowData, TableConfig } from "../../types/table";
import { Table } from "./Table";

interface ResponsiveTableProps<T extends TableRowData> {
  data: T[];
  config: TableConfig<T>;
  className?: string;
  emptyMessage?: string;
}

export function ResponsiveTable<T extends TableRowData>({
  data,
  config,
  className,
  emptyMessage,
}: ResponsiveTableProps<T>) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <div className="w-full space-y-4">
      {/* View toggle for mobile/desktop preference */}
      <div className="flex items-center justify-between bg-white border border-border rounded-lg p-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {data.length} resultat{data.length !== 1 ? "er" : ""}
        </h2>

        <div className="md:hidden flex rounded-md border border-gray-200">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tabell
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "cards"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Kort
          </button>
        </div>
      </div>

      {/* Desktop: Always show table */}
      <div className="hidden md:block">
        <Table
          data={data}
          config={config}
          className={className}
          emptyMessage={emptyMessage}
        />
      </div>

      {/* Mobile: Switch between table and cards */}
      <div className="md:hidden">
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <Table
              data={data}
              config={config}
              className={className}
              emptyMessage={emptyMessage}
            />
          </div>
        ) : (
          <CardView data={data} config={config} />
        )}
      </div>
    </div>
  );
}

function CardView<T extends TableRowData>({
  data,
  config,
}: {
  data: T[];
  config: TableConfig<T>;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium">Ingen data å vise</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {data.map((row) => (
        <div
          key={row.id}
          className="bg-white border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Card content based on columns */}
          <div className="space-y-3">
            {config.columns.map((column) => {
              const value = row[column.key];
              const content = column.render
                ? column.render(value, row)
                : String(value || "");

              return (
                <div
                  key={String(column.key)}
                  className="flex justify-between items-start"
                >
                  <dt className="text-sm font-medium text-gray-600 flex-shrink-0 w-20">
                    {column.header}:
                  </dt>
                  <dd className="text-sm text-gray-900 text-right flex-1 ml-2">
                    {content}
                  </dd>
                </div>
              );
            })}
          </div>

          {/* Actions in card footer */}
          {config.actions && config.actions.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex gap-2 flex-wrap">
                {config.actions
                  .filter((action) => !action.hidden || !action.hidden(row))
                  .map((action) => {
                    const isDisabled = action.disabled && action.disabled(row);
                    return (
                      <button
                        key={action.key}
                        onClick={() => !isDisabled && action.onClick(row)}
                        disabled={isDisabled}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        {action.label}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
