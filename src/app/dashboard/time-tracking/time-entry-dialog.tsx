"use client";

import { createTimeEntry, updateTimeEntry } from "@/actions/time-entries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateTimeEntryData, TimeEntry } from "@/types/time-entry-types";
import { toast } from "sonner";
import { useState } from "react";
import { TimeEntryForm } from "./time-entry-form";
import { mutate } from "swr";
import { format } from "date-fns";

interface TimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultStartTime?: Date;
  onTimeEntryCreated?: () => void;
  editEntry?: TimeEntry;
}

export function TimeEntryDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultStartTime,
  onTimeEntryCreated,
  editEntry,
}: TimeEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateTimeEntryData) => {
    try {
      setIsSubmitting(true);

      // Ensure the date is set correctly
      if (defaultDate) {
        const startHours = data.startTime.getHours();
        const startMinutes = data.startTime.getMinutes();
        data.startTime = new Date(defaultDate);
        data.startTime.setHours(startHours, startMinutes, 0, 0);
        
        const endHours = data.endTime.getHours();
        const endMinutes = data.endTime.getMinutes();
        data.endTime = new Date(defaultDate);
        data.endTime.setHours(endHours, endMinutes, 0, 0);
      }

      // Calculate duration for optimistic update
      const duration = Math.round(
        (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
      );

      // Optimistically update the UI
      const optimisticEntry = {
        id: editEntry?.id || 'temp-' + Date.now(),
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        category: data.category,
        note: data.note || null,
        itemId: data.itemId || null,
        userId: 'current-user', // Will be replaced with actual data
        createdAt: editEntry?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Update all relevant SWR caches
      mutate(
        (key) => Array.isArray(key) && key[0] instanceof Date, // Matches time entries report key pattern
        async (cachedData: any) => {
          if (!cachedData) return cachedData;
          const entries = editEntry
            ? cachedData.entries.map((e: TimeEntry) => 
                e.id === editEntry.id ? optimisticEntry : e
              )
            : [...(cachedData.entries || []), optimisticEntry];
          return {
            ...cachedData,
            entries,
          };
        },
        { revalidate: false }
      );

      // Create or update the entry
      if (editEntry) {
        await updateTimeEntry(editEntry.id, data);
        toast.success("Time entry updated", {
          description: (
            <div className="text-sm">
              <div>{data.category} - {format(data.startTime, "HH:mm")}</div>
              {data.note && <div className="text-muted-foreground mt-1">{data.note}</div>}
            </div>
          ),
        });
      } else {
        await createTimeEntry(data);
        toast.success("Time entry saved", {
          description: (
            <div className="text-sm">
              <div>{data.category} - {format(data.startTime, "HH:mm")}</div>
              {data.note && <div className="text-muted-foreground mt-1">{data.note}</div>}
            </div>
          ),
        });
      }

      // Close dialog and notify parent
      onOpenChange(false);
      onTimeEntryCreated?.();

      // Revalidate all time entry related data
      mutate(
        (key) => Array.isArray(key) && key[0] instanceof Date
      );
    } catch (error) {
      console.error("Error saving time entry:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save time entry";
      toast.error(errorMessage);

      // Revalidate to ensure data consistency
      mutate(
        (key) => Array.isArray(key) && key[0] instanceof Date
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editEntry ? "Edit Time Entry" : "Log Time Entry"}</DialogTitle>
          <DialogDescription>
            {editEntry 
              ? "Update the details of your time entry"
              : "Record time spent on activities in minutes"
            }
          </DialogDescription>
        </DialogHeader>
        <TimeEntryForm
          defaultDate={defaultDate}
          defaultStartTime={editEntry?.startTime || defaultStartTime}
          initialData={editEntry ? {
            startTime: editEntry.startTime,
            endTime: editEntry.endTime,
            category: editEntry.category || undefined,
            note: editEntry.note || undefined,
            itemId: editEntry.itemId || undefined,
          } : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
