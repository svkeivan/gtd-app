import { getInboxItems } from '../actions/items'
import { InboxForm } from './inbox-form'
import { InboxList } from './inbox-list'
import { auth } from '@/lib/auth'

export default async function InboxPage() {
  const session = await auth()
  if (!session?.user) {
    return <div>Please sign in to view your inbox.</div>
  }

  const items = await getInboxItems(session.user.id)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      <InboxForm userId={session.user.id} />
      <InboxList initialItems={items} />
    </div>
  )
}

