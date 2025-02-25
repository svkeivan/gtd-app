"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateTimeEntryData, TimeEntry, TimeEntryReport } from "@/types/time-entry-types";
import { ItemStatus } from "@prisma/client";

export async function getNextActionItems() {
  const { user } = await auth();
  if (!user?.id || !user.isLoggedIn) {
    throw new Error("You must be logged in to view next action items");
  }

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
}

export async function createTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
  const { user } = await auth();
  if (!user?.id || !user.isLoggedIn) {
    throw new Error("You must be logged in to create time entries");
  }

  const duration = Math.round(
    (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
  );

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
}

export async function updateTimeEntry(id: string, data: CreateTimeEntryData): Promise<TimeEntry> {
  const { user } = await auth();
  if (!user?.id || !user.isLoggedIn) {
    throw new Error("You must be logged in to update time entries");
  }

  // Verify ownership
  const existingEntry = await prisma.timeEntry.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existingEntry || existingEntry.userId !== user.id) {
    throw new Error("Time entry not found or unauthorized");
  }

  const duration = Math.round(
    (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
  );

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
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { user } = await auth();
  if (!user?.id || !user.isLoggedIn) {
    throw new Error("You must be logged in to delete time entries");
  }

  // Verify ownership
  const existingEntry = await prisma.timeEntry.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existingEntry || existingEntry.userId !== user.id) {
    throw new Error("Time entry not found or unauthorized");
  }

  await prisma.timeEntry.delete({
    where: { id },
  });

  revalidatePath("/dashboard/time-tracking");
}

export async function getTimeEntries(date: Date): Promise<TimeEntry[]> {
  const { user } = await auth();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

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
}

export async function getTimeEntriesReport(
  startDate: Date,
  endDate: Date,
  tags: string[] = []
): Promise<TimeEntryReport> {
  const { user } = await auth();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: user.id,
      startTime: {
        gte: startDate,
        lte: endDate,
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
}