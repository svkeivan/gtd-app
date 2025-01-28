import { Context, Project } from "@prisma/client";

export type ProjectSummary = Pick<Project, "id" | "title">;
export type ContextSummary = Pick<Context, "id" | "name">;
