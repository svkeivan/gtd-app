"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TimeEntryReport } from "@/types/time-entry-types";

interface TimeDistributionChartProps {
  report: TimeEntryReport | null;
  isLoading: boolean;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Work: "bg-blue-500 dark:bg-blue-600",
    Meeting: "bg-purple-500 dark:bg-purple-600",
    Learning: "bg-green-500 dark:bg-green-600",
    Exercise: "bg-yellow-500 dark:bg-yellow-600",
    Personal: "bg-pink-500 dark:bg-pink-600",
    Break: "bg-gray-500 dark:bg-gray-600",
    Uncategorized: "bg-slate-500 dark:bg-slate-600",
  };
  return colors[category] || colors.Uncategorized;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export function TimeDistributionChart({ report, isLoading }: TimeDistributionChartProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No time entries found for this period
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Object.entries(report.categoryStats)
          .sort(([, a], [, b]) => b - a)
          .map(([category, minutes]) => {
            const percentage = (minutes / report.totalMinutes) * 100;
            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">
                    {formatDuration(minutes)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={cn(
                    "h-2",
                    getCategoryColor(category)
                  )}
                />
              </div>
            );
          })}
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Total Time</span>
          <span className="text-muted-foreground">
            {formatDuration(report.totalMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}