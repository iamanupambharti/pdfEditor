import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Sparkles, Coffee } from 'lucide-react';
import type { PomodoroState } from '../types/document';

interface PomodoroWidgetProps {
  state: PomodoroState;
  onChangeState: React.Dispatch<React.SetStateAction<PomodoroState>>;
  onClose: () => void;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  state,
  onChangeState,
  onClose,
}) => {
  const timerRef = useRef<any>(null);

  // Play soft chime notification tone using Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio autoplay may be prevented
    }
  };

  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = setInterval(() => {
        onChangeState((prev) => {
          if (prev.timeLeft <= 1) {
            playChime();
            const nextMode = prev.mode === 'study' ? 'shortBreak' : 'study';
            const nextMinutes = nextMode === 'study' ? 25 : 5;
            return {
              ...prev,
              isRunning: false,
              mode: nextMode,
              timeLeft: nextMinutes * 60,
              sessionsCompleted: prev.mode === 'study' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, onChangeState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSetMode = (mode: 'study' | 'shortBreak' | 'longBreak') => {
    const mins = mode === 'study' ? 25 : mode === 'shortBreak' ? 5 : 15;
    onChangeState((prev) => ({
      ...prev,
      mode,
      timeLeft: mins * 60,
      isRunning: false,
      targetMinutes: mins,
    }));
  };

  return (
    <div className="fixed bottom-16 right-6 z-40 w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-slate-200 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Study Pomodoro</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl mb-3 text-[10px]">
        <button
          onClick={() => handleSetMode('study')}
          className={`py-1 rounded-lg font-medium transition-all ${
            state.mode === 'study' ? 'bg-amber-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => handleSetMode('shortBreak')}
          className={`py-1 rounded-lg font-medium transition-all ${
            state.mode === 'shortBreak' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          5m Break
        </button>
        <button
          onClick={() => handleSetMode('longBreak')}
          className={`py-1 rounded-lg font-medium transition-all ${
            state.mode === 'longBreak' ? 'bg-indigo-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          15m Break
        </button>
      </div>

      {/* Countdown Display */}
      <div className="text-center py-2">
        <div className="font-mono text-3xl font-extrabold tracking-tight text-white mb-1">
          {formatTime(state.timeLeft)}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span>{state.sessionsCompleted} Focus Sessions Completed</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          onClick={() => onChangeState((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
            state.isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {state.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{state.isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        <button
          onClick={() => handleSetMode(state.mode)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
