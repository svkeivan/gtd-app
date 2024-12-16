'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateItemStatus } from '../actions/items'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppStore } from '@/lib/store'

export function NextActionCard({ action }: { action: any }) {
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()
  const { updateNextAction, removeNextAction } = useAppStore()

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await updateItemStatus(action.id, 'COMPLETED')
      removeNextAction(action.id)
      router.refresh()
    } catch (error) {
      console.error('Failed to complete action:', error)
    }
    setIsCompleting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Checkbox
            checked={isCompleting}
            onCheckedChange={handleComplete}
            disabled={isCompleting}
          />
          <span>{action.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {action.notes && <p className="text-sm text-gray-600 mb-2">{action.notes}</p>}
        <div className="flex flex-wrap gap-2">
          {action.project && (
            <Badge variant="secondary">Project: {action.project.title}</Badge>
          )}
          {action.contexts.map((context: any) => (
            <Badge key={context.id} variant="outline">{context.name}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="ghost" onClick={() => router.push(`/process?id=${action.id}`)}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}

