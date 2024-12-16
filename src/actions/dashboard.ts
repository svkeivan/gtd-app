'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getDashboardData(userId: string) {
  const [
    inboxCount,
    nextActionsCount,
    projectsCount,
    contextsCount,
    recentItems
  ] = await Promise.all([
    prisma.item.count({ where: { userId, status: 'INBOX' } }),
    prisma.item.count({ where: { userId, status: 'NEXT_ACTION' } }),
    prisma.project.count({ where: { userId } }),
    prisma.context.count({ where: { userId } }),
    prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { project: true, contexts: true }
    })
  ])

  return { inboxCount, nextActionsCount, projectsCount, contextsCount, recentItems }
}

