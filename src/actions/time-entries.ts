"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateTimeEntryData, TimeEntry, TimeEntryReport } from "@/types/time-entry-types";
import { ItemStatus } from "@prisma/client";
import { createSafeAction } from "@/lib/safe-action";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

// Helper functions
function validateTimeEntry(data: CreateTimeEntryData) {
  if (!data.startTime || !data.endTime) {
    throw new ValidationError("Start time and end time are required");
  }

  if (data.startTime >= data.endTime) {
    throw new ValidationError("Start time must be before end time");
  }

  const duration = Math.round(
    (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
  );

  if (duration < 1) {
    throw new ValidationError("Time entry must be at least 1 minute long");
  }

  if (duration > 24 * 60) {
    throw new ValidationError("Time entry cannot be longer than 24 hours");
  }

  if (data.note && data.note.length > 500) {
    throw new ValidationError("Note cannot be longer than 500 characters");
  }

  const validCategories = ["FOCUS", "MEETING", "BREAK", "OTHER"];
  if (data.category && !validCategories.includes(data.category)) {
    throw new ValidationError("Invalid category");
  }

  return duration;
}

// Implementation functions
async function getNextActionItemsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const items = await prisma.item.findMany({
      where: {
        userId: user.id,
        status: ItemStatus.NEXT_ACTION,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return items;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function createTimeEntryImpl(data: CreateTimeEntryData): Promise<TimeEntry> {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate time entry data
  const duration = validateTimeEntry(data);

  try {
    // Verify item exists if provided
    if (data.itemId) {
      const item = await prisma.item.findUnique({
        where: { id: data.itemId },
      });
      if (!item) {
        throw new NotFoundError("Item", data.itemId);
      }
      if (item.userId !== user.id) {
        throw new AuthenticationError("Not authorized to track time for this item");
      }
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        category: data.category,
        note: data.note,
        userId: user.id,
        itemId: data.itemId,
      },
    });

    revalidatePath("/dashboard/time-tracking");
    return timeEntry as TimeEntry;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateTimeEntryImpl(id: string, data: CreateTimeEntryData): Promise<TimeEntry> {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate time entry data
  const duration = validateTimeEntry(data);

  try {
    // Verify ownership
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingEntry) {
      throw new NotFoundError("Time entry", id);
    }

    if (existingEntry.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this time entry");
    }

    // Verify item exists if provided
    if (data.itemId) {
      const item = await prisma.item.findUnique({
        where: { id: data.itemId },
      });
      if (!item) {
        throw new NotFoundError("Item", data.itemId);
      }
      if (item.userId !== user.id) {
        throw new AuthenticationError("Not authorized to track time for this item");
      }
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        category: data.category,
        note: data.note,
        itemId: data.itemId,
      },
    });

    revalidatePath("/dashboard/time-tracking");
    return timeEntry as TimeEntry;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function deleteTimeEntryImpl(id: string): Promise<void> {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify ownership
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingEntry) {
      throw new NotFoundError("Time entry", id);
    }

    if (existingEntry.userId !== user.id) {
      throw new AuthenticationError("Not authorized to delete this time entry");
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    revalidatePath("/dashboard/time-tracking");
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getTimeEntriesImpl(date: Date): Promise<TimeEntry[]> {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError("Invalid date");
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return entries as TimeEntry[];
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getTimeEntriesReportImpl(
  startDate: Date,
  endDate: Date,
  tags: string[] = []
): Promise<TimeEntryReport> {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate dates
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new ValidationError("Invalid start date");
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new ValidationError("Invalid end date");
  }
  if (startDate >= endDate) {
    throw new ValidationError("Start date must be before end date");
  }

  // Validate date range (e.g., max 1 year)
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  if (endDate.getTime() - startDate.getTime() > maxRange) {
    throw new ValidationError("Date range cannot exceed 1 year");
  }

  try {
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        ...(tags.length > 0 && {
          item: {
            tags: {
              some: {
                name: {
                  in: tags,
                },
              },
            },
          },
        }),
      },
      include: {
        item: {
          include: {
            tags: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Calculate time spent per category
    const categoryStats = (entries as TimeEntry[]).reduce((acc: Record<string, number>, entry) => {
      const category = entry.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + entry.duration;
      return acc;
    }, {});

    // Calculate total time tracked
    const totalMinutes = entries.reduce((sum: number, entry) => sum + entry.duration, 0);

    return {
      entries: entries as TimeEntry[],
      categoryStats,
      totalMinutes,
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

// Export wrapped actions
export const getNextActionItems = createSafeAction(getNextActionItemsImpl);
export const createTimeEntry = createSafeAction(createTimeEntryImpl);
export const updateTimeEntry = createSafeAction(updateTimeEntryImpl);
export const deleteTimeEntry = createSafeAction(deleteTimeEntryImpl);
export const getTimeEntries = createSafeAction(getTimeEntriesImpl);
export const getTimeEntriesReport = createSafeAction(getTimeEntriesReportImpl);