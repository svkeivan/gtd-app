"use client";

import { TimeEntry } from "@/types/time-entry-types";
import { format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { useMemo } from "react";

interface TrendChartProps {
  entries: TimeEntry[];
  startDate: Date;
  endDate: Date;
  isLoading: boolean;
}

interface DailyStats {
  date: Date;
  categories: Record<string, number>;
  total: number;
}

const CATEGORIES = [
  "Work",
  "Meeting",
  "Learning",
  "Exercise",
  "Personal",
  "Break",
  "Other",
] as const;

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Work: "#3B82F6", // blue-500
    Meeting: "#8B5CF6", // purple-500
    Learning: "#22C55E", // green-500
    Exercise: "#EAB308", // yellow-500
    Personal: "#EC4899", // pink-500
    Break: "#6B7280", // gray-500
    Other: "#64748B", // slate-500
  };
  return colors[category] || colors.Other;
};

export function TrendChart({ entries, startDate, endDate, isLoading }: TrendChartProps) {
  const { dailyStats, maxTotal } = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialize daily stats for each day
    const stats: DailyStats[] = days.map(date => ({
      date,
      categories: CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {}),
      total: 0,
    }));

    // Calculate stats for each day
    entries.forEach(entry => {
      const entryDate = startOfDay(new Date(entry.startTime));
      const dayIndex = stats.findIndex(
        stat => startOfDay(stat.date).getTime() === entryDate.getTime()
      );
      
      if (dayIndex !== -1) {
        const category = entry.category || "Other";
        stats[dayIndex].categories[category] = 
          (stats[dayIndex].categories[category] || 0) + entry.duration;
        stats[dayIndex].total += entry.duration;
      }
    });

    // Find maximum total for scaling
    const maxTotal = Math.max(...stats.map(day => day.total));

    return { dailyStats: stats, maxTotal };
  }, [entries, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const xScale = (index: number) => (index * chartWidth) / (dailyStats.length - 1);
  const yScale = (value: number) => chartHeight - (value / maxTotal) * chartHeight;

  // Generate path for each category
  const generateAreaPath = (category: string, index: number) => {
    const points = dailyStats.map((day, i) => {
      const x = xScale(i);
      let y = 0;
      
      // Sum up all categories up to this one
      for (let j = 0; j <= index; j++) {
        const cat = CATEGORIES[j];
        y += day.categories[cat] || 0;
      }
      
      return `${x},${yScale(y)}`;
    });

    const baselinePoints = dailyStats.map((_, i) => {
      const x = xScale(i);
      let y = 0;
      
      // Sum up all categories before this one
      for (let j = 0; j < index; j++) {
        const cat = CATEGORIES[j];
        y += dailyStats[i].categories[cat] || 0;
      }
      
      return `${x},${yScale(y)}`;
    });

    return `
      M ${points[0]}
      L ${points.join(" L ")}
      L ${baselinePoints[baselinePoints.length - 1]}
      L ${baselinePoints.reverse().join(" L ")}
      Z
    `;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Time Tracking Trends</div>
      <div className="relative w-full overflow-x-auto">
        <svg
          width={width}
          height={height}
          className="font-sans"
          style={{ minWidth: width }}
        >
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Areas */}
            {CATEGORIES.map((category, index) => (
              <path
                key={category}
                d={generateAreaPath(category, index)}
                fill={getCategoryColor(category)}
                opacity={0.7}
                className="transition-opacity hover:opacity-90"
              />
            ))}

            {/* X-axis */}
            <line
              x1={0}
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="currentColor"
              strokeOpacity={0.2}
            />
            {dailyStats.map((day, i) => (
              <text
                key={i}
                x={xScale(i)}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {format(day.date, "MMM d")}
              </text>
            ))}

            {/* Y-axis */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="currentColor"
              strokeOpacity={0.2}
            />
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <g key={tick}>
                <line
                  x1={-5}
                  y1={chartHeight * (1 - tick)}
                  x2={chartWidth}
                  y2={chartHeight * (1 - tick)}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4,4"
                />
                <text
                  x={-10}
                  y={chartHeight * (1 - tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {Math.round(maxTotal * tick / 60)}h
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {CATEGORIES.map(category => (
            <div key={category} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getCategoryColor(category) }}
              />
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}