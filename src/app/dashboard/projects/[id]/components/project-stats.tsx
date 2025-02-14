import { Item } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectStatsProps {
  items: Item[];
  isLoading?: boolean;
}

export function ProjectStats({ items, isLoading = false }: ProjectStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const completedItems = items.filter((item) => item.status === "COMPLETED").length;
  const completionRate = items.length > 0
    ? Math.round((completedItems / items.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl bg-blue-500/10 p-6 shadow-sm transition-all hover:bg-blue-500/20 hover:shadow dark:bg-blue-500/5">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          Total Items
        </h3>
        <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">
          {items.length}
        </p>
      </div>
      <div className="rounded-xl bg-green-500/10 p-6 shadow-sm transition-all hover:bg-green-500/20 hover:shadow dark:bg-green-500/5">
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
          Completed Items
        </h3>
        <p className="text-3xl font-bold text-green-800 dark:text-green-300">
          {completedItems}
        </p>
      </div>
      <div className="rounded-xl bg-purple-500/10 p-6 shadow-sm transition-all hover:bg-purple-500/20 hover:shadow dark:bg-purple-500/5">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">
          Completion Rate
        </h3>
        <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
          {completionRate}%
        </p>
      </div>
    </div>
  );
}