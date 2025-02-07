import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { useTimerStore } from "./timer-state";
import { cn } from "@/lib/utils";
import { TaskSuggestions } from "./task-suggestions";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

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
    sessionsCompleted,
    selectedTask,
    setSelectedTask,
    finishSession
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

  const handleFinish = async () => {
    await finishSession();
    resetTimer();
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

        {mode === 'focus' && (
          <>
            <div className="w-full">
              <TaskSuggestions
                onSelectTask={setSelectedTask}
                selectedTaskId={selectedTask?.id || null}
              />
            </div>

            {isActive && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleFinish}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finish Session
                {selectedTask && (
                  <span className="ml-2 text-muted-foreground">
                    ({selectedTask.title})
                  </span>
                )}
              </Button>
            )}
          </>
        )}
        
        <div className="text-sm text-muted-foreground">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>
    </Card>
  );
}