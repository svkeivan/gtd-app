"use client";

import { Card } from "@/components/ui/card";
import { TimeEntry } from "@/types/time-entry-types";
import { format, parseISO, startOfWeek, addDays, addHours, startOfDay } from "date-fns";
import { useMemo } from "react";

interface ProductivityHeatmapProps {
  entries: TimeEntry[];
  isLoading: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getIntensityColor = (intensity: number) => {
  // Scale from 0-1 where 1 is the most intense
  if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (intensity < 0.25) return 'bg-blue-100 dark:bg-blue-900';
  if (intensity < 0.5) return 'bg-blue-300 dark:bg-blue-700';
  if (intensity < 0.75) return 'bg-blue-500 dark:bg-blue-500';
  return 'bg-blue-700 dark:bg-blue-300';
};

export function ProductivityHeatmap({ entries, isLoading }: ProductivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create a 24x7 matrix for hours x days
    const data: number[][] = Array.from({ length: 7 }, () => 
      Array.from({ length: 24 }, () => 0)
    );

    // Calculate total minutes for each hour slot
    entries.forEach(entry => {
      const startTime = new Date(entry.startTime);
      // If endTime is null, use startTime + duration
      const endTime = entry.endTime 
        ? new Date(entry.endTime)
        : new Date(startTime.getTime() + entry.duration * 60 * 1000);

      // Adjust day index to start from Monday (1) instead of Sunday (0)
      const dayIndex = (startTime.getDay() + 6) % 7; // This makes Monday 0, Sunday 6
      const hourIndex = startTime.getHours();

      // Simple case: entry starts and ends in same hour
      if (startTime.getHours() === endTime.getHours()) {
        data[dayIndex][hourIndex] += entry.duration;
      } else {
        // Complex case: entry spans multiple hours
        let currentTime = startTime;
        while (currentTime < endTime) {
          const currentDayIndex = (currentTime.getDay() + 6) % 7;
          const currentHourIndex = currentTime.getHours();
          
          // Calculate minutes in this hour slot
          const endOfHour = addHours(startOfDay(currentTime), currentHourIndex + 1);
          const minutesInSlot = Math.min(
            60,
            Math.round((endTime.getTime() - currentTime.getTime()) / (1000 * 60))
          );
          
          data[currentDayIndex][currentHourIndex] += minutesInSlot;
          currentTime = endOfHour;
        }
      }
    });

    // Find max value for normalization
    const maxValue = Math.max(...data.flat());

    // Normalize values to 0-1 range
    return data.map(row => 
      row.map(value => maxValue > 0 ? value / maxValue : 0)
    );
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Productivity Patterns</div>
      <div className="relative">
        {/* Hour labels */}
        <div className="flex mb-2">
          <div className="w-12" /> {/* Spacer for day labels */}
          {HOURS.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
              {format(new Date().setHours(hour), 'ha')}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center">
              <div className="w-12 text-xs text-muted-foreground">{day}</div>
              <div className="flex-1 flex gap-1">
                {HOURS.map(hour => {
                  const intensity = heatmapData[dayIndex][hour];
                  const tooltipText = `${day} ${format(new Date().setHours(hour), 'ha')}${
                    intensity > 0 ? ` - ${Math.round(intensity * 100)}% activity` : ''
                  }`;
                  
                  return (
                    <div
                      key={hour}
                      className={`
                        flex-1 aspect-square rounded-sm transition-colors
                        hover:opacity-80 cursor-help
                        ${getIntensityColor(intensity)}
                      `}
                      title={tooltipText}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-700" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-700 dark:bg-blue-300" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}