import { NextResponse } from "next/server";
import { PrismaClient, CommentType } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await request.json();

    // Get current item state for comparison
    const currentItem = await prisma.item.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!currentItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        title: data.title,
        notes: data.notes,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        estimated: data.estimated,
        projectId: data.projectId,
      },
      include: {
        project: true,
        contexts: true,
        tags: true,
      },
    });

    // Create system comments for changes
    const createSystemComment = async (content: string, type: CommentType) => {
      await prisma.taskComment.create({
        data: {
          content,
          type,
          taskId: id,
          userId: user.id,
        },
      });
    };

    // Check for status change
    if (currentItem.status !== data.status) {
      await createSystemComment(
        `Status changed from ${currentItem.status} to ${data.status}`,
        CommentType.STATUS_CHANGE
      );
    }

    // Check for priority change
    if (currentItem.priority !== data.priority) {
      await createSystemComment(
        `Priority changed from ${currentItem.priority} to ${data.priority}`,
        CommentType.PRIORITY_CHANGE
      );
    }

    // Check for estimate change
    if (currentItem.estimated !== data.estimated) {
      await createSystemComment(
        `Estimate changed from ${currentItem.estimated || 0} to ${
          data.estimated || 0
        } minutes`,
        CommentType.ESTIMATE_CHANGE
      );
    }

    // Check for project change
    if (currentItem.projectId !== data.projectId) {
      const newProject = data.projectId
        ? await prisma.project.findUnique({
            where: { id: data.projectId },
          })
        : null;

      await createSystemComment(
        `Project ${
          currentItem.projectId
            ? "changed from " + currentItem.project?.title
            : "set to"
        } ${newProject?.title || "none"}`,
        CommentType.STATUS_CHANGE
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
