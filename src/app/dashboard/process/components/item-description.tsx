"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface ItemDescriptionProps {
  description: string;
  estimate: string;
  dueDate?: Date;
  onDescriptionChange: (value: string) => void;
  onEstimateChange: (value: string) => void;
  onDueDateChange: (date: Date | undefined) => void;
}

export function ItemDescription({
  description,
  estimate,
  dueDate,
  onDescriptionChange,
  onEstimateChange,
  onDueDateChange,
}: ItemDescriptionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-lg">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Add more details about this task..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="estimate" className="text-lg">
            Time Estimate (minutes)
          </Label>
          <Input
            id="estimate"
            type="number"
            placeholder="e.g. 30"
            value={estimate}
            onChange={(e) => onEstimateChange(e.target.value)}
          />
        </div>

        <div className="flex-1 space-y-2">
          <Label className="text-lg">Due Date (optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !dueDate && "text-muted-foreground"
                }`}
              >
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={onDueDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}