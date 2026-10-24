import React, { useState, useEffect } from 'react';
import type { Snapshot, AudioMemo, PruneReason } from '../types/document';
import { 
  Layers, 
  Trash2, 
  History, 
  Bookmark, 
  Mic, 
  RotateCcw, 
  CheckCircle2, 
  Play, 
  Pause, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  ExternalLink,
  CheckSquare
} from 'lucide-react';
import { PDFService } from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';

export type SidebarTab = 'thumbnails' | 'excluded' | 'timeline' | 'bookmarks' | 'audio';

interface SidebarProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  numPages: number;
  currentPage: number;
  excludedPages: Set<number>;
  activePages?: number[];
  bookmarks: number[];
  tags: Record<number, string[]>;
  audioMemos: AudioMemo[];
  snapshots: Snapshot[];
  pruneReasons?: Record<number, PruneReason>;
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  onSelectPage: (page: number) => void;
  onToggleExcludePage: (page: number) => void;
  onRestoreAllPruned: () => void;
  onRestoreBatch?: (pages: number[]) => void;
  onRollbackSnapshot: (snapshotId: string) => void;
  onDeleteAudioMemo: (memoId: string) => void;
  onAddTagToPage: (page: number, tag: string) => void;
  onUpdatePruneReason?: (page: number, reason: PruneReason) => void;
  theme?: 'dark' | 'light';
}

const PRUNE_REASONS_LABELS: Record<PruneReason, string> = {
  mastered: 'Already Mastered',
  syllabus: 'Out of Syllabus',
  low_yield: 'Low-Yield Proof',
  other: 'Other Reason',
};

