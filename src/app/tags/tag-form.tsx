'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTag } from '../actions/tags'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from '@/lib/store'

export function TagForm({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#000000')
  const router = useRouter()
  const addTag = useAppStore((state) => state.addTag)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newTag = await createTag({ name, color, userId })
    addTag(newTag)
    setName('')
    setColor('#000000')
    router.refresh()
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Create New Tag</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a new tag name"
              required
            />
          </div>
          <div>
            <Label htmlFor="tag-color">Tag Color</Label>
            <Input
              id="tag-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Create Tag</Button>
        </form>
      </CardContent>
    </Card>
  )
}

