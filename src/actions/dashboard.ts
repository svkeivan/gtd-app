"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDashboardData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    inboxCount,
    nextActionsCount,
    projectsCount,
    contextsCount,
    completedCount,
    recentItems,
    todaysTasks,
  ] = await Promise.all([
    prisma.item.count({ where: { userId, status: "INBOX" } }),
    prisma.item.count({ where: { userId, status: "NEXT_ACTION" } }),
    prisma.project.count({ where: { userId } }),
    prisma.context.count({ where: { userId } }),
    prisma.item.count({ where: { userId, status: "COMPLETED" } }),
    prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: true, contexts: true },
    }),
    prisma.item.findMany({
      where: {
        userId,
        OR: [
          { dueDate: { gte: today, lt: tomorrow } },
          { plannedDate: { gte: today, lt: tomorrow } },
        ],
        NOT: { status: "COMPLETED" },
      },
      include: {
        project: true,
        contexts: true,
      },
      orderBy: { priority: "desc" },
    }),
  ]);

  return {
    inboxCount,
    nextActionsCount,
    projectsCount,
    contextsCount,
    completedCount,
    recentItems,
    todaysTasks,
  };
}
