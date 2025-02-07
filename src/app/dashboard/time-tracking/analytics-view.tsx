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
import { FocusProgress } from "./components/focus-progress";
import { BreakProgress } from "./components/break-progress";
import { DailyProductivity } from "./components/daily-productivity";
import useSWR from "swr";

type DateRange = "week" | "month" | "3months";

const fetcher = async (startDate: Date, endDate: Date): Promise<TimeEntryReport | null> => {
  const result = await getTimeEntriesReport(startDate, endDate, ["time-entries-report"]);
  return result || null;
};

interface AnalyticsViewProps {
  userId: string;
}

export function AnalyticsView({ userId }: AnalyticsViewProps) {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [selectedView, setSelectedView] = useState<"overview" | "distribution" | "heatmap" | "trend">("overview");

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
  const { data, isLoading } = useSWR(
    [startDate, endDate],
    () => fetcher(startDate, endDate),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      fallbackData: null, // Provide null as fallback to satisfy type system
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
              Track your productivity and time usage patterns
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
          <TabsList className="grid w-full sm:w-[400px] grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="heatmap">Patterns</TabsTrigger>
            <TabsTrigger value="trend">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <DailyProductivity userId={userId} />
              <FocusProgress userId={userId} />
              <BreakProgress userId={userId} />
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <TimeDistributionChart report={data} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <ProductivityHeatmap 
              entries={data?.entries || []} 
              isLoading={isLoading} 
            />
          </TabsContent>

          <TabsContent value="trend" className="space-y-4">
            <TrendChart
              entries={data?.entries || []}
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