"use client";

import { createTimeEntry } from "@/actions/time-entries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { CreateTimeEntryData } from "@/types/time-entry-types";
import { format, set } from "date-fns";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TimeEntryForm } from "./time-entry-form";

const CATEGORIES = [
  "Work",
  "Meeting",
  "Learning",
  "Exercise",
  "Personal",
  "Break",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = ["00", "15", "30", "45"];

interface TimePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

interface TimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultStartTime?: Date | null;
  onTimeEntryCreated?: () => void;
}

function TimePicker({ date, onChange }: TimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? format(date, "HH:mm") : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="space-y-2">
            <Label>Hour</Label>
            <Select
              value={format(date, "HH")}
              onValueChange={(hour) => {
                onChange(
                  set(date, {
                    hours: parseInt(hour),
                    minutes: date.getMinutes(),
                  }),
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent position="popper">
                {HOURS.map((hour) => (
                  <SelectItem
                    key={hour}
                    value={hour.toString().padStart(2, "0")}
                  >
                    {hour.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Minute</Label>
            <Select
              value={format(date, "mm")}
              onValueChange={(minute) => {
                onChange(
                  set(date, {
                    hours: date.getHours(),
                    minutes: parseInt(minute),
                  }),
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent position="popper">
                {MINUTES.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TimeEntryDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultStartTime,
  onTimeEntryCreated,
}: TimeEntryDialogProps) {
  const [date, setDate] = useState<Date>(defaultDate || new Date());
  const [startTime, setStartTime] = useState<Date>(
    defaultStartTime || new Date(),
  );
  const [endTime, setEndTime] = useState<Date>(
    defaultStartTime
      ? new Date(defaultStartTime.getTime() + 30 * 60000)
      : new Date(),
  );
  const [category, setCategory] = useState<Category | "">("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update times when defaultStartTime changes
  useEffect(() => {
    if (defaultStartTime) {
      setStartTime(defaultStartTime);
      setEndTime(new Date(defaultStartTime.getTime() + 30 * 60000));
    }
  }, [defaultStartTime]);

  // Update date when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSubmit = async () => {
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      setIsSubmitting(true);
      const timeEntryData: CreateTimeEntryData = {
        startTime,
        endTime,
        category,
        note: note || undefined,
      };

      await createTimeEntry(timeEntryData);
      toast.success("Time entry saved successfully");

      // Reset form and close dialog
      setCategory("");
      setNote("");
      onOpenChange(false);
      onTimeEntryCreated?.();
    } catch (error) {
      console.error("Error saving time entry:", error);
      toast.error("Failed to save time entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Time Entry</DialogTitle>
        </DialogHeader>
        <TimeEntryForm
          defaultStartTime={startTime}
          defaultEndTime={endTime}
        />
      </DialogContent>
    </Dialog>
  );
}
