"use client";

import { updateItemStatus } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/store";
import { Context } from "@prisma/client";
import { Calendar, GripVertical, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NextAction } from "@/lib/store";

interface NextActionCardProps {
  action: NextAction;
}
export function NextActionCard({ action }: NextActionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const { removeNextAction } = useAppStore();

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await updateItemStatus(action.id, "COMPLETED");
      removeNextAction(action.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to complete action:", error);
    }
    setIsCompleting(false);
  };

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="cursor-grab opacity-30 active:cursor-grabbing group-hover:opacity-100">
              <GripVertical className="h-5 w-5" />
            </div>
            <Checkbox
              checked={isCompleting}
              onCheckedChange={handleComplete}
              disabled={isCompleting}
              className="h-5 w-5"
            />
            <CardTitle className={`text-lg ${isCompleting ? "text-gray-400 line-through" : ""}`}>
              {action.title}
            </CardTitle>
          </div>
          {action.priority !== undefined && (
            <Badge
              variant={
                action.priority < 3
                  ? "destructive"
                  : action.priority < 6
                    ? "default"
                    : "secondary"
              }
            >
              Priority {action.priority + 1}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {action.notes && (
          <p className="text-sm text-gray-600">{action.notes}</p>
        )}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {action.project && (
              <Badge variant="secondary" className="font-medium">
                {action.project.title}
              </Badge>
            )}
            {action?.contexts?.map((context: Context) => (
              <Badge key={context.id} variant="outline" className="font-medium">
                {context.name}
              </Badge>
            ))}
          </div>
          {action.dueDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(action.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/process?id=${action.id}`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
