import { Project } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectHeaderProps {
  project: Project;
  onAddTask: () => void;
  isLoading?: boolean;
}

export function ProjectHeader({ project, onAddTask, isLoading = false }: ProjectHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64" />
          <div className="mt-2 flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="mt-4 h-16 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          {project?.title}
        </h1>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Created {project?.createdAt?.toLocaleDateString()}
          </span>
          <span className="text-sm text-muted-foreground">
            Status: {project?.status || "Active"}
          </span>
        </div>
        {project?.description && (
          <p className="mt-4 text-muted-foreground">{project.description}</p>
        )}
      </div>
      <button
        onClick={onAddTask}
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Add Task
      </button>
    </div>
  );
}