import { Suspense } from 'react'
import { ProfileSetupForm } from './profile-setup-form'
import { SubscriptionInfo } from './subscription-info'
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { subscriptionSchema } from "@/types/profile-types"

export default async function ProfilePage() {
  const { user } = await auth()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch initial subscription data server-side
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: { subscription: true }
  });

  // Parse and validate subscription data
  const initialSubscription = userData?.subscription ? subscriptionSchema.parse({
    plan: userData.subscription.plan,
    status: userData.subscription.status,
    trialEndsAt: userData.subscription.trialEndsAt,
    currentPeriodEnd: userData.subscription.currentPeriodEnd,
    cancelAtPeriodEnd: userData.subscription.cancelAtPeriodEnd,
  }) : null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Profile Settings</h2>
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-lg h-[300px]"></div>
          }>
            <ProfileSetupForm />
          </Suspense>
        </div>

        {/* Subscription Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Subscription</h2>
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-lg h-[300px]"></div>
          }>
            <SubscriptionInfo 
              userId={user.id} 
              initialSubscription={initialSubscription}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
