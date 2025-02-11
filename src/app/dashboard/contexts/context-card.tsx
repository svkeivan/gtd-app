"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { deleteContext, updateContext } from "@/actions/contexts";
import { Item } from "@prisma/client";
import { Edit2, Trash2, Layers, Clock } from "lucide-react";

interface Context {
  id: string;
  name: string;
  description?: string | null;
  items?: Item[];
  mondayEnabled: boolean;
  tuesdayEnabled: boolean;
  wednesdayEnabled: boolean;
  thursdayEnabled: boolean;
  fridayEnabled: boolean;
  saturdayEnabled: boolean;
  sundayEnabled: boolean;
  startTime: string;
  endTime: string;
}

export function ContextCard({ context }: { context: Context }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(context.name);
  const [description, setDescription] = useState(context.description || "");
  const [schedule, setSchedule] = useState({
    mondayEnabled: context.mondayEnabled,
    tuesdayEnabled: context.tuesdayEnabled,
    wednesdayEnabled: context.wednesdayEnabled,
    thursdayEnabled: context.thursdayEnabled,
    fridayEnabled: context.fridayEnabled,
    saturdayEnabled: context.saturdayEnabled,
    sundayEnabled: context.sundayEnabled,
    startTime: context.startTime,
    endTime: context.endTime,
  });
  const router = useRouter();
  const { updateContext: updateContextInStore, removeContext } = useAppStore();

  const handleUpdate = async () => {
    const updatedContext = await updateContext(context.id, {
      name,
      description,
      ...schedule,
    });
    updateContextInStore(updatedContext);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteContext(context.id);
    removeContext(context.id);
    router.refresh();
  };

  const itemCount = context.items?.length || 0;

  const days = [
    { id: "monday", label: "Monday", key: "mondayEnabled" as const },
    { id: "tuesday", label: "Tuesday", key: "tuesdayEnabled" as const },
    { id: "wednesday", label: "Wednesday", key: "wednesdayEnabled" as const },
    { id: "thursday", label: "Thursday", key: "thursdayEnabled" as const },
    { id: "friday", label: "Friday", key: "fridayEnabled" as const },
    { id: "saturday", label: "Saturday", key: "saturdayEnabled" as const },
    { id: "sunday", label: "Sunday", key: "sundayEnabled" as const },
  ];

  const getActiveDays = () => {
    return days
      .filter(({ key }) => context[key])
      .map(({ label }) => label)
      .join(", ");
  };

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Context name"
              />
            ) : (
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-muted-foreground" />
                {context.name}
              </CardTitle>
            )}
          </div>
          <Badge variant="secondary" className="bg-blue-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when and how to use this context"
              className="mt-2"
            />
            <div className="space-y-4">
              <Label>Weekly Schedule</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {days.map(({ id, label, key }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${id}`}
                      checked={schedule[key]}
                      onCheckedChange={(checked) =>
                        setSchedule((prev) => ({ ...prev, [key]: checked === true }))
                      }
                    />
                    <Label htmlFor={`edit-${id}`} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-time">Start Time</Label>
                  <Input
                    id="edit-start-time"
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-time">End Time</Label>
                  <Input
                    id="edit-end-time"
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {context.description && (
              <p className="text-sm text-gray-600">{context.description}</p>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {getActiveDays() || "No days"} • {context.startTime} - {context.endTime}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Task Distribution</span>
                </div>
                <Progress 
                  value={itemCount > 0 ? 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate} variant="default">
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
