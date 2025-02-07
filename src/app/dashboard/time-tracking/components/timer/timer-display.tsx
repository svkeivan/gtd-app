import { cn } from "@/lib/utils";
import { TimerMode } from "./timer-state";

interface TimerDisplayProps {
  timeRemaining: number;
  mode: TimerMode;
  className?: string;
}

export function TimerDisplay({ timeRemaining, mode, className }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const modeColors = {
    focus: 'text-green-600 dark:text-green-400',
    shortBreak: 'text-blue-600 dark:text-blue-400',
    longBreak: 'text-purple-600 dark:text-purple-400'
  };
  
  const modeLabels = {
    focus: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <div className="text-4xl font-bold tracking-tighter">
        {formattedTime}
      </div>
      <div className={cn("text-sm font-medium", modeColors[mode])}>
        {modeLabels[mode]}
      </div>
    </div>
  );
}