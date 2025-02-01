import { Context, Item, Project, Tag } from "@prisma/client";

export type ProjectSummary = Pick<Project, "id" | "title">;
export type ContextSummary = Pick<Context, "id" | "name">;
export type TagSummary = Pick<Tag, "id" | "name" | "color">;

export interface NextActionItem extends Item {
  project?: ProjectSummary | null | undefined;
  contexts?: ContextSummary[];
}

export interface ContextListWithItem extends Context {
  items?: Item[];
}
