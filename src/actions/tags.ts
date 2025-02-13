"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

const prisma = new PrismaClient();

// Helper functions
function validateColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

// Implementation functions
async function getTagsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const tags = await prisma.tag.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return tags;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function createTagImpl(data: { name: string; color: string }) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate name
  if (!data.name?.trim()) {
    throw new ValidationError("Tag name is required");
  }
  if (data.name.length > 30) {
    throw new ValidationError("Tag name must be less than 30 characters");
  }

  // Validate color
  if (!data.color) {
    throw new ValidationError("Color is required");
  }
  if (!validateColor(data.color)) {
    throw new ValidationError("Invalid color format. Use hex color (e.g., #FF0000)");
  }

  try {
    // Check if tag with same name exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: user.id,
        name: data.name,
      },
    });

    if (existingTag) {
      throw new ValidationError("A tag with this name already exists");
    }

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        color: data.color,
        userId: user.id,
      },
    });

    revalidatePath("/tags");
    return tag;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateTagImpl(
  tagId: string,
  data: { name: string; color: string }
) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate name
  if (!data.name?.trim()) {
    throw new ValidationError("Tag name is required");
  }
  if (data.name.length > 30) {
    throw new ValidationError("Tag name must be less than 30 characters");
  }

  // Validate color
  if (!data.color) {
    throw new ValidationError("Color is required");
  }
  if (!validateColor(data.color)) {
    throw new ValidationError("Invalid color format. Use hex color (e.g., #FF0000)");
  }

  try {
    // Verify tag exists and user owns it
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      throw new NotFoundError("Tag", tagId);
    }

    if (existingTag.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this tag");
    }

    // Check if new name conflicts with another tag
    if (data.name !== existingTag.name) {
      const nameConflict = await prisma.tag.findFirst({
        where: {
          userId: user.id,
          name: data.name,
          id: { not: tagId },
        },
      });

      if (nameConflict) {
        throw new ValidationError("A tag with this name already exists");
      }
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    revalidatePath("/tags");
    return tag;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function deleteTagImpl(tagId: string) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify tag exists and user owns it
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!existingTag) {
      throw new NotFoundError("Tag", tagId);
    }

    if (existingTag.userId !== user.id) {
      throw new AuthenticationError("Not authorized to delete this tag");
    }

    // Check if tag has any items
    if (existingTag._count.items > 0) {
      throw new ValidationError(
        "Cannot delete tag with existing items. Please remove the tag from all items first."
      );
    }

    await prisma.tag.delete({
      where: { id: tagId },
    });

    revalidatePath("/tags");
  } catch (error) {
    handlePrismaError(error);
  }
}

// Export wrapped actions
export const getTags = createSafeAction(getTagsImpl);
export const createTag = createSafeAction(createTagImpl);
export const updateTag = createSafeAction(updateTagImpl);
export const deleteTag = createSafeAction(deleteTagImpl);
