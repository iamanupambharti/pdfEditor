import React from 'react';

interface TitleBarProps {
  fileName?: string;
  activePagesCount?: number;
  excludedPagesCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenFile?: () => void;
  onOpenSnapshotModal: () => void;
  onOpenExportModal: () => void;
  onOpenCommandPalette: () => void;
  pomodoroTimeLeft?: number;
  isPomodoroRunning?: boolean;
  pomodoroMode?: 'study' | 'shortBreak' | 'longBreak';
  onTogglePomodoro: () => void;
  onOpenSettings?: () => void;
  hasUnsavedChanges?: boolean;
  snapshotCount?: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  fileName,
  onOpenFile,
  onOpenSnapshotModal,
  onOpenExportModal,
  onOpenCommandPalette,
  pomodoroTimeLeft = 1452,
  isPomodoroRunning = false,
  pomodoroMode = 'study',
  onTogglePomodoro,
  onOpenSettings,
  hasUnsavedChanges = false,
  snapshotCount = 4,
}) => {
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;

  const handleMinimize = () => {
    (window as any).electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    (window as any).electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    (window as any).electronAPI?.closeWindow();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const modeLabel = pomodoroMode === 'study' ? 'Study' : 'Break';

  return (
    <header 
      className="h-10 flex-none select-none z-50"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: '#0B0B0D',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        WebkitAppRegion: 'drag'
      } as React.CSSProperties}
    >
      {/* Left: Brand mark, PRO badge, & Open File trigger */}
      <div 
        className="flex items-center gap-2 pl-3.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <rect width="22" height="22" rx="6" fill="#1A1A1D" stroke="rgba(255,255,255,.14)" strokeWidth="1" />
          <rect x="7.5" y="4.5" width="9.5" height="12" rx="2" fill="#DDD8CC" opacity=".45" />
          <rect x="5" y="7" width="9.5" height="12" rx="2" fill="#F1EFEA" />
        </svg>
        <span className="font-semibold text-[13px] leading-none tracking-[-0.01em] text-[#F1EFEA]">
          FocusDeck
        </span>
        <span 
          className="mono text-[9.5px] font-medium leading-none tracking-[0.1em] text-[#A3A09A] border border-white/[0.14] rounded px-1.5 py-[3px]"
          title={fileName ? `Loaded: ${fileName}${hasUnsavedChanges ? ' (Unsaved)' : ''}` : 'FocusDeck PRO Workstation'}
        >
          PRO
        </span>
        {hasUnsavedChanges && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#DDD8CC]" title="Unsaved changes in workspace" />
        )}

        {onOpenFile && (
          <button
            className="btn"
            onClick={onOpenFile}
            aria-label="Open PDF file (Ctrl O)"
            style={{
              height: '26px',
              padding: '0 8px',
              marginLeft: '4px',
              fontSize: '11.5px',
              gap: '6px',
              background: 'rgba(255,255,255,.05)',
              borderColor: 'rgba(255,255,255,.1)',
              color: '#F1EFEA'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            <span>Open PDF</span>
            <span className="kbd" style={{ fontSize: '9px', height: '16px', padding: '0 4px' }}>Ctrl O</span>
          </button>
        )}
      </div>

      {/* Center: Command Palette CTA button */}
      <button 
        className="btn"
        onClick={onOpenCommandPalette}
        aria-label="Open command palette"
        style={{
          width: '360px',
          justifyContent: 'flex-start',
          height: '28px',
          background: '#131315',
          color: '#A3A09A',
          fontWeight: 400,
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="flex-1 text-left text-[12px]">Command Palette</span>
        <span className="kbd">Ctrl K</span>
      </button>

      {/* Right: Actions, Timer Pill & Window Controls */}
      <div 
        className="flex items-center justify-end gap-1.5 pr-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Pomodoro Quick Chip */}
        <button 
          className="btn"
          onClick={onTogglePomodoro}
          aria-label="Toggle Pomodoro widget"
          style={{
            height: '28px',
            padding: '0 10px',
            background: 'rgba(255,255,255,.05)',
            borderColor: 'rgba(255,255,255,.1)',
            color: '#F1EFEA'
          }}
        >
          <span className={isPomodoroRunning ? 'pulse' : ''} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DDD8CC' }} />
          <span className="mono text-[12px]">{formatTimer(pomodoroTimeLeft)}</span>
          <span className="text-[12px] text-[#A3A09A]">{modeLabel}</span>
        </button>

        {/* Snapshots button */}
        <button 
          className="btn ic"
          onClick={onOpenSnapshotModal}
          data-tip={`Snapshots · ${snapshotCount}`}
          aria-label={`Snapshots, ${snapshotCount} checkpoints`}
          style={{ height: '28px', width: '28px', borderColor: 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
        </button>

        {/* Settings button */}
        <button 
          className="btn ic"
          onClick={onOpenSettings}
          data-tip="Settings"
          aria-label="Settings"
          style={{ height: '28px', width: '28px', borderColor: 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 21v-7" />
            <path d="M4 10V3" />
            <path d="M12 21v-9" />
            <path d="M12 8V3" />
            <path d="M20 21v-5" />
            <path d="M20 12V3" />
            <path d="M1 14h6" />
            <path d="M9 8h6" />
            <path d="M17 16h6" />
          </svg>
        </button>

        {/* Export Deck CTA */}
        <button 
          className="btn primary"
          onClick={onOpenExportModal}
          style={{ height: '28px', margin: '0 8px 0 4px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Deck
        </button>

        {/* Desktop Native Window Controls (Windows) */}
        {isElectron && (
          <div className="flex items-center">
            <button className="wc" onClick={handleMinimize} aria-label="Minimize">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button className="wc" onClick={handleMaximize} aria-label="Maximize">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16v16H4z" />
              </svg>
            </button>
            <button className="wc close" onClick={handleClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18 M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
