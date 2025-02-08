"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Context, Project } from "@prisma/client";

interface OrganizeSectionProps {
  projectId: string;
  contextId: string;
  projects: Project[];
  contexts: Context[];
  onProjectChange: (value: string) => void;
  onContextChange: (value: string) => void;
}

export function OrganizeSection({
  projectId,
  contextId,
  projects,
  contexts,
  onProjectChange,
  onContextChange,
}: OrganizeSectionProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-muted/30 p-4">
      <Label className="mb-4 block text-lg font-semibold">3. Organize</Label>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="project_select" className="text-lg">
              Project (optional)
            </Label>
            <a
              href="/dashboard/projects"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              + Create Project
            </a>
          </div>
          <Select value={projectId} onValueChange={onProjectChange}>
            <SelectTrigger id="project_select">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="context_select" className="text-lg">
              Context (optional)
            </Label>
            <a
              href="/dashboard/contexts"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              + Create Context
            </a>
          </div>
          <Select value={contextId} onValueChange={onContextChange}>
            <SelectTrigger id="context_select">
              <SelectValue placeholder="Select a context" />
            </SelectTrigger>
            <SelectContent>
              {contexts.map((context) => (
                <SelectItem key={context.id} value={context.id}>
                  {context.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}