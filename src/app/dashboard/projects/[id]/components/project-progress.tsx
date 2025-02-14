import { Item } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectProgressProps {
  items: Item[];
  isLoading?: boolean;
}

export function ProjectProgress({ items, isLoading = false }: ProjectProgressProps) {
  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  const completionRate = items.length > 0
    ? Math.round(
        (items.filter((item) => item.status === "COMPLETED").length / items.length) * 100
      )
    : 0;

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Overall Progress
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {completionRate}%
        </span>
      </div>
      <Progress value={completionRate} className="h-2" />
    </div>
  );
}