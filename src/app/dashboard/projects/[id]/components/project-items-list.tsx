import { Context, Item, Project } from "@prisma/client";
import { ItemCard } from "../../../inbox/item-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectItemsListProps {
  items: Item[];
  projects: Project[];
  contexts: Context[];
  statusFilter: string;
  searchQuery: string;
  sortBy: string;
  isLoading?: boolean;
}

export function ProjectItemsList({
  items,
  projects,
  contexts,
  statusFilter,
  searchQuery,
  sortBy,
  isLoading = false,
}: ProjectItemsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-border">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first task to get started
          </p>
        </div>
      </div>
    );
  }

  const filteredAndSortedItems = items
    .filter((item) =>
      statusFilter === "all" ? true : item.status === statusFilter
    )
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredAndSortedItems.map((item) => (
        <ItemCard
          item={item}
          key={item.id}
          projects={projects}
          contexts={contexts}
        />
      ))}
    </div>
  );
}