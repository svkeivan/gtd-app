import { FocusTimer } from "../components/timer/focus-timer";
import { TimerSettings } from "../components/timer/timer-settings";

export default function FocusPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-muted-foreground">
          Manage your work sessions and breaks to stay productive
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col space-y-4">
          <FocusTimer />
        </div>
        <div>
          <TimerSettings />
        </div>
      </div>
    </div>
  );
}