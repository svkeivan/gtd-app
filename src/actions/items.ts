"use server";

import { auth } from "@/lib/auth";
import { CommentType, ItemStatus, PrismaClient } from "@prisma/client";
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

export async function addComment(
  itemId: string,
  content: string,
  type: CommentType = CommentType.COMMENT
) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  const comment = await prisma.taskComment.create({
    data: {
      content,
      type,
      taskId: itemId,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Create notifications for all users except the comment author
  await prisma.commentNotification.createMany({
    data: {
      commentId: comment.id,
      userId: user.id,
    },
  });

  revalidatePath(`/items/${itemId}`);
  return comment;
}

export async function getItemComments(itemId: string) {
  const comments = await prisma.taskComment.findMany({
    where: {
      taskId: itemId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return comments;
}

export async function processItem(
  itemId: string,
  data: {
    status: ItemStatus;
    projectId?: string;
    contextIds?: string[];
  },
) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  const currentItem = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      project: true,
    },
  });

  if (!currentItem) {
    throw new Error("Item not found");
  }

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

  // Add system comment for status change
  if (currentItem.status !== data.status) {
    await addComment(
      itemId,
      `Status changed from ${currentItem.status} to ${data.status}`,
      CommentType.STATUS_CHANGE
    );
  }

  // Add system comment for project change
  if (currentItem.projectId !== data.projectId) {
    const newProject = data.projectId 
      ? await prisma.project.findUnique({ where: { id: data.projectId } })
      : null;
    
    await addComment(
      itemId,
      `Project ${currentItem.projectId ? 'changed from ' + currentItem.project?.title : 'set to'} ${newProject?.title || 'none'}`,
      CommentType.STATUS_CHANGE
    );
  }

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
    priority?: number;
    estimated?: number;
  },
) {
  const currentItem = await prisma.item.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!currentItem) {
    throw new Error("Item not found");
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.notes && { notes: data.notes }),
      ...(data.status && { status: data.status }),
      ...(data.projectId !== undefined && { projectId: data.projectId }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.estimated !== undefined && { estimated: data.estimated }),
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

  // Add system comments for changes
  if (data.status && currentItem.status !== data.status) {
    await addComment(
      id,
      `Status changed from ${currentItem.status} to ${data.status}`,
      CommentType.STATUS_CHANGE
    );
  }

  if (data.priority !== undefined && currentItem.priority !== data.priority) {
    await addComment(
      id,
      `Priority changed from ${currentItem.priority} to ${data.priority}`,
      CommentType.PRIORITY_CHANGE
    );
  }

  if (data.estimated !== undefined && currentItem.estimated !== data.estimated) {
    await addComment(
      id,
      `Estimate changed from ${currentItem.estimated || 0} to ${data.estimated} minutes`,
      CommentType.ESTIMATE_CHANGE
    );
  }

  return item;
}

export async function addDependency(itemId: string, blockerTaskId: string) {
  const dependency = await prisma.taskDependency.create({
    data: {
      dependentTaskId: itemId,
      blockerTaskId,
    },
  });

  await addComment(
    itemId,
    `Added dependency on task ${blockerTaskId}`,
    CommentType.DEPENDENCY_ADDED
  );

  return dependency;
}

export async function removeDependency(itemId: string, blockerTaskId: string) {
  await prisma.taskDependency.deleteMany({
    where: {
      dependentTaskId: itemId,
      blockerTaskId,
    },
  });

  await addComment(
    itemId,
    `Removed dependency on task ${blockerTaskId}`,
    CommentType.DEPENDENCY_REMOVED
  );
}
