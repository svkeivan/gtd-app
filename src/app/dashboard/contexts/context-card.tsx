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
import { useAppStore } from "@/lib/store";
import { deleteContext, updateContext } from "@/actions/contexts";
import { Item } from "@prisma/client";

interface Context {
  id: string;
  name: string;
  items?: Item[]; // Replace 'any' with the specific type if known
}

export function ContextCard({ context }: { context: Context }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(context.name);
  const router = useRouter();
  const { updateContext: updateContextInStore, removeContext } = useAppStore();

  const handleUpdate = async () => {
    const updatedContext = await updateContext(context.id, { name });
    updateContextInStore(updatedContext);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteContext(context.id);
    removeContext(context.id);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1'
            />
          ) : (
            context.name
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Items: {context.items?.length || 0}</p>
      </CardContent>
      <CardFooter className='justify-end space-x-2'>
        {isEditing ? (
          <>
            <Button onClick={handleUpdate}>Save</Button>
            <Button
              variant='outline'
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
