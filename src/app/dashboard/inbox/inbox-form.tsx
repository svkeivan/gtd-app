"use client";

import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InboxForm({ projectId }: { projectId?: string }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const router = useRouter();
  const addItem = useAppStore((state) => state.addItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = await createItem({ title, notes, projectId });
    addItem(newItem);
    setTitle("");
    setNotes("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Add New Item</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind? (e.g., 'Call dentist', 'Buy groceries')"
              required
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details, context, or thoughts... (optional)"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="px-8">
              Capture
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
