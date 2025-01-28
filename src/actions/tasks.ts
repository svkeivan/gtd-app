"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUncompletedTasks(userId: string) {
  return prisma.item.findMany({
    where: {
      userId: userId,
      status: "NEXT_ACTION",
    },
    select: {
      id: true,
      title: true,
      status: true,
      estimated: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
