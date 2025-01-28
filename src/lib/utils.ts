import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1:
      return "#ef4444";
    case 2:
      return "#f97316";
    case 3:
      return "#eab308";
    case 4:
      return "#3b82f6";
    case 5:
      return "#22c55e";
    default:
      return "#6b7280";
  }
}
