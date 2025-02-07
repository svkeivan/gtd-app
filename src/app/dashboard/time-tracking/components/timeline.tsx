"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TimeBlock, TimeEntry } from "@/types/time-entry-types";
import { TimeBlockComponent } from "./time-block";
import { RefObject } from "react";

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

const HOURS = Array.from({ length: 24 }, (_, i) => i);

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
      <div className="flex justify-between items-center mb-6">
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
                  !selectedDate && "text-muted-foreground"
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

      <div className="relative">
        {/* Hour markers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-border bg-background z-10">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute text-xs text-muted-foreground"
              style={{ top: `${hour * 60}px` }}
            >
              {format(new Date().setHours(hour, 0), "ha")}
            </div>
          ))}
        </div>

        <ScrollArea className="h-[70vh] pl-12" ref={scrollAreaRef}>
          <div className="relative h-[1440px]"> {/* 24h * 60min = 1440px */}
            {/* Hour grid lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-border"
                style={{ top: `${hour * 60}px` }}
              />
            ))}

            {/* Half-hour grid lines */}
            {HOURS.map((hour) => (
              <div
                key={`${hour}-30`}
                className="absolute w-full border-t border-border border-dashed opacity-50"
                style={{ top: `${hour * 60 + 30}px` }}
              />
            ))}

            {timeBlocks.map((block, index) => (
              <TimeBlockComponent
                key={index}
                block={block}
                index={index}
                handleTimeBlockClick={handleTimeBlockClick}
                currentTimeRef={currentTimeRef}
                selectedDate={selectedDate}
                onEditEntry={onEditEntry}
                style={{
                  position: 'absolute',
                  top: `${(block.startTime.getHours() * 60 + block.startTime.getMinutes())}px`,
                  height: `${(block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60)}px`,
                  width: 'calc(100% - 1rem)',
                  left: '0.5rem'
                }}
              />
            ))}

            {/* Current time indicator */}
            <div
              ref={currentTimeRef}
              className="absolute left-0 right-0 z-50 transition-all duration-300"
              style={{
                top: `${(new Date().getHours() * 60 + new Date().getMinutes())}px`
              }}
            >
              <div className="relative">
                <div className="absolute -left-3 -top-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="ml-2 h-px bg-red-500 w-full" />
                <span className="absolute -left-12 -top-2.5 text-xs text-red-500">
                  {format(new Date(), 'HH:mm')}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}