import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge classNames and resolve Tailwind conflicts (last one wins).
 *
 * Currently unused — the components write their classes inline. Kept because
 * it is the first thing you want the moment a component takes a `className`
 * prop. Drop this file and the clsx/tailwind-merge deps if that never happens.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
