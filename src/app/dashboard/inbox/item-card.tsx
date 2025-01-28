"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, getPriorityColor } from "@/lib/utils";
import { Item, Project, Tag } from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import {
  CalendarDays,
  CalendarIcon,
  CircleDot,
  Folder,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ItemWithProject extends Item {
  project?: Project;
  tags?: Tag[];
}

export function ItemCard({ item: initialItem }: { item: ItemWithProject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState(initialItem);
  const {
    id,
    title,
    notes,
    createdAt,
    updatedAt,
    projectId,
    project,
    status,
    priority,
    dueDate,
    estimated,
    tags,
  } = item;

  const handleUpdate = async () => {
    try {
      const updateData = {
        title: item.title,
        notes: item.notes,
        status: item.status,
        projectId: item.projectId,
      };

      const response = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update item");
      const updatedItem = await response.json();
      setItem(updatedItem);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  return (
    <div className="h-full">
      <Card
        className="mb-4 h-full cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <div
          className="h-1 w-full rounded-t-xl p-1"
          style={{ backgroundColor: getPriorityColor(priority) }}
        />
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {notes}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <CalendarDays className="mr-1 h-4 w-4" />
              Created: {format(new Date(createdAt), "PPpp")} (
              {differenceInDays(new Date(), new Date(createdAt))} days ago)
            </span>
            <span className="flex items-center">
              <RefreshCw className="mr-1 h-4 w-4" />
              Updated: {format(new Date(updatedAt), "PP")}
            </span>
            {projectId && (
              <span className="flex items-center">
                <Folder className="mr-1 h-4 w-4" />
                Project: {project?.title}
              </span>
            )}
            <span className="flex items-center">
              <CircleDot className="mr-1 h-4 w-4" />
              Status: {status}
            </span>
            <span className="flex items-center">Priority: {priority}</span>
            {dueDate && (
              <span className="flex items-center">
                Due Date: {format(new Date(dueDate), "PP")}
              </span>
            )}
            {estimated && (
              <span className="flex items-center">
                Estimated: {estimated} hours
              </span>
            )}
            {tags && tags.length > 0 && (
              <span className="flex items-center">
                Tags: {tags.map((tag) => tag.name).join(", ")}
              </span>
            )}
          </div>
          <Link href={`/process?id=${id}`} className="mt-4 inline-block">
            <Button>Process Item</Button>
          </Link>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setItem({ ...item, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setItem({ ...item, notes: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={(value) => setItem({ ...item, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">TODO</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={priority}
                  onValueChange={(value) =>
                    setItem({ ...item, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate
                        ? format(new Date(dueDate), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate ? new Date(dueDate) : undefined}
                      onSelect={(date) => setItem({ ...item, dueDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  type="number"
                  value={estimated || ""}
                  onChange={(e) =>
                    setItem({ ...item, estimated: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
