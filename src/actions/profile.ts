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
      // Work schedule preferences
      workStartTime: true,
      workEndTime: true,
      lunchStartTime: true,
      lunchDuration: true,
      breakDuration: true,
      longBreakDuration: true,
      pomodoroDuration: true,
      shortBreakInterval: true,
      subscription: {
        select: {
          plan: true,
          status: true,
          trialEndsAt: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        }
      }
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
        workStartTime: true,
        workEndTime: true,
        lunchStartTime: true,
        lunchDuration: true,
        breakDuration: true,
        longBreakDuration: true,
        pomodoroDuration: true,
        shortBreakInterval: true,
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
    workStartTime: updatedUser.workStartTime,
    workEndTime: updatedUser.workEndTime,
    lunchStartTime: updatedUser.lunchStartTime,
    lunchDuration: updatedUser.lunchDuration,
    breakDuration: updatedUser.breakDuration,
    longBreakDuration: updatedUser.longBreakDuration,
    pomodoroDuration: updatedUser.pomodoroDuration,
    shortBreakInterval: updatedUser.shortBreakInterval,
  };
}

export async function getSubscriptionDetails() {
  const { user: authUser } = await auth();

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: authUser.id },
    select: {
      plan: true,
      status: true,
      trialEndsAt: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  return subscription;
}

export async function cancelSubscription() {
  const { user: authUser } = await auth();

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { userId: authUser.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: authUser.id,
        action: "SUBSCRIPTION_CANCELED",
        details: "Subscription scheduled for cancellation at period end",
      },
    });

    return updated;
  });

  revalidatePath("/dashboard/profile");

  return subscription;
}

export async function reactivateSubscription() {
  const { user: authUser } = await auth();

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { userId: authUser.id },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: authUser.id,
        action: "SUBSCRIPTION_UPDATED",
        details: "Subscription reactivated",
      },
    });

    return updated;
  });

  revalidatePath("/dashboard/profile");

  return subscription;
}
