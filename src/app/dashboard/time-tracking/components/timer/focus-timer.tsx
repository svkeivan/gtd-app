import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { useTimerStore } from "./timer-state";
import { cn } from "@/lib/utils";

interface FocusTimerProps {
  className?: string;
}

export function FocusTimer({ className }: FocusTimerProps) {
  const {
    timeRemaining,
    isActive,
    mode,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    tick,
    adjustTime,
    sessionsCompleted
  } = useTimerStore();

  // Handle timer ticks
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, tick]);

  // Handle visibility change to prevent timer drift
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        pauseTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, pauseTimer]);

  const modeBackgrounds = {
    focus: 'bg-green-50 dark:bg-green-950/30',
    shortBreak: 'bg-blue-50 dark:bg-blue-950/30',
    longBreak: 'bg-purple-50 dark:bg-purple-950/30'
  };

  return (
    <Card className={cn("p-6", modeBackgrounds[mode], className)}>
      <div className="flex flex-col items-center space-y-6">
        <TimerDisplay
          timeRemaining={timeRemaining}
          mode={mode}
          className="mb-2"
        />
        
        <TimerControls
          isActive={isActive}
          mode={mode}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSkip={skipTimer}
          onAdjustTime={adjustTime}
        />
        
        <div className="text-sm text-muted-foreground">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>
    </Card>
  );
}