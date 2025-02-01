'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from '@/lib/store'
import { createItem } from '@/actions/items'

export function QuickAddForm() {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const addItem = useAppStore((state) => state.addItem)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (isLoading) return

    setIsLoading(true)
    setError('')

    try {
      const newItem = await createItem({ title })
      addItem(newItem)
      setTitle('')
      router.refresh()
    } catch (error) {
      console.error('Error adding item:', error)
      setError(error instanceof Error ? error.message : 'Failed to add item')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
