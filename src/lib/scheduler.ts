import { PriorityLevel } from "@prisma/client";
import prisma from "./prisma";

interface ScheduleSlot {
  start: Date;
  end: Date;
  isFocusTime: boolean;
  isBreak: boolean;
}

interface ScheduleTask {
  id: string;
  title: string;
  priority: PriorityLevel;
  estimated: number | null;
  requiresFocus: boolean;
  contexts: {
    id: string;
    name: string;
    mondayEnabled: boolean;
    tuesdayEnabled: boolean;
    wednesdayEnabled: boolean;
    thursdayEnabled: boolean;
    fridayEnabled: boolean;
    saturdayEnabled: boolean;
    sundayEnabled: boolean;
    startTime: string;
    endTime: string;
  }[];
}

export class SmartScheduler {
  private readonly workStartTime: string;
  private readonly workEndTime: string;
  private readonly lunchStartTime: string;
  private readonly lunchDuration: number;
  private readonly breakDuration: number;
  private readonly longBreakDuration: number;
  private readonly pomodoroDuration: number;
  private readonly shortBreakInterval: number;

  constructor(userPreferences: {
    workStartTime: string;
    workEndTime: string;
    lunchStartTime: string;
    lunchDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    pomodoroDuration: number;
    shortBreakInterval: number;
  }) {
    this.workStartTime = userPreferences.workStartTime;
    this.workEndTime = userPreferences.workEndTime;
    this.lunchStartTime = userPreferences.lunchStartTime;
    this.lunchDuration = userPreferences.lunchDuration;
    this.breakDuration = userPreferences.breakDuration;
    this.longBreakDuration = userPreferences.longBreakDuration;
    this.pomodoroDuration = userPreferences.pomodoroDuration;
    this.shortBreakInterval = userPreferences.shortBreakInterval;
  }

  private isContextAvailable(context: ScheduleTask["contexts"][0], date: Date): boolean {
    const dayOfWeek = date.getDay();
    const timeStr = date.toTimeString().slice(0, 5); // HH:MM format

    // Check if context is enabled for this day
    const isDayEnabled = (() => {
      switch (dayOfWeek) {
        case 0: return context.sundayEnabled;
        case 1: return context.mondayEnabled;
        case 2: return context.tuesdayEnabled;
        case 3: return context.wednesdayEnabled;
        case 4: return context.thursdayEnabled;
        case 5: return context.fridayEnabled;
        case 6: return context.saturdayEnabled;
        default: return false;
      }
    })();

    if (!isDayEnabled) return false;

    // Check if current time is within context's time window
    return timeStr >= context.startTime && timeStr <= context.endTime;
  }

  private isWorkingHours(date: Date): boolean {
    const timeStr = date.toTimeString().slice(0, 5);
    return timeStr >= this.workStartTime && timeStr <= this.workEndTime;
  }

  private isLunchTime(date: Date): boolean {
    const timeStr = date.toTimeString().slice(0, 5);
    const lunchEndTime = this.addMinutesToTime(this.lunchStartTime, this.lunchDuration);
    return timeStr >= this.lunchStartTime && timeStr <= lunchEndTime;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  private async getAvailableSlots(date: Date): Promise<ScheduleSlot[]> {
    const slots: ScheduleSlot[] = [];
    let currentTime = new Date(date);
    currentTime.setHours(parseInt(this.workStartTime.split(':')[0], 10));
    currentTime.setMinutes(parseInt(this.workStartTime.split(':')[1], 10));

    const endTime = new Date(date);
    endTime.setHours(parseInt(this.workEndTime.split(':')[0], 10));
    endTime.setMinutes(parseInt(this.workEndTime.split(':')[1], 10));

    let focusSessionCount = 0;

    while (currentTime < endTime) {
      // Skip lunch break
      if (this.isLunchTime(currentTime)) {
        currentTime = new Date(currentTime.getTime() + this.lunchDuration * 60000);
        continue;
      }

      // Handle focus sessions and breaks
      const isFocusTime = focusSessionCount < this.shortBreakInterval;
      const breakDuration = focusSessionCount === this.shortBreakInterval ? 
        this.longBreakDuration : this.breakDuration;

      if (isFocusTime) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(currentTime.getTime() + this.pomodoroDuration * 60000),
          isFocusTime: true,
          isBreak: false
        });
        currentTime = new Date(currentTime.getTime() + this.pomodoroDuration * 60000);
        focusSessionCount++;
      } else {
        slots.push({
          start: new Date(currentTime),
          end: new Date(currentTime.getTime() + breakDuration * 60000),
          isFocusTime: false,
          isBreak: true
        });
        currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
        focusSessionCount = 0;
      }
    }

    return slots;
  }

  private prioritizeTasks(tasks: ScheduleTask[]): ScheduleTask[] {
    return [...tasks].sort((a, b) => {
      // First prioritize by urgency
      const priorityOrder = {
        [PriorityLevel.URGENT]: 4,
        [PriorityLevel.HIGH]: 3,
        [PriorityLevel.MEDIUM]: 2,
        [PriorityLevel.LOW]: 1
      };

      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then consider focus requirements
      if (a.requiresFocus !== b.requiresFocus) {
        return a.requiresFocus ? -1 : 1; // Focus tasks come first
      }

      // Finally sort by estimated duration (shorter tasks first)
      return (a.estimated || 0) - (b.estimated || 0);
    });
  }

  public async scheduleTasks(userId: string, date: Date): Promise<{
    taskId: string;
    plannedDate: Date;
    estimated: number;
  }[]> {
    // Fetch unscheduled tasks with their contexts
    const tasks = await prisma.item.findMany({
      where: {
        userId,
        status: {
          in: ['NEXT_ACTION', 'PROJECT']
        },
        plannedDate: null,
        dueDate: {
          gte: date
        }
      },
      select: {
        id: true,
        title: true,
        priority: true,
        estimated: true,
        requiresFocus: true,
        contexts: {
          select: {
            id: true,
            name: true,
            mondayEnabled: true,
            tuesdayEnabled: true,
            wednesdayEnabled: true,
            thursdayEnabled: true,
            fridayEnabled: true,
            saturdayEnabled: true,
            sundayEnabled: true,
            startTime: true,
            endTime: true,
          }
        }
      }
    });

    const slots = await this.getAvailableSlots(date);
    const prioritizedTasks = this.prioritizeTasks(tasks);
    const scheduledTasks: {
      taskId: string;
      plannedDate: Date;
      estimated: number;
    }[] = [];

    for (const task of prioritizedTasks) {
      // Find appropriate slot for task
      const taskDuration = task.estimated || 30; // Default to 30 minutes
      const requiresFocus = task.requiresFocus;

      for (const slot of slots) {
        // Skip if slot duration doesn't match task requirements
        const slotDuration = (slot.end.getTime() - slot.start.getTime()) / 60000;
        if (slotDuration < taskDuration) continue;

        // Skip if focus requirements don't match
        if (requiresFocus && !slot.isFocusTime) continue;

        // Skip if no matching context is available
        const hasAvailableContext = task.contexts.some(
          context => this.isContextAvailable(context, slot.start)
        );
        if (!hasAvailableContext) continue;

        // Schedule task in this slot
        scheduledTasks.push({
          taskId: task.id,
          plannedDate: slot.start,
          estimated: taskDuration
        });

        // Mark slot as used by adjusting its start time
        slot.start = new Date(slot.start.getTime() + taskDuration * 60000);
        break;
      }
    }

    return scheduledTasks;
  }
}