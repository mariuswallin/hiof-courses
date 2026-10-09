// utils/date.ts

import { format, isPast } from "date-fns";
import { nb } from "date-fns/locale";

/** Human readable date, in Norwegian. */
export function formatDate(date: Date): string {
  return format(date, "d. MMMM yyyy", { locale: nb });
}

/** True when the due date has passed. Used to highlight overdue tasks. */
export function isOverdue(date: Date): boolean {
  return isPast(date);
}
