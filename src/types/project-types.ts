import { Context, Item, Project } from "@prisma/client";

export type ProjectSummary = Pick<Project, "id" | "title">;
export type ContextSummary = Pick<Context, "id" | "name">;

export interface NextActionItem extends Item {
  project?: ProjectSummary | null;
  contexts?: ContextSummary[];
}
