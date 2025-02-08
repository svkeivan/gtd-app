"use server";

import { PrismaClient, PriorityLevel } from "@prisma/client";

interface DashboardData {
  inboxCount: number;
  nextActionsCount: number;
  projectsCount: number;
  contextsCount: number;
  completedCount: number;
  recentItems: Array<{
    id: string;
    title: string;
    status: string;
    project: {
      id: string;
      title: string;
      status: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
      parentId: string | null;
    } | null;
    contexts: Array<{
      id: string;
      name: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
  todaysTasks: Array<{
    id: string;
    title: string;
    priority: number;
    project: { id: string; title: string; } | null;
    contexts: Array<{ id: string; name: string; }>;
  }>;
}

const prisma = new PrismaClient();

export async function getDashboardData(userId: string): Promise<DashboardData> {
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
      select: {
        id: true,
        title: true,
        status: true,
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            parentId: true
          }
        },
        contexts: {
          select: {
            id: true,
            name: true,
            userId: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
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

  // Map priority levels to numbers for visualization
  const priorityMap: Record<PriorityLevel, number> = {
    [PriorityLevel.LOW]: 1,
    [PriorityLevel.MEDIUM]: 2,
    [PriorityLevel.HIGH]: 3,
    [PriorityLevel.URGENT]: 4
  };

  const mappedRecentItems = recentItems.map(item => ({
    id: item.id,
    title: item.title,
    status: item.status,
    project: item.project ? {
      id: item.project.id,
      title: item.project.title,
      status: item.project.status,
      userId: item.project.userId,
      createdAt: item.project.createdAt,
      updatedAt: item.project.updatedAt,
      parentId: item.project.parentId
    } : null,
    contexts: item.contexts.map(ctx => ({
      id: ctx.id,
      name: ctx.name,
      userId: ctx.userId,
      createdAt: ctx.createdAt,
      updatedAt: ctx.updatedAt
    }))
  }));

  const mappedTodaysTasks = todaysTasks.map(item => ({
    id: item.id,
    title: item.title,
    priority: priorityMap[item.priority as PriorityLevel],
    project: item.project ? { id: item.project.id, title: item.project.title } : null,
    contexts: item.contexts.map(ctx => ({ id: ctx.id, name: ctx.name }))
  }));

  return {
    inboxCount,
    nextActionsCount,
    projectsCount,
    contextsCount,
    completedCount,
    recentItems: mappedRecentItems,
    todaysTasks: mappedTodaysTasks,
  };
}
