'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processItem } from '../actions/items'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAppStore } from '@/lib/store'

export function ProcessForm({ item }: { item: any }) {
  const [status, setStatus] = useState('')
  const [projectName, setProjectName] = useState('')
  const [contextName, setContextName] = useState('')
  const router = useRouter()
  const { removeItem, addProject, addContext } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!status) return

    let projectId, contextIds

    if (status === 'PROJECT' && projectName) {
      const newProject = { id: Date.now().toString(), name: projectName }
      addProject(newProject)
      projectId = newProject.id
    }

    if (contextName) {
      const newContext = { id: Date.now().toString(), name: contextName }
      addContext(newContext)
      contextIds = [newContext.id]
    }

    await processItem(item.id, { status, projectId, contextIds })
    removeItem(item.id)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="font-medium mb-2">Notes:</p>
            <p>{item.notes || 'No additional notes'}</p>
          </div>
          <RadioGroup onValueChange={setStatus} required>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NEXT_ACTION" id="next_action" />
              <Label htmlFor="next_action">Next Action</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PROJECT" id="project" />
              <Label htmlFor="project">Project</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SOMEDAY_MAYBE" id="someday_maybe" />
              <Label htmlFor="someday_maybe">Someday/Maybe</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="REFERENCE" id="reference" />
              <Label htmlFor="reference">Reference</Label>
            </div>
          </RadioGroup>
          {status === 'PROJECT' && (
            <div>
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="context_name">Context (optional)</Label>
            <Input
              id="context_name"
              value={contextName}
              onChange={(e) => setContextName(e.target.value)}
            />
          </div>
          <Button type="submit">Process Item</Button>
        </form>
      </CardContent>
    </Card>
  )
}

