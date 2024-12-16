import { getDashboardData } from '../actions/dashboard'
import { DashboardSummary } from './dashboard-summary'
import { RecentItemsList } from './recent-items-list'
import { QuickAddForm } from './quick-add-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { user } = await auth()
  
  if (!user || !user.isLoggedIn) {
    redirect('/login')
  }

  const dashboardData = await getDashboardData(user.id)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <QuickAddForm userId={user.id} />
          <DashboardSummary data={dashboardData} />
        </div>
        <RecentItemsList items={dashboardData.recentItems} />
      </div>
    </div>
  )
}

