'use client'

import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { ProjectCard } from './project-card'

export function ProjectList({ initialProjects }: { initialProjects: any[] }) {
  const { projects, setProjects } = useAppStore()

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects, setProjects])

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

