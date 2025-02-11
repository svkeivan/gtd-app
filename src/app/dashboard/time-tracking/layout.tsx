import { Toaster } from "sonner";
import { TimeTrackingNav } from "./components/time-tracking-nav";

export default function TimeTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Time Tracking</h1>
        <TimeTrackingNav />
      </div>
      {children}
      <Toaster position="top-right" />
    </div>
  );
}