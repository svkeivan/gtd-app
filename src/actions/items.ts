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
import { createSafeAction } from "@/lib/safe-action";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

const prisma = new PrismaClient();

// Helper functions
async function getNextSubtaskOrder(parentId: string): Promise<number> {
  const lastSubtask = await prisma.subtask.findFirst({
    where: { parentId },
    orderBy: { order: "desc" },
  });
  return (lastSubtask?.order ?? -1) + 1;
}

async function getNextChecklistItemOrder(itemId: string): Promise<number> {
  const lastItem = await prisma.checklistItem.findFirst({
    where: { itemId },
    orderBy: { order: "desc" },
  });
  return (lastItem?.order ?? -1) + 1;
}

// Base implementations
async function createItemImpl(data: {
  title: string;
  notes?: string;
  projectId?: string;
  priority?: PriorityLevel;
  estimated?: number;
  requiresFocus?: boolean;
}) {
  if (!data.title.trim()) {
    throw new ValidationError("Title is required");
  }

  // Validate estimated time if provided
  if (data.estimated) {
    if (data.estimated < 5 || data.estimated > 480) {
      throw new ValidationError("Estimated time must be between 5 and 480 minutes");
    }
    data.estimated = Math.min(Math.max(data.estimated, 5), 480);
  }

  // If projectId is provided, verify it exists
  if (data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new NotFoundError("Project", data.projectId);
    }
  }

  try {
    const { user } = await auth();
    if (!user) throw new AuthenticationError();

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
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getInboxItemsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const items = await prisma.item.findMany({
      where: {
        userId: user.id,
        status: "INBOX",
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
  } catch (error) {
    handlePrismaError(error);
  }
}

async function addCommentImpl(
  itemId: string,
  content: string,
  type: CommentType = CommentType.COMMENT,
) {
  if (!content.trim()) {
    throw new ValidationError("Comment content is required");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundError("Item", itemId);
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
  } catch (error) {
    handlePrismaError(error);
  }
}

async function processItemImpl(
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
  if (!user) throw new AuthenticationError();

  try {
    const currentItem = await prisma.item.findUnique({
      where: { id: itemId },
      include: { project: true },
    });

    if (!currentItem) {
      throw new NotFoundError("Item", itemId);
    }

    // Validate estimated time if provided
    if (data.estimated) {
      if (data.estimated < 5 || data.estimated > 480) {
        throw new ValidationError("Estimated time must be between 5 and 480 minutes");
      }
      data.estimated = Math.min(Math.max(data.estimated, 5), 480);
    }

    // Verify project exists if provided
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        throw new NotFoundError("Project", data.projectId);
      }
    }

    // Verify contexts exist if provided
    if (data.contextIds?.length) {
      const contexts = await prisma.context.findMany({
        where: { id: { in: data.contextIds } },
      });
      if (contexts.length !== data.contextIds.length) {
        throw new ValidationError("One or more contexts not found");
      }
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

    // Add system comments for changes
    if (currentItem.status !== data.status) {
      await addCommentImpl(
        itemId,
        `Status changed from ${currentItem.status} to ${data.status}`,
        CommentType.STATUS_CHANGE,
      );
    }

    if (currentItem.projectId !== data.projectId) {
      const newProject = data.projectId
        ? await prisma.project.findUnique({ where: { id: data.projectId } })
        : null;

      await addCommentImpl(
        itemId,
        `Project ${currentItem.projectId ? "changed from " + currentItem.project?.title : "set to"} ${newProject?.title || "none"}`,
        CommentType.STATUS_CHANGE,
      );
    }

    revalidatePath("/inbox");
    revalidatePath("/process");
    return item;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateItemImpl(
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
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const currentItem = await prisma.item.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!currentItem) {
      throw new NotFoundError("Item", id);
    }

    // Validate title if provided
    if (data.title && !data.title.trim()) {
      throw new ValidationError("Title cannot be empty");
    }

    // Validate estimated time if provided
    if (data.estimated) {
      if (data.estimated < 5 || data.estimated > 480) {
        throw new ValidationError("Estimated time must be between 5 and 480 minutes");
      }
      data.estimated = Math.min(Math.max(data.estimated, 5), 480);
    }

    // Verify project exists if provided
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        throw new NotFoundError("Project", data.projectId);
      }
    }

    // Verify contexts exist if provided
    if (data.contextIds?.length) {
      const contexts = await prisma.context.findMany({
        where: { id: { in: data.contextIds } },
      });
      if (contexts.length !== data.contextIds.length) {
        throw new ValidationError("One or more contexts not found");
      }
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
      await addCommentImpl(
        id,
        `Status changed from ${currentItem.status} to ${data.status}`,
        CommentType.STATUS_CHANGE,
      );
    }

    if (data.priority !== undefined && currentItem.priority !== data.priority) {
      await addCommentImpl(
        id,
        `Priority changed from ${currentItem.priority} to ${data.priority}`,
        CommentType.PRIORITY_CHANGE,
      );
    }

    if (
      data.estimated !== undefined &&
      currentItem.estimated !== data.estimated
    ) {
      await addCommentImpl(
        id,
        `Estimate changed from ${currentItem.estimated || 0} to ${data.estimated} minutes`,
        CommentType.ESTIMATE_CHANGE,
      );
    }

    return item;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function addSubtaskImpl(
  parentId: string,
  data: { title: string; notes?: string },
) {
  if (!data.title.trim()) {
    throw new ValidationError("Subtask title is required");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify parent item exists and belongs to user
    const parentItem = await prisma.item.findUnique({
      where: { id: parentId },
    });
    if (!parentItem) {
      throw new NotFoundError("Parent item", parentId);
    }
    if (parentItem.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this item");
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
  } catch (error) {
    handlePrismaError(error);
  }
}

async function removeSubtaskImpl(parentId: string, subtaskId: string) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify both items exist and belong to user
    const [parent, subtask] = await Promise.all([
      prisma.item.findUnique({ where: { id: parentId } }),
      prisma.item.findUnique({ where: { id: subtaskId } }),
    ]);

    if (!parent) throw new NotFoundError("Parent item", parentId);
    if (!subtask) throw new NotFoundError("Subtask", subtaskId);

    if (parent.userId !== user.id || subtask.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify these items");
    }

    // Delete the subtask relationship and the item
    await prisma.$transaction([
      prisma.subtask.delete({
        where: { taskId: subtaskId },
      }),
      prisma.item.delete({
        where: { id: subtaskId },
      }),
    ]);

    revalidatePath("/next-actions");
  } catch (error) {
    handlePrismaError(error);
  }
}

