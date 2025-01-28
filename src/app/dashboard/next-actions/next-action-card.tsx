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
    <Card className="group relative transition-shadow duration-200 hover:shadow-md">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-30 active:cursor-grabbing group-hover:opacity-100">
        <GripVertical className="h-5 w-5" />
      </div>
      <CardHeader className="pl-10">
        <CardTitle className="flex items-center gap-3">
          <Checkbox
            checked={isCompleting}
            onCheckedChange={handleComplete}
            disabled={isCompleting}
            className="h-5 w-5"
          />
          <span className={isCompleting ? "text-gray-400 line-through" : ""}>
            {action.title}
          </span>
          {action.dueDate && (
            <Badge
              variant="secondary"
              className="ml-auto flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" />
              {new Date(action.dueDate).toLocaleDateString()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-10">
        {action.notes && (
          <p className="mb-3 text-sm text-gray-600">{action.notes}</p>
        )}
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
          {action.priority !== undefined && (
            <Badge
              variant={
                action.priority < 3
                  ? "destructive"
                  : action.priority < 6
                    ? "default"
                    : "secondary"
              }
              className="ml-auto"
            >
              Priority {action.priority + 1}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end pl-10">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.push(`/process?id=${action.id}`)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
