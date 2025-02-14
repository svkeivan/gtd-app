import { PriorityLevel } from "@prisma/client";

export interface ScheduleContext {
  id: string;
  name: string;
  availableHours: string[];
}

export interface ScheduleTask {
  id: string;
  title: string;
  priority: PriorityLevel;
  dueDate?: Date | null;
  plannedDate?: Date | null;
  estimated?: number | null;
  contexts: ScheduleContext[];
  timeSpent?: number;
  progress?: number;
}

export interface UserSchedulePreferences {
  workStartTime: string;
  workEndTime: string;
  timezone: string;
  breakDuration: number;
  lunchStartTime: string;
  lunchDuration: number;
  existingMeetings?: {
    start: Date;
    end: Date;
    title: string;
  }[];
}

export interface ProductivityMetrics {
  focusSessionsCount: number;
  completedTasks: number;
  breakAdherence: number;
  productivity: number;
}

export interface ScheduleOptimizationInput {
  tasks: ScheduleTask[];
  userPreferences: UserSchedulePreferences;
  productivityMetrics?: ProductivityMetrics | null;
}

export interface ScheduledTask {
  taskId: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  reasoning: string;
}

export interface BreakSlot {
  startTime: string;
  endTime: string;
  type: 'SHORT' | 'LONG' | 'LUNCH';
}

export interface AIScheduleSuggestion {
  scheduledTasks: ScheduledTask[];
  breakSlots: BreakSlot[];
  recommendations: string[];
}

export interface OptimizeScheduleResponse {
  success: boolean;
  schedule?: AIScheduleSuggestion;
  error?: string;
}