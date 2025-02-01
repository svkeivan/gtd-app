"use client";

import { useAppStore } from "@/lib/store";
import { Project } from "@prisma/client";
import { useEffect } from "react";
import { ProjectCard } from "./project-card";

export function ProjectList({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const { projects, setProjects } = useAppStore();

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects, setProjects]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
