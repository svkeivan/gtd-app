"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format, addMinutes, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { getTimeEntries } from "@/actions/time-entries";
import { TimeBlock, TimeEntry } from "@/types/time-entry-types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimeEntryDialog } from "./time-entry-dialog";

export function TimelineView() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadTimeEntries() {
      try {
        setIsLoading(true);
        const entries = await getTimeEntries(selectedDate);
        
        // Generate time blocks for the day
        const blocks: TimeBlock[] = [];
        let currentTime = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);

        while (currentTime < dayEnd) {
          const blockEnd = addMinutes(currentTime, 30);
          const blockEntries = entries.filter(entry => {
            const entryStart = new Date(entry.startTime);
            const entryEnd = entry.endTime ? new Date(entry.endTime) : entryStart;
            return (
              (entryStart >= currentTime && entryStart < blockEnd) ||
              (entryEnd > currentTime && entryEnd <= blockEnd) ||
              (entryStart <= currentTime && entryEnd >= blockEnd)
            );
          });

          blocks.push({
            startTime: currentTime,
            endTime: blockEnd,
            entries: blockEntries,
          });
          currentTime = blockEnd;
        }

        setTimeBlocks(blocks);
      } catch (error) {
        console.error("Error loading time entries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTimeEntries();
  }, [selectedDate]);

  // Scroll to current time on initial load and when date changes
  useEffect(() => {
    if (!isLoading && scrollAreaRef.current && currentTimeRef.current) {
      const now = new Date();
      if (
        selectedDate.getDate() === now.getDate() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getFullYear() === now.getFullYear()
      ) {
        const scrollPosition = currentTimeRef.current.offsetTop - 200;
        scrollAreaRef.current.scrollTop = scrollPosition;
      }
    }
  }, [isLoading, selectedDate]);

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      Work: "bg-blue-500 dark:bg-blue-600",
      Meeting: "bg-purple-500 dark:bg-purple-600",
      Learning: "bg-green-500 dark:bg-green-600",
      Exercise: "bg-yellow-500 dark:bg-yellow-600",
      Personal: "bg-pink-500 dark:bg-pink-600",
      Break: "bg-gray-500 dark:bg-gray-600",
    };
    return colors[category || ""] || "bg-slate-500 dark:bg-slate-600";
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleTimeBlockClick = (startTime: Date) => {
    setSelectedTime(startTime);
    setDialogOpen(true);
  };

  const isCurrentTimeBlock = (block: TimeBlock) => {
    const now = new Date();
    return isWithinInterval(now, { start: block.startTime, end: block.endTime });
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center items-center h-[600px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
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
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {timeBlocks.map((block, index) => {
              const isCurrentTime = isCurrentTimeBlock(block);
              return (
                <div key={index}>
                  {isCurrentTime && (
                    <div
                      ref={currentTimeRef}
                      className="relative h-0.5 -mb-0.5 bg-blue-500 dark:bg-blue-400 w-full z-10"
                    />
                  )}
                  <div
                    className={cn(
                      "flex items-start p-2 rounded-lg transition-colors cursor-pointer",
                      "hover:bg-accent hover:bg-opacity-50",
                      "dark:hover:bg-accent dark:hover:bg-opacity-25",
                      isCurrentTime && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => handleTimeBlockClick(block.startTime)}
                  >
                    <div className="w-20 text-sm text-muted-foreground">
                      {format(block.startTime, "HH:mm")}
                    </div>
                    <div className="flex-1">
                      {block.entries.length > 0 ? (
                        block.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-md mb-1",
                              "bg-card dark:bg-card/90",
                              "border border-border/50",
                              "transition-all duration-200 ease-in-out",
                              "hover:shadow-md dark:hover:shadow-none",
                              "hover:border-border"
                            )}
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{entry.note}</p>
                              {entry.category && (
                                <Badge
                                  variant="secondary"
                                  className={`${getCategoryColor(entry.category)} text-white`}
                                >
                                  {entry.category}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.duration} min
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={cn(
                          "h-8 rounded-md",
                          "border border-dashed border-muted-foreground/20",
                          "dark:border-muted-foreground/10",
                          "transition-colors duration-200",
                          "hover:border-muted-foreground/30",
                          "dark:hover:border-muted-foreground/20"
                        )} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      <TimeEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selectedDate}
        defaultStartTime={selectedTime}
      />
    </>
  );
}