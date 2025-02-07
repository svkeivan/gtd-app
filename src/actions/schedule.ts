"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SmartScheduler } from "@/lib/scheduler";

export async function scheduleUnplannedTasks( date: Date) {
  const { user:authenticateUser } = await auth();
    if (!authenticateUser) {
      throw new Error("User not found");
    }
    const userId = authenticateUser.id;
  try {
    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        workStartTime: true,
        workEndTime: true,
        lunchStartTime: true,
        lunchDuration: true,
        breakDuration: true,
        longBreakDuration: true,
        pomodoroDuration: true,
        shortBreakInterval: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Initialize scheduler with user preferences
    const scheduler = new SmartScheduler(user);

    // Get scheduled tasks
    const scheduledTasks = await scheduler.scheduleTasks(userId, date);

    // Update tasks with planned dates
    const updates = scheduledTasks.map((task) =>
      prisma.item.update({
        where: { id: task.taskId },
        data: {
          plannedDate: task.plannedDate,
          estimated: task.estimated,
        },
      })
    );

    // Execute all updates in a transaction
    await prisma.$transaction(updates);

    return scheduledTasks;
  } catch (error) {
    console.error("Error in scheduleUnplannedTasks:", error);
    throw error;
  }
}

export async function getSchedulePreview(userId: string, date: Date) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        workStartTime: true,
        workEndTime: true,
        lunchStartTime: true,
        lunchDuration: true,
        breakDuration: true,
        longBreakDuration: true,
        pomodoroDuration: true,
        shortBreakInterval: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const scheduler = new SmartScheduler(user);
    return scheduler.scheduleTasks(userId, date);
  } catch (error) {
    console.error("Error in getSchedulePreview:", error);
    throw error;
  }
}