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
    <Card>
      <CardHeader>
        <CardTitle>Recent Items</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <div>
                <Link
                  href={`/dashboard/process?id=${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.title}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {item.project && <span>Project: {item.project.title}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>{item.status}</Badge>
                {item.contexts.map((context) => (
                  <Badge key={context.name} variant="outline">
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
