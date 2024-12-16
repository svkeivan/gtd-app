'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getTags(userId: string) {
  const tags = await prisma.tag.findMany({
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
  return tags
}

export async function createTag(data: { name: string; color: string; userId: string }) {
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      color: data.color,
      user: { connect: { id: data.userId } },
    },
  })
  revalidatePath('/tags')
  return tag
}

export async function updateTag(tagId: string, data: { name: string; color: string }) {
  const tag = await prisma.tag.update({
    where: { id: tagId },
    data: {
      name: data.name,
      color: data.color,
    },
  })
  revalidatePath('/tags')
  return tag
}

export async function deleteTag(tagId: string) {
  await prisma.tag.delete({
    where: { id: tagId },
  })
  revalidatePath('/tags')
}

