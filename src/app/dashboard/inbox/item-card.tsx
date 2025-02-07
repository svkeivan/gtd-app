"use client";

import { getContexts } from "@/actions/contexts";
import { getProjects } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPriorityColor } from "@/lib/utils";
import {
  ChecklistItem,
  Context,
  Item,
  Project,
  Subtask,
  Tag,
} from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CalendarIcon,
  CheckSquare,
  CircleDot,
  Clock,
  Folder,
  ListTodo,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditItemDialog } from "./edit-item-dialog";

interface ItemWithProject extends Item {
  project?: Project;
  tags?: Tag[];
  contexts?: Context[];
  subtasks?: Array<Subtask & { task: Item }>;
  checklistItems?: ChecklistItem[];
}

interface ItemCardProps {
  item: ItemWithProject;
  projects: Project[];
  contexts: Context[];
}

export function ItemCard({ item: initialItem, projects, contexts }: ItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<ItemWithProject>(initialItem);
  const {
    id,
    title,
    notes,
    createdAt,
    projectId,
    project,
    status,
    priority,
    dueDate,
    estimated,
    tags,
  } = item;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="group relative">
      <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: getPriorityColor(priority) }}
        />
        <CardContent className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="text-xl font-semibold leading-tight tracking-tight">
                {title}
              </h3>
              {notes && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {notes}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setIsOpen(true)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                  status,
                )}`}
              >
                <CircleDot className="h-3 w-3" />
                {status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                {priority} Priority
              </span>
              {dueDate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(dueDate), "PP")}
                </span>
              )}
              {estimated && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  <Clock className="h-3 w-3" />
                  {estimated}h
                </span>
              )}
            </div>

            {/* Subtasks and Checklists Summary */}
            <div className="flex flex-wrap gap-4">
              {item.subtasks && item.subtasks.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ListTodo className="h-3 w-3" />
                  {item.subtasks.length} subtask
                  {item.subtasks.length !== 1 ? "s" : ""}
                </div>
              )}
              {item.checklistItems && item.checklistItems.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckSquare className="h-3 w-3" />
                  {item.checklistItems.filter((i) => i.completed).length}/
                  {item.checklistItems.length} completed
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {differenceInDays(new Date(), new Date(createdAt))} days ago
              </span>
              {project?.title && (
                <span className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {project?.title}
                </span>
              )}
              {tags && tags.length > 0 && (
                <span className="flex items-center gap-1">
                  {tags.map((tag) => tag.name).join(", ")}
                </span>
              )}
            </div>

            <div className="pt-2">
              <Link
                href={`/dashboard/process?id=${id}`}
                className="inline-flex w-full items-center justify-center"
              >
                <Button
                  variant="ghost"
                  className="w-full gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Process Item
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <EditItemDialog
        item={item}
        projects={projects}
        contexts={contexts}
        open={isOpen}
        onOpenChange={setIsOpen}
        onUpdate={setItem}
      />
    </div>
  );
}
