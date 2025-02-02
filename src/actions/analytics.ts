'use server'

import { PrismaClient } from '@prisma/client'
import { startOfDay, subDays, format, startOfWeek, endOfWeek } from 'date-fns'

const prisma = new PrismaClient()

export async function getAnalyticsData(userId: string): Promise<{
  taskCompletionTrend: Array<{ date: string; completed: number }>;
  projectProgressTrend: Array<{ date: string; inProgress: number; completed: number }>;
  workflowMetrics: {
    inbox: number;
    nextActions: number;
    waitingFor: number;
    projects: number;
    somedayMaybe: number;
    reference: number;
  };
  contextDistribution: Array<{ context: string; count: number }>;
  weeklyReviewStats: {
    lastReviewDate: string | null;
    reviewsLast30Days: number;
    avgDaysBetweenReviews: number;
  };
  timeToCompletion: {
    avgDays: number;
    byPriority: Array<{ priority: number; avgDays: number }>;
  };
  projectHealth: {
    totalProjects: number;
    activeProjects: number;
    projectsWithoutNextActions: number;
    avgNextActionsPerProject: number;
  };
}> {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, 30) // Get data for the last 30 days

  // Existing trends
  const taskCompletionTrend = await prisma.item.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  })

  const projectProgressTrend = await prisma.project.groupBy({
    by: ['createdAt', 'status'],
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  })

  // Current workflow stage counts
  const workflowCounts = await prisma.item.groupBy({
    by: ['status'],
    where: {
      userId,
      status: {
        in: ['INBOX', 'NEXT_ACTION', 'WAITING_FOR', 'PROJECT', 'SOMEDAY_MAYBE', 'REFERENCE'],
      },
    },
    _count: {
      id: true,
    },
  })

  // Context distribution
  const contextDistribution = await prisma.context.findMany({
    where: { userId },
    include: {
      _count: {
        select: { items: true },
      },
    },
  })

  // Weekly review stats
  const reviews = await prisma.review.findMany({
    where: {
      userId,
      completedAt: {
        gte: startDate,
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  })

  // Time to completion analysis
  const completedItems = await prisma.item.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      priority: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // Project health metrics
  const projectsWithNextActions = await prisma.project.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      items: {
        where: {
          status: 'NEXT_ACTION',
        },
      },
    },
  })

  // Process task completion trend data
  const taskCompletionData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(endDate, i), 'yyyy-MM-dd')
    const completedCount = taskCompletionTrend.find(
      (item: { createdAt: Date; _count: { id: number } }) =>
        format(new Date(item.createdAt), 'yyyy-MM-dd') === date
    )?._count.id ?? 0
    return { date, completed: completedCount }
  }).reverse()

  // Process project progress trend data
  const projectProgressData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(endDate, i), 'yyyy-MM-dd')
    const inProgressCount = projectProgressTrend.filter(
      (item: { createdAt: Date; status: string; _count: { id: number } }) =>
        format(new Date(item.createdAt), 'yyyy-MM-dd') === date && item.status === 'ACTIVE'
    ).reduce((sum: number, item: { _count: { id: number } }) => sum + item._count.id, 0)
    const completedCount = projectProgressTrend.filter(
      (item: { createdAt: Date; status: string; _count: { id: number } }) =>
        format(new Date(item.createdAt), 'yyyy-MM-dd') === date && item.status === 'COMPLETED'
    ).reduce((sum: number, item: { _count: { id: number } }) => sum + item._count.id, 0)
    return { date, inProgress: inProgressCount, completed: completedCount }
  }).reverse()

  // Calculate workflow metrics
  const workflowMetrics = {
    inbox: workflowCounts.find(w => w.status === 'INBOX')?._count.id ?? 0,
    nextActions: workflowCounts.find(w => w.status === 'NEXT_ACTION')?._count.id ?? 0,
    waitingFor: workflowCounts.find(w => w.status === 'WAITING_FOR')?._count.id ?? 0,
    projects: workflowCounts.find(w => w.status === 'PROJECT')?._count.id ?? 0,
    somedayMaybe: workflowCounts.find(w => w.status === 'SOMEDAY_MAYBE')?._count.id ?? 0,
    reference: workflowCounts.find(w => w.status === 'REFERENCE')?._count.id ?? 0,
  }

  // Calculate context distribution
  const contextData = contextDistribution.map(context => ({
    context: context.name,
    count: context._count.items,
  }))

  // Calculate weekly review stats
  const lastReview = reviews[0]
  const reviewDates = reviews.map(r => r.completedAt)
  const avgDaysBetweenReviews =
    reviewDates.length > 1
      ? reviewDates.reduce((sum, date, i) => {
          if (i === 0) return 0
          return sum + Math.abs(date.getTime() - reviewDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / (reviewDates.length - 1)
      : 0

  // Calculate time to completion metrics
  const timeToCompletionByPriority = completedItems.reduce((acc, item) => {
    const days = Math.ceil((item.updatedAt.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    if (!acc[item.priority]) {
      acc[item.priority] = { total: 0, count: 0 }
    }
    acc[item.priority].total += days
    acc[item.priority].count++
    return acc
  }, {} as Record<number, { total: number; count: number }>)

  const avgTimeToCompletion = completedItems.reduce((sum, item) => {
    return sum + Math.ceil((item.updatedAt.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  }, 0) / (completedItems.length || 1)

  // Calculate project health metrics
  const projectHealth = {
    totalProjects: projectsWithNextActions.length,
    activeProjects: projectsWithNextActions.filter(p => p.status === 'ACTIVE').length,
    projectsWithoutNextActions: projectsWithNextActions.filter(p => p.items.length === 0).length,
    avgNextActionsPerProject:
      projectsWithNextActions.reduce((sum, p) => sum + p.items.length, 0) /
      (projectsWithNextActions.length || 1),
  }

  return {
    taskCompletionTrend: taskCompletionData,
    projectProgressTrend: projectProgressData,
    workflowMetrics,
    contextDistribution: contextData,
    weeklyReviewStats: {
      lastReviewDate: lastReview ? format(lastReview.completedAt, 'yyyy-MM-dd') : null,
      reviewsLast30Days: reviews.length,
      avgDaysBetweenReviews,
    },
    timeToCompletion: {
      avgDays: avgTimeToCompletion,
      byPriority: Object.entries(timeToCompletionByPriority).map(([priority, data]) => ({
        priority: Number(priority),
        avgDays: data.total / data.count,
      })),
    },
    projectHealth,
  }
}