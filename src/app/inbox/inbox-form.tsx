'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createItem } from '../actions/items'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from '@/lib/store'

export function InboxForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()
  const addItem = useAppStore((state) => state.addItem)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newItem = await createItem({ title, notes, userId })
    addItem(newItem)
    setTitle('')
    setNotes('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a new task"
        required
      />
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes (optional)"
        rows={3}
      />
      <Button type="submit">Add to Inbox</Button>
    </form>
  )
}

