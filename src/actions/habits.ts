"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createHabit = async (
  name: string,
  description?: string
): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        description,
        frequency: 1,
        period: "day",
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to create habit" };
  }

  revalidatePath("/dashboard");
  return { message: "Habit created successfully" };
};

export const updateHabit = async (id: string, name: string, description?: string, frequency: number = 1, period: string = "day"): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.habit.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        name: name,
        description: description,
        frequency: frequency,
        period: period,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to update habit" };
  }

  revalidatePath("/dashboard");
  return { message: "Habit updated successfully" };
};

export const deleteHabit = async (id: string): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.habit.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to delete habit" };
  }

  revalidatePath("/dashboard");
  return { message: "Habit deleted successfully" };
};

export const logHabit = async (id: string, date: Date, completed: boolean): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date: date,
        },
      },
      update: {
        completed: completed,
      },
      create: {
        habitId: id,
        date: date,
        completed: completed,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to log habit" };
  }

  revalidatePath("/dashboard");
  return { message: "Habit logged successfully" };
};

export const createDailyMetric = async (name: string, value: string | undefined, date: Date): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    // Find or create the DailyProductivity entry for the user and date
    let dailyProductivity = await prisma.dailyProductivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: date,
        },
      },
    });

    if (!dailyProductivity) {
      dailyProductivity = await prisma.dailyProductivity.create({
          data: {
            userId: session.user.id,
            date: date,
          },
        });
      }

      await prisma.dailyMetric.create({
        data: {
          dailyProductivityId: dailyProductivity.id,
          name: name,
          value: value,
        },
      });
    } catch (error) {
      console.error(error);
      return { message: "Failed to create daily metric" };
    }

    revalidatePath("/dashboard");
    return { message: "Daily metric created successfully" };
};

export const updateDailyMetric = async (id: string, name: string, value: string | undefined): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.dailyMetric.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        value: value,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to update daily metric" };
  }

  revalidatePath("/dashboard");
  return { message: "Daily metric updated successfully" };
};

export const deleteDailyMetric = async (id: string): Promise<{ message: string | null }> => {
  const session = await auth();

  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.dailyMetric.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Failed to delete daily metric" };
  }

  revalidatePath("/dashboard");
  return { message: "Daily metric deleted successfully" };
};
