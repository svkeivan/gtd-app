import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/create-safe-action";
import { z } from "zod";
import { BreakSession, BreakType } from "@prisma/client";

// Schemas
const startBreakSessionSchema = z.object({
  userId: z.string(),
  type: z.nativeEnum(BreakType),
});

const sessionIdSchema = z.object({
  sessionId: z.string(),
});

const getBreakSessionsSchema = z.object({
  userId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

// Types
type StartBreakSessionInput = z.infer<typeof startBreakSessionSchema>;
type SessionIdInput = z.infer<typeof sessionIdSchema>;
type GetBreakSessionsInput = z.infer<typeof getBreakSessionsSchema>;

interface BreakStats {
  totalBreaks: number;
  completedBreaks: number;
  skippedBreaks: number;
  breakAdherence: number;
  averageBreakDuration: number;
}

// Start a new break session
export const startBreakSession = createSafeAction(
  startBreakSessionSchema,
  async (data: StartBreakSessionInput) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: {
          breakDuration: true,
          longBreakDuration: true,
          lunchDuration: true,
        },
      });

      if (!user) {
        return { error: "User not found" };
      }

      // Determine break duration based on type
      const duration = (() => {
        switch (data.type) {
          case "SHORT":
            return user.breakDuration;
          case "LONG":
            return user.longBreakDuration;
          case "LUNCH":
            return user.lunchDuration;
        }
      })();

      const session = await prisma.breakSession.create({
        data: {
          userId: data.userId,
          type: data.type,
          startTime: new Date(),
          duration,
        },
      });

      revalidatePath("/dashboard/time-tracking");
      return { data: session };
    } catch (error) {
      return { error: "Failed to start break session" };
    }
  }
);

// Complete a break session
export const completeBreakSession = createSafeAction(
  sessionIdSchema,
  async (data: SessionIdInput) => {
    try {
      const session = await prisma.breakSession.update({
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
          breakAdherence: 100, // First break of the day, 100% adherence
        },
        update: {
          // Recalculate break adherence
          breakAdherence: {
            set: await calculateBreakAdherence(session.userId, date),
          },
        },
      });

      revalidatePath("/dashboard/time-tracking");
      return { data: session };
    } catch (error) {
      return { error: "Failed to complete break session" };
    }
  }
);

// Skip a break session
export const skipBreakSession = createSafeAction(
  sessionIdSchema,
  async (data: SessionIdInput) => {
    try {
      const session = await prisma.breakSession.update({
        where: { id: data.sessionId },
        data: {
          endTime: new Date(),
          skipped: true,
        },
      });

      // Update daily productivity metrics with skipped break
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
          breakAdherence: 0, // First break of the day was skipped
        },
        update: {
          // Recalculate break adherence
          breakAdherence: {
            set: await calculateBreakAdherence(session.userId, date),
          },
        },
      });

      revalidatePath("/dashboard/time-tracking");
      return { data: session };
    } catch (error) {
      return { error: "Failed to skip break session" };
    }
  }
);

// Get break sessions for a date range
export const getBreakSessions = createSafeAction(
  getBreakSessionsSchema,
  async (data: GetBreakSessionsInput) => {
    try {
      const sessions = await prisma.breakSession.findMany({
        where: {
          userId: data.userId,
          startTime: {
            gte: data.startDate,
            lte: data.endDate,
          },
        },
        orderBy: {
          startTime: "desc",
        },
      });

      return { data: sessions };
    } catch (error) {
      return { error: "Failed to fetch break sessions" };
    }
  }
);

// Get break session statistics
export const getBreakStats = createSafeAction(
  getBreakSessionsSchema,
  async (data: GetBreakSessionsInput) => {
    try {
      const sessions = await prisma.breakSession.findMany({
        where: {
          userId: data.userId,
          startTime: {
            gte: data.startDate,
            lte: data.endDate,
          },
        },
      });

      const totalBreaks = sessions.length;
      const completedBreaks = sessions.filter((s: BreakSession) => s.completed).length;
      const skippedBreaks = sessions.filter((s: BreakSession) => s.skipped).length;
      const totalDuration = sessions.reduce((acc: number, s: BreakSession) => acc + s.duration, 0);

      const stats: BreakStats = {
        totalBreaks,
        completedBreaks,
        skippedBreaks,
        breakAdherence: totalBreaks > 0 ? (completedBreaks / totalBreaks) * 100 : 0,
        averageBreakDuration: completedBreaks > 0 ? totalDuration / completedBreaks : 0,
      };

      return { data: stats };
    } catch (error) {
      return { error: "Failed to fetch break statistics" };
    }
  }
);

// Helper function to calculate break adherence for a specific day
async function calculateBreakAdherence(userId: string, date: Date): Promise<number> {
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const sessions = await prisma.breakSession.findMany({
    where: {
      userId,
      startTime: {
        gte: date,
        lte: endDate,
      },
    },
  });

  const totalBreaks = sessions.length;
  const completedBreaks = sessions.filter(s => s.completed).length;

  return totalBreaks > 0 ? (completedBreaks / totalBreaks) * 100 : 0;
}