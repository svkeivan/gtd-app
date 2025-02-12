"use client";

import { useState } from "react";
import { createHabit } from "@/actions/habits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

export const HabitForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createHabit(name, description);
      if (result?.message) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setName("");
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Label htmlFor="name">Habit Name</Label>
      <Input
        type="text"
        id="name"
        name="name"
        placeholder="Habit name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Label htmlFor="description">Habit Description</Label>
      <Textarea
        id="description"
        name="description"
        placeholder="Habit description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Habit"}
      </Button>
    </form>
  );
};
