"use server";

import { auth } from "@/lib/auth";
import { PrismaClient, Context, ItemStatus, PriorityLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { ActionState } from "@/lib/create-safe-action";
import { z } from "zod";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

const prisma = new PrismaClient();

// Types
export interface ContextListItem {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  priority: PriorityLevel;
  title: string;
  notes: string | null;
  status: ItemStatus;
  dueDate: Date | null;
  plannedDate: Date | null;
  estimated: number | null;
  requiresFocus: boolean;
  projectId: string | null;
}

export interface ContextWithItems extends Context {
  items: ContextListItem[];
}

// Schemas
const getContextsSchema = z.void();

const createContextSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  mondayEnabled: z.boolean().optional(),
  tuesdayEnabled: z.boolean().optional(),
  wednesdayEnabled: z.boolean().optional(),
  thursdayEnabled: z.boolean().optional(),
  fridayEnabled: z.boolean().optional(),
  saturdayEnabled: z.boolean().optional(),
  sundayEnabled: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

const updateContextSchema = z.object({
  id: z.string(),
  data: createContextSchema,
});

const deleteContextSchema = z.object({
  id: z.string(),
});

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
async function getContextsImpl(): Promise<ActionState<void, ContextWithItems[]>> {
  try {
    const { user } = await auth();
    if (!user) {
      return {
        fieldErrors: undefined,
        error: "Unauthorized",
      };
    }

    const contexts = await prisma.context.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            priority: true,
            title: true,
            notes: true,
            status: true,
            dueDate: true,
            plannedDate: true,
            estimated: true,
            requiresFocus: true,
            projectId: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      fieldErrors: undefined,
      error: undefined,
      data: contexts,
    };
  } catch (error) {
    console.error("Error in getContexts:", error);
    return {
      fieldErrors: undefined,
      error: error instanceof Error ? error.message : "Failed to load contexts",
    };
  }
}

async function createContextImpl(
  data: z.infer<typeof createContextSchema>
): Promise<ActionState<z.infer<typeof createContextSchema>, Context>> {
  try {
    const { user } = await auth();
    if (!user) {
      return {
        fieldErrors: undefined,
        error: "Unauthorized",
      };
    }

    // Validate time range if provided
    if (data.startTime || data.endTime) {
      validateTimeRange(
        data.startTime ?? "09:00",
        data.endTime ?? "17:00"
      );
    }

    // Check if context with same name exists
    const existingContext = await prisma.context.findFirst({
      where: {
        userId: user.id,
        name: data.name,
      },
    });

    if (existingContext) {
      return {
        fieldErrors: undefined,
        error: "A context with this name already exists",
      };
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
    return {
      fieldErrors: undefined,
      error: undefined,
      data: context,
    };
  } catch (error) {
    console.error("Error in createContext:", error);
    return {
      fieldErrors: undefined,
      error: error instanceof Error ? error.message : "Failed to create context",
    };
  }
}

async function updateContextImpl(
  data: z.infer<typeof updateContextSchema>
): Promise<ActionState<z.infer<typeof updateContextSchema>, Context>> {
  try {
    const { user } = await auth();
    if (!user) {
      return {
        fieldErrors: undefined,
        error: "Unauthorized",
      };
    }

    // Verify context exists and user owns it
    const existingContext = await prisma.context.findUnique({
      where: { id: data.id },
    });

    if (!existingContext) {
      return {
        fieldErrors: undefined,
        error: `Context not found: ${data.id}`,
      };
    }

    if (existingContext.userId !== user.id) {
      return {
        fieldErrors: undefined,
        error: "Not authorized to modify this context",
      };
    }

    // Check if new name conflicts with another context
    if (data.data.name !== existingContext.name) {
      const nameConflict = await prisma.context.findFirst({
        where: {
          userId: user.id,
          name: data.data.name,
          id: { not: data.id },
        },
      });

      if (nameConflict) {
        return {
          fieldErrors: undefined,
          error: "A context with this name already exists",
        };
      }
    }

    const context = await prisma.context.update({
      where: { id: data.id },
      data: {
        name: data.data.name,
        description: data.data.description,
        mondayEnabled: data.data.mondayEnabled,
        tuesdayEnabled: data.data.tuesdayEnabled,
        wednesdayEnabled: data.data.wednesdayEnabled,
        thursdayEnabled: data.data.thursdayEnabled,
        fridayEnabled: data.data.fridayEnabled,
        saturdayEnabled: data.data.saturdayEnabled,
        sundayEnabled: data.data.sundayEnabled,
        startTime: data.data.startTime,
        endTime: data.data.endTime,
      },
    });

    revalidatePath("/contexts");
    return {
      fieldErrors: undefined,
      error: undefined,
      data: context,
    };
  } catch (error) {
    console.error("Error in updateContext:", error);
    return {
      fieldErrors: undefined,
      error: error instanceof Error ? error.message : "Failed to update context",
    };
  }
}

async function deleteContextImpl(
  data: z.infer<typeof deleteContextSchema>
): Promise<ActionState<z.infer<typeof deleteContextSchema>, void>> {
  try {
    const { user } = await auth();
    if (!user) {
      return {
        fieldErrors: undefined,
        error: "Unauthorized",
      };
    }

    // Verify context exists and user owns it
    const existingContext = await prisma.context.findUnique({
      where: { id: data.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!existingContext) {
      return {
        fieldErrors: undefined,
        error: `Context not found: ${data.id}`,
      };
    }

    if (existingContext.userId !== user.id) {
      return {
        fieldErrors: undefined,
        error: "Not authorized to delete this context",
      };
    }

    // Check if context has any items
    if (existingContext._count.items > 0) {
      return {
        fieldErrors: undefined,
        error: "Cannot delete context with existing items. Please remove all items from this context first.",
      };
    }

    await prisma.context.delete({
      where: { id: data.id },
    });

    revalidatePath("/contexts");
    return {
      fieldErrors: undefined,
      error: undefined,
      data: undefined,
    };
  } catch (error) {
    console.error("Error in deleteContext:", error);
    return {
      fieldErrors: undefined,
      error: error instanceof Error ? error.message : "Failed to delete context",
    };
  }
}

// Export wrapped actions
export const getContexts = createSafeAction(getContextsSchema, getContextsImpl);
export const createContext = createSafeAction(createContextSchema, createContextImpl);
export const updateContext = createSafeAction(updateContextSchema, updateContextImpl);
export const deleteContext = createSafeAction(deleteContextSchema, deleteContextImpl);
