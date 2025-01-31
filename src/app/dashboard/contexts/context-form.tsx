"use client";

import { createContext } from "@/actions/contexts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContextForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const addContext = useAppStore((state) => state.addContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newContext = await createContext({ name, description, userId });
    addContext({ ...newContext, items: [] });
    setName("");
    setDescription("");
    router.refresh();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New Context</CardTitle>
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
              placeholder="Enter a new context name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context-description">Description</Label>
            <Textarea
              id="context-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when and how to use this context"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Context
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
