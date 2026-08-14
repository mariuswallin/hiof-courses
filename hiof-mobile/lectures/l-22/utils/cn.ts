// utils/cn.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Takes a list of className strings and merges them
export function cn(...inputs: ClassValue[]) {
	// twMerge removes duplicate classes and resolves Tailwind specificity;
	// clsx handles conditional classes and joins them.
	return twMerge(clsx(inputs));
}
