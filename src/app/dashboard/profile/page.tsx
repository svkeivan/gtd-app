import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { subscriptionSchema } from "@/types/profile-types";
import { Suspense } from "react";
import { ProfileSetupForm } from "./profile-setup-form";
import { SubscriptionInfo } from "./subscription-info";

export default async function ProfilePage() {
  const { user } = await auth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch initial subscription data server-side
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: { subscription: true },
  });

  // Parse and validate subscription data
  const initialSubscription = userData?.subscription
    ? subscriptionSchema.parse({
        plan: userData.subscription.plan,
        status: userData.subscription.status,
        trialEndsAt: userData.subscription.trialEndsAt,
        currentPeriodEnd: userData.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: userData.subscription.cancelAtPeriodEnd,
      })
    : null;

  return (
    <div className="container mx-auto space-y-8 p-6">
      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile Settings Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Profile Settings</h2>
          <Suspense
            fallback={
              <div className="h-[300px] animate-pulse rounded-lg bg-gray-200"></div>
            }
          >
            <ProfileSetupForm />
          </Suspense>
        </div>

        {/* Subscription Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Subscription</h2>
          <Suspense
            fallback={
              <div className="h-[300px] animate-pulse rounded-lg bg-gray-200"></div>
            }
          >
            <SubscriptionInfo
              userId={user.id}
              initialSubscription={initialSubscription}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
