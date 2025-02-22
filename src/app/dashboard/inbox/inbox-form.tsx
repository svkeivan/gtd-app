"use client";
import { inboxTr } from "@/lib/translations/inbox";

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

export function InboxForm({ projectId }: { projectId?: string }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [estimated, setEstimated] = useState<number>(30);
  const [requiresFocus, setRequiresFocus] = useState(false);
  const router = useRouter();
  const addItem = useAppStore((state) => state.addItem);

  const handleEstimatedChange = (value: number) => {
    // Clamp value between 5 and 480 minutes
    setEstimated(Math.min(Math.max(value, 5), 480));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="mb-4 text-lg font-semibold">{inboxTr['AddNewItem'] || 'Add New Item'}</h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={inboxTr['WhatsOnYourMind'] || "What's on your mind? (e.g., 'Call dentist', 'Buy groceries')"}
              required
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={inboxTr['AddAdditionalDetails'] || "Add any additional details, context, or thoughts... (optional)"}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{inboxTr['PriorityLevel'] || "Priority Level"}</Label>
              <Select value={priority} onValueChange={(value: PriorityLevel) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={inboxTr['SelectPriority'] || "Select priority"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-slate-400")} />
                    {inboxTr['Low'] || "Low"}
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-blue-500")} />
                    {inboxTr['Medium'] || "Medium"}
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-yellow-500")} />
                    {inboxTr['High'] || "High"}
                  </SelectItem>
                  <SelectItem value="URGENT">
                    <span className={cn("inline-block w-2 h-2 rounded-full mr-2 bg-red-500")} />
                    {inboxTr['Urgent'] || "Urgent"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated">{inboxTr['EstimatedTimeMinutes'] || "Estimated Time (minutes)"}</Label>
              <Input
                id="estimated"
                type="number"
                min={5}
                max={480}
                value={estimated}
                onChange={(e) => handleEstimatedChange(Number(e.target.value))}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">{inboxTr['Between5And480Minutes'] || "Between 5 and 480 minutes (8 hours)"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="focus-mode"
              checked={requiresFocus}
              onCheckedChange={setRequiresFocus}
            />
            <Label htmlFor="focus-mode" className="cursor-pointer">
                          {inboxTr['RequiresFocusMode'] || "Requires Focus Mode"}
                          <p className="text-xs text-muted-foreground">
                            {inboxTr['EnableForTasksThatNeedConcentratedAttention'] || "Enable for tasks that need concentrated attention"}
                          </p>
                        </Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="px-8">
                          {inboxTr['Capture'] || "Capture"}
                        </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
