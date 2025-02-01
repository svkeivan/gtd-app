'use server'

import { PrismaClient } from '@prisma/client'
import { startOfDay, subDays, format } from 'date-fns'

const prisma = new PrismaClient()

export async function getAnalyticsData(userId: string) {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, 30) // Get data for the last 30 days

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

  const taskCompletionData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(endDate, i), 'yyyy-MM-dd')
    const completedCount = taskCompletionTrend.find(
      (item: { createdAt: Date; _count: { id: number } }) => format(item.createdAt, 'yyyy-MM-dd') === date
    )?._count.id || 0
    return { date, completed: completedCount }
  }).reverse()

  const projectProgressData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(endDate, i), 'yyyy-MM-dd')
    const inProgressCount = projectProgressTrend.filter(
      item => format(item.createdAt, 'yyyy-MM-dd') === date && item.status === 'ACTIVE'
    ).reduce((sum, item) => sum + item._count.id, 0)
    const completedCount = projectProgressTrend.filter(
      item => format(item.createdAt, 'yyyy-MM-dd') === date && item.status === 'COMPLETED'
    ).reduce((sum, item) => sum + item._count.id, 0)
    return { date, inProgress: inProgressCount, completed: completedCount }
  }).reverse()

  return {
    taskCompletionTrend: taskCompletionData,
    projectProgressTrend: projectProgressData,
  }
}

