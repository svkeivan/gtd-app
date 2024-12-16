'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { ContextCard } from './context-card'

export function ContextList({ initialContexts }: { initialContexts: any[] }) {
  const { contexts, setContexts } = useAppStore()

  useEffect(() => {
    setContexts(initialContexts)
  }, [initialContexts, setContexts])

  return (
    <div className="space-y-4">
      {contexts.map((context) => (
        <ContextCard key={context.id} context={context} />
      ))}
    </div>
  )
}

