"use server";

import prisma from "@/lib/prisma";

export async function getUserPreferences(userId: string) {
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
      timezone: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}