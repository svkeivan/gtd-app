import { NextResponse } from "next/server";
import { PrismaClient, CommentType } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, itemId, type = CommentType.COMMENT } = await request.json();

    if (!content || !itemId) {
      return NextResponse.json(
        { error: "Content and itemId are required" },
        { status: 400 }
      );
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

    // Create notification
    await prisma.commentNotification.create({
      data: {
        commentId: comment.id,
        userId: user.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "ItemId is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
