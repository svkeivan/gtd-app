"use client";

import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getNextActionItems } from "@/actions/time-entries";
import { toast } from "sonner";
import { CreateTimeEntryData } from "@/types/time-entry-types";
import { cn } from "@/lib/utils";

type NextActionItem = {
  id: string;
  title: string;
};

const CATEGORIES = [
  "Work",
  "Meeting",
  "Learning",
  "Exercise",
  "Personal",
  "Break",
  "Other"
] as const;

export type Category = typeof CATEGORIES[number];

interface TimeEntryFormProps {
  defaultDate?: Date;
  defaultStartTime?: Date;
  initialData?: {
    startTime: Date;
    endTime: Date | null;
    category?: string;
    note?: string;
    itemId?: string;
  };
  onSubmit: (data: CreateTimeEntryData) => Promise<void>;
  isSubmitting: boolean;
}

export function TimeEntryForm({ 
  defaultDate,
  defaultStartTime,
  initialData,
  onSubmit,
  isSubmitting 
}: TimeEntryFormProps) {
  const [startTime, setStartTime] = useState<Date>(
    initialData?.startTime || defaultStartTime || new Date()
  );
  const [duration, setDuration] = useState<number>(() => {
    if (initialData?.endTime) {
      return Math.round(
        (initialData.endTime.getTime() - initialData.startTime.getTime()) / (1000 * 60)
      );
    }
    return 30;
  });
  const [category, setCategory] = useState<Category | "">(
    (initialData?.category as Category) || ""
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [itemId, setItemId] = useState<string>(initialData?.itemId || "");
  const [nextActionItems, setNextActionItems] = useState<NextActionItem[]>([]);
  const [isCustomDuration, setIsCustomDuration] = useState(() => {
    if (initialData?.endTime) {
      const mins = Math.round(
        (initialData.endTime.getTime() - initialData.startTime.getTime()) / (1000 * 60)
      );
      return ![15, 30, 45, 60].includes(mins);
    }
    return false;
  });

  useEffect(() => {
    const loadNextActionItems = async () => {
      try {
        const items = await getNextActionItems();
        setNextActionItems(items);
      } catch (error) {
        console.error("Error loading next action items:", error);
        toast.error("Failed to load next action items");
      }
    };

    loadNextActionItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !duration || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (duration <= 0 || duration > 480) { // Max 8 hours
      toast.error("Duration must be between 1 and 480 minutes");
      return;
    }

    const endTime = addMinutes(startTime, duration);

    const timeEntryData: CreateTimeEntryData = {
      startTime,
      endTime,
      category,
      note: note || undefined,
      itemId: itemId || undefined,
    };

    try {
      await onSubmit(timeEntryData);
      
      if (!initialData) {
        // Only reset form for new entries
        setDuration(30);
        setCategory("");
        setItemId("");
        setNote("");
        setIsCustomDuration(false);
      }
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error in form submission:", error);
    }
  };

  const handleDurationChange = (newDuration: number | string) => {
    if (typeof newDuration === 'number') {
      setDuration(newDuration);
      setIsCustomDuration(false);
    } else {
      setIsCustomDuration(true);
      setDuration(30); // Default value for the input
    }
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setDuration(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Start Time</Label>
        <Input
          type="time"
          value={format(startTime, "HH:mm")}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(":").map(Number);
            const newDate = new Date(startTime);
            newDate.setHours(hours, minutes);
            setStartTime(newDate);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={!isCustomDuration && duration === 15 ? "default" : "outline"}
            size="sm"
            onClick={() => handleDurationChange(15)}
          >
            15m
          </Button>
          <Button
            type="button"
            variant={!isCustomDuration && duration === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => handleDurationChange(30)}
          >
            30m
          </Button>
          <Button
            type="button"
            variant={!isCustomDuration && duration === 45 ? "default" : "outline"}
            size="sm"
            onClick={() => handleDurationChange(45)}
          >
            45m
          </Button>
          <Button
            type="button"
            variant={!isCustomDuration && duration === 60 ? "default" : "outline"}
            size="sm"
            onClick={() => handleDurationChange(60)}
          >
            1h
          </Button>
          <Button
            type="button"
            variant={isCustomDuration ? "default" : "outline"}
            size="sm"
            onClick={() => handleDurationChange("custom")}
          >
            Custom
          </Button>
        </div>
        {isCustomDuration && (
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="number"
              min="1"
              max="480"
              value={duration}
              onChange={handleCustomDurationChange}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <NextActionItemSelector
        itemId={itemId}
        setItemId={setItemId}
        nextActionItems={nextActionItems}
      />

      <div className="space-y-2">
        <Label htmlFor="note">Notes</Label>
        <Textarea
          id="note"
          placeholder="What did you work on?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-20"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : initialData ? "Update Entry" : "Save Entry"}
      </Button>
    </form>
  );
}

interface NextActionItemSelectorProps {
  itemId: string;
  setItemId: (itemId: string) => void;
  nextActionItems: NextActionItem[];
}

function NextActionItemSelector({ itemId, setItemId, nextActionItems }: NextActionItemSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="item">Next Action Item (Optional)</Label>
      <Select value={itemId} onValueChange={setItemId}>
        <SelectTrigger>
          <SelectValue placeholder="Select an item to track time for" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {nextActionItems.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}