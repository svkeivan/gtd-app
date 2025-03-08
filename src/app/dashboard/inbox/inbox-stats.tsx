"use client";

import { inboxTr } from "@/lib/translations/inbox";
import { Item, ItemStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  CheckCircle, 
  Clock, 
  InboxIcon, 
  ListTodo 
} from "lucide-react";

interface InboxStatsProps {
  items: Item[];
}

export function InboxStats({ items }: InboxStatsProps) {
  // Calculate stats
  const totalItems = items.length;
  const processedItems = items.filter(item => item.status !== "INBOX").length;
  const unprocessedItems = totalItems - processedItems;
  const completedItems = items.filter(item => item.status === "COMPLETED").length;
  
  // Calculate processing rate (percentage of items that have been processed)
  const processingRate = totalItems > 0 
    ? Math.round((processedItems / totalItems) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard 
        icon={<InboxIcon className="h-4 w-4" />}
        label={inboxTr['TotalItems'] || 'Total Items'} 
        value={totalItems.toString()} 
      />
      <StatCard 
        icon={<ListTodo className="h-4 w-4" />}
        label={inboxTr['Unprocessed'] || 'Unprocessed'} 
        value={unprocessedItems.toString()} 
      />
      <StatCard 
        icon={<CheckCircle className="h-4 w-4" />}
        label={inboxTr['Completed'] || 'Completed'} 
        value={completedItems.toString()} 
      />
      <StatCard 
        icon={<BarChart className="h-4 w-4" />}
        label={inboxTr['ProcessingRate'] || 'Processing Rate'} 
        value={`${processingRate}%`} 
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            {icon}
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
