'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function InboxList({ initialItems }: { initialItems: any[] }) {
  const { items, setItems } = useAppStore()

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems, setItems])

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.notes}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

