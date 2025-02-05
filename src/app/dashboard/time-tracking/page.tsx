"use client";

import { useState } from "react";
import { TimelineView } from "./timeline-view";
import { TimeEntryDialog } from "./time-entry-dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnalyticsView } from "./analytics-view";
import { Suspense } from "react";



function LoadingCard() {
  return (
    <Card className="p-4">
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </Card>
  );
}

export default function TimeTrackingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Log and analyze your daily activities in 30-minute blocks
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Log New Activity</Button>
      </div>
      
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4">
          <Suspense fallback={<LoadingCard />}>
            <TimelineView />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<LoadingCard />}>
            <AnalyticsView />
          </Suspense>
        </TabsContent>
      </Tabs>

      <TimeEntryDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={new Date()}
        defaultStartTime={new Date()}
      />
    </div>
  );
}