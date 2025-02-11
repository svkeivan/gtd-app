"use client";

import { CalendarIcon, NotebookIcon } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@prisma/client";

interface ProcessHeaderProps {
  title: string;
  notes?: string | null;
  createdAt: Date;
  progress: number;
  currentProject?: Project | null;
}

export function ProcessHeader({
  title,
  notes,
  createdAt,
  progress,
  currentProject,
}: ProcessHeaderProps) {
  return (
    <CardHeader className="space-y-4 border-b pb-6">
      <Progress value={progress} className="h-2" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {notes && (
            <p className="max-w-2xl whitespace-pre-wrap text-muted-foreground">
              {notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {new Date(createdAt).toLocaleDateString()}
          </div>
          {currentProject && (
            <div className="flex items-center gap-1">
              <NotebookIcon className="h-4 w-4" />
              {currentProject.title}
            </div>
          )}
        </div>
      </div>
    </CardHeader>
  );
}