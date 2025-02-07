import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimerStore } from "./timer-state";
import { Card } from "@/components/ui/card";

interface TimerSettingsProps {
  className?: string;
}

export function TimerSettings({ className }: TimerSettingsProps) {
  const {
    focusLength,
    shortBreakLength,
    longBreakLength,
    setFocusLength,
    setShortBreakLength,
    setLongBreakLength,
  } = useTimerStore();

  const handleInputChange = (
    value: string,
    setter: (minutes: number) => void
  ) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0) {
      setter(minutes);
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="focusLength">Focus Duration (minutes)</Label>
            <Input
              id="focusLength"
              type="number"
              min="1"
              value={focusLength}
              onChange={(e) => handleInputChange(e.target.value, setFocusLength)}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortBreakLength">Short Break Duration (minutes)</Label>
            <Input
              id="shortBreakLength"
              type="number"
              min="1"
              value={shortBreakLength}
              onChange={(e) => handleInputChange(e.target.value, setShortBreakLength)}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="longBreakLength">Long Break Duration (minutes)</Label>
            <Input
              id="longBreakLength"
              type="number"
              min="1"
              value={longBreakLength}
              onChange={(e) => handleInputChange(e.target.value, setLongBreakLength)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}