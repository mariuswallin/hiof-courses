// /app/components/table/TableActions.tsx

import type { TableAction, TableRowData } from "../../types/table";

interface TableActionsProps<T extends TableRowData> {
  row: T;
  actions: TableAction<T>[];
}

export function TableActions<T extends TableRowData>({
  row,
  actions,
}: TableActionsProps<T>) {
  const visibleActions = actions.filter(
    (action) => !action.hidden || !action.hidden(row)
  );

  if (visibleActions.length === 0) {
    return <div className="text-gray-400">Ingen handlinger</div>;
  }

  return (
    <menu className="flex gap-2" aria-label="Tabellhandlinger">
      {visibleActions.map((action) => {
        const isDisabled = action.disabled && action.disabled(row);

        const buttonClasses = [
          "px-3 py-1 text-sm rounded transition-colors",
          action.color === "danger"
            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
            : action.color === "secondary"
            ? "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            : "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
          isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={action.key} className="flex-shrink-0">
            <button
              className={buttonClasses}
              onClick={() => !isDisabled && action.onClick(row)}
              aria-label={action.label} // If the button only has an icon
              disabled={isDisabled}
              title={action.label}
            >
              {action.icon && (
                <span aria-hidden="true" className="mr-1">
                  {action.icon}
                </span>
              )}
              {action.label}
            </button>
          </li>
        );
      })}
    </menu>
  );
}
