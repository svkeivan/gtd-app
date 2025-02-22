import { Badge } from "@/components/ui/badge";
import { common } from "@/lib/translations/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboard } from "@/lib/translations/dashboard";
import { toPersianNumber } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: number;
  project: {
    id: string;
    title: string;
  } | null;
  contexts: Array<{
    id: string;
    name: string;
  }>;
}

interface TodaysTasksListProps {
  tasks: Task[];
}

export function TodaysTasksList({ tasks }: TodaysTasksListProps) {
  if (!tasks.length) {
    return null;
  }

  return (
    <Card className="sm:hover:shadow-md transition-shadow duration-200">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-lg sm:text-xl">{dashboard.Dashboard || "Today's Tasks"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors duration-200"
            >
              <div className="space-y-1 sm:space-y-2 min-w-0">
                <p className="font-medium text-sm sm:text-base line-clamp-2">
                  {task.title}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {task.project && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs sm:text-sm"
                    >
                      {task.project.title}
                    </Badge>
                  )}
                  {task.contexts.map((context) => (
                    <Badge 
                      key={context.id} 
                      variant="outline"
                      className="text-xs sm:text-sm"
                    >
                      {context.name}
                    </Badge>
                  ))}
                </div>
              </div>
              {task.priority > 0 && (
                <Badge 
                  variant="destructive"
                  className="shrink-0 text-xs sm:text-sm"
                >
                  {common.priority || "Priority"}{toPersianNumber(task.priority)}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
