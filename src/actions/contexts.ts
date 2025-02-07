"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();


export async function getContexts() {
const { user } = await auth();

  const contexts = await prisma.context.findMany({
    where: {
      userId: user?.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return contexts;
}

export async function createContext(data: {
  name: string;
  description?: string;
  userId: string;
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
  const context = await prisma.context.create({
    data: {
      name: data.name,
      description: data.description,
      user: { connect: { id: data.userId } },
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
}

export async function updateContext(
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
}

export async function deleteContext(contextId: string) {
  await prisma.context.delete({
    where: { id: contextId },
  });
  revalidatePath("/contexts");
}
