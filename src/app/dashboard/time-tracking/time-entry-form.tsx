"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createTimeEntry, getNextActionItems } from "@/actions/time-entries";
import { toast } from "sonner";
import { CreateTimeEntryData } from "@/types/time-entry-types";

type NextActionItem = {
  id: string;
  title: string;
};

const CATEGORIES = [
  "Work",
  "Meeting",
  "Learning",
  "Exercise",
  "Personal",
  "Break",
  "Other"
] as const;

type Category = typeof CATEGORIES[number];

export function TimeEntryForm() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [note, setNote] = useState("");
  const [itemId, setItemId] = useState<string>("");
  const [nextActionItems, setNextActionItems] = useState<NextActionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadNextActionItems = async () => {
      try {
        const items = await getNextActionItems();
        setNextActionItems(items);
      } catch (error) {
        console.error("Error loading next action items:", error);
        toast.error("Failed to load next action items");
      }
    };

    loadNextActionItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      setIsSubmitting(true);
      const timeEntryData: CreateTimeEntryData = {
        startTime: start,
        endTime: end,
        category,
        note: note || undefined,
        itemId: itemId || undefined,
      };

      await createTimeEntry(timeEntryData);
      toast.success("Time entry saved successfully");
      
      // Reset form
      setStartTime("");
      setEndTime("");
      setCategory("");
      setItemId("");
      setNote("");
    } catch (error) {
      console.error("Error saving time entry:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save time entry";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Log Time Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item">Next Action Item (Optional)</Label>
          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an item to track time for" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {nextActionItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Notes</Label>
          <Textarea
            id="note"
            placeholder="What did you work on?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-20"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Entry"}
        </Button>
      </form>
    </Card>
  );
}