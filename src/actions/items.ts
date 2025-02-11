"use server";

import { auth } from "@/lib/auth";
import {
  CommentType,
  ItemStatus,
  PriorityLevel,
  PrismaClient,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cache } from "react";

const prisma = new PrismaClient();

export async function createItem(data: {
  title: string;
  notes?: string;
  projectId?: string;
  priority?: PriorityLevel;
  estimated?: number;
  requiresFocus?: boolean;
}) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  // Validate estimated time if provided
  if (data.estimated) {
    data.estimated = Math.min(Math.max(data.estimated, 5), 480);
  }

  const item = await prisma.item.create({
    data: {
      title: data.title,
      notes: data.notes,
      status: data.projectId ? "PROJECT" : "INBOX",
      projectId: data.projectId ?? null,
      userId: user.id,
      priority: data.priority ?? "MEDIUM",
      estimated: data.estimated,
      requiresFocus: data.requiresFocus ?? false,
    },
  });

  if (data.projectId) {
    revalidatePath(`/projects/${data.projectId}`);
  } else {
    revalidatePath("/inbox");
  }
  return item;
}

export async function getInboxItems() {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  const items = await prisma.item.findMany({
    where: {
      userId: user?.id,
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
  type: CommentType = CommentType.COMMENT,
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
    notes?: string;
    estimated?: number;
    dueDate?: Date;
    priority?: PriorityLevel;
    requiresFocus?: boolean;
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

  // Validate estimated time if provided
  if (data.estimated) {
    data.estimated = Math.min(Math.max(data.estimated, 5), 480);
  }

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      status: data.status,
      projectId: data.projectId,
      contexts: {
        set: data.contextIds?.map((id) => ({ id })) || [],
      },
      notes: data.notes,
      estimated: data.estimated,
      dueDate: data.dueDate,
      priority: data.priority,
      requiresFocus: data.requiresFocus,
    },
  });

  // Add system comment for status change
  if (currentItem.status !== data.status) {
    await addComment(
      itemId,
      `Status changed from ${currentItem.status} to ${data.status}`,
      CommentType.STATUS_CHANGE,
    );
  }

  // Add system comment for project change
  if (currentItem.projectId !== data.projectId) {
    const newProject = data.projectId
      ? await prisma.project.findUnique({ where: { id: data.projectId } })
      : null;

    await addComment(
      itemId,
      `Project ${currentItem.projectId ? "changed from " + currentItem.project?.title : "set to"} ${newProject?.title || "none"}`,
      CommentType.STATUS_CHANGE,
    );
  }

  revalidatePath("/inbox");
  revalidatePath("/process");
  return item;
}

