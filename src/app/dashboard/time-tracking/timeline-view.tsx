"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Timeline } from "./components/timeline";
import { getTimeEntries } from "@/actions/time-entries";
import { TimeBlock, TimeEntry } from "@/types/time-entry-types";
import { TimeEntryDialog } from "./time-entry-dialog";
import { startOfDay, endOfDay, addMinutes } from "date-fns";
import { RefObject } from "react";
import useSWR, { mutate } from "swr";

const fetcher = async (date: Date) => {
  return getTimeEntries(date);
};

export function TimelineView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [editEntry, setEditEntry] = useState<TimeEntry | undefined>(undefined);
  const scrollAreaRef: RefObject<HTMLDivElement | null> = useRef(null);
  const currentTimeRef: RefObject<HTMLDivElement | null> = useRef(null);

  // Fetch time entries with SWR for real-time updates
  const { data: entries, isLoading } = useSWR(
    selectedDate,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Generate time blocks
  const timeBlocks: TimeBlock[] = (() => {
    if (!entries) return [];

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

    return blocks;
  })();

  const handleTimeBlockClick = (startTime: Date) => {
    setSelectedTime(startTime);
    setEditEntry(undefined);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditEntry(entry);
    setSelectedTime(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditEntry(undefined);
      setSelectedTime(undefined);
    }
  };

  const handleTimeEntryCreated = () => {
    // Revalidate data
    mutate(selectedDate);
  };

  // Scroll to current time on initial load
  useEffect(() => {
    if (currentTimeRef.current && scrollAreaRef.current) {
      const now = new Date();
      if (
        now.toDateString() === selectedDate.toDateString() &&
        !isLoading
      ) {
        currentTimeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selectedDate, isLoading]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Daily Timeline</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your time entries for the day
            </p>
          </div>
        </div>

        <Timeline
          timeBlocks={timeBlocks}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          calendarOpen={false}
          setCalendarOpen={() => {}}
          handleTimeBlockClick={handleTimeBlockClick}
          currentTimeRef={currentTimeRef}
          scrollAreaRef={scrollAreaRef}
          onEditEntry={handleEditEntry}
        />

        {/* Real-time indicator */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Updates automatically every 30 seconds</span>
        </div>
      </Card>

      <TimeEntryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        defaultDate={selectedDate}
        defaultStartTime={selectedTime}
        editEntry={editEntry}
        onTimeEntryCreated={handleTimeEntryCreated}
      />
    </>
  );
}