import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MousePointer,
  Hand,
  Pen, 
  Highlighter, 
  Eraser, 
  Type, 
  Square, 
  Trash2, 
  RotateCcw, 
  History, 
  Download, 
  Maximize2, 
  Timer, 
  FolderOpen,
  Sparkles,
  Settings,
  Moon,
  Sun,
  Contrast
} from 'lucide-react';
import type { ToolType, PaperTone } from '../types/document';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolType) => void;
  onToggleExcludeCurrentPage: () => void;
  onOpenSnapshotModal: () => void;
  onOpenExportModal: () => void;
  onToggleZenMode: () => void;
  onTogglePomodoro: () => void;
  onOpenFile: () => void;
  onLoadSample: () => void;
  onOpenSettings?: () => void;
  onChangePaperTone?: (tone: PaperTone) => void;
  isCurrentPageExcluded: boolean;
  currentPage: number;
  theme?: 'dark' | 'light';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onToggleExcludeCurrentPage,
  onOpenSnapshotModal,
  onOpenExportModal,
  onToggleZenMode,
  onTogglePomodoro,
  onOpenFile,
  onLoadSample,
  onOpenSettings,
  onChangePaperTone,
  isCurrentPageExcluded,
  currentPage,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'prune-toggle',
      title: isCurrentPageExcluded ? `Restore Page ${currentPage} into Exam Deck` : `Prune Page ${currentPage} (Reduce Burden)`,
      category: 'Exam Pruning',
      icon: isCurrentPageExcluded ? <RotateCcw className="w-4 h-4 text-emerald-400" /> : <Trash2 className="w-4 h-4 text-rose-400" />,
      shortcut: 'Del',
      action: onToggleExcludeCurrentPage,
    },
    {
      id: 'tool-select',
      title: 'Pointer / Select Tool',
      category: 'Tools',
      icon: <MousePointer className="w-4 h-4 text-indigo-400" />,
      shortcut: 'V',
      action: () => onSelectTool('select'),
    },
    {
      id: 'tool-hand',
      title: 'Pan / Hand Tool',
      category: 'Tools',
      icon: <Hand className="w-4 h-4 text-indigo-400" />,
      shortcut: 'H / Space',
      action: () => onSelectTool('hand'),
    },
    {
      id: 'tool-pen',
      title: 'Freehand Pen Tool',
      category: 'Tools',
      icon: <Pen className="w-4 h-4 text-indigo-400" />,
      shortcut: 'P',
      action: () => onSelectTool('pen'),
    },
    {
      id: 'tool-highlighter',
      title: 'Smart Exam Highlighter',
      category: 'Tools',
      icon: <Highlighter className="w-4 h-4 text-amber-400" />,
      shortcut: 'H',
      action: () => onSelectTool('highlighter'),
    },
    {
      id: 'tool-eraser',
      title: 'Stroke & Area Eraser',
      category: 'Tools',
      icon: <Eraser className="w-4 h-4 text-rose-400" />,
      shortcut: 'E',
      action: () => onSelectTool('eraser'),
    },
    {
      id: 'tool-text',
      title: 'Text Sticky Note',
      category: 'Tools',
      icon: <Type className="w-4 h-4 text-indigo-400" />,
      shortcut: 'T',
      action: () => onSelectTool('text'),
    },
    {
      id: 'tool-shape',
      title: 'Geometric Shapes & Diagrams',
      category: 'Tools',
      icon: <Square className="w-4 h-4 text-indigo-400" />,
      shortcut: 'S',
      action: () => onSelectTool('shape'),
    },
    {
      id: 'paper-dark',
      title: 'Paper Tone: Dark Mode',
      category: 'View',
      icon: <Moon className="w-4 h-4 text-slate-300" />,
      action: () => onChangePaperTone?.('dark'),
    },
    {
      id: 'paper-sepia',
      title: 'Paper Tone: Sepia (Eye-strain relief)',
      category: 'View',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      action: () => onChangePaperTone?.('sepia'),
    },
    {
      id: 'paper-night',
      title: 'Paper Tone: Night Inverted PDF (OLED Black)',
      category: 'View',
      icon: <Contrast className="w-4 h-4 text-violet-400" />,
      action: () => onChangePaperTone?.('night'),
    },
    {
      id: 'snapshot-checkpoint',
      title: 'Save Version Checkpoint (Snapshot)',
      category: 'History',
      icon: <History className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+Shift+S',
      action: onOpenSnapshotModal,
    },
    {
      id: 'export-clean',
      title: 'Export Clean Exam PDF & .fdeck Bundle',
      category: 'Export',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      shortcut: 'Ctrl+E',
      action: onOpenExportModal,
    },
    {
      id: 'zen-mode',
      title: 'Toggle Distraction-Free Zen Mode',
      category: 'Study Suite',
      icon: <Maximize2 className="w-4 h-4 text-violet-400" />,
      shortcut: 'Z',
      action: onToggleZenMode,
    },
    {
      id: 'pomodoro',
      title: 'Start / Pause Pomodoro Study Timer',
      category: 'Study Suite',
      icon: <Timer className="w-4 h-4 text-amber-400" />,
      shortcut: 'Ctrl+Alt+P',
      action: onTogglePomodoro,
    },
    {
      id: 'settings',
      title: 'Open FocusDeck Settings',
      category: 'Preferences',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      action: () => onOpenSettings?.(),
    },
    {
      id: 'open-file',
      title: 'Open PDF or .fdeck Project',
      category: 'File',
      icon: <FolderOpen className="w-4 h-4 text-slate-400" />,
      shortcut: 'Ctrl+O',
      action: onOpenFile,
    },
    {
      id: 'load-sample',
      title: 'Load Sample CS & Algorithms Exam Prep Deck',
      category: 'File',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      action: onLoadSample,
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
            : 'bg-[#11151F] border-white/10 text-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className={`px-4 py-3 border-b flex items-center gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'border-white/10'
        }`}>
          <Search className={`w-4 h-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search action..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent border-none outline-none text-sm font-sans ${
              isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-500'
            }`}
          />
          <kbd className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
            isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-[#0A0D14] border-white/10 text-slate-400'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className={`text-center py-8 text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isLight 
                      ? 'hover:bg-slate-100 text-slate-700' 
                      : 'hover:bg-white/[0.04] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${
                      isSelected 
                        ? 'bg-white/15' 
                        : isLight 
                        ? 'bg-slate-100 text-slate-700' 
                        : 'bg-[#171C29] text-slate-300'
                    }`}>
                      {cmd.icon}
                    </div>
                    <div>
                      <span className="font-medium">{cmd.title}</span>
                      <span className={`text-[10px] ml-2 ${
                        isSelected ? 'text-indigo-200' : isLight ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        {cmd.category}
                      </span>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                      isSelected 
                        ? 'bg-indigo-700/80 border-indigo-400/40 text-white' 
                        : isLight 
                        ? 'bg-slate-100 border-slate-300 text-slate-600' 
                        : 'bg-[#0A0D14] border-white/10 text-slate-400'
                    }`}>
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