export const Sidebar: React.FC<SidebarProps> = ({
  pdfDoc,
  numPages,
  currentPage,
  excludedPages,
  bookmarks,
  tags,
  audioMemos,
  snapshots,
  pruneReasons = {},
  activeTab,
  onChangeTab,
  onSelectPage,
  onToggleExcludePage,
  onRestoreAllPruned,
  onRestoreBatch,
  onRollbackSnapshot,
  onDeleteAudioMemo,
  onAddTagToPage,
  onUpdatePruneReason,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Pruned Multi-Selection & Filter States
  const [selectedPruned, setSelectedPruned] = useState<Set<number>>(new Set());
  const [filterMode, setFilterMode] = useState<'active' | 'all'>('active');

  const handleSelectAllPruned = () => {
    setSelectedPruned(new Set(excludedPages));
  };

  const handleInvertPrunedSelection = () => {
    const inverted = new Set<number>();
    for (const p of excludedPages) {
      if (!selectedPruned.has(p)) {
        inverted.add(p);
      }
    }
    setSelectedPruned(inverted);
  };

  const handleClearPrunedSelection = () => {
    setSelectedPruned(new Set());
  };

  const handleToggleSelectPruned = (page: number) => {
    setSelectedPruned((prev) => {
      const next = new Set(prev);
      if (next.has(page)) {
        next.delete(page);
      } else {
        next.add(page);
      }
      return next;
    });
  };

  const handleRestoreSelectedPruned = () => {
    if (selectedPruned.size === 0) return;
    if (onRestoreBatch) {
      onRestoreBatch(Array.from(selectedPruned));
    } else {
      for (const p of selectedPruned) {
        onToggleExcludePage(p);
      }
    }
    setSelectedPruned(new Set());
  };

  // Generate thumbnails progressively
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let isMounted = true;
    const generateAll = async () => {
      for (let p = 1; p <= numPages; p++) {
        if (!isMounted) break;
        if (!thumbnails[p]) {
          try {
            const dataUrl = await PDFService.renderThumbnail(pdfDoc, p, 130);
            if (isMounted) {
              setThumbnails((prev) => ({ ...prev, [p]: dataUrl }));
            }
          } catch (e) {
            console.error('Error generating thumbnail for page', p, e);
          }
        }
      }
    };

    generateAll();
    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages]);

  // Audio playback handler
  const handleTogglePlayAudio = (memo: AudioMemo) => {
    if (playingAudioId === memo.id) {
      setPlayingAudioId(null);
      return;
    }

    const audio = new Audio(memo.audioBase64);
    setPlayingAudioId(memo.id);
    audio.play();
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    onAddTagToPage(currentPage, newTagInput.trim().replace(/^#/, ''));
    setNewTagInput('');
  };

  if (isCollapsed) {
    return (
      <div className={`w-12 border-r flex flex-col items-center py-3 select-none z-30 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0A0D14] border-white/[0.08]'
      }`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className={`p-2 rounded-lg transition-colors mb-4 ${
            isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
          title="Expand Sidebar (Ctrl+\)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('thumbnails'); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'thumbnails'
                ? 'bg-indigo-600 text-white'
                : isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/10'
            }`}
            title="Thumbnails"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('excluded'); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'excluded'
                ? 'bg-rose-600 text-white'
                : isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/10'
            }`}
            title={`Safety Bin (${excludedPages.size} pruned)`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('timeline'); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white'
                : isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/10'
            }`}
            title="Version History & Snapshots"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('audio'); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'audio'
                ? 'bg-rose-600 text-white'
                : isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/10'
            }`}
            title="Voice Memos"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('bookmarks'); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-amber-600 text-white'
                : isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/10'
            }`}
            title="Bookmarks & Tags"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className={`w-72 border-r flex flex-col select-none z-30 h-full backdrop-blur-md transition-colors ${
      isLight ? 'bg-[#F7F7F5] border-slate-200 text-slate-800' : 'bg-[#0A0D14] border-white/[0.08] text-slate-200'
    }`}>
      {/* Sidebar Top Nav Tabs (§17.4) */}
      <div className={`flex items-center justify-between border-b px-2 py-2 ${
        isLight ? 'border-slate-200 bg-white/50' : 'border-white/[0.08]'
      }`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeTab('thumbnails')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'thumbnails'
                ? isLight ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200' : 'bg-[#171C29] text-indigo-300 font-semibold shadow-inner'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Page Thumbnails"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px]">Pages</span>
          </button>

          <button
            onClick={() => onChangeTab('excluded')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'excluded'
                ? isLight ? 'bg-rose-100 text-rose-700 font-semibold border border-rose-200' : 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/20'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Pruned History & Safety Bin (Restore deleted pages)"
          >
            <Trash2 className={`w-3.5 h-3.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
            <span className="text-[11px]">Pruned ({excludedPages.size})</span>
          </button>

          <button
            onClick={() => onChangeTab('timeline')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'timeline'
                ? isLight ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200' : 'bg-[#171C29] text-indigo-300 font-semibold shadow-inner'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Snapshots & Rollback"
          >
            <History className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <span className="text-[11px]">History</span>
          </button>

          <button
            onClick={() => onChangeTab('audio')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'audio'
                ? isLight ? 'bg-white text-rose-700 font-semibold shadow-xs border border-slate-200' : 'bg-[#171C29] text-rose-300 font-semibold shadow-inner'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Voice Memos"
          >
            <Mic className={`w-3.5 h-3.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
          </button>

          <button
            onClick={() => onChangeTab('bookmarks')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'bookmarks'
                ? isLight ? 'bg-white text-amber-700 font-semibold shadow-xs border border-slate-200' : 'bg-[#171C29] text-amber-300 font-semibold shadow-inner'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Bookmarks & Study Tags"
          >
            <Tag className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className={`p-1 rounded transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-slate-500 hover:text-slate-300'}`}
          title="Collapse Sidebar (Ctrl+\)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Thumbnails Grid */}
      {activeTab === 'thumbnails' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className={`flex items-center justify-between text-[11px] px-1 mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            <span>{numPages - excludedPages.size} of {numPages} Active</span>
            <div className={`flex items-center gap-1 rounded-md p-0.5 border text-[10px] ${
              isLight ? 'bg-slate-200/60 border-slate-300' : 'bg-white/5 border-white/10'
            }`}>
              <button
                onClick={() => setFilterMode('active')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  filterMode === 'active'
                    ? isLight ? 'bg-white text-indigo-700 shadow-xs' : 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Show only active kept pages (hide deleted)"
              >
                Active Only
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  filterMode === 'all'
                    ? isLight ? 'bg-white text-indigo-700 shadow-xs' : 'bg-indigo-600 text-white shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
                title="Show all pages including pruned"
              >
                All ({numPages})
              </button>
            </div>
          </div>

          {numPages - excludedPages.size === 0 && filterMode === 'active' ? (
            <div className="text-center py-12 text-xs">
              <Trash2 className="w-8 h-8 text-rose-500/60 mx-auto mb-2" />
              <p className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>All Pages Pruned</p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                All pages are saved safely in your Pruned History.
              </p>
              <button
                onClick={() => onChangeTab('excluded')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Open Pruned History
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: numPages }, (_, i) => i + 1)
                .filter((p) => filterMode === 'all' || !excludedPages.has(p))
                .map((p, idx) => {
                  const isExcluded = excludedPages.has(p);
                  const isCurrent = currentPage === p;
                  const hasBookmark = bookmarks.includes(p);
                  const pageTags = tags[p] || [];

                  return (
                    <div
                      key={p}
                      onClick={() => onSelectPage(p)}
                      className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all ${
                        isCurrent
                          ? isLight ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-md bg-white' : 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg bg-[#11151F]'
                          : isExcluded
                          ? isLight ? 'border-rose-200 opacity-55 bg-rose-50 hover:opacity-80' : 'border-rose-900/40 opacity-45 bg-rose-950/20 hover:opacity-75'
                          : isLight ? 'border-slate-200 hover:border-slate-300 bg-white shadow-xs' : 'border-white/10 hover:border-white/20 bg-[#11151F]/70'
                      }`}
                    >
                      {/* Thumbnail Image */}
                      <div className={`aspect-[3/4] flex items-center justify-center overflow-hidden relative ${
                        isLight ? 'bg-slate-100' : 'bg-[#0A0D14]'
                      }`}>
                        {thumbnails[p] ? (
                          <img
                            src={thumbnails[p]}
                            alt={`Page ${p}`}
                            className={`w-full h-full object-contain ${isExcluded ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <div className={`text-xs font-mono animate-pulse ${isLight ? 'text-slate-400' : 'text-slate-700'}`}>
                            Loading...
                          </div>
                        )}

                        {/* Excluded Overlay Badge */}
                        {isExcluded && (
                          <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 text-center backdrop-blur-[1px] ${
                            isLight ? 'bg-rose-50/80' : 'bg-rose-950/70'
                          }`}>
                            <Trash2 className={`w-5 h-5 mb-1 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                              Pruned
                            </span>
                          </div>
                        )}

                        {/* Bookmark indicator */}
                        {hasBookmark && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-0.5 rounded shadow">
                            <Bookmark className="w-3 h-3 fill-current" />
                          </div>
                        )}

                        {/* Hover Toggle Prune Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExcludePage(p);
                          }}
                          className={`absolute top-1 right-1 p-1 rounded-md transition-opacity shadow-md cursor-pointer ${
                            isExcluded
                              ? 'bg-emerald-600 text-white opacity-100 hover:bg-emerald-500'
                              : 'bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-500'
                          }`}
                          title={isExcluded ? 'Restore Page' : 'Prune this Page'}
                        >
                          {isExcluded ? (
                            <RotateCcw className="w-3 h-3" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Card Footer */}
                      <div className={`px-2 py-1 flex items-center justify-between text-[11px] ${
                        isLight ? 'bg-slate-50 border-t border-slate-100' : 'bg-[#0A0D14]'
                      }`}>
                        <span className={`font-mono font-medium ${isCurrent ? 'text-indigo-600 font-semibold' : isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                          {filterMode === 'active' ? `Deck #${idx + 1}` : `p. ${p}`}
                        </span>

                        {pageTags.length > 0 ? (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            #{pageTags[0]}
                          </span>
                        ) : filterMode === 'active' ? (
                          <span className="text-[10px] text-slate-500 font-mono">
                            p.{p}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pruned History & Safety Bin with Batch Select / Invert */}
      {activeTab === 'excluded' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className={`p-3 rounded-xl border text-xs ${
            isLight
              ? 'bg-rose-50/80 border-rose-200 text-rose-800'
              : 'bg-rose-950/20 border-rose-900/30 text-rose-300'
          }`}>
            <div className={`flex items-center gap-1.5 font-semibold mb-1 ${isLight ? 'text-rose-900' : 'text-rose-200'}`}>
              <ShieldAlert className={`w-4 h-4 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
              <span>Pruned History & Safety Bin</span>
            </div>
            <p className={`text-[11px] leading-relaxed mb-2.5 ${isLight ? 'text-rose-700' : 'text-rose-300/80'}`}>
              Pages deleted from the active deck are safely preserved here. Select pages to restore them individually or in bulk.
            </p>

            {excludedPages.size > 0 && (
              <div className="space-y-2">
                {/* Batch Action Toolbar */}
                <div className={`flex items-center justify-between gap-1 p-1.5 rounded-lg border text-[11px] ${
                  isLight ? 'bg-white border-rose-200 text-slate-700' : 'bg-[#11151F] border-white/10 text-slate-300'
                }`}>
                  <button
                    onClick={handleSelectAllPruned}
                    className="px-1.5 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    title="Select all pruned pages"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Select All</span>
                  </button>

                  <button
                    onClick={handleInvertPrunedSelection}
                    className="px-1.5 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    title="Invert current selection"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-500" />
                    <span>Revert Selection</span>
                  </button>

                  {selectedPruned.size > 0 && (
                    <button
                      onClick={handleClearPrunedSelection}
                      className="px-1.5 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Clear selection"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Restore Buttons */}
                <div className="flex items-center gap-1.5">
                  {selectedPruned.size > 0 ? (
                    <button
                      onClick={handleRestoreSelectedPruned}
                      className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Selected ({selectedPruned.size})
                    </button>
                  ) : null}

                  <button
                    onClick={onRestoreAllPruned}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      selectedPruned.size > 0
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                        : 'flex-1 bg-rose-600 hover:bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-600/30'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore All ({excludedPages.size})
                  </button>
                </div>
              </div>
            )}
          </div>

          {excludedPages.size === 0 ? (
            <div className="text-center py-12 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>History Empty</p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                No pages have been pruned yet. Delete pages from the viewer to remove them from your active deck.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(excludedPages).sort((a, b) => a - b).map((p) => {
                const currentReason: PruneReason = pruneReasons[p] || 'other';
                const isChecked = selectedPruned.has(p);

                return (
                  <div
                    key={p}
                    onClick={() => handleToggleSelectPruned(p)}
                    className={`p-2.5 rounded-xl border text-xs space-y-2 transition-all cursor-pointer ${
                      isChecked
                        ? isLight
                          ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400'
                          : 'bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30'
                        : isLight
                        ? 'bg-white border-slate-200 text-slate-800 shadow-xs hover:border-slate-300'
                        : 'bg-[#11151F] border-white/10 text-slate-200 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />

                        {/* Thumbnail snippet if available */}
                        {thumbnails[p] ? (
                          <img
                            src={thumbnails[p]}
                            alt={`Preview page ${p}`}
                            className="w-8 h-10 object-contain rounded border border-white/10 bg-slate-900/40"
                          />
                        ) : (
                          <span className={`w-8 h-10 rounded flex items-center justify-center font-mono text-[11px] border ${
                            isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#171C29] text-slate-300 border-white/10'
                          }`}>
                            {p}
                          </span>
                        )}

                        <div>
                          <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                            Page {p}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Pruned from deck
                          </span>
                        </div>
                      </div>

                      {/* Direct Single Restore Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExcludePage(p);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                          isLight
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
                            : 'bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/40 text-emerald-300'
                        }`}
                        title="Restore this page back into the active PDF deck"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                    </div>

                    {/* Prune Reason Selector */}
                    {onUpdatePruneReason && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className={`flex items-center gap-1.5 pt-1.5 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}
                      >
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Reason:</span>
                        <select
                          value={currentReason}
                          onChange={(e) => onUpdatePruneReason(p, e.target.value as PruneReason)}
                          className={`text-[10px] rounded px-1.5 py-0.5 outline-none border focus:border-indigo-500 ${
                            isLight
                              ? 'bg-slate-50 text-slate-800 border-slate-200'
                              : 'bg-[#171C29] text-slate-300 border-white/10'
                          }`}
                        >
                          {Object.entries(PRUNE_REASONS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Version History & Snapshots (§17.4 & §17.7) */}
      {activeTab === 'timeline' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Quick link to Pruned History */}
          {excludedPages.size > 0 && (
            <div 
              onClick={() => onChangeTab('excluded')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                isLight ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100' : 'bg-rose-950/30 border-rose-900/40 text-rose-300 hover:bg-rose-950/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="font-semibold block">{excludedPages.size} Deleted / Pruned Pages</span>
                  <span className="text-[10px] opacity-75">Click to view, batch select & restore</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          )}

          <div className={`flex items-center justify-between text-xs px-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Timeline Snapshots</span>
            <span className="text-[11px]">{snapshots.length} saved</span>
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-xs">
              <History className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-indigo-400' : 'text-indigo-500/40'}`} />
              <p className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>No Snapshots Yet</p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                Save a checkpoint before batch operations to revert anytime.
              </p>
            </div>
          ) : (
            <div className={`space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 ${
              isLight ? 'before:bg-slate-200' : 'before:bg-white/10'
            }`}>
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="relative pl-6 group text-xs"
                >
                  <div className={`absolute left-1.5 top-2 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 group-hover:scale-125 transition-transform ${
                    isLight ? 'bg-white' : 'bg-[#0A0D14]'
                  }`} />

                  <div className={`p-2.5 rounded-xl border transition-colors ${
                    isLight ? 'bg-white border-slate-200 hover:border-indigo-400 shadow-xs' : 'bg-[#11151F] border-white/10 hover:border-indigo-500/40'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          {snap.name}
                        </span>
                        {snap.isAuto && (
                          <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                            isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            Auto
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {snap.description && (
                      <p className={`text-[11px] mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {snap.description}
                      </p>
                    )}

                    <div className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                      isLight ? 'border-slate-100 text-slate-500' : 'border-white/10 text-slate-500'
                    }`}>
                      <span>{snap.excludedPages.length} Pruned Pages</span>
                      <button
                        onClick={() => onRollbackSnapshot(snap.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          isLight ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' : 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300'
                        }`}
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Rollback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audio Memos */}
      {activeTab === 'audio' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className={`flex items-center justify-between text-xs px-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Voice Memos</span>
            <span className="text-[11px]">{audioMemos.length} memos</span>
          </div>

          {audioMemos.length === 0 ? (
            <div className="text-center py-12 text-xs">
              <Mic className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-rose-400' : 'text-rose-500/40'}`} />
              <p className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>No Voice Memos</p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                Click "Voice Memo" in the toolbar to record verbal notes for any page.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {audioMemos.map((memo) => (
                <div
                  key={memo.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200 text-slate-800 shadow-xs' : 'bg-[#11151F] border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleTogglePlayAudio(memo)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        playingAudioId === memo.id
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isLight ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                      }`}
                    >
                      {playingAudioId === memo.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        {memo.title || `Voice Note (Page ${memo.pageNumber})`}
                      </div>
                      <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        Page {memo.pageNumber} • {memo.durationSeconds}s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectPage(memo.pageNumber)}
                      className={`p-1 rounded ${isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'}`}
                      title="Jump to Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAudioMemo(memo.id)}
                      className={`p-1 rounded ${isLight ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600' : 'hover:bg-rose-500/20 text-slate-500 hover:text-rose-400'}`}
                      title="Delete Memo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Bookmarks & Study Tags */}
      {activeTab === 'bookmarks' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <span className={`text-xs font-semibold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Bookmarked Pages
            </span>
            {bookmarks.length === 0 ? (
              <p className={`text-[11px] italic ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>No pages bookmarked yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {bookmarks.map((p) => (
                  <button
                    key={p}
                    onClick={() => onSelectPage(p)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs cursor-pointer border ${
                      isLight
                        ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    <Bookmark className="w-3 h-3 fill-current" /> Page {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`border-t pt-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <span className={`text-xs font-semibold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Add Tag to Page {currentPage}
            </span>
            <form onSubmit={handleCreateTag} className="flex gap-1.5 mb-3">
              <input
                type="text"
                placeholder="e.g. Formula, HighYield"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className={`flex-1 rounded-lg px-2.5 py-1 text-xs outline-none border focus:border-indigo-500 ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-[#11151F] border-white/15 text-white placeholder-slate-500'
                }`}
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Tag
              </button>
            </form>

            <span className={`text-xs font-semibold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              All Study Tags
            </span>
            <div className="space-y-1.5">
              {Object.entries(tags).map(([pStr, pageTags]) => {
                const pNum = Number(pStr);
                return pageTags.map((t) => (
                  <div
                    key={`${pNum}-${t}`}
                    onClick={() => onSelectPage(pNum)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-xs'
                        : 'bg-[#11151F] border-white/10 hover:border-indigo-400 text-slate-200'
                    }`}
                  >
                    <span className="text-indigo-600 font-mono font-medium">#{t}</span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Page {pNum}</span>
                  </div>
                ));
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
