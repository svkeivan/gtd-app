"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProfileFormData, profileSchema } from "@/types/profile-types";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const { user: authUser } = await auth();

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      language: true,
      theme: true,
      timezone: true,
      avatar: true,
      profileComplete: true,
    },
  });

  if (!userProfile) {
    throw new Error("User not found");
  }

  return userProfile;
}

export async function updateProfile(data: ProfileFormData) {
  const { user: authUser } = await auth();

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  // Validate data
  const validatedData = profileSchema.parse(data);

  // Start a transaction to handle both update and audit log
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Get previous data for audit log
    const previousData = await tx.user.findUnique({
      where: { id: authUser.id },
      select: {
        name: true,
        language: true,
        theme: true,
        timezone: true,
        avatar: true,
      },
    });

    // Update user
    const user = await tx.user.update({
      where: { id: authUser.id },
      data: {
        ...validatedData,
        profileComplete: true,
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: authUser.id,
        action: "PROFILE_UPDATE",
        details: JSON.stringify({
          previous: previousData,
          new: validatedData,
        }),
      },
    });

    return user;
  });

  revalidatePath("/dashboard/profile");

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    language: updatedUser.language,
    theme: updatedUser.theme,
    timezone: updatedUser.timezone,
    avatar: updatedUser.avatar,
    profileComplete: updatedUser.profileComplete,
  };
}
