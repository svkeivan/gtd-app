"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format, addMinutes, startOfDay, endOfDay } from "date-fns";
import { getTimeEntries } from "@/actions/time-entries";
import { TimeBlock, TimeEntry } from "@/types/time-entry-types";

export function TimelineView() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

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

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      Work: "bg-blue-500",
      Meeting: "bg-purple-500",
      Learning: "bg-green-500",
      Exercise: "bg-yellow-500",
      Personal: "bg-pink-500",
      Break: "bg-gray-500",
    };
    return colors[category || ""] || "bg-slate-500";
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
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Daily Timeline</h2>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="border rounded p-1"
        />
      </div>
      
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {timeBlocks.map((block, index) => (
            <div
              key={index}
              className="flex items-start p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <div className="w-20 text-sm text-muted-foreground">
                {format(block.startTime, "HH:mm")}
              </div>
              <div className="flex-1">
                {block.entries.length > 0 ? (
                  block.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 bg-secondary rounded-md mb-1"
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
                  <div className="h-8 border border-dashed border-muted-foreground/20 rounded-md" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}