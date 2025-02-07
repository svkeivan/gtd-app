import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/create-safe-action";
import { z } from "zod";
import { FocusSession } from "@prisma/client";

// Schemas
const startFocusSessionSchema = z.object({
  userId: z.string(),
  itemId: z.string().optional(),
});

const sessionIdSchema = z.object({
  sessionId: z.string(),
});

const getFocusSessionsSchema = z.object({
  userId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

// Types
type StartFocusSessionInput = z.infer<typeof startFocusSessionSchema>;
type SessionIdInput = z.infer<typeof sessionIdSchema>;
type GetFocusSessionsInput = z.infer<typeof getFocusSessionsSchema>;

interface FocusStats {
  totalSessions: number;
  completedSessions: number;
  interruptedSessions: number;
  totalFocusMinutes: number;
  successRate: number;
}

// Start a new focus session
export const startFocusSession = createSafeAction(
  startFocusSessionSchema,
  async (data: StartFocusSessionInput) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { pomodoroDuration: true },
      });

      if (!user) {
        return { error: "User not found" };
      }

      const session = await prisma.focusSession.create({
        data: {
          userId: data.userId,
          itemId: data.itemId,
          startTime: new Date(),
          duration: user.pomodoroDuration,
        },
      });

      revalidatePath("/dashboard/time-tracking");
      return { data: session };
    } catch (error) {
      return { error: "Failed to start focus session" };
    }
  }
);

// Complete a focus session
export const completeFocusSession = createSafeAction(
  sessionIdSchema,
  async (data: SessionIdInput) => {
    try {
      const session = await prisma.focusSession.update({
        where: { id: data.sessionId },
        data: {
          endTime: new Date(),
          completed: true,
        },
      });

      // Update daily productivity metrics
      const date = new Date();
      date.setHours(0, 0, 0, 0);

      await prisma.dailyProductivity.upsert({
        where: {
          userId_date: {
            userId: session.userId,
            date,
          },
        },
        create: {
          userId: session.userId,
          date,
          focusSessionsCount: 1,
          focusMinutes: session.duration,
        },
        update: {
          focusSessionsCount: { increment: 1 },
          focusMinutes: { increment: session.duration },
        },
      });

      revalidatePath("/dashboard/time-tracking");
      return { data: session };
    } catch (error) {
      return { error: "Failed to complete focus session" };
    }
  }
);

// Interrupt a focus session
export const interruptFocusSession = createSafeAction(
  sessionIdSchema,
  async (data: SessionIdInput) => {
    try {
      const session = await prisma.focusSession.update({
        where: { id: data.sessionId },
        data: {
          endTime: new Date(),
          interrupted: true,
        },
      });

      revalidatePath("/dashboard/time-tracking");
      return { data: session };
    } catch (error) {
      return { error: "Failed to interrupt focus session" };
    }
  }
);

// Get focus sessions for a date range
export const getFocusSessions = createSafeAction(
  getFocusSessionsSchema,
  async (data: GetFocusSessionsInput) => {
    try {
      const sessions = await prisma.focusSession.findMany({
        where: {
          userId: data.userId,
          startTime: {
            gte: data.startDate,
            lte: data.endDate,
          },
        },
        include: {
          item: true,
        },
        orderBy: {
          startTime: "desc",
        },
      });

      return { data: sessions };
    } catch (error) {
      return { error: "Failed to fetch focus sessions" };
    }
  }
);

// Get focus session statistics
export const getFocusStats = createSafeAction(
  getFocusSessionsSchema,
  async (data: GetFocusSessionsInput) => {
    try {
      const sessions = await prisma.focusSession.findMany({
        where: {
          userId: data.userId,
          startTime: {
            gte: data.startDate,
            lte: data.endDate,
          },
        },
      });

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter((s: FocusSession) => s.completed).length;
      const interruptedSessions = sessions.filter((s: FocusSession) => s.interrupted).length;
      const totalFocusMinutes = sessions.reduce((acc: number, s: FocusSession) => acc + s.duration, 0);
      const successRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      const stats: FocusStats = {
        totalSessions,
        completedSessions,
        interruptedSessions,
        totalFocusMinutes,
        successRate,
      };

      return { data: stats };
    } catch (error) {
      return { error: "Failed to fetch focus statistics" };
    }
  }
);