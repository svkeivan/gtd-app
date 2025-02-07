"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getFocusStats } from "@/actions/focus-sessions";
import { startOfDay, endOfDay } from "date-fns";
import useSWR from "swr";

interface FocusProgressProps {
  userId: string;
}

const fetcher = async (userId: string) => {
  const now = new Date();
  return getFocusStats({
    userId,
    startDate: startOfDay(now),
    endDate: endOfDay(now),
  });
};

export function FocusProgress({ userId }: FocusProgressProps) {
  const { data: statsResult, isLoading } = useSWR(
    `focus-stats-${userId}`,
    () => fetcher(userId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  const stats = statsResult?.data;

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="h-[120px] flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Sessions</h3>
        <div className="text-sm text-muted-foreground">
          Today&apos;s progress
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Success Rate</span>
            <span>{Math.round(stats.successRate)}%</span>
          </div>
          <Progress value={stats.successRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">
              {stats.completedSessions}
            </div>
            <div className="text-sm text-muted-foreground">
              Completed
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {stats.totalFocusMinutes}
            </div>
            <div className="text-sm text-muted-foreground">
              Minutes Focused
            </div>
          </div>
        </div>

        {stats.interruptedSessions > 0 && (
          <div className="text-sm text-muted-foreground">
            {stats.interruptedSessions} session{stats.interruptedSessions === 1 ? '' : 's'} interrupted
          </div>
        )}
      </div>
    </Card>
  );
}