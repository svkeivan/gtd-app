"use client";

import { getSession } from "@/actions/auth";
import { getFocusStats } from "@/actions/focus-sessions";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { endOfDay, startOfDay } from "date-fns";
import useSWR from "swr";

const fetcher = async () => {
  const now = new Date();
  const session = await getSession();
  if (!session) {
    throw new Error("User session not found");
  }
  const { id: userId } = session;
  return getFocusStats({
    userId,
    startDate: startOfDay(now),
    endDate: endOfDay(now),
  });
};

export function FocusProgress() {
  const { data: statsResult, isLoading } = useSWR(
    `focus-stats`,
    () => fetcher(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    },
  );

  const stats = statsResult?.data;

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex h-[120px] items-center justify-center">
          <div className="w-full animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-2 w-full rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Sessions</h3>
        <div className="text-sm text-muted-foreground">
          Today&apos;s progress
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Success Rate</span>
            <span>{Math.round(stats.successRate)}%</span>
          </div>
          <Progress value={stats.successRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalFocusMinutes}</div>
            <div className="text-sm text-muted-foreground">Minutes Focused</div>
          </div>
        </div>

        {stats.interruptedSessions > 0 && (
          <div className="text-sm text-muted-foreground">
            {stats.interruptedSessions} session
            {stats.interruptedSessions === 1 ? "" : "s"} interrupted
          </div>
        )}
      </div>
    </Card>
  );
}
