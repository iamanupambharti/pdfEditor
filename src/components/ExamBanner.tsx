import React, { useState } from 'react';

interface ExamBannerProps {
  numPages: number;
  excludedPages: Set<number>;
  minutesSavedPerPage?: number;
  examDate?: string | null;
  onBatchPrune: (start: number, end: number) => void;
  onRestoreAllPruned: () => void;
  onOpenSnapshotModal?: () => void;
  onOpenSidebarToTab?: (tab: any) => void;
  theme?: 'dark' | 'light';
}

export const ExamBanner: React.FC<ExamBannerProps> = ({
  numPages,
  excludedPages,
  minutesSavedPerPage = 3,
  onBatchPrune,
  onRestoreAllPruned,
}) => {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [startPage, setStartPage] = useState('1');
  const [endPage, setEndPage] = useState(String(numPages || 1));

  if (numPages === 0) return null;

  const total = numPages;
  const prunedCount = excludedPages.size;
  const activeCount = total - prunedCount;
  const minutes = prunedCount * minutesSavedPerPage;
  const pct = total > 0 ? Math.round((prunedCount / total) * 100) : 0;

  // Split bar calculation: total width is 240px
  const barTotalWidth = 240;
  const keptRatio = total > 0 ? activeCount / total : 1;
  const keptW = Math.round(barTotalWidth * keptRatio);
  const prunedW = barTotalWidth - keptW;

  const handleApplyBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(startPage, 10);
    const end = parseInt(endPage, 10);
    if (!isNaN(s) && !isNaN(end) && s >= 1 && end <= numPages && s <= end) {
      onBatchPrune(s, end);
      setShowBatchModal(false);
    }
  };

  return (
    <>
      <section 
        aria-label="Study load summary" 
        className="h-12 flex-none select-none z-40"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '0 16px',
          background: '#131315',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        {/* Layers Icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DDD8CC" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
          <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </svg>

        {/* Live metric: Active pages to master */}
        <div aria-live="polite" className="flex items-baseline gap-1.5 text-[13px] text-[#F1EFEA]">
          <span className="mono text-[18px] font-semibold tracking-[-0.02em]">{activeCount}</span>
          <span className="font-medium">pages to master</span>
          <span className="text-[#A3A09A]">of {total}</span>
        </div>

        <span className="sep" />

        {/* Pruned chip */}
        <span className="chip" style={{ background: 'rgba(251,113,133,.12)', color: '#FDA4AF' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          <span className="mono">{prunedCount}</span> pruned
        </span>

        {/* Time saved chip */}
        <span className="chip" style={{ background: 'rgba(255,255,255,.05)', color: '#F1EFEA' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A3A09A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          ≈ <span className="mono">{minutes}</span> min saved
        </span>

        {/* Percentage lighter chip - bone fill, graphite text per ui.md §6 */}
        <span className="chip mono font-semibold" style={{ background: '#F1EFEA', color: '#151513' }}>
          {pct}% lighter
        </span>

        {/* Dual-segmented Progress Bar with hatch pattern for pruned and bone for kept */}
        <svg width="240" height="8" viewBox="0 0 240 8" role="img" aria-label="Kept versus pruned pages" className="ml-1">
          <defs>
            <pattern id="hatchbar" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="rgba(251,113,133,.16)" />
              <rect width="2" height="6" fill="rgba(251,113,133,.55)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="240" height="8" rx="4" fill="rgba(255,255,255,.06)" />
          {prunedW > 0 && (
            <rect x={keptW} y="0" width={prunedW} height="8" fill="url(#hatchbar)" />
          )}
          {keptW > 0 && (
            <rect x="0" y="0" width={keptW} height="8" rx="4" fill="#F1EFEA" />
          )}
        </svg>

        <div className="flex-1" />

        {/* Actions: Batch Prune & Restore All */}
        <button 
          className="btn" 
          onClick={() => {
            setStartPage('1');
            setEndPage(String(numPages));
            setShowBatchModal(true);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18 M3 12h12 M3 18h8" />
          </svg>
          Batch Prune
        </button>

        <button 
          className="btn restore-o" 
          onClick={onRestoreAllPruned}
          disabled={prunedCount === 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Restore All
        </button>
      </section>

      {/* Batch Prune Modal */}
      {showBatchModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,11,13,.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowBatchModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: '#1A1A1D',
              border: '1px solid rgba(255,255,255,.14)',
              color: '#F1EFEA'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="serif text-xl">Batch Prune Page Range</h3>
              <button 
                onClick={() => setShowBatchModal(false)}
                className="text-[#A3A09A] hover:text-[#F1EFEA]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#A3A09A] mb-4">
              Exclude non-examinable sections (proofs, appendices, historical context) in bulk.
            </p>
            <form onSubmit={handleApplyBatch}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1">
                  <label className="lbl block mb-1">From Page</label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    className="w-full h-9 rounded-lg px-3 bg-[#131315] border border-white/10 text-[#F1EFEA] font-mono text-sm focus:outline-none focus:border-[#DDD8CC]"
                  />
                </div>
                <span className="text-[#A3A09A] mt-4">to</span>
                <div className="flex-1">
                  <label className="lbl block mb-1">To Page</label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    className="w-full h-9 rounded-lg px-3 bg-[#131315] border border-white/10 text-[#F1EFEA] font-mono text-sm focus:outline-none focus:border-[#DDD8CC]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="btn ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn prune"
                >
                  Prune Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
