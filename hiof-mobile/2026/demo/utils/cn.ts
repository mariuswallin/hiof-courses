// utils/cn.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges Tailwind classes so the last one wins when two control the same
// property. Without twMerge, `p-2 p-4` would keep both and the result would
// depend on class order in the generated stylesheet.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
