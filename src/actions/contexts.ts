"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

const prisma = new PrismaClient();

// Helper functions
function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function validateTimeRange(startTime: string, endTime: string): void {
  if (!validateTimeFormat(startTime)) {
    throw new ValidationError("Invalid start time format. Use HH:MM format");
  }
  if (!validateTimeFormat(endTime)) {
    throw new ValidationError("Invalid end time format. Use HH:MM format");
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes >= endMinutes) {
    throw new ValidationError("Start time must be before end time");
  }
}

// Implementation functions
async function getContextsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const contexts = await prisma.context.findMany({
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
    return contexts;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function createContextImpl(data: {
  name: string;
  description?: string;
  mondayEnabled?: boolean;
  tuesdayEnabled?: boolean;
  wednesdayEnabled?: boolean;
  thursdayEnabled?: boolean;
  fridayEnabled?: boolean;
  saturdayEnabled?: boolean;
  sundayEnabled?: boolean;
  startTime?: string;
  endTime?: string;
}) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate name
  if (!data.name?.trim()) {
    throw new ValidationError("Context name is required");
  }
  if (data.name.length > 50) {
    throw new ValidationError("Context name must be less than 50 characters");
  }

  // Validate description
  if (data.description && data.description.length > 500) {
    throw new ValidationError("Description must be less than 500 characters");
  }

  // Validate time range if provided
  if (data.startTime || data.endTime) {
    validateTimeRange(
      data.startTime ?? "09:00",
      data.endTime ?? "17:00"
    );
  }

  try {
    // Check if context with same name exists
    const existingContext = await prisma.context.findFirst({
      where: {
        userId: user.id,
        name: data.name,
      },
    });

    if (existingContext) {
      throw new ValidationError("A context with this name already exists");
    }

    const context = await prisma.context.create({
      data: {
        name: data.name,
        description: data.description,
        userId: user.id,
        mondayEnabled: data.mondayEnabled ?? false,
        tuesdayEnabled: data.tuesdayEnabled ?? false,
        wednesdayEnabled: data.wednesdayEnabled ?? false,
        thursdayEnabled: data.thursdayEnabled ?? false,
        fridayEnabled: data.fridayEnabled ?? false,
        saturdayEnabled: data.saturdayEnabled ?? false,
        sundayEnabled: data.sundayEnabled ?? false,
        startTime: data.startTime ?? "09:00",
        endTime: data.endTime ?? "17:00",
      },
    });

    revalidatePath("/contexts");
    return context;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateContextImpl(
  contextId: string,
  data: {
    name: string;
    description?: string;
    mondayEnabled?: boolean;
    tuesdayEnabled?: boolean;
    wednesdayEnabled?: boolean;
    thursdayEnabled?: boolean;
    fridayEnabled?: boolean;
    saturdayEnabled?: boolean;
    sundayEnabled?: boolean;
    startTime?: string;
    endTime?: string;
  },
) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  // Validate name
  if (!data.name?.trim()) {
    throw new ValidationError("Context name is required");
  }
  if (data.name.length > 50) {
    throw new ValidationError("Context name must be less than 50 characters");
  }

  // Validate description
  if (data.description && data.description.length > 500) {
    throw new ValidationError("Description must be less than 500 characters");
  }

  // Validate time range if provided
  if (data.startTime || data.endTime) {
    validateTimeRange(
      data.startTime ?? "09:00",
      data.endTime ?? "17:00"
    );
  }

  try {
    // Verify context exists and user owns it
    const existingContext = await prisma.context.findUnique({
      where: { id: contextId },
    });

    if (!existingContext) {
      throw new NotFoundError("Context", contextId);
    }

    if (existingContext.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this context");
    }

    // Check if new name conflicts with another context
    if (data.name !== existingContext.name) {
      const nameConflict = await prisma.context.findFirst({
        where: {
          userId: user.id,
          name: data.name,
          id: { not: contextId },
        },
      });

      if (nameConflict) {
        throw new ValidationError("A context with this name already exists");
      }
    }

    const context = await prisma.context.update({
      where: { id: contextId },
      data: {
        name: data.name,
        description: data.description,
        mondayEnabled: data.mondayEnabled,
        tuesdayEnabled: data.tuesdayEnabled,
        wednesdayEnabled: data.wednesdayEnabled,
        thursdayEnabled: data.thursdayEnabled,
        fridayEnabled: data.fridayEnabled,
        saturdayEnabled: data.saturdayEnabled,
        sundayEnabled: data.sundayEnabled,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    revalidatePath("/contexts");
    return context;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function deleteContextImpl(contextId: string) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify context exists and user owns it
    const existingContext = await prisma.context.findUnique({
      where: { id: contextId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!existingContext) {
      throw new NotFoundError("Context", contextId);
    }

    if (existingContext.userId !== user.id) {
      throw new AuthenticationError("Not authorized to delete this context");
    }

    // Check if context has any items
    if (existingContext._count.items > 0) {
      throw new ValidationError(
        "Cannot delete context with existing items. Please remove all items from this context first."
      );
    }

    await prisma.context.delete({
      where: { id: contextId },
    });

    revalidatePath("/contexts");
  } catch (error) {
    handlePrismaError(error);
  }
}

// Export wrapped actions
export const getContexts = createSafeAction(getContextsImpl);
export const createContext = createSafeAction(createContextImpl);
export const updateContext = createSafeAction(updateContextImpl);
export const deleteContext = createSafeAction(deleteContextImpl);
