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

  // Convert tasks to calendar events (only include tasks with valid due dates)
  const taskEvents = tasks
    .filter((task) => task.dueDate instanceof Date)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate as Date,
      end: task.dueDate as Date,
      allDay: true,
      isTask: true,
      itemId: task.id,
    }));

  // Convert time entries to calendar events (only include entries with valid start times)
  const timeEvents = timeEntries
    .filter((entry) => entry.startTime instanceof Date)
    .map((entry) => {
      const start = entry.startTime as Date;
      let end: Date;
      
      if (entry.endTime instanceof Date) {
        end = entry.endTime;
      } else {
        // If no end time is provided, calculate it using duration
        end = new Date(start.getTime() + (entry.duration || 30) * 60000);
      }
      
      return {
        id: entry.id,
        title: `${entry.item.title} (${entry.duration}min)`,
        start,
        end,
        allDay: false,
        isTimeEntry: true,
        itemId: entry.id,
      };
    });

  // Combine and return all events
  return [...taskEvents, ...timeEvents];
}
