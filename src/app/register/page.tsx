import { RegisterForm } from './register-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RegisterPage() {
  const { user } = await auth()
  
  if (user?.isLoggedIn) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        <RegisterForm />
      </div>
    </div>
  )
}

