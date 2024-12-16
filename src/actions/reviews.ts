'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getReviewItems(userId: string) {
  const [
    inboxItems,
    nextActions,
    projects,
    waitingFor,
    somedayMaybe
  ] = await Promise.all([
    prisma.item.findMany({ where: { userId, status: 'INBOX' } }),
    prisma.item.findMany({ where: { userId, status: 'NEXT_ACTION' } }),
    prisma.project.findMany({ where: { userId } }),
    prisma.item.findMany({ where: { userId, status: 'WAITING_FOR' } }),
    prisma.item.findMany({ where: { userId, status: 'SOMEDAY_MAYBE' } })
  ])

  return { inboxItems, nextActions, projects, waitingFor, somedayMaybe }
}

export async function completeWeeklyReview(userId: string) {
  const review = await prisma.review.create({
    data: {
      userId,
      completedAt: new Date(),
    }
  })

  revalidatePath('/review')
  return review
}

export async function getLastReviewDate(userId: string) {
  const lastReview = await prisma.review.findFirst({
    where: { userId },
    orderBy: { completedAt: 'desc' },
  })

  return lastReview?.completedAt
}

