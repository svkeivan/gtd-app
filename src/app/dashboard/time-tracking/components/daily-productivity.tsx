"use client";

import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { createSafeAction } from "@/lib/create-safe-action";
import prisma from "@/lib/prisma";
import { format, startOfDay } from "date-fns";
import useSWR from "swr";
import { z } from "zod";

// Schema for getting daily productivity
const getDailyProductivitySchema = z.object({
  userId: z.string(),
  date: z.date(),
});

type GetDailyProductivityInput = z.infer<typeof getDailyProductivitySchema>;

// Action to get daily productivity
const getDailyProductivity = createSafeAction(
  getDailyProductivitySchema,
  async (data: GetDailyProductivityInput) => {
    try {
      const metrics = await prisma.dailyProductivity.findUnique({
        where: {
          userId_date: {
            userId: data.userId,
            date: data.date,
          },
        },
      });

      return { data: metrics };
    } catch (error) {
      return { error: "Failed to fetch daily productivity" };
    }
  },
);

const fetcher = async () => {
  const now = new Date();
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  return getDailyProductivity({
    userId: user.id,
    date: startOfDay(now),
  });
};

export function DailyProductivity() {
  const { data: metricsResult, isLoading } = useSWR(
    `daily-productivity`,
    () => fetcher(),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    },
  );

  const metrics = metricsResult?.data;

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

  if (!metrics) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          No productivity data for today
        </div>
      </Card>
    );
  }

  const getProductivityEmoji = (score: number) => {
    if (score >= 80) return "🚀";
    if (score >= 60) return "💪";
    if (score >= 40) return "👍";
    return "🎯";
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Daily Overview</h3>
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "MMM d, yyyy")}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Your productivity metrics for today
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-3xl font-bold">
            {Math.round(metrics.productivity)}%
            <span className="text-2xl">
              {getProductivityEmoji(metrics.productivity)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Productivity Score
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold">{metrics.completedTasks}</div>
          <div className="text-sm text-muted-foreground">Tasks Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-3xl font-bold">{metrics.focusMinutes}</div>
          <div className="text-sm text-muted-foreground">Minutes Focused</div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold">{metrics.focusSessionsCount}</div>
          <div className="text-sm text-muted-foreground">Focus Sessions</div>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Break Adherence</span>
          <span
            className={
              metrics.breakAdherence >= 70
                ? "text-green-600"
                : "text-yellow-600"
            }
          >
            {Math.round(metrics.breakAdherence)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
