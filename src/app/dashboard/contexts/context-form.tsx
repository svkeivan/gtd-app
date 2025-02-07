"use client";

import { createContext } from "@/actions/contexts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Layers } from "lucide-react";

export function ContextForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState({
    mondayEnabled: false,
    tuesdayEnabled: false,
    wednesdayEnabled: false,
    thursdayEnabled: false,
    fridayEnabled: false,
    saturdayEnabled: false,
    sundayEnabled: false,
    startTime: "09:00",
    endTime: "17:00",
  });
  const router = useRouter();
  const addContext = useAppStore((state) => state.addContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newContext = await createContext({
      name,
      description,
      userId,
      ...schedule,
    });
    addContext({ ...newContext, items: [] });
    setName("");
    setDescription("");
    setSchedule({
      mondayEnabled: false,
      tuesdayEnabled: false,
      wednesdayEnabled: false,
      thursdayEnabled: false,
      fridayEnabled: false,
      saturdayEnabled: false,
      sundayEnabled: false,
      startTime: "09:00",
      endTime: "17:00",
    });
    router.refresh();
  };

  const days = [
    { id: "monday", label: "Monday", key: "mondayEnabled" as const },
    { id: "tuesday", label: "Tuesday", key: "tuesdayEnabled" as const },
    { id: "wednesday", label: "Wednesday", key: "wednesdayEnabled" as const },
    { id: "thursday", label: "Thursday", key: "thursdayEnabled" as const },
    { id: "friday", label: "Friday", key: "fridayEnabled" as const },
    { id: "saturday", label: "Saturday", key: "saturdayEnabled" as const },
    { id: "sunday", label: "Sunday", key: "sundayEnabled" as const },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Create New Context</CardTitle>
            <CardDescription>
              Contexts help organize tasks based on location, tools, or conditions needed to complete them
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context-name">Name</Label>
            <Input
              id="context-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home, Office, Phone, Computer"
              required
            />
            <p className="text-sm text-muted-foreground">
              Choose a name that clearly identifies where or when tasks can be done
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="context-description">Description</Label>
            <Textarea
              id="context-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Tasks that require being at home with access to household tools"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Add details about when this context applies and what resources are needed
            </p>
          </div>
          <div className="space-y-4">
            <Label>Weekly Schedule</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {days.map(({ id, label, key }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    checked={schedule[key]}
                    onCheckedChange={(checked) =>
                      setSchedule((prev) => ({ ...prev, [key]: checked === true }))
                    }
                  />
                  <Label htmlFor={id} className="text-sm font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create Context
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
