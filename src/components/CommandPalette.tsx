import React, { useState, useEffect, useRef } from 'react';
import type { ToolType, PaperTone } from '../types/document';

interface CommandItem {
  id: string;
  title: string;
  desc?: string;
  category: string;
  iconD: string;
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
}) => {
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
    // Export category
    {
      id: 'export-options',
      title: 'Export Deck…',
      desc: 'Open export options',
      category: 'Export',
      iconD: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
      shortcut: 'Ctrl E',
      action: onOpenExportModal,
    },
    {
      id: 'export-clean',
      title: 'Export clean exam PDF',
      desc: 'Drops pruned pages and bakes annotations',
      category: 'Export',
      iconD: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v4a2 2 0 0 0 2 2h4',
      action: onOpenExportModal,
    },
    {
      id: 'export-bundle',
      title: 'Export project bundle (.fdeck)',
      desc: 'With memos, tags, and snapshots',
      category: 'Export',
      iconD: 'm7.5 4.27 9 5.15 M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.29 7 12 12l8.71-5 M12 22V12',
      action: onOpenExportModal,
    },

    // View category
    {
      id: 'zen-mode',
      title: 'Toggle Zen mode',
      desc: 'Exit with Esc',
      category: 'View',
      iconD: 'M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3',
      shortcut: 'Z',
      action: onToggleZenMode,
    },
    {
      id: 'paper-dark',
      title: 'Dark stage paper tone',
      desc: 'Natural document on dark stage',
      category: 'View',
      iconD: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      action: () => onChangePaperTone?.('dark'),
    },
    {
      id: 'paper-sepia',
      title: 'Sepia warm paper tone',
      desc: 'Gentle warmth for late-night study',
      category: 'View',
      iconD: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      action: () => onChangePaperTone?.('sepia'),
    },
    {
      id: 'paper-night',
      title: 'Night mode inverted paper',
      desc: 'Inverted text with true-color annotations',
      category: 'View',
      iconD: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      action: () => onChangePaperTone?.('night'),
    },

    // Prune category
    {
      id: 'prune-toggle',
      title: isCurrentPageExcluded ? `Restore Page ${currentPage}` : `Prune Page ${currentPage}`,
      desc: isCurrentPageExcluded ? 'Return page to examinable deck' : 'Exclude from deck and exam export',
      category: 'Pruning',
      iconD: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
      shortcut: 'Delete',
      action: onToggleExcludeCurrentPage,
    },

    // Study tools category
    {
      id: 'pomo-toggle',
      title: 'Toggle Pomodoro Study Timer',
      desc: '25m Focus · 5m Break with chimes',
      category: 'Study',
      iconD: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
      action: onTogglePomodoro,
    },
    {
      id: 'snapshot-save',
      title: 'Save Checkpoint Snapshot',
      desc: 'Capture document state with 1-click rollback',
      category: 'Study',
      iconD: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z M8 13a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
      shortcut: 'Ctrl Shift S',
      action: onOpenSnapshotModal,
    },

    // Annotation Tools category
    {
      id: 'tool-pen',
      title: 'Pen tool',
      desc: 'Freehand ink drawings',
      category: 'Tools',
      iconD: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
      shortcut: 'P',
      action: () => onSelectTool('pen'),
    },
    {
      id: 'tool-highlighter',
      title: 'Highlighter tool',
      desc: 'Translucent multiply marker',
      category: 'Tools',
      iconD: 'm9 11-6 6v3h3l6-6m-3-3 7-7a2 2 0 0 1 3 3l-7 7m-3-3 3 3',
      shortcut: 'H',
      action: () => onSelectTool('highlighter'),
    },
    {
      id: 'tool-eraser',
      title: 'Vector Eraser',
      desc: 'Collision stroke eraser',
      category: 'Tools',
      iconD: 'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21 M22 21H7 M5 11l9 9',
      shortcut: 'E',
      action: () => onSelectTool('eraser'),
    },
    {
      id: 'tool-note',
      title: 'Sticky Note tool',
      desc: 'Place editable colored note cards',
      category: 'Tools',
      iconD: 'M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z M15 3v6h6',
      shortcut: 'T',
      action: () => onSelectTool('text'),
    },

    // File Actions category
    {
      id: 'file-open',
      title: 'Open PDF File…',
      desc: 'Open textbook or document from disk',
      category: 'File',
      iconD: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z',
      shortcut: 'Ctrl O',
      action: onOpenFile,
    },
    {
      id: 'file-sample',
      title: 'Load Distributed Systems Sample Deck',
      desc: 'Explore pre-configured diagrams and annotations',
      category: 'File',
      iconD: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      action: onLoadSample,
    },
  ];

  if (onOpenSettings) {
    commands.push({
      id: 'settings-open',
      title: 'Open Settings…',
      desc: 'Configure study minutes and timer thresholds',
      category: 'Settings',
      iconD: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
      action: onOpenSettings,
    });
  }

  // Filter commands
  const filtered = query.trim()
    ? commands.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        (c.desc && c.desc.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  // Key navigation
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

  // Group filtered results by category
  const categories = Array.from(new Set(filtered.map((c) => c.category)));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      style={{
        background: 'rgba(11,11,13,.75)',
        backdropFilter: 'blur(8px)',
        fontFamily: "'Geist',system-ui,sans-serif",
        color: '#F1EFEA'
      }}
      onClick={onClose}
    >
      <div 
        role="dialog" 
        aria-label="Command palette"
        style={{
          position: 'relative',
          width: '640px',
          maxHeight: '480px',
          borderRadius: '20px',
          background: '#1A1A1D',
          border: '1px solid rgba(255,255,255,.14)',
          boxShadow: '0 16px 40px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.02)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            height: '56px',
            padding: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,.08)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3A09A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, tools, and actions…"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#F1EFEA] placeholder-[#A3A09A]"
          />
          <span className="kbd">Esc</span>
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#A3A09A]">
              No matching actions found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filtered.filter((c) => c.category === cat);
              return (
                <div key={cat} className="mb-2">
                  <div style={{ padding: '8px 12px 4px', font: "500 10px/1 'Geist',sans-serif", letterSpacing: '.08em', textTransform: 'uppercase', color: '#A3A09A' }}>
                    {cat}
                  </div>
                  {catItems.map((cmd) => {
                    const globalIdx = filtered.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          height: '44px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(241,239,234,.14)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 120ms ease'
                        }}
                      >
                        {isSelected && (
                          <span style={{ position: 'absolute', left: 0, top: '12px', bottom: '12px', width: '2px', borderRadius: '1px', background: '#F1EFEA' }} />
                        )}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSelected ? '#F1EFEA' : '#A3A09A'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={cmd.iconD} />
                        </svg>
                        <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 500, color: isSelected ? '#FFFFFF' : '#F1EFEA' }}>
                          {cmd.title}
                        </span>
                        {cmd.desc && (
                          <span style={{ fontSize: '11px', color: '#98A0B6' }}>
                            {cmd.desc}
                          </span>
                        )}
                        {cmd.shortcut && (
                          <span className="kbd" style={{ color: isSelected ? '#C7D2FE' : '#98A0B6' }}>
                            {cmd.shortcut}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Key Navigation Footer */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            height: '40px',
            padding: '0 20px',
            borderTop: '1px solid rgba(255,255,255,.08)',
            background: 'rgba(10,13,20,.35)',
            fontSize: '11px',
            color: '#98A0B6'
          }}
        >
          <span><span className="mono" style={{ color: '#E8EAF2' }}>↑↓</span> navigate</span>
          <span><span className="mono" style={{ color: '#E8EAF2' }}>↵</span> select</span>
          <span><span className="mono" style={{ color: '#E8EAF2' }}>Esc</span> close</span>
          <span style={{ flex: 1 }} />
          <span className="mono">{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
};
