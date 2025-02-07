"use client";

import { format, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TimeBlock, TimeEntry } from "@/types/time-entry-types";
import React, { RefObject, CSSProperties, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, DotsHorizontalIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTimeEntry } from "@/actions/time-entries";
import { toast } from "sonner";
import { mutate } from "swr";

interface TimeBlockComponentProps {
  block: TimeBlock;
  index: number;
  handleTimeBlockClick: (startTime: Date) => void;
  currentTimeRef: RefObject<HTMLDivElement | null>;
  selectedDate: Date;
  style?: CSSProperties;
  onEditEntry?: (entry: TimeEntry) => void;
}

const getCategoryColor = (category: string | null) => {
  const colors: Record<string, string> = {
    Work: "bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-500",
    Meeting: "bg-purple-500 dark:bg-purple-600 border-purple-600 dark:border-purple-500",
    Learning: "bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-500",
    Exercise: "bg-yellow-500 dark:bg-yellow-600 border-yellow-600 dark:border-yellow-500",
    Personal: "bg-pink-500 dark:bg-pink-600 border-pink-600 dark:border-pink-500",
    Break: "bg-gray-500 dark:bg-gray-600 border-gray-600 dark:border-gray-500",
  };
  return colors[category || ""] || "bg-slate-500 dark:bg-slate-600 border-slate-600 dark:border-slate-500";
};

const isCurrentTimeBlock = (block: TimeBlock) => {
  const now = new Date();
  return isWithinInterval(now, { start: block.startTime, end: block.endTime });
};

export function TimeBlockComponent({
  block,
  index,
  handleTimeBlockClick,
  currentTimeRef,
  selectedDate,
  style,
  onEditEntry,
}: TimeBlockComponentProps) {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const isCurrentTime = isCurrentTimeBlock(block);
  const now = new Date();
  const isToday =
    selectedDate.getDate() === now.getDate() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();

  const handleDelete = async (entry: TimeEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting[entry.id]) return;

    try {
      setIsDeleting(prev => ({ ...prev, [entry.id]: true }));

      // Optimistically update UI
      mutate(
        selectedDate,
        (data: TimeEntry[] | undefined) => {
          if (!data) return data;
          return data.filter(e => e.id !== entry.id);
        },
        false
      );

      await deleteTimeEntry(entry.id);
      toast.success("Time entry deleted");

      // Revalidate data
      mutate(selectedDate);
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
      // Revalidate to restore correct data
      mutate(selectedDate);
    } finally {
      setIsDeleting(prev => ({ ...prev, [entry.id]: false }));
    }
  };

  const handleEdit = (entry: TimeEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEntry?.(entry);
  };

  return (
    <div style={style}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "group relative rounded-lg transition-all duration-200",
                "hover:bg-accent/5 dark:hover:bg-accent/10",
                isCurrentTime && isToday && "bg-blue-50/50 dark:bg-blue-900/10"
              )}
              onClick={() => handleTimeBlockClick(block.startTime)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTimeBlockClick(block.startTime);
                }
              }}
            >
              {/* Time label */}
              <div className="absolute -left-14 top-0 text-xs text-muted-foreground select-none">
                {format(block.startTime, "HH:mm")}
              </div>

              {/* Add button - shows on hover */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute -right-10 top-1/2 -translate-y-1/2 opacity-0",
                  "group-hover:opacity-100 transition-opacity"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTimeBlockClick(block.startTime);
                }}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>

              {/* Time entries */}
              {block.entries.length > 0 ? (
                <div className="space-y-1 p-2">
                  {block.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "relative rounded-md p-3",
                        "border-l-4 bg-card dark:bg-card/90",
                        getCategoryColor(entry.category),
                        "transition-all duration-200",
                        "group/entry"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium line-clamp-2">{entry.note || "No description"}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {entry.duration}m
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/entry:opacity-100"
                                >
                                  <DotsHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => handleEdit(entry, e as any)}
                                  className="gap-2"
                                >
                                  <Pencil1Icon className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => handleDelete(entry, e as any)}
                                  className="gap-2 text-destructive focus:text-destructive"
                                  disabled={isDeleting[entry.id]}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  {isDeleting[entry.id] ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {entry.category && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              getCategoryColor(entry.category),
                              "text-white"
                            )}
                          >
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    "h-8 m-2 rounded-md",
                    "border border-dashed border-muted-foreground/20",
                    "dark:border-muted-foreground/10",
                    "transition-all duration-200",
                    "group-hover:border-muted-foreground/40",
                    "dark:group-hover:border-muted-foreground/30"
                  )}
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Click to add time entry</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}