import React, { useEffect, useRef } from 'react';
import type { PomodoroState } from '../types/document';

interface PomodoroWidgetProps {
  state: PomodoroState;
  onChangeState: React.Dispatch<React.SetStateAction<PomodoroState>>;
  onClose: () => void;
  theme?: 'dark' | 'light';
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
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1175, audioCtx.currentTime + 0.3); // D6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch {}
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

  const handleReset = () => {
    const mins = state.mode === 'study' ? 25 : state.mode === 'shortBreak' ? 5 : 15;
    onChangeState((prev) => ({
      ...prev,
      timeLeft: mins * 60,
      isRunning: false,
    }));
  };

  const handleSkip = () => {
    const nextMode = state.mode === 'study' ? 'shortBreak' : 'study';
    const mins = nextMode === 'study' ? 25 : 5;
    onChangeState((prev) => ({
      ...prev,
      mode: nextMode,
      timeLeft: mins * 60,
      isRunning: false,
    }));
  };

  // SVG Ring Progress Math
  const totalSeconds = (state.targetMinutes || (state.mode === 'study' ? 25 : 5)) * 60;
  const circumference = 2 * Math.PI * 76; // ≈ 477.5
  const progressRatio = Math.max(0, Math.min(1, state.timeLeft / totalSeconds));
  const dashOffset = circumference * (1 - progressRatio);

  const completedDots = state.sessionsCompleted % 4;

  return (
    <div 
      className="fixed bottom-16 right-6 z-50 select-none animate-in fade-in zoom-in-95 duration-150"
      style={{
        position: 'fixed',
        width: '280px',
        boxSizing: 'border-box',
        fontFamily: "'Geist',system-ui,sans-serif",
        color: '#E8EAF2'
      }}
    >
      <section 
        aria-label="Pomodoro timer" 
        style={{
          position: 'relative',
          width: '216px',
          boxSizing: 'border-box',
          padding: '16px',
          borderRadius: '24px',
          background: 'rgba(26,26,29,.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.14)',
          boxShadow: '0 16px 40px rgba(0,0,0,.45)',
          margin: '0 auto',
          color: '#F1EFEA'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close Pomodoro widget"
          className="hover:text-white transition-colors"
          style={{
            position: 'absolute',
            right: '12px',
            top: '12px',
            background: 'none',
            border: 0,
            color: '#A3A09A',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ✕
        </button>

        {/* Mode Selector Tabs */}
        <div 
          role="tablist" 
          aria-label="Timer mode" 
          style={{
            display: 'flex',
            gap: '2px',
            padding: '3px',
            borderRadius: '10px',
            background: '#131315',
            border: '1px solid rgba(255,255,255,.08)',
            marginTop: '8px'
          }}
        >
          <button 
            role="tab" 
            aria-selected={state.mode === 'study'} 
            onClick={() => handleSetMode('study')}
            style={{
              flex: 1,
              height: '24px',
              border: 0,
              borderRadius: '7px',
              background: state.mode === 'study' ? 'rgba(241,239,234,.14)' : 'none',
              color: state.mode === 'study' ? '#F1EFEA' : '#A3A09A',
              font: "500 11px/1 'Geist',sans-serif",
              cursor: 'pointer'
            }}
          >
            Study
          </button>
          <button 
            role="tab" 
            aria-selected={state.mode === 'shortBreak'} 
            onClick={() => handleSetMode('shortBreak')}
            style={{
              flex: 1,
              height: '24px',
              border: 0,
              borderRadius: '7px',
              background: state.mode === 'shortBreak' ? 'rgba(52,211,153,.18)' : 'none',
              color: state.mode === 'shortBreak' ? '#6EE7B7' : '#A3A09A',
              font: "500 11px/1 'Geist',sans-serif",
              cursor: 'pointer'
            }}
          >
            Short
          </button>
          <button 
            role="tab" 
            aria-selected={state.mode === 'longBreak'} 
            onClick={() => handleSetMode('longBreak')}
            style={{
              flex: 1,
              height: '24px',
              border: 0,
              borderRadius: '7px',
              background: state.mode === 'longBreak' ? 'rgba(56,189,248,.18)' : 'none',
              color: state.mode === 'longBreak' ? '#7DD3FC' : '#A3A09A',
              font: "500 11px/1 'Geist',sans-serif",
              cursor: 'pointer'
            }}
          >
            Long
          </button>
        </div>

        {/* 168px Ring Visualizer per ui.md §6 */}
        <div 
          style={{
            position: 'relative',
            width: '168px',
            height: '168px',
            margin: '12px auto 0'
          }}
          role="timer" 
          aria-live="polite" 
          aria-label={`${formatTime(state.timeLeft)} remaining`}
        >
          <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0 }}>
            <circle cx="84" cy="84" r="76" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
            <circle 
              cx="84" 
              cy="84" 
              r="76" 
              fill="none" 
              stroke={state.mode === 'study' ? '#F1EFEA' : state.mode === 'shortBreak' ? '#34D399' : '#38BDF8'} 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeDasharray={circumference} 
              strokeDashoffset={dashOffset} 
              transform="rotate(-90 84 84)"
              style={{ transition: 'stroke-dashoffset 300ms ease' }}
            />
          </svg>

          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ font: "500 36px/1 'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', color: '#F1EFEA' }}>
              {formatTime(state.timeLeft)}
            </div>
            <div style={{ marginTop: '8px', font: "500 10px/1 'Geist',sans-serif", letterSpacing: '.14em', textTransform: 'uppercase', color: state.mode === 'study' ? '#F1EFEA' : '#6EE7B7' }}>
              {state.mode === 'study' ? 'Focus' : 'Break'}
            </div>
            {/* 4 Session Progress Dots */}
            <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }} aria-label={`Session ${completedDots + 1} of 4`}>
              <svg width="40" height="6" viewBox="0 0 40 6" aria-hidden="true">
                {[0, 1, 2, 3].map((dotIdx) => (
                  <circle 
                    key={dotIdx}
                    cx={3 + dotIdx * 11} 
                    cy="3" 
                    r="3" 
                    fill={dotIdx <= completedDots ? '#F1EFEA' : 'rgba(255,255,255,.18)'} 
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
          {/* Reset */}
          <button 
            onClick={handleReset}
            aria-label="Reset timer" 
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,.14)',
              background: 'none',
              color: '#A3A09A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          {/* Play/Pause: Bone fill, graphite text per ui.md §6 */}
          <button 
            onClick={() => onChangeState((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
            aria-label={state.isRunning ? 'Pause timer' : 'Start timer'} 
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '50%',
              border: 0,
              background: '#F1EFEA',
              color: '#151513',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,.3)'
            }}
          >
            {state.isRunning ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            )}
          </button>

          {/* Skip */}
          <button 
            onClick={handleSkip}
            aria-label="Skip to next phase" 
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,.14)',
              background: 'none',
              color: '#98A0B6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};
