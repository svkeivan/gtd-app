"use client";

import { useAppStore } from "@/lib/store";
import { Item } from "@prisma/client";
import { useEffect, useState } from "react";
import { ItemCard } from "./item-card";

export function InboxList({ initialItems }: { initialItems: Item[] }) {
  const { items, setItems } = useAppStore();
  const [status, setStatus] = useState<string>("INBOX");
  const [search, setSearch] = useState<string>("");
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const statusValues = ["all", ...new Set(items.map((item) => item.status))];

  const filteredItems = items.filter((item) => {
    if (status === "all") return item.title.toLowerCase().includes(search.toLowerCase());
    return item.status === status && item.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Inbox Items</h2>
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-sm text-secondary-foreground">
            {items.length} items
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <span className="text-sm text-muted-foreground">
            Filter by status:
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {statusValues.map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {statusValue === "all"
                  ? "All Items"
                  : statusValue.charAt(0).toUpperCase() +
                    statusValue.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
