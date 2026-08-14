// /app/lib/sorting.ts

// Generic sorting utility function for table data
// Handles multiple data types: string, number, Date, boolean, null/undefined

export function sortTableData<T extends Record<string, any>>(
  data: T[],
  column: keyof T,
  direction: "asc" | "desc"
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[column];
    const bValue = b[column];

    // Handle null or undefined values - always sort them to the end
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1; // null values go to end
    if (bValue == null) return -1; // null values go to end

    const comparison = compareValues(aValue, bValue);
    return direction === "asc" ? comparison : -comparison;
  });
}

// Utility function to compare two values of any type
function compareValues(a: any, b: any): number {
  // String comparison with locale support for proper internationalization
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b, undefined, {
      numeric: true, // Handle numeric strings like "10" vs "2"
      sensitivity: "base", // Case-insensitive comparison
    });
  }

  // Numeric comparison
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  // Date comparison - convert to timestamps
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Boolean comparison - true values come after false
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1;
  }

  // Type mismatch or unsupported types - fallback to string comparison
  const aString = String(a);
  const bString = String(b);

  return aString.localeCompare(bString, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

// Utility function to get sort indicator based on current sort state
export function getSortIndicator(
  currentColumn: string | symbol | undefined,
  targetColumn: string | symbol,
  direction: "asc" | "desc" | undefined
): "↑" | "↓" | "" {
  if (currentColumn !== targetColumn) {
    return "";
  }

  return direction === "asc" ? "↑" : "↓";
}

const isValidNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

// Utility function to check if a value is numeric
export function isNumericValue(value: any): boolean {
  if (
    value == null ||
    value === "" ||
    value === undefined ||
    typeof value === "object"
  )
    return false; // null, undefined, empty string, and objects are not numeric
  if (typeof value === "boolean") return false; // booleans are not numeric
  if (typeof value === "number" && isValidNumber(value)) return true;
  if (typeof value === "string" && value.trim() !== "") {
    return isValidNumber(value); // numeric strings are valid
  }
  return false;
}
