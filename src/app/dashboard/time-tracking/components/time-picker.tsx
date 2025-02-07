"use client";

import { format, set } from "date-fns";
import { Clock } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = ["00", "15", "30", "45"];

interface TimePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function TimePicker({ date, onChange }: TimePickerProps) {
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