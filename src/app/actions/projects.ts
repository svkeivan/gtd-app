'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      userId: userId,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return projects
}

export async function createProject(data: { title: string; userId: string }) {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      status: 'ACTIVE',
      user: { connect: { id: data.userId } },
    },
  })
  revalidatePath('/projects')
  return project
}

export async function updateProject(projectId: string, data: { title: string; status: string }) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: data.title,
      status: data.status,
    },
  })
  revalidatePath('/projects')
  return project
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: { id: projectId },
  })
  revalidatePath('/projects')
}

