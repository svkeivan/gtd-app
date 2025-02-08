"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Subtask, ChecklistItem, Item } from "@prisma/client";
import { useState } from "react";

interface TaskDetailsProps {
  subtasks: Array<Subtask & { task: Item }>;
  checklistItems: ChecklistItem[];
  onAddSubtask: (title: string) => Promise<void>;
  onRemoveSubtask: (subtaskId: string) => Promise<void>;
  onAddChecklistItem: (title: string) => Promise<void>;
  onToggleChecklistItem: (id: string, completed: boolean) => Promise<void>;
  onRemoveChecklistItem: (id: string) => Promise<void>;
}

export function TaskDetails({
  subtasks,
  checklistItems,
  onAddSubtask,
  onRemoveSubtask,
  onAddChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
}: TaskDetailsProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(newSubtaskTitle);
    setNewSubtaskTitle("");
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    onAddChecklistItem(newChecklistItem);
    setNewChecklistItem("");
  };

  const handleSubtaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleChecklistKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChecklistItem();
    }
  };

  return (
    <div className="space-y-4 rounded-lg bg-muted/30 p-4">
      <Label className="text-lg font-semibold">2. Add Details & Tasks</Label>
      
      {/* Subtasks Section */}
      <div className="space-y-2">
        <Label className="text-lg">Subtasks</Label>
        {subtasks?.map((subtask) => (
          <div key={subtask.taskId} className="flex items-center gap-2">
            <Input
              value={subtask.task.title}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveSubtask(subtask.taskId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Add a subtask..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={handleSubtaskKeyPress}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleAddSubtask}>
            Add
          </Button>
        </div>
      </div>

      {/* Checklist Section */}
      <div className="space-y-2">
        <Label className="text-lg">Checklist</Label>
        {checklistItems?.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={item.completed}
              onCheckedChange={(checked) =>
                onToggleChecklistItem(item.id, checked as boolean)
              }
            />
            <Input
              value={item.title}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveChecklistItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Add a checklist item..."
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyPress={handleChecklistKeyPress}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleAddChecklistItem}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}