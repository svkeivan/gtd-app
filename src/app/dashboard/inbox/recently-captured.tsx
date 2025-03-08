"use client";

import { inboxTr } from "@/lib/translations/inbox";
import { Item } from "@prisma/client";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPriorityColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecentlyCapturedProps {
  items: Item[];
}

export function RecentlyCaptured({ items }: RecentlyCapturedProps) {
  // Sort items by creation date (newest first)
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Take only the 5 most recent items
  const recentItems = sortedItems.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          {inboxTr['RecentlyCaptured'] || 'Recently Captured'}
          <Badge variant="outline" className="ml-2">
            {recentItems.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <div 
              key={item.id} 
              className="group flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                />
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.createdAt), "HH:mm")}
                </span>
              </div>
              <Link href={`/dashboard/process?id=${item.id}`}>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  {inboxTr['Process'] || 'Process'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
