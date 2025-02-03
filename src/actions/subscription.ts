import { z } from "zod";
import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/create-safe-action";

// Simple schema for getting subscription info
const getSubscriptionSchema = z.object({
  userId: z.string(),
});

type GetSubscriptionInput = z.infer<typeof getSubscriptionSchema>;

// Get subscription info - always returns full access
export const getSubscription = createSafeAction(getSubscriptionSchema, async ({ 
  userId 
}: GetSubscriptionInput) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    // Return full access subscription info
    return {
      data: {
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        features: {
          projects: 'Unlimited projects',
          analytics: 'Advanced',
          support: 'Priority',
          teamFeatures: 'Included'
        }
      },
      error: null
    };
  } catch (error) {
    return { 
      data: null, 
      error: 'Failed to fetch subscription information' 
    };
  }
});

// Feature access - always returns true for full access
export async function isFeatureAvailable(
  userId: string,
  feature: string
): Promise<boolean> {
  return true;
}

// Project limit - always returns Infinity for unlimited projects
export async function getMaxProjects(userId: string): Promise<number> {
  return Infinity;
}