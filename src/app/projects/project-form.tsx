'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '../actions/projects'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from '@/lib/store'

export function ProjectForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const router = useRouter()
  const addProject = useAppStore((state) => state.addProject)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newProject = await createProject({ title, userId })
    addProject(newProject)
    setTitle('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a new project title"
        required
      />
      <Button type="submit">Create Project</Button>
    </form>
  )
}

