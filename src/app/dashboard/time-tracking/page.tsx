import { Metadata } from "next";
import { TimelineView } from "./timeline-view";
import { TimeEntryForm } from "./time-entry-form";

export const metadata: Metadata = {
  title: "Time Tracking - GTD App",
  description: "Track and analyze your time usage in 30-minute blocks",
};

export default function TimeTrackingPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimelineView />
        </div>
        <div>
          <TimeEntryForm />
        </div>
      </div>
    </div>
  );
}