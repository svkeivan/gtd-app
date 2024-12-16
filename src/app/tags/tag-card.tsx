'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTag, deleteTag } from '../actions/tags'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from '@/lib/store'

export function TagCard({ tag }: { tag: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color)
  const router = useRouter()
  const { updateTag: updateTagInStore, removeTag } = useAppStore()

  const handleUpdate = async () => {
    const updatedTag = await updateTag(tag.id, { name, color })
    updateTagInStore(updatedTag)
    setIsEditing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    await deleteTag(tag.id)
    removeTag(tag.id)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: tag.color }}
          ></div>
          <span>{isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          ) : (
            tag.name
          )}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="mb-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        )}
        <p>Items: {tag.items?.length || 0}</p>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

