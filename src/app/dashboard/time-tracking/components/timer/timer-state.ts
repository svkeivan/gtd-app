import { create } from 'zustand';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  mode: TimerMode;
  focusLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  sessionsCompleted: number;
  sessionsUntilLongBreak: number;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  adjustTime: (seconds: number) => void;
  setFocusLength: (minutes: number) => void;
  setShortBreakLength: (minutes: number) => void;
  setLongBreakLength: (minutes: number) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  timeRemaining: 25 * 60, // 25 minutes in seconds
  isActive: false,
  mode: 'focus',
  focusLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  sessionsCompleted: 0,
  sessionsUntilLongBreak: 4,

  startTimer: () => set({ isActive: true }),
  
  pauseTimer: () => set({ isActive: false }),
  
  resetTimer: () => {
    const { mode, focusLength, shortBreakLength, longBreakLength } = get();
    const newTime = mode === 'focus' 
      ? focusLength * 60 
      : mode === 'shortBreak'
        ? shortBreakLength * 60
        : longBreakLength * 60;
    set({ timeRemaining: newTime, isActive: false });
  },
  
  skipTimer: () => {
    const { mode, focusLength, shortBreakLength, longBreakLength, sessionsCompleted, sessionsUntilLongBreak } = get();
    let newMode: TimerMode = 'focus';
    let newSessionsCompleted = sessionsCompleted;
    
    if (mode === 'focus') {
      newSessionsCompleted = sessionsCompleted + 1;
      if (newSessionsCompleted % sessionsUntilLongBreak === 0) {
        newMode = 'longBreak';
      } else {
        newMode = 'shortBreak';
      }
    } else {
      newMode = 'focus';
    }
    
    const newTime = newMode === 'focus' 
      ? focusLength * 60 
      : newMode === 'shortBreak'
        ? shortBreakLength * 60
        : longBreakLength * 60;
        
    set({ 
      mode: newMode,
      timeRemaining: newTime,
      isActive: false,
      sessionsCompleted: newSessionsCompleted
    });
  },
  
  tick: () => {
    const { timeRemaining, skipTimer } = get();
    if (timeRemaining <= 0) {
      skipTimer();
      // Could add notification here
      return;
    }
    set((state) => ({ timeRemaining: state.timeRemaining - 1 }));
  },
  
  setMode: (mode: TimerMode) => {
    const { focusLength, shortBreakLength, longBreakLength } = get();
    const newTime = mode === 'focus' 
      ? focusLength * 60 
      : mode === 'shortBreak'
        ? shortBreakLength * 60
        : longBreakLength * 60;
    set({ mode, timeRemaining: newTime, isActive: false });
  },
  
  adjustTime: (seconds: number) => {
    set((state) => ({ 
      timeRemaining: Math.max(0, state.timeRemaining + seconds),
      isActive: false 
    }));
  },
  
  setFocusLength: (minutes: number) => set({ focusLength: minutes }),
  setShortBreakLength: (minutes: number) => set({ shortBreakLength: minutes }),
  setLongBreakLength: (minutes: number) => set({ longBreakLength: minutes }),
}));