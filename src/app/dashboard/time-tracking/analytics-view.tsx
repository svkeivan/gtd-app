"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { getTimeEntriesReport } from "@/actions/time-entries";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TimeEntryReport } from "@/types/time-entry-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeDistributionChart } from "./components/time-distribution-chart";
import { ProductivityHeatmap } from "./components/productivity-heatmap";
import { TrendChart } from "./components/trend-chart";
import useSWR from "swr";

type DateRange = "week" | "month" | "3months";

const fetcher = async (startDate: Date, endDate: Date) => {
  return getTimeEntriesReport(startDate, endDate, ["time-entries-report"]);
};

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [selectedView, setSelectedView] = useState<"distribution" | "heatmap" | "trend">("distribution");

  // Calculate date range
  const { startDate, endDate } = (() => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }),
          endDate: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "month":
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
        };
      case "3months":
        return {
          startDate: startOfMonth(subMonths(now, 2)),
          endDate: endOfMonth(now),
        };
      default:
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }),
          endDate: endOfWeek(now, { weekStartsOn: 1 }),
        };
    }
  })();

  // Fetch data with SWR for real-time updates
  const { data: report, isLoading } = useSWR(
    [startDate, endDate],
    () => fetcher(startDate, endDate),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const handleRangeChange = (value: DateRange) => {
    setDateRange(value);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Time Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Analyze your time usage patterns and productivity trends
            </p>
          </div>
          <div className="w-full sm:w-[200px]">
            <Label>Time Range</Label>
            <Select value={dateRange} onValueChange={handleRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="space-y-4">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="heatmap">Patterns</TabsTrigger>
            <TabsTrigger value="trend">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="space-y-4">
            <TimeDistributionChart report={report} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <ProductivityHeatmap entries={report?.entries || []} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="trend" className="space-y-4">
            <TrendChart
              entries={report?.entries || []}
              startDate={startDate}
              endDate={endDate}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Real-time indicator */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Updates automatically every 30 seconds</span>
        </div>
      </Card>
    </div>
  );
}