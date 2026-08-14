// utils/cn.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Slår sammen klassenavn: clsx håndterer betingelser, twMerge fjerner
// duplikater og lar den siste Tailwind-klassen vinne.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
