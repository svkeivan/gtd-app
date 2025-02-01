"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCalendarEvents(userId: string) {
  // Fetch tasks with due dates
  const tasks = await prisma.item.findMany({
    where: {
      userId: userId,
      dueDate: { not: null },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
    },
  });

  // Fetch time entries
  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      item: {
        select: {
          title: true,
        },
      },
    },
  });

  // Convert tasks to calendar events (only include tasks with due dates)
  const taskEvents = tasks
    .filter((task) => task.dueDate !== null)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate as Date,
      end: task.dueDate as Date,
      allDay: true,
      isTask: true,
      itemId: task.id,
    }));

  // Convert time entries to calendar events
  const timeEvents = timeEntries.map((entry) => ({
    id: entry.id,
    title: `${entry.item.title} (${entry.duration}min)`,
    start: entry.startTime,
    end: entry.endTime || entry.startTime,
    allDay: false,
    isTimeEntry: true,
    itemId: entry.id,
  }));

  // Combine and return all events
  return [...taskEvents, ...timeEvents];
}
