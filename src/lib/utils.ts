import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

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

export function convertMinutesToHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ""}`;
}

export function getTimeAgo(createdAt: string | Date): string {
  const diff = differenceInDays(new Date(), new Date(createdAt));

  if (diff === 0) {
    const hours = differenceInHours(new Date(), new Date(createdAt));

    if (hours === 0) {
      const minutes = differenceInMinutes(new Date(), new Date(createdAt));

      if (minutes === 0) {
        return "a few moments ago";
      }
      return `${minutes} minutes ago`;
    }
    return `${hours} hours ago`;
  }
  return `${diff} days ago`;
}
