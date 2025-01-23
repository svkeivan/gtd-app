"use client";

import { useAppStore } from "@/lib/store";
import { Item } from "@prisma/client";
import { useEffect, useState } from "react";
import { ItemCard } from "./item-card";

export function InboxList({ initialItems }: { initialItems: Item[] }) {
  const { items, setItems } = useAppStore();
  const [status, setStatus] = useState<string>("all");
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  const statusValues = ["all", ...new Set(items.map((item) => item.status))];

  const filteredItems = items.filter((item) => {
    if (status === "all") return true;
    return item.status === status;
  });

  return (
    <div>
      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border p-2"
        >
          {statusValues.map((statusValue) => (
            <option key={statusValue} value={statusValue}>
              {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
