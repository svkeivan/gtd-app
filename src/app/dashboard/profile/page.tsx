import { Suspense } from 'react'
import { ProfileSetupForm } from './profile-setup-form'

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Setup</h1>
      <Suspense fallback={
        <div className="animate-pulse bg-gray-200 rounded-lg h-[300px]"></div>
      }>
        <ProfileSetupForm />
      </Suspense>
    </div>
  )
}
