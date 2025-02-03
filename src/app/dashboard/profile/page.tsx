import { Suspense } from 'react'
import { ProfileSetupForm } from './profile-setup-form'
import { SubscriptionInfo } from './subscription-info'

export default function ProfilePage() {
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
            <SubscriptionInfo />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
