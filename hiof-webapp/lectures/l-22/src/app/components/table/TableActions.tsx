// /app/components/table/TableActions.tsx

import { cn } from "@/app/lib/utils/cn";
import type { TableAction, TableRowData } from "@/app/types/table";

interface TableActionsProps<T extends TableRowData> {
  row: T;
  actions: TableAction<T>[];
  rowLabel?: string;
}

export function TableActions<T extends TableRowData>({
  row,
  actions,
  rowLabel,
}: TableActionsProps<T>) {
  const visibleActions = actions.filter(
    (action) => !action.hidden || !action.hidden(row)
  );

  if (visibleActions.length === 0) {
    return (
      <div
        className="text-center text-gray-400 text-sm italic"
        role="cell"
        aria-label="Ingen tilgjengelige handlinger"
      >
        Ingen handlinger
      </div>
    );
  }

  // Build a descriptive aria-label for the action group
  const actionsLabel = rowLabel
    ? `Handlinger for ${rowLabel}`
    : `${visibleActions.length} handlinger tilgjengelige`;

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={actionsLabel}
    >
      {visibleActions.map((action) => (
        <ActionButton
          key={action.key}
          action={action}
          row={row}
          rowLabel={rowLabel}
        />
      ))}
    </div>
  );
}

function ActionButton<T extends TableRowData>({
  action,
  row,
  rowLabel,
  tabIndex = 0,
}: {
  action: TableAction<T>;
  row: T;
  rowLabel?: string;
  tabIndex?: number;
}) {
  const isDisabled = action.disabled && action.disabled(row);

  // Utility function to get color classes based on action type
  const getColorClasses = (color: string = "primary") => {
    const colorMap = {
      primary: {
        base: "text-blue-600 border-blue-200 bg-blue-50",
        hover: "hover:text-blue-800 hover:bg-blue-100 hover:border-blue-300",
        focus: "focus:ring-blue-500 focus:border-blue-500",
      },
      secondary: {
        base: "text-gray-600 border-gray-200 bg-gray-50",
        hover: "hover:text-gray-800 hover:bg-gray-100 hover:border-gray-300",
        focus: "focus:ring-gray-500 focus:border-gray-500",
      },
      danger: {
        base: "text-red-600 border-red-200 bg-red-50",
        hover: "hover:text-red-800 hover:bg-red-100 hover:border-red-300",
        focus: "focus:ring-red-500 focus:border-red-500",
      },
    };

    const colors = colorMap[color as keyof typeof colorMap] || colorMap.primary;
    return `${colors.base} ${colors.hover} ${colors.focus}`;
  };

  const buttonClasses = cn([
    // Base styling for all action buttons
    "inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all duration-150",
    // Improved focus styles
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-75",
    // Color classes based on action type
    getColorClasses(action.color),
    // Disabled state styling
    isDisabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer transform hover:scale-105 active:scale-95 focus:scale-105",
    // Improved contrast for text
    "font-semibold",
  ]);

  const handleClick = () => {
    if (!isDisabled) {
      action.onClick(row);
    }
  };

  // Improved keyboard support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  // Generate aria-label for better accessibility
  const generateAriaLabel = () => {
    let label = action.label;

    if (rowLabel) {
      label += ` for ${rowLabel}`;
    }

    if (isDisabled) {
      label += `, ikke tilgjengelig`;
    }

    return label;
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      title={action.label}
      aria-label={generateAriaLabel()}
      aria-describedby={action.description ? `${action.key}-desc` : undefined}
      tabIndex={tabIndex}
      type="button"
    >
      {action.icon && (
        <span
          className="mr-1.5 flex-shrink-0 w-3 h-3"
          aria-hidden="true"
          role="img"
        >
          {action.icon}
        </span>
      )}
      <span className="truncate">{action.label}</span>

      {/* Optional description for screen readers */}
      {action.description && (
        <span id={`${action.key}-desc`} className="sr-only">
          {action.description}
        </span>
      )}
    </button>
  );
}
