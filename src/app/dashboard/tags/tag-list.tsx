'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { TagCard } from './tag-card'
import { TagSummary } from '@/types/project-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { deleteTag } from '@/actions/tags'
import { useRouter } from 'next/navigation'

export function TagList({ initialTags }: { initialTags: TagSummary[] }) {
  const { tags, setTags, removeTag } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags, setTags])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (value: string) => {
    setSortBy(value)
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleBulkDelete = async () => {
    if (window.confirm('Are you sure you want to delete the selected tags?')) {
      for (const tagId of selectedTags) {
        await deleteTag(tagId)
        removeTag(tagId)
      }
      setSelectedTags([])
      router.refresh()
    }
  }

  const filteredAndSortedTags = tags
    .filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      // Add more sorting options here
      return 0
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="recent">Recently Used</SelectItem>
              <SelectItem value="usage">Most Used</SelectItem>
            </SelectContent>
          </Select>
          {selectedTags.length > 0 && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleBulkDelete}
              title="Delete selected tags"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            isSelected={selectedTags.includes(tag.id)}
            onSelect={() => handleTagSelect(tag.id)}
          />
        ))}
      </div>

      {filteredAndSortedTags.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No tags found matching your search.
        </div>
      )}
    </div>
  )
}
