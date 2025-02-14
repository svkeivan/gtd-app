"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SmartScheduler } from "@/lib/scheduler";
import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { ActionState } from "@/lib/create-safe-action";
import type { AIScheduleSuggestion } from "@/types/schedule-types";

const optimizeScheduleSchema = z.object({
  date: z.date(),
  considerFutureWeek: z.boolean(),
});

export type OptimizeScheduleInput = z.infer<typeof optimizeScheduleSchema>;

export interface OptimizeScheduleResponse {
  schedule: AIScheduleSuggestion;
}

export type OptimizeScheduleActionState = ActionState<
  OptimizeScheduleInput,
  OptimizeScheduleResponse
>;

async function optimizeSchedule(
  data: OptimizeScheduleInput
): Promise<OptimizeScheduleActionState> {
  try {
    const { user } = await auth();
    if (!user) {
      return { 
        fieldErrors: undefined,
        error: "Unauthorized",
      };
    }

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
          longBreakDuration: true,
          pomodoroDuration: true,
          shortBreakInterval: true,
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

    if (!userPrefs) {
      return { 
        fieldErrors: undefined,
        error: "User preferences not found",
      };
    }

    // 2. Format data for OpenRouter prompt
    const prompt = `As an AI calendar assistant, analyze and optimize this schedule:
    
    Current Tasks:
    ${JSON.stringify(tasks, null, 2)}
    
    User Preferences:
    ${JSON.stringify(userPrefs, null, 2)}
    
    ${metrics ? `Productivity Metrics:
    ${JSON.stringify(metrics, null, 2)}` : ''}
    
    Please provide:
    1. Optimal task scheduling considering priorities, deadlines, and user's productive hours
    2. Strategic break placement
    3. Recommendations for improving schedule efficiency
    
    Return the response in this exact JSON format:
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
    }`;

    // 3. Call OpenRouter API
    const headers = new Headers({
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'GTD App Calendar Assistant',
    });

    if (process.env.NEXT_PUBLIC_APP_URL) {
      headers.append('HTTP-Referer', process.env.NEXT_PUBLIC_APP_URL);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'anthropic/claude-2',
        messages: [{
          role: 'user',
          content: prompt,
        }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return { 
        fieldErrors: undefined,
        error: 'Failed to optimize schedule. Please try again later.',
      };
    }

    const result = await response.json();
    const schedule: AIScheduleSuggestion = JSON.parse(
      result.choices[0].message.content
    );

    // 4. Apply AI suggestions using existing SmartScheduler
    const scheduler = new SmartScheduler({
      workStartTime: userPrefs.workStartTime,
      workEndTime: userPrefs.workEndTime,
      lunchStartTime: userPrefs.lunchStartTime,
      lunchDuration: userPrefs.lunchDuration,
      breakDuration: userPrefs.breakDuration,
      longBreakDuration: userPrefs.longBreakDuration,
      pomodoroDuration: userPrefs.pomodoroDuration,
      shortBreakInterval: userPrefs.shortBreakInterval,
    });
    
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
      fieldErrors: undefined,
      error: undefined,
      data: { schedule },
    };
  } catch (error) {
    console.error('Error in optimizeSchedule:', error);
    return {
      fieldErrors: undefined,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export const optimizeScheduleAction = createSafeAction(
  optimizeScheduleSchema,
  optimizeSchedule
);