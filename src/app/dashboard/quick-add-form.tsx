'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from '@/lib/store'
import { createItem } from '@/actions/items'
import { persian } from '@/lib/persian'

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
      setError(error instanceof Error ? error.message : persian["Failed to add item"] || 'Failed to add item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="sm:hover:shadow-md transition-shadow duration-200">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-lg sm:text-xl">{persian["Quick Add"] || "Quick Add"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={persian["Add a new task..."] || "Add a new task..."}
              className="flex-grow min-w-0"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="sm:w-24"
            >
              {isLoading ? persian["Adding..."] || 'Adding...' : persian["Add"] || 'Add'}
            </Button>
          </div>
          {error && (
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
