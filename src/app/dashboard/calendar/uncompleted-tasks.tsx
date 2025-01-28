"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Task {
  id: string;
  title: string;
  status: string;
  estimated: number | null;
}

interface UncompletedTasksProps {
  tasks: Task[];
}

export function UncompletedTasks({ tasks }: UncompletedTasksProps) {
  const handleDragStart = (event: React.DragEvent, task: Task) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id: task.id,
        title: task.title,
        estimated: task.estimated || 30,
        isTask: true,
      }),
    );
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold">Uncompleted Tasks</h2>
      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              className="cursor-move p-3 hover:bg-gray-50"
            >
              <p className="text-sm">{task.title}</p>
              {task.estimated && (
                <p className="mt-1 text-xs text-gray-500">
                  Est: {task.estimated}min
                </p>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
