'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { TagCard } from './tag-card'
import { TagSummary } from '@/types/project-types'

export function TagList({ initialTags }: { initialTags: TagSummary[] }) {
  const { tags, setTags } = useAppStore()

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags, setTags])

  return (
    <div className="space-y-4">
      {tags.map((tag) => (
        <TagCard key={tag.id} tag={tag} />
      ))}
    </div>
  )
}
