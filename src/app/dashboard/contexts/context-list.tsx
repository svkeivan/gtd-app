"use client";

import { useAppStore } from "@/lib/store";
import { ContextListWithItem } from "@/types/project-types";
import { useEffect } from "react";
import { ContextCard } from "./context-card";

export function ContextList({
  initialContexts,
}: {
  initialContexts: ContextListWithItem[];
}) {
  const { contexts, setContexts } = useAppStore();

  useEffect(() => {
    setContexts(initialContexts);
  }, [initialContexts, setContexts]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {contexts.map((context) => (
        <ContextCard key={context.id} context={context} />
      ))}
    </div>
  );
}
