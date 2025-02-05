"use client";

import { addChecklistItem, addSubtask, removeChecklistItem, removeSubtask, updateChecklistItem, updateItemStatus } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { Context } from "@prisma/client";
import { Calendar, ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NextAction } from "@/lib/store";

interface NextActionCardProps {
  action: NextAction;
}

export function NextActionCard({ action }: NextActionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const router = useRouter();
  const { removeNextAction } = useAppStore();

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await updateItemStatus(action.id, "COMPLETED");
      removeNextAction(action.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to complete action:", error);
    }
    setIsCompleting(false);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await addSubtask(action.id, { title: newSubtaskTitle });
      setNewSubtaskTitle("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add subtask:", error);
    }
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    try {
      await removeSubtask(action.id, subtaskId);
      router.refresh();
    } catch (error) {
      console.error("Failed to remove subtask:", error);
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    try {
      await addChecklistItem(action.id, newChecklistItem);
      setNewChecklistItem("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add checklist item:", error);
    }
  };

  const handleToggleChecklistItem = async (id: string, completed: boolean) => {
    try {
      await updateChecklistItem(id, { completed });
      router.refresh();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
    }
  };

  const handleRemoveChecklistItem = async (id: string) => {
    try {
      await removeChecklistItem(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to remove checklist item:", error);
    }
  };

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="cursor-grab opacity-30 active:cursor-grabbing group-hover:opacity-100">
              <GripVertical className="h-5 w-5" />
            </div>
            <Checkbox
              checked={isCompleting}
              onCheckedChange={handleComplete}
              disabled={isCompleting}
              className="h-5 w-5"
            />
            <CardTitle className={`text-lg ${isCompleting ? "text-gray-400 line-through" : ""}`}>
              {action.title}
            </CardTitle>
          </div>
          {action.priority !== undefined && (
            <Badge
              variant={
                action.priority < 3
                  ? "destructive"
                  : action.priority < 6
                    ? "default"
                    : "secondary"
              }
            >
              Priority {action.priority + 1}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {action.notes && (
          <p className="text-sm text-gray-600">{action.notes}</p>
        )}
        
        {/* Subtasks Section */}
        {action.subtasks && action.subtasks.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-1 text-sm font-medium text-gray-600"
            >
              {showSubtasks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Subtasks ({action.subtasks.length})
            </button>
            {showSubtasks && (
              <div className="ml-6 space-y-2">
                {action.subtasks.map((subtask) => (
                  <div key={subtask.taskId} className="flex items-center gap-2">
                    <div className="flex-1">
                      <span className="text-sm">{subtask.task.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSubtask(subtask.taskId)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="New subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Checklist Section */}
        {action.checklistItems && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Checklist</div>
            <div className="ml-6 space-y-2">
              {action.checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => handleToggleChecklistItem(item.id, checked as boolean)}
                    className="h-4 w-4"
                  />
                  <span className={`flex-1 text-sm ${item.completed ? "text-gray-400 line-through" : ""}`}>
                    {item.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="New checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {action.project && (
              <Badge variant="secondary" className="font-medium">
                {action.project.title}
              </Badge>
            )}
            {action?.contexts?.map((context: Context) => (
              <Badge key={context.id} variant="outline" className="font-medium">
                {context.name}
              </Badge>
            ))}
          </div>
          {action.dueDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(action.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/process?id=${action.id}`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
