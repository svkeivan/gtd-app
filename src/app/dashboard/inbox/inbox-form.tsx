"use client";

import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PriorityLevel } from "@prisma/client";
import { cn } from "@/lib/utils";
import emitter from "@/lib/events";

interface InboxFormProps {
  projectId?: string;
  onSuccess?: () => void;
}

export function InboxForm({ projectId, onSuccess }: InboxFormProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [estimated, setEstimated] = useState<number>(30);
  const [requiresFocus, setRequiresFocus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const addItem = useAppStore((state) => state.addItem);

  const handleEstimatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input for better user experience while typing
    if (value === '') {
      setEstimated(0);
      return;
    }
    const numValue = Number(value);
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setEstimated(numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    // Validate estimated time before submission
    const clampedEstimate = Math.min(Math.max(estimated, 5), 480);
    if (estimated !== clampedEstimate) {
      setEstimated(clampedEstimate);
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem = await createItem({ 
        title, 
        notes, 
        projectId,
        priority,
        estimated,
        requiresFocus
      });
      addItem(newItem);
      setTitle("");
      setNotes("");
      setPriority("MEDIUM");
      setEstimated(30);
      setRequiresFocus(false);
      if (newItem?.projectId) {
        emitter.emit('newTask', { projectId: newItem.projectId });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select 
                value={priority} 
                onValueChange={(value: PriorityLevel) => setPriority(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-slate-400")} />
                    Low
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-blue-500")} />
                    Medium
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-yellow-500")} />
                    High
                  </SelectItem>
                  <SelectItem value="URGENT">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-red-500")} />
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated">Estimated Time (minutes)</Label>
              <Input
                id="estimated"
                type="number"
                min={5}
                max={480}
                value={estimated}
                onChange={handleEstimatedChange}
                className="h-10"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Between 5 and 480 minutes (8 hours)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="focus-mode"
              checked={requiresFocus}
              onCheckedChange={setRequiresFocus}
              disabled={isSubmitting}
            />
            <Label htmlFor="focus-mode" className="cursor-pointer">
              Requires Focus Mode
              <p className="text-xs text-muted-foreground">
                Enable for tasks that need concentrated attention
              </p>
            </Label>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Adding...
                </div>
              ) : (
                "Capture"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
