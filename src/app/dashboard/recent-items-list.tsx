import { persian } from "@/lib/persian";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface RecentItem {
  id: string;
  title: string;
  status: string;
  project: {
    id: string;
    title: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string | null;
  } | null;
  contexts: Array<{
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

interface RecentItemsListProps {
  items: RecentItem[];
}

export function RecentItemsList({ items }: RecentItemsListProps) {
  return (
    <Card className="sm:hover:shadow-md transition-shadow duration-200">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-lg sm:text-xl">{persian["recentItems"] || "Recent Items"}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 sm:space-y-4">
          {items.map((item) => (
            <li 
              key={item.id} 
              className="flex flex-col gap-2 rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <Link
                  href={`/dashboard/process?id=${item.id}`}
                  className="block font-medium text-sm sm:text-base hover:underline line-clamp-1"
                >
                  {item.title}
                </Link>
                {item.project && (
                  <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    {persian["project"]}: {item.project.title}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Badge className="text-xs sm:text-sm">
                  {item.status}
                </Badge>
                {item.contexts.map((context) => (
                  <Badge 
                    key={context.name} 
                    variant="outline"
                    className="text-xs sm:text-sm"
                  >
                    {context.name}
                  </Badge>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
