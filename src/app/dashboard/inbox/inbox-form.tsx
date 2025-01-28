"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createItem } from "../../actions/items";

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
    <form onSubmit={handleSubmit} className="mb-8 space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Task Title
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a new task"
          required
          className="w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notes
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes (optional)"
          rows={3}
          className="w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Add New Task
      </Button>
    </form>
  );
}
