/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { ProjectCard } from "./project-card";

export function ProjectList({ initialProjects }: { initialProjects: any[] }) {
  const { projects, setProjects } = useAppStore();

  useEffect(() => {
    setProjects(initialProjects);
    console.log("ProjectList: ", initialProjects);
  }, [initialProjects, setProjects]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
}
