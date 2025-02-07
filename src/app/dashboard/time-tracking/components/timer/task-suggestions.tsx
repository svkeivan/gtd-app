"use client";

import { useEffect, useState } from "react";
import { getNextActionItems } from "@/actions/time-entries";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Task {
  id: string;
  title: string;
}

interface TaskSuggestionsProps {
  onSelectTask: (task: Task | null) => void;
  selectedTaskId: string | null;
}

export function TaskSuggestions({ onSelectTask, selectedTaskId }: TaskSuggestionsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const nextActions = await getNextActionItems();
        setTasks(nextActions);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No next actions available. Add some tasks to track time against them.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Select a task to focus on:</div>
      <ScrollArea className="h-[120px] rounded-md border p-2">
        <div className="space-y-2">
          {tasks.map((task) => (
            <Button
              key={task.id}
              variant={selectedTaskId === task.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left"
              onClick={() => onSelectTask(task)}
            >
              {task.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
      {selectedTaskId && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => onSelectTask(null)}
        >
          Clear selection
        </Button>
      )}
    </div>
  );
}