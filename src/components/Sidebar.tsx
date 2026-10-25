import React, { useState, useEffect, useRef } from 'react';
import type { Snapshot, AudioMemo, PruneReason } from '../types/document';
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

const PRUNE_REASON_LABELS: Record<PruneReason, string> = {
  mastered: 'Already mastered',
  syllabus: 'Out of syllabus',
  low_yield: 'Low-yield proof',
  other: 'Other reason',
};

const WAVE_PATH = 'M3 14v4 M8 11v10 M13 8v16 M18 12v8 M23 6v20 M28 10v12 M33 13v6 M38 4v24 M43 9v14 M48 12v8 M53 7v18 M58 11v10 M63 14v4 M68 5v22 M73 10v12 M78 13v6 M83 8v16 M88 11v10 M93 15v2 M98 9v14 M103 12v8 M108 6v20 M113 13v6 M118 10v12 M123 14v4 M128 8v16 M133 12v8 M138 15v2';

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
  onAddTagToPage,
  onUpdatePruneReason,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showNewTagField, setShowNewTagField] = useState(false);
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<PruneReason | null>(null);

  // Progressive thumbnail rendering
  const thumbnailsRef = useRef<Record<number, string>>({});
  useEffect(() => {
    thumbnailsRef.current = thumbnails;
  }, [thumbnails]);

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;
    let isMounted = true;

    const renderBatch = async () => {
      for (let p = 1; p <= numPages; p++) {
        if (!isMounted) break;
        if (!thumbnailsRef.current[p]) {
          try {
            const url = await PDFService.renderThumbnail(pdfDoc, p, 114);
            if (isMounted) {
              setThumbnails((prev) => ({ ...prev, [p]: url }));
            }
          } catch (e) {
            console.error('Thumb render error', p, e);
          }
        }
      }
    };
    renderBatch();
    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages]);

  // Audio Playback
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

  const handleCreateTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    onAddTagToPage(currentPage, clean);
    setNewTagInput('');
    setShowNewTagField(false);
  };

  const binCount = excludedPages.size;
  const activeCount = numPages - binCount;

  // Tab definitions matching the exact SVGs in FocusDeck Workspace
  const tabDefs = [
    {
      id: 'thumbnails' as SidebarTab,
      label: 'Thumbnails',
      d: 'M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M15 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M15 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z M4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z',
      badge: false,
      count: 0
    },
    {
      id: 'excluded' as SidebarTab,
      label: 'Safety Bin',
      d: 'M3 4h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M4 8v11a2 2 0 0 0 2 2h2 M20 8v11a2 2 0 0 1-2 2h-2 M9 15l3-3 3 3 M12 12v9',
      badge: binCount > 0,
      count: binCount
    },
    {
      id: 'timeline' as SidebarTab,
      label: 'Timeline & Snapshots',
      d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5 M12 7v5l4 2',
      badge: snapshots.length > 0,
      count: snapshots.length
    },
    {
      id: 'bookmarks' as SidebarTab,
      label: 'Tags & Bookmarks',
      d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z M7.5 7.5h.01',
      badge: false,
      count: 0
    },
    {
      id: 'audio' as SidebarTab,
      label: 'Voice Memos',
      d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3',
      badge: audioMemos.length > 0,
      count: audioMemos.length
    }
  ];

  const titles: Record<SidebarTab, [string, string]> = {
    thumbnails: ['Pages', `${numPages} total · ${activeCount} active`],
    excluded: ['Safety Bin', `${binCount} pruned`],
    timeline: ['Timeline', `${snapshots.length} checkpoints`],
    bookmarks: ['Tags & Bookmarks', `${Object.keys(tags).length} tags · ${bookmarks.length} saved`],
    audio: ['Voice Memos', `${audioMemos.length} memos`]
  };

  // Tag aggregation
  const allTagsMap: Record<string, number> = {};
  Object.values(tags).forEach((tagList) => {
    tagList.forEach((t) => {
      allTagsMap[t] = (allTagsMap[t] || 0) + 1;
    });
  });

  // Pages to display in thumbnails
  let displayedPages = Array.from({ length: numPages }, (_, i) => i + 1);
  if (selectedTagFilter) {
    displayedPages = displayedPages.filter((p) => tags[p]?.includes(selectedTagFilter));
  }

  // Pruned pages
  const prunedList = Array.from(excludedPages).sort((a, b) => a - b);
  const filteredPrunedList = selectedReasonFilter
    ? prunedList.filter((p) => (pruneReasons[p] || 'other') === selectedReasonFilter)
    : prunedList;

  // Reason breakdown counts
  const reasonCounts: Record<PruneReason, number> = {
    mastered: 0,
    syllabus: 0,
    low_yield: 0,
    other: 0,
  };
  prunedList.forEach((p) => {
    const r = pruneReasons[p] || 'other';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  return (
    <div 
      className="flex-none select-none transition-all duration-200"
      style={{
        width: isCollapsed ? '48px' : '320px',
        height: '100%',
        display: 'flex',
        background: '#131315',
        color: '#F1EFEA',
        borderRight: '1px solid rgba(255,255,255,.08)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Left Icon Rail (48px fixed) */}
      <nav 
        role="tablist" 
        aria-label="Sidebar sections" 
        aria-orientation="vertical"
        style={{
          width: '48px',
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          padding: '12px 0',
          boxSizing: 'border-box',
          background: '#0B0B0D',
          borderRight: isCollapsed ? 'none' : '1px solid rgba(255,255,255,.08)',
        }}
      >
        {tabDefs.map((t) => {
          const isSelected = activeTab === t.id && !isCollapsed;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isSelected}
              aria-label={t.label}
              onClick={() => {
                onChangeTab(t.id);
                if (isCollapsed) setIsCollapsed(false);
              }}
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                padding: 0,
                border: 0,
                background: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                flex: 'none',
              }}
              data-tip={t.label}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
                <rect width="36" height="36" rx="8" fill={isSelected ? 'rgba(241,239,234,.14)' : 'none'} />
                <rect x="0" y="10" width="2" height="16" rx="1" fill={isSelected ? '#F1EFEA' : 'none'} />
                <svg 
                  x="10" 
                  y="10" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={isSelected ? '#F1EFEA' : '#A3A09A'} 
                  strokeWidth="1.75" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d={t.d} />
                </svg>
              </svg>
              {t.badge && (
                <span 
                  className="mono" 
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-4px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 3px',
                    boxSizing: 'border-box',
                    borderRadius: '8px',
                    background: '#E11D48',
                    color: '#fff',
                    font: "600 10px/16px 'Geist Mono',monospace",
                    textAlign: 'center'
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Collapse / Expand Toggle Button */}
        <button
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setIsCollapsed((prev) => !prev)}
          data-tip={isCollapsed ? 'Expand sidebar · Ctrl \\' : 'Collapse sidebar · Ctrl \\'}
          style={{
            width: '36px',
            height: '36px',
            padding: 0,
            border: 0,
            background: 'none',
            borderRadius: '8px',
            color: '#98A0B6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M9 3v18" />
          </svg>
        </button>
      </nav>

      {/* Right Drawer Panel (visible when expanded) */}
      {!isCollapsed && (
        <section 
          role="tabpanel" 
          aria-label={titles[activeTab][0]}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {/* Drawer Header */}
          <header 
            style={{
              height: '56px',
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ font: "400 21px/1 'Instrument Serif',Georgia,serif", letterSpacing: '-.005em', color: '#F1EFEA' }}>
              {titles[activeTab][0]}
            </span>
            <span style={{ font: "500 11px/1 'Geist Mono',monospace", color: '#A3A09A' }}>
              {titles[activeTab][1]}
            </span>
          </header>

          <div 
            style={{
              flex: 1,
              minHeight: 0,
              padding: '0 16px 16px',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            {/* TAB 1: THUMBNAILS */}
            {activeTab === 'thumbnails' && (
              <div>
                <div style={{ fontSize: '11px', color: '#A3A09A', margin: '-2px 0 12px' }}>
                  Click to open · Hover to prune
                </div>
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    columnGap: '12px',
                    rowGap: '10px'
                  }}
                >
                  {displayedPages.map((n) => {
                    const isPruned = excludedPages.has(n);
                    const isActive = n === currentPage;
                    const isBm = bookmarks.includes(n);
                    const pageTags = tags[n] || [];
                    const thumbUrl = thumbnails[n];

                    return (
                      <div key={n} className="cursor-pointer" onClick={() => onSelectPage(n)}>
                        <div 
                          style={{
                            position: 'relative',
                            width: '114px',
                            height: '148px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#fff',
                            boxShadow: '0 2px 6px rgba(0,0,0,.15)'
                          }}
                        >
                          {/* Live Rendered Canvas or Skeleton SVG */}
                          {thumbUrl ? (
                            <img 
                              src={thumbUrl} 
                              alt={`Page ${n}`}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <svg width="114" height="148" viewBox="0 0 114 148" aria-hidden="true">
                              <rect x="10" y="12" width="52" height="5" rx="1" fill="#0E1220" opacity=".85" />
                              <rect x="10" y="24" width="94" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="31" width="94" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="38" width="88" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="45" width="94" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="52" width="60" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="66" width="94" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="73" width="90" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="80" width="94" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="87" width="70" height="3" rx="1.5" fill="#D3D6DF" />
                              <rect x="10" y="108" width="94" height="3" rx="1.5" fill="#D3D6DF" />
                            </svg>
                          )}

                          {/* Pruned Diagonal Hatch Shield */}
                          {isPruned && (
                            <div 
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'repeating-linear-gradient(135deg,rgba(225,29,72,.34) 0 6px,rgba(225,29,72,.5) 6px 12px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <span 
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: '#0B0B0D',
                                  color: '#FDA4AF',
                                  font: "600 9px/1 'Geist',sans-serif",
                                  letterSpacing: '.14em'
                                }}
                              >
                                PRUNED
                              </span>
                            </div>
                          )}

                          {/* Bookmark Ribbon */}
                          {isBm && (
                            <svg width="14" height="20" viewBox="0 0 14 20" style={{ position: 'absolute', right: '8px', top: 0 }} aria-label="Bookmarked" role="img">
                              <path d="M0 0h14v20l-7-5-7 5z" fill="#F59E0B" />
                            </svg>
                          )}

                          {/* Active Ring - 2px Bone Ring per ui.md §6 */}
                          <svg width="114" height="148" viewBox="0 0 114 148" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden="true">
                            <rect 
                              x="1" 
                              y="1" 
                              width="112" 
                              height="146" 
                              rx="7" 
                              fill="none" 
                              stroke={isActive ? '#F1EFEA' : 'rgba(255,255,255,.1)'} 
                              strokeWidth={isActive ? 2 : 1} 
                            />
                          </svg>
                        </div>

                        {/* Page label and tag pills below thumbnail */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '20px', marginTop: '6px' }}>
                          <span 
                            className="mono" 
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: 500, 
                              color: isActive ? '#F1EFEA' : '#A3A09A' 
                            }}
                          >
                            {(n < 10 ? '0' : '') + n}
                          </span>
                          {pageTags[0] && (
                            <span 
                              style={{
                                padding: '3px 6px',
                                borderRadius: '4px',
                                background: 'rgba(245,158,11,.14)',
                                color: '#FBBF24',
                                font: "500 10px/1 'Geist',sans-serif"
                              }}
                            >
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

            {/* TAB 2: SAFETY BIN */}
            {activeTab === 'excluded' && (
              <div>
                <button 
                  onClick={onRestoreAllPruned}
                  disabled={binCount === 0}
                  style={{
                    width: '100%',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '10px',
                    border: '1px solid rgba(52,211,153,.4)',
                    background: 'rgba(52,211,153,.08)',
                    color: '#6EE7B7',
                    font: "500 13px/1 'Geist',sans-serif",
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Restore all {binCount} pages
                </button>

                {/* Reason filter pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '14px 0 12px' }}>
                  {(['mastered', 'syllabus', 'low_yield', 'other'] as PruneReason[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedReasonFilter(selectedReasonFilter === r ? null : r)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: selectedReasonFilter === r ? 'rgba(241,239,234,.14)' : 'rgba(255,255,255,.05)',
                        border: selectedReasonFilter === r ? '1px solid #F1EFEA' : '1px solid transparent',
                        font: "500 11px/1 'Geist',sans-serif",
                        color: selectedReasonFilter === r ? '#F1EFEA' : '#A3A09A',
                        cursor: 'pointer'
                      }}
                    >
                      {PRUNE_REASON_LABELS[r]} <span className="mono" style={{ color: '#A3A09A', marginLeft: '4px' }}>{reasonCounts[r]}</span>
                    </button>
                  ))}
                </div>

                {/* Pruned List Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredPrunedList.length === 0 ? (
                    <div className="text-xs text-[#A3A09A] py-8 text-center italic font-serif" style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '13px' }}>
                      No pruned pages in this category.
                    </div>
                  ) : (
                    filteredPrunedList.map((p) => {
                      const reason = pruneReasons[p] || 'other';
                      return (
                        <div 
                          key={p} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px',
                            borderRadius: '10px',
                            background: '#1A1A1D',
                            border: '1px solid rgba(255,255,255,.08)'
                          }}
                        >
                          {/* Mini Thumbnail with rose tint */}
                          <svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true">
                            <rect width="32" height="42" rx="4" fill="#fff" />
                            <rect x="5" y="6" width="14" height="2" fill="#0E1220" />
                            <rect x="5" y="13" width="22" height="2" fill="#D3D6DF" />
                            <rect x="5" y="19" width="22" height="2" fill="#D3D6DF" />
                            <rect x="5" y="25" width="16" height="2" fill="#D3D6DF" />
                            <rect width="32" height="42" rx="4" fill="rgba(225,29,72,.4)" />
                          </svg>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ font: "500 13px/1.2 'Geist',sans-serif" }}>Page {p}</div>
                            {onUpdatePruneReason ? (
                              <select
                                value={reason}
                                onChange={(e) => onUpdatePruneReason(p, e.target.value as PruneReason)}
                                className="bg-transparent text-[11px] text-[#98A0B6] border-none outline-none cursor-pointer p-0 mt-1"
                              >
                                <option value="mastered">Already mastered</option>
                                <option value="syllabus">Out of syllabus</option>
                                <option value="low_yield">Low-yield proof</option>
                                <option value="other">Other reason</option>
                              </select>
                            ) : (
                              <div style={{ marginTop: '4px', fontSize: '11px', color: '#98A0B6' }}>
                                {PRUNE_REASON_LABELS[reason]}
                              </div>
                            )}
                          </div>

                          <button 
                            aria-label={`Restore page ${p}`}
                            onClick={() => onToggleExcludePage(p)}
                            style={{
                              width: '28px',
                              height: '28px',
                              padding: 0,
                              borderRadius: '8px',
                              border: '1px solid rgba(52,211,153,.4)',
                              background: 'none',
                              color: '#6EE7B7',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                            </svg>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TIMELINE */}
            {activeTab === 'timeline' && (
              <div>
                <div style={{ position: 'relative', marginTop: '4px', paddingLeft: '20px' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '8px', bottom: '8px', width: '1px', background: 'rgba(255,255,255,.12)' }} />

                  {/* Current Live State */}
                  <div style={{ position: 'relative', marginBottom: '12px', padding: '12px', borderRadius: '12px', background: '#1A1A1D', border: '1px solid rgba(255,255,255,.08)' }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" style={{ position: 'absolute', left: '-20px', top: '16px' }} aria-hidden="true">
                      <circle cx="5.5" cy="5.5" r="4.5" fill="#F1EFEA" stroke="#131315" strokeWidth="2" />
                    </svg>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ font: "500 13px/1.2 'Geist',sans-serif" }}>Current workspace</span>
                      <span style={{ padding: '3px 6px', borderRadius: '4px', background: 'rgba(241,239,234,.14)', color: '#F1EFEA', font: "600 9px/1 'Geist',sans-serif", letterSpacing: '.1em' }}>LIVE</span>
                    </div>
                    <div className="mono" style={{ marginTop: '4px', font: "400 11px/1 'Geist Mono',monospace", color: '#A3A09A' }}>Now</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', font: "500 11px/1 'Geist Mono',monospace", color: '#F1EFEA' }}>
                      <span>{activeCount} kept</span>
                      <span style={{ color: '#FDA4AF' }}>{binCount} pruned</span>
                    </div>
                  </div>

                  {/* Saved Snapshots */}
                  {snapshots.map((snap) => (
                    <div 
                      key={snap.id}
                      style={{
                        position: 'relative',
                        marginBottom: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#1A1A1D',
                        border: '1px solid rgba(255,255,255,.08)'
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" style={{ position: 'absolute', left: '-20px', top: '16px' }} aria-hidden="true">
                        <circle cx="5.5" cy="5.5" r="4.5" fill="#A3A09A" stroke="#131315" strokeWidth="2" />
                      </svg>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ font: "500 13px/1.2 'Geist',sans-serif" }}>{snap.name}</span>
                      </div>
                      <div className="mono" style={{ marginTop: '4px', font: "400 11px/1 'Geist Mono',monospace", color: '#A3A09A' }}>
                        {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', font: "500 11px/1 'Geist Mono',monospace", color: '#F1EFEA' }}>
                        <span>{numPages - (snap.excludedPages?.length || 0)} kept</span>
                        <span style={{ color: '#FDA4AF' }}>{snap.excludedPages?.length || 0} pruned</span>
                      </div>
                      {snap.description && (
                        <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: 1.45, color: '#A3A09A' }}>
                          {snap.description}
                        </div>
                      )}
                      <button 
                        onClick={() => onRollbackSnapshot(snap.id)}
                        style={{
                          marginTop: '10px',
                          height: '28px',
                          padding: '0 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '8px',
                          border: '1px solid rgba(251,113,133,.45)',
                          background: 'rgba(251,113,133,.08)',
                          color: '#FDA4AF',
                          font: "500 12px/1 'Geist',sans-serif",
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        Rollback
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', lineHeight: 1.5, color: '#98A0B6' }}>
                  Rollback restores previous annotations and page exclusions safely.
                </div>
              </div>
            )}

            {/* TAB 4: TAGS & BOOKMARKS */}
            {activeTab === 'bookmarks' && (
              <div>
                <div className="lbl" style={{ font: "500 10px/1 'Geist',sans-serif", letterSpacing: '.08em', textTransform: 'uppercase', color: '#98A0B6', marginBottom: '10px' }}>
                  Quick tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['HighYield', 'Formula', 'ExamDoubt'].map((tagName) => {
                    const isSelected = selectedTagFilter === tagName;
                    const count = allTagsMap[tagName] || 0;
                    return (
                      <button
                        key={tagName}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTagFilter(isSelected ? null : tagName)}
                        style={{
                          height: '30px',
                          padding: '0 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid rgba(245,158,11,.55)' : '1px solid rgba(255,255,255,.14)',
                          background: isSelected ? 'rgba(245,158,11,.14)' : 'none',
                          color: isSelected ? '#FBBF24' : '#E8EAF2',
                          font: "500 12px/1 'Geist',sans-serif",
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                        #{tagName}
                        <span className="mono" style={{ font: "500 11px/1 'Geist Mono',monospace", color: isSelected ? '#E8EAF2' : '#98A0B6' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  <button 
                    onClick={() => setShowNewTagField((prev) => !prev)}
                    style={{
                      height: '30px',
                      padding: '0 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      border: '1px dashed rgba(255,255,255,.2)',
                      background: 'none',
                      color: '#98A0B6',
                      font: "500 12px/1 'Geist',sans-serif",
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14 M12 5v14" />
                    </svg>
                    New tag
                  </button>
                </div>

                {showNewTagField && (
                  <form onSubmit={handleCreateTagSubmit} className="mt-2.5 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BarQuestion"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="flex-1 h-8 rounded px-2.5 bg-[#171C29] border border-white/10 text-white text-xs outline-none focus:border-[#818CF8]"
                    />
                    <button type="submit" className="btn primary text-xs px-3 h-8">Add</button>
                  </form>
                )}

                {selectedTagFilter && (
                  <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', fontSize: '12px', lineHeight: 1.45, color: '#E8EAF2' }}>
                    Showing <span className="mono" style={{ color: '#FBBF24' }}>{displayedPages.length}</span> of {numPages} pages tagged #{selectedTagFilter}. <span style={{ color: '#98A0B6' }}>Click tag again to clear.</span>
                  </div>
                )}

                <div style={{ font: "500 10px/1 'Geist',sans-serif", letterSpacing: '.08em', textTransform: 'uppercase', color: '#98A0B6', margin: '22px 0 10px' }}>
                  Bookmarks
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bookmarks.length === 0 ? (
                    <div className="text-xs text-[#98A0B6] py-3 text-center">No bookmarked pages yet. Press B to bookmark.</div>
                  ) : (
                    bookmarks.map((bmPage) => (
                      <div 
                        key={bmPage} 
                        onClick={() => onSelectPage(bmPage)}
                        className="cursor-pointer hover:border-white/20 transition-all"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#171C29',
                          border: '1px solid rgba(255,255,255,.08)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span style={{ flex: 1, minWidth: 0, font: "500 12.5px/1.3 'Geist',sans-serif" }}>
                          Page {bmPage}
                        </span>
                        <span className="mono" style={{ font: "500 11px/1 'Geist Mono',monospace", color: '#98A0B6' }}>
                          p.{bmPage}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: VOICE MEMOS */}
            {activeTab === 'audio' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {audioMemos.length === 0 ? (
                    <div className="text-xs text-[#98A0B6] py-8 text-center">
                      No voice memos recorded yet. Use the Mic tool on any page to record spoken summaries.
                    </div>
                  ) : (
                    audioMemos.map((memo) => {
                      const isPlaying = playingAudioId === memo.id;
                      return (
                        <div 
                          key={memo.id}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            background: '#1A1A1D',
                            border: '1px solid rgba(255,255,255,.08)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ font: "500 13px/1.25 'Geist',sans-serif", color: '#F1EFEA' }}>{memo.title || 'Revision Memo'}</span>
                            <button 
                              onClick={() => onSelectPage(memo.pageNumber)}
                              style={{
                                height: '22px',
                                padding: '0 7px',
                                borderRadius: '5px',
                                border: '1px solid rgba(255,255,255,.14)',
                                background: 'none',
                                color: '#A3A09A',
                                font: "500 10.5px/1 'Geist Mono',monospace",
                                cursor: 'pointer'
                              }}
                            >
                              p.{memo.pageNumber}
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <button 
                              onClick={() => handleTogglePlayAudio(memo)}
                              aria-label={`Play ${memo.title}`}
                              style={{
                                width: '32px',
                                height: '32px',
                                padding: 0,
                                flex: 'none',
                                borderRadius: '50%',
                                border: 0,
                                background: '#F1EFEA',
                                color: '#151513',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 120ms ease, background-color 120ms ease'
                              }}
                            >
                              {isPlaying ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                  <rect x="6" y="4" width="4" height="16" />
                                  <rect x="14" y="4" width="4" height="16" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                  <path d="M6 3l14 9-14 9z" />
                                </svg>
                              )}
                            </button>

                            {/* Audio Waveform SVG */}
                            <div style={{ position: 'relative', flex: 1, minWidth: 0, height: '32px' }}>
                              <svg width="100%" height="32" viewBox="0 0 141 32" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
                                <path d={WAVE_PATH} stroke="rgba(255,255,255,.22)" strokeWidth="2" strokeLinecap="round" fill="none" />
                              </svg>
                              {isPlaying && (
                                <div style={{ position: 'absolute', left: 0, top: 0, width: '60%', height: '32px', overflow: 'hidden' }}>
                                  <svg width="263" height="32" viewBox="0 0 141 32" preserveAspectRatio="none" style={{ display: 'block' }} aria-hidden="true">
                                    <path d={WAVE_PATH} stroke="#F1EFEA" strokeWidth="2" strokeLinecap="round" fill="none" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', font: "400 10.5px/1 'Geist Mono',monospace", color: '#98A0B6' }}>
                            <span>{isPlaying ? 'Playing...' : '0:00'}</span>
                            <span>{Math.floor(memo.durationSeconds / 60)}:{(memo.durationSeconds % 60 < 10 ? '0' : '') + (memo.durationSeconds % 60)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
