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
import { Context, Item, Project } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface nextActionProps extends Item {
  project?: Project;
  contexts?: Context[];
}
export function NextActionCard({ action }: { action: nextActionProps }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Checkbox
            checked={isCompleting}
            onCheckedChange={handleComplete}
            disabled={isCompleting}
          />
          <span>{action.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {action.notes && (
          <p className="mb-2 text-sm text-gray-600">{action.notes}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {action.project && (
            <Badge variant="secondary">Project: {action.project.title}</Badge>
          )}
          {action?.contexts?.map((context: Context) => (
            <Badge key={context.id} variant="outline">
              {context.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          variant="ghost"
          onClick={() => router.push(`/process?id=${action.id}`)}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
