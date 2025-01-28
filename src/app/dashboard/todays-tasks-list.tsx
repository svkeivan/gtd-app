import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between space-x-4 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{task.title}</p>
                <div className="flex flex-wrap gap-2">
                  {task.project && (
                    <Badge variant="secondary">{task.project.title}</Badge>
                  )}
                  {task.contexts.map((context) => (
                    <Badge key={context.id} variant="outline">
                      {context.name}
                    </Badge>
                  ))}
                </div>
              </div>
              {task.priority > 0 && (
                <Badge variant="destructive">P{task.priority}</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
