'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getCalendarEvents(userId: string) {
  const events = await prisma.item.findMany({
    where: {
      userId: userId,
      dueDate: { not: null },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
    },
  })

  return events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.dueDate,
    end: event.dueDate,
    allDay: true,
  }))
}