export async function getNextActions() {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  const nextActions = await prisma.item.findMany({
    where: {
      userId: user.id,
      status: "NEXT_ACTION",
    },
    include: {
      project: true,
      contexts: true,
      subtasks: {
        include: {
          task: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      checklistItems: {
        orderBy: {
          order: "asc",
        },
      },
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

export async function getNextActionsWithDetails() {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  const nextActions = await prisma.item.findMany({
    where: {
      userId: user.id,
      status: "NEXT_ACTION",
    },
    include: {
      project: true,
      contexts: true,
      subtasks: {
        include: {
          task: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      checklistItems: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { id: true, title: true },
  });

  const contexts = await prisma.context.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  return { nextActions, projects, contexts };
}

export const getInboxCount = cache(async () => {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  const count = await prisma.item.count({
    where: {
      userId: user.id,
      status: "INBOX",
    },
  });
  return count;
});

export async function getItemToProcess(id?: string) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }
  const item = await prisma.item.findFirst({
    where: id
      ? { id: id }
      : { userId: user.id, status: "INBOX" },
    include: {
      contexts: true,
      subtasks: {
        include: {
          task: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      checklistItems: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  return item;
}
export async function getItemOfProjects(id: string) {
  const item = await prisma.item.findFirst({
    where: {
      projectId: id,
    },
    include: {
      subtasks: {
        include: {
          task: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      checklistItems: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  return item;
}

// Subtask Management
export async function addSubtask(
  parentId: string,
  data: { title: string; notes?: string },
) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  // Create the subtask as a regular item first
  const subtaskItem = await prisma.item.create({
    data: {
      title: data.title,
      notes: data.notes,
      status: "NEXT_ACTION",
      userId: user.id,
    },
  });

  // Create the subtask relationship
  const subtask = await prisma.subtask.create({
    data: {
      parentId,
      taskId: subtaskItem.id,
      order: await getNextSubtaskOrder(parentId),
    },
  });

  revalidatePath("/next-actions");
  return subtask;
}

export async function removeSubtask(parentId: string, subtaskId: string) {
  await prisma.subtask.delete({
    where: {
      taskId: subtaskId,
    },
  });

  // Delete the actual item
  await prisma.item.delete({
    where: {
      id: subtaskId,
    },
  });

  revalidatePath("/next-actions");
}

export async function reorderSubtasks(parentId: string, subtaskIds: string[]) {
  await prisma.$transaction(
    subtaskIds.map((id, index) =>
      prisma.subtask.update({
        where: { taskId: id },
        data: { order: index },
      }),
    ),
  );

  revalidatePath("/next-actions");
}

async function getNextSubtaskOrder(parentId: string): Promise<number> {
  const lastSubtask = await prisma.subtask.findFirst({
    where: { parentId },
    orderBy: { order: "desc" },
  });
  return (lastSubtask?.order ?? -1) + 1;
}

// Checklist Management
export async function addChecklistItem(itemId: string, title: string) {
  const checklistItem = await prisma.checklistItem.create({
    data: {
      title,
      itemId,
      order: await getNextChecklistItemOrder(itemId),
    },
  });

  revalidatePath("/next-actions");
  return checklistItem;
}

export async function updateChecklistItem(
  id: string,
  data: { title?: string; completed?: boolean },
) {
  const checklistItem = await prisma.checklistItem.update({
    where: { id },
    data,
  });

  revalidatePath("/next-actions");
  return checklistItem;
}

export async function removeChecklistItem(id: string) {
  await prisma.checklistItem.delete({
    where: { id },
  });

  revalidatePath("/next-actions");
}

export async function reorderChecklistItems(
  itemId: string,
  checklistItemIds: string[],
) {
  await prisma.$transaction(
    checklistItemIds.map((id, index) =>
      prisma.checklistItem.update({
        where: { id },
        data: { order: index },
      }),
    ),
  );

  revalidatePath("/next-actions");
}

async function getNextChecklistItemOrder(itemId: string): Promise<number> {
  const lastItem = await prisma.checklistItem.findFirst({
    where: { itemId },
    orderBy: { order: "desc" },
  });
  return (lastItem?.order ?? -1) + 1;
}

export async function updateItem(
  id: string,
  data: {
    title?: string;
    notes?: string;
    status?: ItemStatus;
    projectId?: string | null;
    contextIds?: string[];
    priority?: PriorityLevel;
    estimated?: number;
    requiresFocus?: boolean;
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

  // Validate estimated time if provided
  if (data.estimated) {
    data.estimated = Math.min(Math.max(data.estimated, 5), 480);
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
      ...(data.requiresFocus !== undefined && {
        requiresFocus: data.requiresFocus,
      }),
      ...(data.contextIds && {
        contexts: {
          set: data.contextIds.map((id) => ({ id })),
        },
      }),
    },
    include: {
      contexts: true,
      subtasks: {
        include: {
          task: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      checklistItems: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  // Add system comments for changes
  if (data.status && currentItem.status !== data.status) {
    await addComment(
      id,
      `Status changed from ${currentItem.status} to ${data.status}`,
      CommentType.STATUS_CHANGE,
    );
  }

  if (data.priority !== undefined && currentItem.priority !== data.priority) {
    await addComment(
      id,
      `Priority changed from ${currentItem.priority} to ${data.priority}`,
      CommentType.PRIORITY_CHANGE,
    );
  }

  if (
    data.estimated !== undefined &&
    currentItem.estimated !== data.estimated
  ) {
    await addComment(
      id,
      `Estimate changed from ${currentItem.estimated || 0} to ${data.estimated} minutes`,
      CommentType.ESTIMATE_CHANGE,
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
    CommentType.DEPENDENCY_ADDED,
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
    CommentType.DEPENDENCY_REMOVED,
  );
}

export async function getNextItems() {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  const items = await prisma.item.findMany({
    where: {
      userId: user.id,
      status: "NEXT_ACTION",
    },
    select: {
      id: true,
      title: true,
      status: true,
      plannedDate: true,
      estimated: true,
      subtasks: {
        include: {
          task: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      checklistItems: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return items;
}

export async function updateItemPlanning(
  itemId: string,
  data: {
    plannedDate: Date;
    estimated: number;
  },
) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  // Validate estimated time
  const validatedEstimate = Math.min(Math.max(data.estimated, 5), 480);

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      plannedDate: data.plannedDate,
      estimated: validatedEstimate,
    },
  });

  revalidatePath("/calendar");
  return item;
}

interface TaskBreakdown {
  focusSessions: number;
  shortBreaks: number;
  longBreaks: number;
  remainingTime: number;
  totalDuration: number;
}

export async function calculateTaskBreakdown(
  itemId: string,
): Promise<TaskBreakdown> {
  const { user: sessionUser } = await auth();
  if (!sessionUser) {
    throw new Error("User not found");
  }

  // Get the full user data with preferences
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      pomodoroDuration: true,
      breakDuration: true,
      longBreakDuration: true,
      shortBreakInterval: true,
    },
  });

  if (!user) {
    throw new Error("User preferences not found");
  }

  // Get the item with its estimated time
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      estimated: true,
      requiresFocus: true,
    },
  });

  if (!item?.estimated) {
    throw new Error("Item has no estimated duration");
  }

  // If task doesn't require focus, return simple breakdown
  if (!item.requiresFocus) {
    return {
      focusSessions: 1,
      shortBreaks: 0,
      longBreaks: 0,
      remainingTime: item.estimated,
      totalDuration: item.estimated,
    };
  }

  const pomodoroDuration = user.pomodoroDuration;
  const shortBreakDuration = user.breakDuration;
  const longBreakDuration = user.longBreakDuration;
  const sessionsBeforeLongBreak = user.shortBreakInterval;

  // Calculate number of complete focus sessions needed
  const totalMinutes = item.estimated;
  const fullSessions = Math.floor(totalMinutes / pomodoroDuration);
  const remainingTime = totalMinutes % pomodoroDuration;

  // Calculate breaks needed
  const longBreaks = Math.floor(fullSessions / sessionsBeforeLongBreak);
  const shortBreaks = fullSessions - longBreaks - (remainingTime > 0 ? 0 : 1);

  // Calculate total duration including breaks
  const totalDuration =
    totalMinutes + // Task time
    shortBreaks * shortBreakDuration + // Short break time
    longBreaks * longBreakDuration; // Long break time

  return {
    focusSessions: fullSessions + (remainingTime > 0 ? 1 : 0),
    shortBreaks,
    longBreaks,
    remainingTime: remainingTime,
    totalDuration,
  };
}

export async function splitTaskIntoSessions(itemId: string): Promise<void> {
  const { user: sessionUser } = await auth();
  if (!sessionUser) {
    throw new Error("User not found");
  }

  // Get the breakdown first
  const breakdown = await calculateTaskBreakdown(itemId);

  // Get the original task
  const originalTask = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      title: true,
      estimated: true,
      requiresFocus: true,
    },
  });

  if (!originalTask?.estimated || !originalTask.requiresFocus) {
    throw new Error(
      "Task cannot be split: missing estimation or focus requirement",
    );
  }

  // Get user preferences for session duration
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      pomodoroDuration: true,
    },
  });

  if (!user) {
    throw new Error("User preferences not found");
  }

  // Create subtasks for each focus session
  for (let i = 0; i < breakdown.focusSessions; i++) {
    const isLastSession = i === breakdown.focusSessions - 1;
    const sessionDuration =
      isLastSession && breakdown.remainingTime > 0
        ? breakdown.remainingTime
        : user.pomodoroDuration;

    const sessionTitle = `${originalTask.title} - Session ${i + 1}/${breakdown.focusSessions}`;

    // Create the session subtask
    const subtaskItem = await prisma.item.create({
      data: {
        title: sessionTitle,
        status: "NEXT_ACTION",
        userId: sessionUser.id,
        estimated: sessionDuration,
        requiresFocus: true,
      },
    });

    // Link it as a subtask
    await prisma.subtask.create({
      data: {
        parentId: itemId,
        taskId: subtaskItem.id,
        order: i,
      },
    });
  }

  // Update the original task to mark it as split
  await prisma.item.update({
    where: { id: itemId },
    data: {
      notes:
        `Split into ${breakdown.focusSessions} focus sessions\n` +
        `Total duration: ${breakdown.totalDuration} minutes\n` +
        `Short breaks: ${breakdown.shortBreaks}\n` +
        `Long breaks: ${breakdown.longBreaks}`,
    },
  });

  revalidatePath("/next-actions");
}

export async function deleteItem(id: string) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.item.delete({
    where: { id },
  });

  revalidatePath("/inbox");
  return { success: true };
}

export async function updateItemsPriority(
  items: { id: string; priority: PriorityLevel }[],
) {
  const { user } = await auth();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.item.update({
          where: { id: item.id },
          data: { priority: item.priority },
        }),
      ),
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error reordering items:", error);
    throw new Error("Failed to reorder items");
  }
}
