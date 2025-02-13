"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createSafeAction } from "@/lib/safe-action";
import {
  AuthenticationError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

const prisma = new PrismaClient();

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Implementation functions
async function getReviewItemsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const [inboxItems, nextActions, projects, waitingFor, somedayMaybe] =
      await Promise.all([
        prisma.item.findMany({
          where: { userId: user.id, status: "INBOX" },
          orderBy: { createdAt: "desc" },
        }),
        prisma.item.findMany({
          where: { userId: user.id, status: "NEXT_ACTION" },
          include: {
            project: true,
            contexts: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.project.findMany({
          where: { userId: user.id },
          include: {
            items: {
              where: { status: { not: "COMPLETED" } },
            },
          },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.item.findMany({
          where: { userId: user.id, status: "WAITING_FOR" },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.item.findMany({
          where: { userId: user.id, status: "SOMEDAY_MAYBE" },
          orderBy: { updatedAt: "desc" },
        }),
      ]);

    return {
      inboxItems,
      nextActions,
      projects,
      waitingFor,
      somedayMaybe,
      stats: {
        inboxCount: inboxItems.length,
        nextActionsCount: nextActions.length,
        projectsCount: projects.length,
        waitingForCount: waitingFor.length,
        somedayMaybeCount: somedayMaybe.length,
      },
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

async function completeWeeklyReviewImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Check if a review was already completed today
    const lastReview = await prisma.review.findFirst({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });

    if (lastReview && isToday(lastReview.completedAt)) {
      throw new ValidationError("You have already completed a review today");
    }

    // Check if inbox is empty
    const inboxCount = await prisma.item.count({
      where: { userId: user.id, status: "INBOX" },
    });

    if (inboxCount > 0) {
      throw new ValidationError(
        "Please process all inbox items before completing the review"
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        completedAt: new Date(),
        // Could add more metadata about the review state
        metadata: {
          nextActionsCount: await prisma.item.count({
            where: { userId: user.id, status: "NEXT_ACTION" },
          }),
          projectsCount: await prisma.project.count({
            where: { userId: user.id },
          }),
          waitingForCount: await prisma.item.count({
            where: { userId: user.id, status: "WAITING_FOR" },
          }),
          somedayMaybeCount: await prisma.item.count({
            where: { userId: user.id, status: "SOMEDAY_MAYBE" },
          }),
        },
      },
    });

    revalidatePath("/review");
    return review;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getLastReviewDateImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const lastReview = await prisma.review.findFirst({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });

    return lastReview?.completedAt;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getReviewStatsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Get reviews from the last 12 weeks
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    const reviews = await prisma.review.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: twelveWeeksAgo,
        },
      },
      orderBy: {
        completedAt: "asc",
      },
    });

    // Calculate weekly review completion rate
    const weekCount = 12;
    const completedWeeks = new Set(
      reviews.map((review) =>
        `${review.completedAt.getFullYear()}-${review.completedAt.getWeek()}`
      )
    ).size;

    return {
      totalReviews: reviews.length,
      weeklyCompletionRate: (completedWeeks / weekCount) * 100,
      lastReview: reviews[reviews.length - 1]?.completedAt,
      reviewStreak: calculateReviewStreak(reviews),
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

// Helper function to calculate review streak
function calculateReviewStreak(reviews: Array<{ completedAt: Date }>): number {
  if (reviews.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

  // Start from the most recent review
  for (let i = reviews.length - 1; i >= 0; i--) {
    const reviewDate = reviews[i].completedAt;
    const expectedDate = new Date(today.getTime() - streak * oneWeek);

    // Allow for reviews to be within 2 days of expected date
    const timeDiff = Math.abs(expectedDate.getTime() - reviewDate.getTime());
    if (timeDiff > 2 * 24 * 60 * 60 * 1000) break; // Break if more than 2 days difference

    streak++;
  }

  return streak;
}

// Add Date prototype for getting week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function(): number {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Export wrapped actions
export const getReviewItems = createSafeAction(getReviewItemsImpl);
export const completeWeeklyReview = createSafeAction(completeWeeklyReviewImpl);
export const getLastReviewDate = createSafeAction(getLastReviewDateImpl);
export const getReviewStats = createSafeAction(getReviewStatsImpl);
