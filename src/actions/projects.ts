"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();
export async function getProjects() {
  const { user } = await auth();

  const projects = await prisma.project.findMany({
    where: {
      userId: user?.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return projects;
}
export async function getProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      items: true,
    },
  });
  return project;
}
export async function createProject(data: {
  title: string;
  userId: string;
  description?: string;
  status?: string;
}) {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "ACTIVE",
      user: { connect: { id: data.userId } },
    },
  });
  revalidatePath("/projects");
  return project;
}

export async function updateProject(
  projectId: string,
  data: { title: string; status: string; description?: string },
) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: data.title,
      status: data.status,
      description: data.description,
    },
  });
  revalidatePath("/projects");
  return project;
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: { id: projectId },
  });
  revalidatePath("/projects");
}
