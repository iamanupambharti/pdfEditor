import React from 'react';
import { 
  FileText, 
  Minus, 
  Square, 
  X, 
  History, 
  Download, 
  Search,
  Timer,
  FolderOpen,
  Sun,
  Moon
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface TitleBarProps {
  fileName: string;
  activePagesCount: number;
  excludedPagesCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenFile: () => void;
  onOpenSnapshotModal: () => void;
  onOpenExportModal: () => void;
  onOpenCommandPalette: () => void;
  pomodoroTimeLeft: number;
  isPomodoroRunning: boolean;
  onTogglePomodoro: () => void;
  hasUnsavedChanges?: boolean;
  snapshotCount?: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  fileName,
  activePagesCount,
  excludedPagesCount,
  theme,
  onToggleTheme,
  onOpenFile,
  onOpenSnapshotModal,
  onOpenExportModal,
  onOpenCommandPalette,
  pomodoroTimeLeft,
  isPomodoroRunning,
  onTogglePomodoro,
  hasUnsavedChanges = false,
  snapshotCount = 0,
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

  const isLight = theme === 'light';

  return (
    <header className={`h-11 border-b flex items-center justify-between px-3 select-none z-50 backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-xs' 
        : 'bg-[#0A0D14]/95 border-white/[0.08] text-slate-200'
    }`}>
      {/* Left: Brand Identity & Document Name */}
      <div className="flex items-center gap-3">
        <BrandLogo size={24} />

        <div className={`h-4 w-px ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />

        {/* Current Document status badge */}
        <div className="flex items-center gap-2 text-xs">
          {hasUnsavedChanges && (
            <span 
              className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
              title="Unsaved changes in workspace" 
            />
          )}
          <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <span 
            className={`max-w-[200px] truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`} 
            title={fileName || 'No Document Open'}
          >
            {fileName || 'No Document Open'}
          </span>

          {activePagesCount > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activePagesCount} active
              </span>

              {excludedPagesCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  isLight 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {excludedPagesCount} pruned
                </span>
              )}
            </div>
          )}

          {/* Open File Button */}
          <button
            onClick={onOpenFile}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ml-1 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-[#11151F] hover:bg-[#171C29] border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Open PDF or .fdeck Project (Ctrl+O)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] hidden sm:inline">Open</span>
          </button>
        </div>
      </div>

      {/* Middle: Command Palette & Pomodoro quick status chip */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenCommandPalette}
          className={`flex items-center gap-2.5 px-3 py-1 rounded-lg border text-xs transition-all shadow-sm w-56 sm:w-64 cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-500 hover:text-slate-800'
              : 'bg-[#11151F] hover:bg-[#171C29] border-white/[0.08] text-slate-400 hover:text-slate-200'
          }`}
          title="Command Palette (Ctrl+K)"
        >
          <Search className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className="text-[11px] truncate flex-1 text-left">Type a command or search...</span>
          <kbd className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
            isLight 
              ? 'bg-white border-slate-200 text-slate-600' 
              : 'bg-[#0A0D14] border-white/10 text-slate-400'
          }`}>
            Ctrl+K
          </kbd>
        </button>

        {/* Pomodoro quick chip */}
        <button
          onClick={onTogglePomodoro}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            isPomodoroRunning
              ? isLight
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              : 'bg-[#11151F] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-[#171C29]'
          }`}
          title="Study Pomodoro Timer (Ctrl+Alt+P)"
        >
          <Timer className={`w-3.5 h-3.5 ${isPomodoroRunning ? 'animate-pulse text-amber-500' : ''}`} />
          <span className="font-mono text-[11px] tabular-nums">{formatTimer(pomodoroTimeLeft)}</span>
          {isPomodoroRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5" />}
        </button>
      </div>

      {/* Right: Actions & Theme Toggle & Window Controls */}
      <div className="flex items-center gap-1.5">
        {/* Mood Theme Switcher (Dark / Light) */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-[#11151F] hover:bg-[#171C29] border-white/10 text-slate-300 hover:text-white'
          }`}
          title={isLight ? 'Switch to Dark Mood (Stage Theme)' : 'Switch to Light Mood (Paper Theme)'}
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-indigo-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <button
          onClick={onOpenSnapshotModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isLight 
              ? 'text-slate-700 hover:bg-slate-100' 
              : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Version History & Snapshots"
        >
          <History className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-medium hidden sm:inline">Snapshots</span>
          {snapshotCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
              isLight
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {snapshotCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
          title="Export Cleaned PDF or .fdeck Project"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Export</span>
        </button>

        {isElectron && (
          <div className={`flex items-center ml-2 border-l pl-1 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
            <button
              onClick={handleMinimize}
              className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/[0.08] text-slate-400 hover:text-white'}`}
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className={`p-1.5 rounded transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/[0.08] text-slate-400 hover:text-white'}`}
              title="Maximize"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-rose-600 rounded text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
