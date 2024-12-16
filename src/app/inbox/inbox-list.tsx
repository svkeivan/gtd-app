"use client";

import { useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function InboxList({ initialItems }: { initialItems: any[] }) {
  const { items, setItems } = useAppStore();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  return (
    <div className='space-y-4'>
      {items.map((item) => (
        <Link
          href={`/process?id=${item.id}`}
          key={item.id}
        >
          <Card className='cursor-pointer hover:bg-gray-100 transition-colors'>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{item.notes}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
