"use client";

import { getBreakStats } from "@/actions/break-sessions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { BreakType } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import useSWR from "swr";

const fetcher = async () => {
  const now = new Date();
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  return getBreakStats({
    userId: user.id,
    startDate: startOfDay(now),
    endDate: endOfDay(now),
  });
};

const breakTypeLabels: Record<BreakType, string> = {
  SHORT: "Short Break",
  LONG: "Long Break",
  LUNCH: "Lunch Break",
};

const breakTypeBadgeColors: Record<BreakType, string> = {
  SHORT: "bg-blue-100 text-blue-800",
  LONG: "bg-purple-100 text-purple-800",
  LUNCH: "bg-green-100 text-green-800",
};

export function BreakProgress() {
  const { data: statsResult, isLoading } = useSWR(
    `break-stats`,
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

  const getProgressColor = (adherence: number) => {
    if (adherence >= 80) return "bg-emerald-500";
    if (adherence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Break Adherence</h3>
        <div className="text-sm text-muted-foreground">
          Today&apos;s break statistics
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Break Adherence</span>
            <span>{Math.round(stats.breakAdherence)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all",
                getProgressColor(stats.breakAdherence),
              )}
              style={{
                width: `${Math.min(100, Math.max(0, stats.breakAdherence))}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{stats.completedBreaks}</div>
            <div className="text-sm text-muted-foreground">Breaks Taken</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageBreakDuration)}
            </div>
            <div className="text-sm text-muted-foreground">Avg. Minutes</div>
          </div>
        </div>

        {stats.skippedBreaks > 0 && (
          <div className="text-sm text-red-600">
            {stats.skippedBreaks} break{stats.skippedBreaks === 1 ? "" : "s"}{" "}
            skipped today
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {Object.entries(breakTypeLabels).map(([type, label]) => (
            <Badge
              key={type}
              variant="secondary"
              className={breakTypeBadgeColors[type as BreakType]}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
