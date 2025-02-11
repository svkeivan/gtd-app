import { Button } from "@/components/ui/button";
import { TimerMode } from "./timer-state";
import { Play, Pause, SkipForward, RefreshCw, Plus, Minus } from "lucide-react";

interface TimerControlsProps {
  isActive: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjustTime: (seconds: number) => void;
  className?: string;
}

export function TimerControls({
  isActive,
  mode,
  onStart,
  onPause,
  onReset,
  onSkip,
  onAdjustTime,
  className
}: TimerControlsProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onAdjustTime(-60)}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onAdjustTime(60)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant={isActive ? "destructive" : "default"}
          size="icon"
          onClick={isActive ? onPause : onStart}
          className="h-12 w-12"
        >
          {isActive ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onSkip}
          className="h-8 w-8"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}