'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from '@/lib/store'

export function QuickAddForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const router = useRouter()
  const addItem = useAppStore((state) => state.addItem)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add item')
      }

      const newItem = await response.json()
      addItem(newItem)
      setTitle('')
      router.refresh()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow"
          />
          <Button type="submit">Add</Button>
        </form>
      </CardContent>
    </Card>
  )
}

