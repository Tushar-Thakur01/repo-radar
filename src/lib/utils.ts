// Utility function to merge Tailwind CSS classes
// This combines clsx (conditional classes) with tailwind-merge (deduplication)
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
