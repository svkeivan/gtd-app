"use client";
import { inboxTr } from "@/lib/translations/inbox";

import { useAppStore } from "@/lib/store";
import { getContexts } from "@/actions/contexts";
import { getProjects } from "@/actions/projects";
import { useEffect, useState } from "react";
import { ItemCard } from "./item-card";

import { Context, Item, ItemStatus, Project } from "@prisma/client";

export function InboxList({ initialItems }: { initialItems: Item[] }) {
  const { items, setItems } = useAppStore();
  const [status, setStatus] = useState<"all" | ItemStatus>("INBOX");
  const [search, setSearch] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, contextsData] = await Promise.all([
          getProjects(),
          getContexts(),
        ]);

        setProjects(projectsData);
        setContexts(contextsData);
      } catch (error) {
        console.error("Failed to load projects and contexts:", error);
      }
    };

    loadData();
  }, []);

  const statusValues = ["all", ...new Set(items.map((item) => item.status))] as const;

  const handleStatusChange = (value: string) => {
    setStatus(value as "all" | ItemStatus);
  };

  const getStatusTranslation = (value: string) => {
    if (value === "all") return inboxTr['AllItems'];
    return inboxTr.Status[value as ItemStatus] || value;
  };

  const filteredItems = items.filter((item) => {
    if (status === "all") return item.title.toLowerCase().includes(search.toLowerCase());
    return item.status === status && item.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{inboxTr['InboxItems'] || "Inbox Items"}</h2>
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-sm text-secondary-foreground">
            {items.length} {inboxTr['Items'] || "items"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={inboxTr['SearchItems'] || "Search items..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <span className="text-sm text-muted-foreground">
            {inboxTr['FilterByStatus'] || "Filter by status:"}
          </span>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {statusValues.map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {statusValue === "all"
                  ? inboxTr['AllItems'] || "All Items"
                  : inboxTr.Status?.[statusValue] || statusValue}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            projects={projects}
            contexts={contexts}
          />
        ))}
      </div>
    </div>
  );
}
