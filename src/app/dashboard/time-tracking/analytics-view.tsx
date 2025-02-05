"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { getTimeEntriesReport } from "@/actions/time-entries";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TimeEntryReport } from "@/types/time-entry-types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DateRange = "week" | "month";

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [report, setReport] = useState<TimeEntryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadReport = async (range: DateRange) => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (range === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      const data = await getTimeEntriesReport(startDate, endDate);
      setReport(data);
    } catch (error) {
      console.error("Error loading time report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangeChange = (value: DateRange) => {
    setDateRange(value);
    loadReport(value);
  };

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

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Time Distribution</h2>
          <div className="w-[200px]">
            <Label>Time Range</Label>
            <Select value={dateRange} onValueChange={handleRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : report ? (
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
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No time entries found for this period
          </div>
        )}
      </Card>
    </div>
  );
}