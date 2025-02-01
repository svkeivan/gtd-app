"use client";

import { createContext } from "@/actions/contexts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Layers } from "lucide-react";

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
          <Button type="submit" className="w-full">
            Create Context
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
