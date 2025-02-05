export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  category: string | null;
  note: string | null;
  itemId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimeEntryData {
  startTime: Date;
  endTime: Date;
  category: string;
  note?: string | null;
  itemId?: string;
}

export interface TimeEntryReport {
  entries: TimeEntry[];
  categoryStats: Record<string, number>;
  totalMinutes: number;
}

export interface TimeBlock {
  startTime: Date;
  endTime: Date;
  entries: TimeEntry[];
}