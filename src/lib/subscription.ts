import prisma from "./prisma";
import type { Prisma } from "@prisma/client";

// Define the enum values exactly as they are in the schema
const SubscriptionPlan = {
  FREE: 'FREE',
  PERSONAL: 'PERSONAL',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE'
} as const;

type SubscriptionPlanType = typeof SubscriptionPlan[keyof typeof SubscriptionPlan];

const SubscriptionStatus = {
  TRIALING: 'TRIALING',
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
  UNPAID: 'UNPAID'
} as const;

type SubscriptionStatusType = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

type SubscriptionFeature = 
  | "basic_analytics"
  | "advanced_analytics"
  | "priority_support"
  | "team_collaboration"
  | "custom_integrations"
  | "sla_guarantee";

export class SubscriptionService {
  static async createTrialSubscription(userId: string) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 15); // 15-day trial
    
    return prisma.$transaction(async (tx) => {
      // Create subscription directly using prisma client
      const subscription = await tx.user.update({
        where: { id: userId },
        data: {
          subscription: {
            create: {
              plan: SubscriptionPlan.PROFESSIONAL,
              status: SubscriptionStatus.TRIALING,
              trialEndsAt: trialEndDate,
              currentPeriodStart: new Date(),
              currentPeriodEnd: trialEndDate,
            }
          }
        },
        include: {
          subscription: true
        }
      });

      // Log trial start with correct audit action
      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRIAL_STARTED',
          details: "Trial subscription created with Professional features",
        }
      });

      return subscription.subscription;
    });
  }

  static async getSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });
    return user?.subscription;
  }

  static async updateSubscription(
    userId: string,
    plan: SubscriptionPlanType,
    stripeSubscriptionId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          subscription: {
            update: {
              plan,
              status: SubscriptionStatus.ACTIVE,
              stripeSubscriptionId,
              trialEndsAt: null, // End trial when updating to a paid plan
            }
          }
        },
        include: {
          subscription: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_UPDATED',
          details: `Subscription updated to ${plan} plan`,
        }
      });

      return user.subscription;
    });
  }

  static async cancelSubscription(userId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          subscription: {
            update: {
              status: SubscriptionStatus.CANCELED,
              cancelAtPeriodEnd: true,
            }
          }
        },
        include: {
          subscription: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'SUBSCRIPTION_CANCELED',
          details: "Subscription canceled",
        }
      });

      return user.subscription;
    });
  }

  static async getMaxProjects(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });
    
    const subscription = user?.subscription;
    if (!subscription) return 3; // Default free tier limit

    // During trial, give professional tier limits
    if (subscription.status === SubscriptionStatus.TRIALING) {
      return Infinity;
    }

    switch (subscription.plan) {
      case SubscriptionPlan.FREE:
        return 3;
      case SubscriptionPlan.PERSONAL:
        return 10;
      case SubscriptionPlan.PROFESSIONAL:
        return Infinity;
      case SubscriptionPlan.ENTERPRISE:
        return Infinity; // Can be customized per enterprise client
      default:
        return 3;
    }
  }

  static async isFeatureAvailable(
    userId: string,
    feature: SubscriptionFeature
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });
    
    const subscription = user?.subscription;
    if (!subscription) return false;

    // During trial, give access to professional features
    if (subscription.status === SubscriptionStatus.TRIALING) {
      return feature !== "custom_integrations" && feature !== "sla_guarantee";
    }

    // Handle inactive subscriptions
    if (subscription.status === SubscriptionStatus.CANCELED ||
        subscription.status === SubscriptionStatus.PAST_DUE ||
        subscription.status === SubscriptionStatus.UNPAID) {
      return false;
    }

    switch (feature) {
      case "basic_analytics":
        return subscription.plan !== SubscriptionPlan.FREE;
      case "advanced_analytics":
        return subscription.plan === SubscriptionPlan.PROFESSIONAL ||
               subscription.plan === SubscriptionPlan.ENTERPRISE;
      case "priority_support":
        return subscription.plan !== SubscriptionPlan.FREE;
      case "team_collaboration":
        return subscription.plan === SubscriptionPlan.PROFESSIONAL || 
               subscription.plan === SubscriptionPlan.ENTERPRISE;
      case "custom_integrations":
      case "sla_guarantee":
        return subscription.plan === SubscriptionPlan.ENTERPRISE;
      default:
        return false;
    }
  }

  static async handleTrialExpiration(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });
    
    const subscription = user?.subscription;
    if (!subscription || !subscription.trialEndsAt) return;

    if (subscription.status === SubscriptionStatus.TRIALING && 
        subscription.trialEndsAt < new Date()) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            subscription: {
              update: {
                status: SubscriptionStatus.UNPAID,
                plan: SubscriptionPlan.FREE,
              }
            }
          }
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'TRIAL_ENDED',
            details: "Trial period expired, account converted to free plan",
          }
        });
      });
    }
  }
}