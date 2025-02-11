"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TimeBlock, TimeEntry } from "@/types/time-entry-types";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { format } from "date-fns";
import { RefObject } from "react";
import { TimeBlockComponent } from "./time-block";

interface TimelineProps {
  timeBlocks: TimeBlock[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleTimeBlockClick: (startTime: Date) => void;
  currentTimeRef: RefObject<HTMLDivElement | null>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  onEditEntry?: (entry: TimeEntry) => void;
}


export function Timeline({
  timeBlocks,
  selectedDate,
  setSelectedDate,
  calendarOpen,
  setCalendarOpen,
  handleTimeBlockClick,
  currentTimeRef,
  scrollAreaRef,
  onEditEntry,
}: TimelineProps) {
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-2">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  date && setSelectedDate(date);
                  setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("next")}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex h-[calc(100vh-16rem)] max-h-[50rem] min-h-[30rem] w-full flex-col rounded-md border border-border/30 bg-background/50 shadow-sm">
        <ScrollArea
          className="relative h-full touch-pan-x overflow-x-auto"
          ref={scrollAreaRef}
          scrollHideDelay={100}
        >
          {/* Timeline content */}
          <div className="relative min-w-[300px] flex-1">
            <div className="relative min-h-[768px]">
              {timeBlocks.map((block, index) => {
                return (
                  <TimeBlockComponent
                    key={`block-${index}`}
                    block={block}
                    handleTimeBlockClick={handleTimeBlockClick}
                    currentTimeRef={currentTimeRef}
                    selectedDate={selectedDate}
                    onEditEntry={onEditEntry}
                  />
                );
              })}
            </div>
          </div>{" "}
        </ScrollArea>
      </div>
    </div>
  );
}
