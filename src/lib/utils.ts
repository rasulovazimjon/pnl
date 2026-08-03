import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn/ui's class-merging helper: combine conditional classes (clsx) and
// resolve Tailwind conflicts (tailwind-merge). Used by shadcn components.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
