"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Item, Project } from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import Link from "next/link";

interface ItemWithProject extends Item {
  project?: Project;
}
export function ItemCard({ item }: { item: ItemWithProject }) {
  const { id, title, notes, createdAt, updatedAt, projectId, project } = item;
  return (
    <Link href={`/process?id=${id}`}>
      <Card className="mb-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-md">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {notes}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <span className="mr-1">📅</span>
              Created: {format(new Date(createdAt), "PPpp")} (
              {differenceInDays(new Date(), new Date(createdAt))} days ago)
            </span>
            <span className="flex items-center">
              <span className="mr-1">🔄</span>
              Updated: {format(new Date(updatedAt), "PP")}
            </span>
            {projectId && (
              <span className="flex items-center">
                <span className="mr-1">📁</span>
                Project: {project?.title}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