async function addChecklistItemImpl(itemId: string, title: string) {
  if (!title.trim()) {
    throw new ValidationError("Checklist item title is required");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify parent item exists and belongs to user
    const parentItem = await prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!parentItem) {
      throw new NotFoundError("Item", itemId);
    }
    if (parentItem.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this item");
    }

    const checklistItem = await prisma.checklistItem.create({
      data: {
        title,
        itemId,
        order: await getNextChecklistItemOrder(itemId),
      },
    });

    revalidatePath("/next-actions");
    return checklistItem;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateChecklistItemImpl(
  id: string,
  data: { title?: string; completed?: boolean },
) {
  if (data.title !== undefined && !data.title.trim()) {
    throw new ValidationError("Checklist item title cannot be empty");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify checklist item exists and belongs to user through parent item
    const existingItem = await prisma.checklistItem.findUnique({
      where: { id },
      include: { item: true },
    });
    if (!existingItem) {
      throw new NotFoundError("Checklist item", id);
    }
    if (existingItem.item.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this checklist item");
    }

    const checklistItem = await prisma.checklistItem.update({
      where: { id },
      data,
    });

    revalidatePath("/next-actions");
    return checklistItem;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function addDependencyImpl(itemId: string, blockerTaskId: string) {
  if (itemId === blockerTaskId) {
    throw new ValidationError("An item cannot depend on itself");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify both items exist and belong to user
    const [dependentTask, blockerTask] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemId } }),
      prisma.item.findUnique({ where: { id: blockerTaskId } }),
    ]);

    if (!dependentTask) throw new NotFoundError("Dependent task", itemId);
    if (!blockerTask) throw new NotFoundError("Blocker task", blockerTaskId);

    if (dependentTask.userId !== user.id || blockerTask.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify these items");
    }

    // Check for circular dependencies
    const existingDependency = await prisma.taskDependency.findFirst({
      where: {
        OR: [
          { dependentTaskId: blockerTaskId, blockerTaskId: itemId },
          { dependentTaskId: itemId, blockerTaskId: blockerTaskId },
        ],
      },
    });

    if (existingDependency) {
      throw new ValidationError("Circular dependency detected");
    }

    const dependency = await prisma.taskDependency.create({
      data: {
        dependentTaskId: itemId,
        blockerTaskId,
      },
    });

    await addCommentImpl(
      itemId,
      `Added dependency on task ${blockerTaskId}`,
      CommentType.DEPENDENCY_ADDED,
    );

    return dependency;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function removeDependencyImpl(itemId: string, blockerTaskId: string) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify both items exist and belong to user
    const [dependentTask, blockerTask] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemId } }),
      prisma.item.findUnique({ where: { id: blockerTaskId } }),
    ]);

    if (!dependentTask) throw new NotFoundError("Dependent task", itemId);
    if (!blockerTask) throw new NotFoundError("Blocker task", blockerTaskId);

    if (dependentTask.userId !== user.id || blockerTask.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify these items");
    }

    await prisma.taskDependency.deleteMany({
      where: {
        dependentTaskId: itemId,
        blockerTaskId,
      },
    });

    await addCommentImpl(
      itemId,
      `Removed dependency on task ${blockerTaskId}`,
      CommentType.DEPENDENCY_REMOVED,
    );
  } catch (error) {
    handlePrismaError(error);
  }
}

// Create safe actions
export const createItem = createSafeAction(createItemImpl);
export const getInboxItems = createSafeAction(getInboxItemsImpl);
export const addComment = createSafeAction(addCommentImpl);
export const processItem = createSafeAction(processItemImpl);
export const updateItem = createSafeAction(updateItemImpl);
export const addSubtask = createSafeAction(addSubtaskImpl);
export const removeSubtask = createSafeAction(removeSubtaskImpl);
export const addChecklistItem = createSafeAction(addChecklistItemImpl);
export const updateChecklistItem = createSafeAction(updateChecklistItemImpl);
export const addDependency = createSafeAction(addDependencyImpl);
export const removeDependency = createSafeAction(removeDependencyImpl);

// Cache wrapper for inbox count
export const getInboxCount = cache(createSafeAction(async () => {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    return await prisma.item.count({
      where: {
        userId: user.id,
        status: "INBOX",
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}));
