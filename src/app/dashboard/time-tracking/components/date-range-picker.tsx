"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  setValue: (value: DateRange | undefined) => void;
}

export function DateRangePicker({ value, setValue }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            {value?.from ? (
              value.to ? (
                `${format(value.from, "PPP")} - ${format(value.to, "PPP")}`
              ) : (
                format(value.from, "PPP")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={setValue}
            numberOfMonths={2}
            pagedNavigation
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}