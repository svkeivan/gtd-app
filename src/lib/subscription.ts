import prisma from "./prisma";

// Simplified subscription service that gives full access to everyone
export class SubscriptionService {
  static async getSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });
    return user?.subscription;
  }

  static async createSubscription(userId: string) {
    return prisma.$transaction(async (tx) => {
      const subscription = await tx.user.update({
        where: { id: userId },
        data: {
          subscription: {
            create: {
              plan: 'PROFESSIONAL',
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date('2099-12-31'), // Far future date for unlimited access
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
          details: "Full access subscription created",
        }
      });

      return subscription.subscription;
    });
  }

  // Always return Infinity for unlimited projects
  static async getMaxProjects(userId: string): Promise<number> {
    return Infinity;
  }

  // Always return true for full feature access
  static async isFeatureAvailable(
    userId: string,
    feature: string
  ): Promise<boolean> {
    return true;
  }
}