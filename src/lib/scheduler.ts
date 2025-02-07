import { PriorityLevel } from "@prisma/client";
import prisma from "./prisma";

interface ScheduleSlot {
  start: Date;
  end: Date;
  isFocusTime: boolean;
  isBreak: boolean;
  context?: string; // Track current context
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
  dependsOn: string[]; // IDs of tasks this task depends on
  blocks: string[]; // IDs of tasks this task blocks
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
  private readonly contextSwitchPenalty: number = 15; // Minutes penalty for context switch

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
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  private async getAvailableSlots(date: Date): Promise<ScheduleSlot[]> {
    const slots: ScheduleSlot[] = [];
    let currentTime = new Date(date);
    currentTime.setHours(parseInt(this.workStartTime.split(':')[0], 10));
    currentTime.setMinutes(parseInt(this.workStartTime.split(':')[1], 10));
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    const endTime = new Date(date);
    endTime.setHours(parseInt(this.workEndTime.split(':')[0], 10));
    endTime.setMinutes(parseInt(this.workEndTime.split(':')[1], 10));
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    let focusSessionCount = 0;
    let lastContextId: string | undefined;
    let consecutiveWorkTime = 0;

    while (currentTime < endTime) {
      if (!this.isWorkingHours(currentTime)) {
        currentTime = new Date(currentTime.getTime() + 60000);
        continue;
      }

      // Skip lunch break
      if (this.isLunchTime(currentTime)) {
        const lunchSlot: ScheduleSlot = {
          start: new Date(currentTime),
          end: new Date(currentTime.getTime() + this.lunchDuration * 60000),
          isFocusTime: false,
          isBreak: true
        };
        slots.push(lunchSlot);
        currentTime = new Date(currentTime.getTime() + this.lunchDuration * 60000);
        focusSessionCount = 0;
        consecutiveWorkTime = 0;
        continue;
      }

      // Add dynamic break if consecutive work time exceeds threshold
      if (consecutiveWorkTime >= 90) { // 90 minutes max consecutive work
        const breakTime = Math.min(this.breakDuration, 
          Math.floor(consecutiveWorkTime / 90) * this.breakDuration);
        
        slots.push({
          start: new Date(currentTime),
          end: new Date(currentTime.getTime() + breakTime * 60000),
          isFocusTime: false,
          isBreak: true
        });

        currentTime = new Date(currentTime.getTime() + breakTime * 60000);
        consecutiveWorkTime = 0;
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
          isBreak: false,
          context: lastContextId
        });
        currentTime = new Date(currentTime.getTime() + this.pomodoroDuration * 60000);
        focusSessionCount++;
        consecutiveWorkTime += this.pomodoroDuration;
      } else {
        slots.push({
          start: new Date(currentTime),
          end: new Date(currentTime.getTime() + breakDuration * 60000),
          isFocusTime: false,
          isBreak: true
        });
        currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
        focusSessionCount = 0;
        consecutiveWorkTime = 0;
      }
    }

    return slots;
  }

  private buildDependencyGraph(tasks: ScheduleTask[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    
    // Initialize graph
    tasks.forEach(task => {
      graph.set(task.id, new Set<string>());
    });

    // Add dependencies
    tasks.forEach(task => {
      task.dependsOn.forEach(dependencyId => {
        const dependencies = graph.get(task.id);
        if (dependencies) {
          dependencies.add(dependencyId);
        }
      });
    });

    return graph;
  }

  private topologicalSort(tasks: ScheduleTask[]): ScheduleTask[] {
    const graph = this.buildDependencyGraph(tasks);
    const visited = new Set<string>();
    const sorted: ScheduleTask[] = [];
    const temp = new Set<string>();

    function visit(taskId: string): boolean {
      if (temp.has(taskId)) {
        throw new Error("Circular dependency detected");
      }
      if (visited.has(taskId)) return false;

      temp.add(taskId);
      const dependencies = graph.get(taskId) || new Set();
      dependencies.forEach(depId => visit(depId));
      temp.delete(taskId);

      visited.add(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) sorted.push(task);
      return true;
    }

    try {
      tasks.forEach(task => {
        if (!visited.has(task.id)) {
          visit(task.id);
        }
      });
      return sorted.reverse();
    } catch (error) {
      console.error("Error in topological sort:", error);
      return tasks;
    }
  }

  private prioritizeTasks(tasks: ScheduleTask[]): ScheduleTask[] {
    // First handle dependencies through topological sort
    const sortedTasks = this.topologicalSort(tasks);

    // Then sort by priority within dependency constraints
    return sortedTasks.sort((a, b) => {
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
    // Fetch unscheduled tasks with their contexts and dependencies
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
        },
        dependsOn: {
          select: {
            blockerTaskId: true
          }
        },
        blocks: {
          select: {
            dependentTaskId: true
          }
        }
      }
    });

    // Transform tasks to include dependency information
    const transformedTasks: ScheduleTask[] = tasks.map(task => ({
      ...task,
      dependsOn: task.dependsOn.map(d => d.blockerTaskId),
      blocks: task.blocks.map(b => b.dependentTaskId)
    }));

    const slots = await this.getAvailableSlots(date);
    const prioritizedTasks = this.prioritizeTasks(transformedTasks);
    const scheduledTasks: {
      taskId: string;
      plannedDate: Date;
      estimated: number;
    }[] = [];

    let currentContextId: string | undefined;

    for (const task of prioritizedTasks) {
      // Find appropriate slot for task
      const taskDuration = task.estimated || 30; // Default to 30 minutes
      const requiresFocus = task.requiresFocus;

      let bestSlot: ScheduleSlot | null = null;
      let bestScore = -Infinity;

      for (const slot of slots) {
        // Skip if slot is already fully used
        if (slot.start >= slot.end) continue;

        // Skip if slot duration doesn't match task requirements
        const slotDuration = (slot.end.getTime() - slot.start.getTime()) / 60000;
        if (slotDuration < taskDuration) continue;

        // Skip if focus requirements don't match
        if (requiresFocus && !slot.isFocusTime) continue;

        // Skip if slot is a break
        if (slot.isBreak) continue;

        // Skip if no matching context is available
        const availableContexts = task.contexts.filter(
          context => this.isContextAvailable(context, slot.start)
        );
        if (task.contexts.length > 0 && availableContexts.length === 0) continue;

        // Calculate slot score based on various factors
        let score = 0;

        // Prefer slots that maintain the same context
        const matchingContext = availableContexts.find(c => c.id === currentContextId);
        if (matchingContext) {
          score += 10; // High bonus for context continuity
        }

        // Penalize context switches
        if (!matchingContext && currentContextId) {
          score -= this.contextSwitchPenalty;
        }

        // Prefer earlier slots for higher priority tasks
        const hoursSinceStart = (slot.start.getTime() - date.getTime()) / (1000 * 60 * 60);
        score -= hoursSinceStart * (task.priority === PriorityLevel.URGENT ? 2 : 1);

        if (score > bestScore) {
          bestScore = score;
          bestSlot = slot;
        }
      }

      if (bestSlot) {
        // Schedule task in best slot
        scheduledTasks.push({
          taskId: task.id,
          plannedDate: new Date(bestSlot.start),
          estimated: taskDuration
        });

        // Update context tracking
        if (task.contexts.length > 0) {
          currentContextId = task.contexts[0].id;
          bestSlot.context = currentContextId;
        }

        // Mark slot as used by adjusting its start time
        bestSlot.start = new Date(bestSlot.start.getTime() + taskDuration * 60000);
      }
    }

    return scheduledTasks;
  }
}