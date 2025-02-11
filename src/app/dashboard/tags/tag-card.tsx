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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2 } from "lucide-react";

interface TagCardProps {
  tag: TagSummary;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function TagCard({ tag, isSelected = false, onSelect }: TagCardProps) {
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
    if (window.confirm("Are you sure you want to delete this tag?")) {
      await deleteTag(tag.id);
      removeTag(tag.id);
      router.refresh();
    }
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <Card
      className={`group relative transition-shadow hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {onSelect && (
        <div className="absolute left-2 top-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect()}
            aria-label={`Select ${tag.name} tag`}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 pl-8">
          <div
            className="h-6 w-6 rounded-full transition-transform group-hover:scale-110"
            style={{ backgroundColor: tag.color }}
          ></div>
          <span className="flex-1">
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Tag name"
                autoFocus
              />
            ) : (
              <span className="inline-block w-full truncate">{tag.name}</span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="mb-2 space-y-2">
            <label className="text-sm text-muted-foreground">Tag Color</label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-16"
              />
              <span className="text-sm text-muted-foreground">
                Click to change color
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        {isEditing ? (
          <>
            <Button onClick={handleUpdate} size="sm">
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              size="sm"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
              title="Edit tag"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Delete tag"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
