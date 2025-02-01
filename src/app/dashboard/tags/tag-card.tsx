"use client";

import { deleteTag, updateTag } from "@/actions/tags";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { TagSummary } from "@/types/project-types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TagCard({ tag }: { tag: TagSummary }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const router = useRouter();
  const { updateTag: updateTagInStore, removeTag } = useAppStore();

  const handleUpdate = async () => {
    const updatedTag = await updateTag(tag.id, { name, color });
    updateTagInStore(updatedTag);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteTag(tag.id);
    removeTag(tag.id);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: tag.color }}
          ></div>
          <span>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            ) : (
              tag.name
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="mb-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
