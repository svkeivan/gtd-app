"use client";

import { useState } from "react";
import { HabitList } from "./habit-list";
import { HabitForm } from "./habit-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Suspense } from "react";

function LoadingCard() {
  return (
    <div className="p-4">
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Track and manage your daily habits
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Habit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track your progress.
              </DialogDescription>
            </DialogHeader>
            <HabitForm />
            <DialogFooter>
              <Button type="submit" form="habit-form">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="habits" className="space-y-4">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="habits">Habits List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="space-y-4">
          <Suspense fallback={<LoadingCard />}>
            <HabitList />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<LoadingCard />}>
            <div className="p-4">
              <p className="text-muted-foreground">Analytics coming soon!</p>
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
