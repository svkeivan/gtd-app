import { getItemToProcess } from '../actions/items'
import { ProcessForm } from './process-form'
import { auth } from '@/lib/auth'

export default async function ProcessPage() {
  const session = await auth()
  if (!session?.user) {
    return <div>Please sign in to process your tasks.</div>
  }

  const item = await getItemToProcess(session.user.id)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Process Inbox</h1>
      {item ? (
        <ProcessForm item={item} />
      ) : (
        <p>No items to process. Great job!</p>
      )}
    </div>
  )
}

