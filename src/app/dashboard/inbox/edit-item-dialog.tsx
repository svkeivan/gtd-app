"use client";

import {
  addChecklistItem,
  addSubtask,
  removeChecklistItem,
  removeSubtask,
  updateChecklistItem,
  updateItem,
} from "@/actions/items";
import { CommentList } from "@/components/comments/comment-list";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChecklistItem,
  Context,
  Item,
  ItemStatus,
  Project,
  Subtask,
  Tag,
} from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface ItemWithProject extends Item {
  project?: Project;
  tags?: Tag[];
  contexts?: Context[];
  subtasks?: Array<Subtask & { task: Item }>;
  checklistItems?: ChecklistItem[];
}

interface EditItemDialogProps {
  item: ItemWithProject;
  projects: Project[];
  contexts: Context[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedItem: ItemWithProject) => void;
}

export function EditItemDialog({
  item: initialItem,
  projects,
  contexts,
  open,
  onOpenChange,
  onUpdate,
}: EditItemDialogProps) {
  const [item, setItem] = useState<ItemWithProject>(initialItem);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await addSubtask(item.id, { title: newSubtaskTitle });
      setNewSubtaskTitle("");
      const updatedItem = await updateItem(item.id, { title: item.title }); // Refresh item data
      onUpdate(updatedItem);
    } catch (error) {
      console.error("Failed to add subtask:", error);
    }
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    try {
      await removeSubtask(item.id, subtaskId);
      const updatedItem = await updateItem(item.id, { title: item.title }); // Refresh item data
      onUpdate(updatedItem);
    } catch (error) {
      console.error("Failed to remove subtask:", error);
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    try {
      await addChecklistItem(item.id, newChecklistItem);
      setNewChecklistItem("");
      const updatedItem = await updateItem(item.id, { title: item.title }); // Refresh item data
      onUpdate(updatedItem);
    } catch (error) {
      console.error("Failed to add checklist item:", error);
    }
  };

  const handleToggleChecklistItem = async (id: string, completed: boolean) => {
    try {
      await updateChecklistItem(id, { completed });
      const updatedItem = await updateItem(item.id, { title: item.title }); // Refresh item data
      onUpdate(updatedItem);
    } catch (error) {
      console.error("Failed to update checklist item:", error);
    }
  };

  const handleRemoveChecklistItem = async (id: string) => {
    try {
      await removeChecklistItem(id);
      const updatedItem = await updateItem(item.id, { title: item.title }); // Refresh item data
      onUpdate(updatedItem);
    } catch (error) {
      console.error("Failed to remove checklist item:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedItem = await updateItem(item.id, {
        title: item.title,
        notes: item.notes ?? undefined,
        status: item.status,
        priority: item.priority,
        estimated: item.estimated ?? undefined,
        projectId: item.projectId,
        contextIds: item.contexts?.map((c) => c.id) || [],
      });

      onUpdate(updatedItem);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Item</DialogTitle>
          <DialogDescription>
            Edit item details and view activity history
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="mt-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={item.title}
                  onChange={(e) => setItem({ ...item, title: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={item.notes || ""}
                  onChange={(e) => setItem({ ...item, notes: e.target.value })}
                  className="min-h-[100px] resize-none"
                  placeholder="Add any details or context..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={item.status}
                    onValueChange={(value: ItemStatus) =>
                      setItem({ ...item, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INBOX">Inbox</SelectItem>
                      <SelectItem value="NEXT_ACTION">Next Action</SelectItem>
                      <SelectItem value="PROJECT">Project</SelectItem>
                      <SelectItem value="WAITING_FOR">Waiting For</SelectItem>
                      <SelectItem value="SOMEDAY_MAYBE">
                        Someday/Maybe
                      </SelectItem>
                      <SelectItem value="REFERENCE">Reference</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DELEGATED">Delegated</SelectItem>
                      <SelectItem value="TRASHED">Trashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={item.priority.toString()}
                    onValueChange={(value) =>
                      setItem({ ...item, priority: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Low</SelectItem>
                      <SelectItem value="1">Medium</SelectItem>
                      <SelectItem value="2">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(projects?.length > 0 || contexts?.length > 0) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects?.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project</label>
                      <Select
                        value={item.projectId || "none"}
                        onValueChange={(value) =>
                          setItem({ ...item, projectId: value === "none" ? null : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {contexts?.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contexts</label>
                      <Select
                        value={item.contexts?.[0]?.id || "none"}
                        onValueChange={(value) =>
                          setItem({
                            ...item,
                            contexts: value === "none" ? [] : [{ id: value } as Context],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select context" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Context</SelectItem>
                          {contexts.map((context) => (
                            <SelectItem key={context.id} value={context.id}>
                              {context.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !item.dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.dueDate
                          ? format(new Date(item.dueDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          item.dueDate ? new Date(item.dueDate) : undefined
                        }
                        onSelect={(date) =>
                          setItem({ ...item, dueDate: date || null })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Hours</label>
                  <Input
                    type="number"
                    value={item.estimated?.toString() || ""}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        estimated: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="h-10"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">
                Comments & Activity Log
              </h3>
              <CommentList itemId={item.id as string} />
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
