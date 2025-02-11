"use server";

import { BreakType, PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Type definitions for calendar events
interface BaseCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

interface TaskCalendarEvent extends BaseCalendarEvent {
  isTask: true;
  itemId: string;
  contexts: Array<{
    id: string;
    name: string;
  }>;
  progress: number;
  timeSpent: number;
  estimated?: number | null;
}

interface FocusCalendarEvent extends BaseCalendarEvent {
  isFocus: true;
  completed: boolean;
  interrupted: boolean;
}

interface BreakCalendarEvent extends BaseCalendarEvent {
  isBreak: true;
  breakType: BreakType;
  completed: boolean;
  skipped: boolean;
}

type CalendarEvent = TaskCalendarEvent | FocusCalendarEvent | BreakCalendarEvent;

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  // Fetch tasks with planned dates or due dates
  const tasks = await prisma.item.findMany({
    where: {
      userId: userId,
      OR: [
        { plannedDate: { not: undefined } },
        { dueDate: { not: undefined } }
      ]
    },
    select: {
      id: true,
      title: true,
      plannedDate: true,
      dueDate: true,
      estimated: true,
      contexts: {
        select: {
          id: true,
          name: true,
        }
      },
      TimeEntry: {
        where: {
          endTime: { not: undefined }
        },
        select: {
          duration: true
        }
      }
    },
  });

  // Fetch focus sessions
  const focusSessions = await prisma.focusSession.findMany({
    where: {
      userId: userId,
      startTime: { not: undefined }
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      completed: true,
      interrupted: true,
      item: {
        select: {
          title: true
        }
      }
    }
  });

  // Fetch break sessions
  const breakSessions = await prisma.breakSession.findMany({
    where: {
      userId: userId,
      startTime: { not: undefined }
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      type: true,
      completed: true,
      skipped: true
    }
  });

  // Convert tasks to calendar events
  const taskEvents = tasks.map((task): TaskCalendarEvent | null => {
    const start = task.plannedDate || task.dueDate;
    if (!start) return null;

    // Calculate progress
    const totalTimeSpent = task.TimeEntry.reduce((acc: number, entry) => acc + entry.duration, 0);
    const progress = task.estimated ? Math.min(100, (totalTimeSpent / task.estimated) * 100) : 0;
    
    return {
      id: task.id,
      title: task.title,
      start: start,
      end: task.plannedDate
        ? new Date(start.getTime() + (task.estimated || 30) * 60000)
        : start,
      allDay: !task.plannedDate,
      isTask: true,
      itemId: task.id,
      contexts: task.contexts,
      progress,
      timeSpent: totalTimeSpent,
      estimated: task.estimated
    };
  }).filter((event): event is TaskCalendarEvent => event !== null);

  // Convert focus sessions to calendar events
  const focusEvents = focusSessions.map((session): FocusCalendarEvent | null => {
    if (!session.startTime) return null;
    
    return {
      id: session.id,
      title: session.item?.title ? `Focus: ${session.item.title}` : 'Focus Session',
      start: session.startTime,
      end: session.endTime || new Date(session.startTime.getTime() + session.duration * 60000),
      isFocus: true,
      completed: session.completed,
      interrupted: session.interrupted
    };
  }).filter((event): event is FocusCalendarEvent => event !== null);

  // Convert break sessions to calendar events
  const breakEvents = breakSessions.map((session): BreakCalendarEvent | null => {
    if (!session.startTime) return null;
    
    return {
      id: session.id,
      title: `${session.type.charAt(0) + session.type.slice(1).toLowerCase()} Break`,
      start: session.startTime,
      end: session.endTime || new Date(session.startTime.getTime() + session.duration * 60000),
      isBreak: true,
      breakType: session.type,
      completed: session.completed,
      skipped: session.skipped
    };
  }).filter((event): event is BreakCalendarEvent => event !== null);

  // Combine and return all events
  return [...taskEvents, ...focusEvents, ...breakEvents];
}
