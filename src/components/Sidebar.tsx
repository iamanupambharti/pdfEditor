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
  ExternalLink
} from 'lucide-react';
import { PDFService } from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';

export type SidebarTab = 'thumbnails' | 'excluded' | 'timeline' | 'bookmarks' | 'audio';

interface SidebarProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  numPages: number;
  currentPage: number;
  excludedPages: Set<number>;
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
  onRollbackSnapshot: (snapshotId: string) => void;
  onDeleteAudioMemo: (memoId: string) => void;
  onAddTagToPage: (page: number, tag: string) => void;
  onUpdatePruneReason?: (page: number, reason: PruneReason) => void;
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
  onRollbackSnapshot,
  onDeleteAudioMemo,
  onAddTagToPage,
  onUpdatePruneReason,
}) => {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

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
      <div className="w-12 bg-[#0A0D14] border-r border-white/[0.08] flex flex-col items-center py-3 select-none z-30">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors mb-4"
          title="Expand Sidebar (Ctrl+\)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('thumbnails'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'thumbnails' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}
            title="Thumbnails"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('excluded'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'excluded' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}
            title={`Safety Bin (${excludedPages.size} pruned)`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('timeline'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}
            title="Version History & Snapshots"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('audio'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'audio' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}
            title="Voice Memos"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsCollapsed(false); onChangeTab('bookmarks'); }}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'bookmarks' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}
            title="Bookmarks & Tags"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-[#0A0D14] border-r border-white/[0.08] flex flex-col select-none z-30 h-full backdrop-blur-md">
      {/* Sidebar Top Nav Tabs (§17.4) */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-2 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeTab('thumbnails')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'thumbnails'
                ? 'bg-[#171C29] text-indigo-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
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
                ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Safety Bin (Pruned Pages)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px]">Bin ({excludedPages.size})</span>
          </button>

          <button
            onClick={() => onChangeTab('timeline')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#171C29] text-indigo-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Snapshots & Rollback"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">History</span>
          </button>

          <button
            onClick={() => onChangeTab('audio')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'audio'
                ? 'bg-[#171C29] text-rose-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Voice Memos"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <button
            onClick={() => onChangeTab('bookmarks')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-[#171C29] text-amber-300 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
            title="Bookmarks & Study Tags"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors"
          title="Collapse Sidebar (Ctrl+\)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Thumbnails Grid */}
      {activeTab === 'thumbnails' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mb-1">
            <span>{numPages - excludedPages.size} of {numPages} Active Pages</span>
            <span>Click to Jump</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
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
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg bg-[#11151F]'
                      : isExcluded
                      ? 'border-rose-900/40 opacity-45 bg-rose-950/20 hover:opacity-75'
                      : 'border-white/10 hover:border-white/20 bg-[#11151F]/70'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="aspect-[3/4] bg-[#0A0D14] flex items-center justify-center overflow-hidden relative">
                    {thumbnails[p] ? (
                      <img
                        src={thumbnails[p]}
                        alt={`Page ${p}`}
                        className={`w-full h-full object-contain ${isExcluded ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <div className="text-slate-700 text-xs font-mono animate-pulse">
                        Loading...
                      </div>
                    )}

                    {/* Excluded Overlay Badge */}
                    {isExcluded && (
                      <div className="absolute inset-0 bg-rose-950/70 flex flex-col items-center justify-center p-2 text-center backdrop-blur-[1px]">
                        <Trash2 className="w-5 h-5 text-rose-400 mb-1" />
                        <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
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
                      className={`absolute top-1 right-1 p-1 rounded-md transition-opacity shadow-md ${
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
                  <div className="px-2 py-1 bg-[#0A0D14] flex items-center justify-between text-[11px]">
                    <span className={`font-mono font-medium ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`}>
                      p. {p}
                    </span>

                    {pageTags.length > 0 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        #{pageTags[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Safety Bin with Prune Reasons (§17.4 and §18.2 P2) */}
      {activeTab === 'excluded' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-rose-200 mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Pruned Safety Bin</span>
            </div>
            <p className="text-[11px] text-rose-300/80 leading-relaxed mb-2">
              Pruned pages are removed from your active study deck and clean exports, but are 100% safe here.
            </p>
            {excludedPages.size > 0 && (
              <button
                onClick={onRestoreAllPruned}
                className="w-full py-1.5 px-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 rounded-lg text-rose-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore All {excludedPages.size} Pages
              </button>
            )}
          </div>

          {excludedPages.size === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <p className="font-medium text-slate-400">Safety Bin Empty</p>
              <p className="text-[11px] text-slate-600 mt-1">
                No pages have been pruned yet. Press Delete on any page to cut clutter.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(excludedPages).sort((a, b) => a - b).map((p) => {
                const currentReason: PruneReason = pruneReasons[p] || 'other';

                return (
                  <div
                    key={p}
                    className="p-2.5 rounded-xl bg-[#11151F] border border-white/10 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#171C29] flex items-center justify-center font-mono text-slate-300 text-[11px]">
                          {p}
                        </span>
                        <span className="font-medium text-slate-200">Page {p}</span>
                      </div>
                      <button
                        onClick={() => onToggleExcludePage(p)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                    </div>

                    {/* Prune Reason Selector */}
                    {onUpdatePruneReason && (
                      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-400">Reason:</span>
                        <select
                          value={currentReason}
                          onChange={(e) => onUpdatePruneReason(p, e.target.value as PruneReason)}
                          className="bg-[#171C29] text-[10px] text-slate-300 border border-white/10 rounded px-1.5 py-0.5 outline-none focus:border-indigo-500"
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
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300">Timeline Snapshots</span>
            <span className="text-[11px]">{snapshots.length} saved</span>
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <History className="w-8 h-8 text-indigo-500/40 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No Snapshots Yet</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Save a checkpoint before batch operations to revert anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="relative pl-6 group text-xs"
                >
                  <div className="absolute left-1.5 top-2 w-3.5 h-3.5 rounded-full bg-[#0A0D14] border-2 border-indigo-500 group-hover:scale-125 transition-transform" />

                  <div className="p-2.5 rounded-xl bg-[#11151F] border border-white/10 hover:border-indigo-500/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">
                          {snap.name}
                        </span>
                        {snap.isAuto && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Auto
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {snap.description && (
                      <p className="text-[11px] text-slate-400 mb-2">
                        {snap.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-500">
                      <span>{snap.excludedPages.length} Pruned Pages</span>
                      <button
                        onClick={() => onRollbackSnapshot(snap.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300">Voice Memos</span>
            <span className="text-[11px]">{audioMemos.length} memos</span>
          </div>

          {audioMemos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Mic className="w-8 h-8 text-rose-500/40 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No Voice Memos</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Click "Voice Memo" in the toolbar to record verbal notes for any page.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {audioMemos.map((memo) => (
                <div
                  key={memo.id}
                  className="p-2.5 rounded-xl bg-[#11151F] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleTogglePlayAudio(memo)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        playingAudioId === memo.id
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                      }`}
                    >
                      {playingAudioId === memo.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="font-medium text-slate-200">
                        {memo.title || `Voice Note (Page ${memo.pageNumber})`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Page {memo.pageNumber} • {memo.durationSeconds}s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectPage(memo.pageNumber)}
                      className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200"
                      title="Jump to Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAudioMemo(memo.id)}
                      className="p-1 hover:bg-rose-500/20 rounded text-slate-500 hover:text-rose-400"
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
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Bookmarked Pages
            </span>
            {bookmarks.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No pages bookmarked yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {bookmarks.map((p) => (
                  <button
                    key={p}
                    onClick={() => onSelectPage(p)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Bookmark className="w-3 h-3 fill-current" /> Page {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-3">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Add Tag to Page {currentPage}
            </span>
            <form onSubmit={handleCreateTag} className="flex gap-1.5 mb-3">
              <input
                type="text"
                placeholder="e.g. Formula, HighYield"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 bg-[#11151F] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Tag
              </button>
            </form>

            <span className="text-xs font-semibold text-slate-300 block mb-2">
              All Study Tags
            </span>
            <div className="space-y-1.5">
              {Object.entries(tags).map(([pStr, pageTags]) => {
                const pNum = Number(pStr);
                return pageTags.map((t) => (
                  <div
                    key={`${pNum}-${t}`}
                    onClick={() => onSelectPage(pNum)}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-[#11151F] border border-white/10 text-xs hover:border-indigo-400 cursor-pointer"
                  >
                    <span className="text-indigo-400 font-mono">#{t}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Page {pNum}</span>
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
