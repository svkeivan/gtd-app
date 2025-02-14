import { Context, Item, Project, Tag, ItemStatus, PriorityLevel } from "@prisma/client";

export type ProjectSummary = Pick<Project, "id" | "title">;
export type ContextSummary = Pick<Context, "id" | "name">;
export type TagSummary = Pick<Tag, "id" | "name" | "color">;

export interface NextActionItem extends Item {
  project?: ProjectSummary | null | undefined;
  contexts?: ContextSummary[];
}

export interface ContextListItem {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  priority: PriorityLevel;
  title: string;
  notes: string | null;
  status: ItemStatus;
  dueDate: Date | null;
  plannedDate: Date | null;
  estimated: number | null;
  requiresFocus: boolean;
  projectId: string | null;
}

export interface ContextListWithItem extends Context {
  items: ContextListItem[];
}
