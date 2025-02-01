'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getContexts(userId: string) {
  const contexts = await prisma.context.findMany({
    where: {
      userId: userId,
    },
    include: {
      items: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  return contexts
}

export async function createContext(data: { name: string; description?: string; userId: string }) {
  const context = await prisma.context.create({
    data: {
      name: data.name,
      description: data.description,
      user: { connect: { id: data.userId } },
    },
  })
  revalidatePath('/contexts')
  return context
}

export async function updateContext(contextId: string, data: { name: string; description?: string }) {
  const context = await prisma.context.update({
    where: { id: contextId },
    data: {
      name: data.name,
      description: data.description,
    },
  })
  revalidatePath('/contexts')
  return context
}

export async function deleteContext(contextId: string) {
  await prisma.context.delete({
    where: { id: contextId },
  })
  revalidatePath('/contexts')
}
