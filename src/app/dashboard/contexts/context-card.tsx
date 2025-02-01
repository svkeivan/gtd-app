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
import { useAppStore } from "@/lib/store";
import { deleteContext, updateContext } from "@/actions/contexts";
import { Item } from "@prisma/client";
import { Edit2, Trash2, Layers } from "lucide-react";

interface Context {
  id: string;
  name: string;
  description?: string | null;
  items?: Item[];
}

export function ContextCard({ context }: { context: Context }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(context.name);
  const [description, setDescription] = useState(context.description || "");
  const router = useRouter();
  const { updateContext: updateContextInStore, removeContext } = useAppStore();

  const handleUpdate = async () => {
    const updatedContext = await updateContext(context.id, { name, description });
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
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe when and how to use this context"
            className="mt-2"
          />
        ) : (
          <>
            {context.description && (
              <p className="text-sm text-gray-600">{context.description}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Task Distribution</span>
              </div>
              <Progress 
                value={itemCount > 0 ? 100 : 0} 
                className="h-2"
              />
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
