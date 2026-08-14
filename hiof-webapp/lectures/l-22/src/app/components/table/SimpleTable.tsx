// /app/components/table/SimpleTable.tsx

import { Table } from "./Table";
import type {
  TableRowData,
  TableConfig,
  ColumnConfig,
  TableAction,
} from "@/app/types/table";

interface SimpleTableProps<T extends TableRowData> {
  data: T[];
  columns: (keyof T)[];
  columnHeaders?: Partial<Record<keyof T, string>>;
  actions?: {
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
  };
  emptyMessage?: string;
}

export function SimpleTable<T extends TableRowData>({
  data,
  columns,
  columnHeaders = {},
  actions,
  emptyMessage,
}: SimpleTableProps<T>) {
  // Automatically generate column configuration based on provided keys
  const columnConfig: ColumnConfig<T>[] = columns.map((key) => ({
    key,
    header:
      columnHeaders[key] ||
      String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    sortable: true,
    render: (value: any) => {
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (typeof value === "boolean") {
        return value ? "✓" : "✗";
      }
      return String(value || "");
    },
  }));

  // Automatically generate action configuration
  const actionConfig: TableAction<T>[] = [];

  if (actions?.onView) {
    actionConfig.push({
      key: "view",
      label: "View",
      color: "primary",
      onClick: actions.onView,
    });
  }

  if (actions?.onEdit) {
    actionConfig.push({
      key: "edit",
      label: "Edit",
      color: "secondary",
      onClick: actions.onEdit,
    });
  }

  if (actions?.onDelete) {
    actionConfig.push({
      key: "delete",
      label: "Delete",
      color: "danger",
      onClick: actions.onDelete,
    });
  }

  const config: TableConfig<T> = {
    columns: columnConfig,
    actions: actionConfig.length > 0 ? actionConfig : undefined,
    striped: true,
    hoverable: true,
  };

  return <Table data={data} config={config} emptyMessage={emptyMessage} />;
}
