import { getNextActionsWithDetails } from '../actions/items'
import { NextActionsList } from './next-actions-list'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NextActionsPage() {
  const { user } = await auth()
  
  if (!user || !user.isLoggedIn) {
    redirect('/login')
  }

  const { nextActions, projects, contexts } = await getNextActionsWithDetails(user.id)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Next Actions</h1>
      <NextActionsList initialNextActions={nextActions} projects={projects} contexts={contexts} userId={user.id} />
    </div>
  )
}

