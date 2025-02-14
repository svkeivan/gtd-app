# AI Schedule Optimizer Implementation Guide

## Overview
This document provides detailed implementation instructions for integrating OpenRouter-based AI scheduling optimization with our existing SmartScheduler system.

## Implementation Steps

### 1. Create AI Schedule Optimizer Action

Create a new server action at `src/actions/ai-schedule-optimizer.ts` with the following structure:

```typescript
// Implementation for src/actions/ai-schedule-optimizer.ts

"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SmartScheduler } from "@/lib/scheduler";
import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";

const optimizeScheduleSchema = z.object({
  date: z.date(),
  considerFutureWeek: z.boolean().default(false),
});

async function optimizeSchedule(data: z.infer<typeof optimizeScheduleSchema>) {
  const { user } = await auth();
  if (!user) throw new Error("Unauthorized");

  // 1. Gather scheduling context
  const [userPrefs, tasks, metrics] = await Promise.all([
    // Get user preferences
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        workStartTime: true,
        workEndTime: true,
        timezone: true,
        breakDuration: true,
        lunchStartTime: true,
        lunchDuration: true,
      },
    }),
    // Get tasks
    prisma.item.findMany({
      where: {
        userId: user.id,
        status: { in: ['NEXT_ACTION', 'PROJECT'] },
        dueDate: { gte: data.date },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        plannedDate: true,
        estimated: true,
        contexts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
          },
        },
        TimeEntry: {
          where: { endTime: { not: null } },
          select: { duration: true },
        },
      },
    }),
    // Get productivity metrics
    prisma.dailyProductivity.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: new Date(data.date.setHours(0, 0, 0, 0)),
          lt: new Date(data.date.setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  if (!userPrefs) throw new Error("User preferences not found");

  // 2. Format data for OpenRouter prompt
  const prompt = {
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
      plannedDate: task.plannedDate,
      estimated: task.estimated,
      contexts: task.contexts.map(c => ({
        id: c.id,
        name: c.name,
        availableHours: [`${c.startTime}-${c.endTime}`],
      })),
      timeSpent: task.TimeEntry.reduce((acc, entry) => acc + entry.duration, 0),
    })),
    userPreferences: {
      workStartTime: userPrefs.workStartTime,
      workEndTime: userPrefs.workEndTime,
      timezone: userPrefs.timezone,
      breakDuration: userPrefs.breakDuration,
      lunchStartTime: userPrefs.lunchStartTime,
      lunchDuration: userPrefs.lunchDuration,
    },
    productivityMetrics: metrics ? {
      focusSessionsCount: metrics.focusSessionsCount,
      completedTasks: metrics.completedTasks,
      breakAdherence: metrics.breakAdherence,
      productivity: metrics.productivity,
    } : null,
  };

  // 3. Call OpenRouter API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-2',
      messages: [{
        role: 'user',
        content: `As an AI calendar assistant, analyze and optimize this schedule:
        
        Current Tasks:
        ${JSON.stringify(prompt.tasks, null, 2)}
        
        User Preferences:
        ${JSON.stringify(prompt.userPreferences, null, 2)}
        
        ${prompt.productivityMetrics ? `Productivity Metrics:
        ${JSON.stringify(prompt.productivityMetrics, null, 2)}` : ''}
        
        Please provide:
        1. Optimal task scheduling considering priorities, deadlines, and user's productive hours
        2. Strategic break placement
        3. Recommendations for improving schedule efficiency
        
        Return the response in this JSON format:
        {
          "scheduledTasks": [{
            "taskId": string,
            "suggestedStartTime": string (ISO),
            "suggestedEndTime": string (ISO),
            "reasoning": string
          }],
          "breakSlots": [{
            "startTime": string (ISO),
            "endTime": string (ISO),
            "type": "SHORT" | "LONG" | "LUNCH"
          }],
          "recommendations": string[]
        }`,
      }],
      response_format: { type: 'json_object' },
    }),
  });

  const result = await response.json();
  const schedule = JSON.parse(result.choices[0].message.content);

  // 4. Apply AI suggestions using existing SmartScheduler
  const scheduler = new SmartScheduler(userPrefs);
  
  // Update task planned dates based on AI suggestions
  const updates = schedule.scheduledTasks.map(suggestion =>
    prisma.item.update({
      where: { id: suggestion.taskId },
      data: {
        plannedDate: new Date(suggestion.suggestedStartTime),
        estimated: Math.ceil(
          (new Date(suggestion.suggestedEndTime).getTime() -
           new Date(suggestion.suggestedStartTime).getTime()) / 60000
        ),
      },
    })
  );

  // Store break suggestions
  const breakUpdates = schedule.breakSlots.map(breakSlot =>
    prisma.breakSession.create({
      data: {
        userId: user.id,
        startTime: new Date(breakSlot.startTime),
        endTime: new Date(breakSlot.endTime),
        duration: Math.ceil(
          (new Date(breakSlot.endTime).getTime() -
           new Date(breakSlot.startTime).getTime()) / 60000
        ),
        type: breakSlot.type,
      },
    })
  );

  // Execute all updates in a transaction
  await prisma.$transaction([...updates, ...breakUpdates]);

  return {
    schedule,
    success: true,
  };
}

export const optimizeScheduleAction = createSafeAction(
  optimizeScheduleSchema,
  optimizeSchedule
);
```

### 2. Update Calendar View Component

Modify `src/app/dashboard/calendar/calendar-view.tsx` to add the AI optimization button:

```typescript
// Add to existing imports
import { optimizeScheduleAction } from "@/actions/ai-schedule-optimizer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Add inside CalendarView component
const handleOptimizeSchedule = async () => {
  const result = await optimizeScheduleAction({
    date: new Date(),
    considerFutureWeek: true,
  });

  if (result.success) {
    toast({
      title: "Schedule Optimized",
      description: "Your calendar has been optimized based on AI recommendations.",
    });
    // Refresh calendar view
  }
};

// Add to JSX
<Button 
  onClick={handleOptimizeSchedule}
  className="mb-4"
>
  Optimize Schedule with AI
</Button>
```

### 3. Environment Setup

Add the following environment variable:
```env
OPENROUTER_API_KEY=your_api_key_here
```

### 4. Type Definitions

Create or update type definitions in `src/types/schedule-types.ts`:

```typescript
export interface AIScheduleSuggestion {
  scheduledTasks: {
    taskId: string;
    suggestedStartTime: string;
    suggestedEndTime: string;
    reasoning: string;
  }[];
  breakSlots: {
    startTime: string;
    endTime: string;
    type: 'SHORT' | 'LONG' | 'LUNCH';
  }[];
  recommendations: string[];
}
```

## Testing Plan

1. Unit Tests:
   - Test schedule optimization with various task combinations
   - Verify break slot generation
   - Test error handling

2. Integration Tests:
   - Test OpenRouter API integration
   - Verify database updates
   - Test calendar view updates

3. End-to-End Tests:
   - Complete optimization flow
   - UI interaction testing
   - Performance testing with large datasets

## Security Considerations

1. API Key Protection:
   - Store OPENROUTER_API_KEY in environment variables
   - Never expose the key in client-side code
   - Implement rate limiting

2. Data Privacy:
   - Minimize sensitive data in API requests
   - Sanitize AI responses before storage
   - Log access to optimization features

## Next Steps

1. Switch to Code mode to implement the server action
2. Add the optimization button to the calendar view
3. Implement error handling and loading states
4. Add type definitions
5. Set up environment variables
6. Implement testing suite