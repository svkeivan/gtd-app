import { getTags } from '../actions/tags'
import { TagList } from './tag-list'
import { TagForm } from './tag-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function TagsPage() {
  const { user } = await auth()

  if (!user || !user.isLoggedIn) {
    redirect('/login')
  }

  const tags = await getTags(user.id)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tags</h1>
      <TagForm userId={user.id} />
      <TagList initialTags={tags} />
    </div>
  )
}

