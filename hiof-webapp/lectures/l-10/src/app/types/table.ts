// /app/types/table.ts

// Basic-interface for table row data
export interface TableRowData {
  readonly id: string;
  [key: string]: any;
}

// Define column configuration for flexible tables
export interface ColumnConfig<T extends TableRowData> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";

  // Optional render function for custom formatting
  render?: (value: any, row: T) => React.ReactNode;
}

// Describes actions that can be performed on rows
export interface TableAction<T extends TableRowData> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "danger";

  // Conditional visibility and accessibility
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  onClick: (row: T) => void;
}

// Main configuration for the table
export interface TableConfig<T extends TableRowData> {
  columns: ColumnConfig<T>[];
  actions?: TableAction<T>[];
  defaultSort?: {
    column: keyof T;
    direction: "asc" | "desc";
  };
  showHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}
