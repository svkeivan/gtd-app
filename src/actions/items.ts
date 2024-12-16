"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createItem(data: {
  title: string;
  notes?: string;
  userId: string;
}) {
  const item = await prisma.item.create({
    data: {
      title: data.title,
      notes: data.notes,
      status: "INBOX",
      user: { connect: { id: data.userId } },
    },
  });
  revalidatePath("/inbox");
  return item;
}

export async function getInboxItems(userId: string) {
  const items = await prisma.item.findMany({
    where: {
      userId: userId,
      status: "INBOX",
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
    status: string;
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

export async function updateItemStatus(itemId: string, status: string) {
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
