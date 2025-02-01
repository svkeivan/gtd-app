"use server";

import { auth } from "@/lib/auth";
import { ItemStatus, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cache } from "react";

const prisma = new PrismaClient();

export async function createItem(data: {
  title: string;
  notes?: string;
  projectId?: string;
}) {
  const user = await auth();
  if (!user.user) {
    throw new Error("User not found");
  }
  const item = await prisma.item.create({
    data: {
      title: data.title,
      notes: data.notes,
      status: data.projectId ? "PROJECT" : "INBOX",
      projectId: data.projectId ?? null,
      userId: user.user?.id,
    },
  });
  if (data.projectId) {
    revalidatePath(`/projects/${data.projectId}`);
  } else {
    revalidatePath("/inbox");
  }
  return item;
}
export async function getInboxItems(userId: string) {
  const items = await prisma.item.findMany({
    where: {
      userId: userId,
    },
    include: {
      project: true,
      contexts: true,
      tags: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return items;
}

export async function processItem(
  itemId: string,
  data: {
    status: ItemStatus;
    projectId?: string;
    contextIds?: string[];
  },
) {
  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      status: data.status,
      projectId: data.projectId,
      contexts: {
        set: data.contextIds?.map((id) => ({ id })) || [],
      },
    },
  });
  revalidatePath("/inbox");
  revalidatePath("/process");
  return item;
}

export async function getNextActions(userId: string) {
  const nextActions = await prisma.item.findMany({
    where: {
      userId: userId,
      status: "NEXT_ACTION",
    },
    include: {
      project: true,
      contexts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return nextActions;
}

export async function updateItemStatus(itemId: string, status: ItemStatus) {
  const item = await prisma.item.update({
    where: { id: itemId },
    data: { status },
  });
  revalidatePath("/next-actions");
  return item;
}

export async function getNextActionsWithDetails(userId: string) {
  const nextActions = await prisma.item.findMany({
    where: {
      userId: userId,
      status: { not: "COMPLETED" },
    },
    include: {
      project: true,
      contexts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const projects = await prisma.project.findMany({
    where: { userId: userId },
    select: { id: true, title: true },
  });

  const contexts = await prisma.context.findMany({
    where: { userId: userId },
    select: { id: true, name: true },
  });

  return { nextActions, projects, contexts };
}

export const getInboxCount = cache(async (userId: string) => {
  const count = await prisma.item.count({
    where: {
      userId,
      status: "INBOX",
    },
  });
  return count;
});

export async function getItemToProcess(idOrUserId: string) {
  const item = await prisma.item.findFirst({
    where: {
      OR: [{ id: idOrUserId }, { userId: idOrUserId, status: "INBOX" }],
    },
    include: {
      contexts: true,
    },
  });
  return item;
}

export async function getItemOfProjects(id: string) {
  const item = await prisma.item.findFirst({
    where: {
      projectId: id,
    },
  });
  return item;
}

export async function updateItem(
  id: string,
  data: {
    title?: string;
    notes?: string;
    status?: ItemStatus;
    projectId?: string | null;
    contextIds?: string[];
  },
) {
  const item = await prisma.item.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.notes && { notes: data.notes }),
      ...(data.status && { status: data.status }),
      ...(data.projectId !== undefined && { projectId: data.projectId }),
      ...(data.contextIds && {
        contexts: {
          set: data.contextIds.map((id) => ({ id })),
        },
      }),
    },
    include: {
      contexts: true,
    },
  });
  return item;
}
