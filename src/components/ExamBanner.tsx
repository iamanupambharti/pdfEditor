import React, { useState } from 'react';
import { 
  Brain, 
  Trash2, 
  SlidersHorizontal, 
  Clock,
  TrendingDown,
  Calendar
} from 'lucide-react';

interface ExamBannerProps {
  numPages: number;
  excludedPages: Set<number>;
  minutesSavedPerPage?: number;
  examDate?: string | null;
  onBatchPrune: (start: number, end: number) => void;
  onRestoreAllPruned: () => void;
  onOpenSnapshotModal: () => void;
  onOpenSidebarToTab: (tab: 'thumbnails' | 'excluded' | 'timeline') => void;
  theme?: 'dark' | 'light';
}

export const ExamBanner: React.FC<ExamBannerProps> = ({
  numPages,
  excludedPages,
  minutesSavedPerPage = 3,
  examDate,
  onBatchPrune,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [showRangeDialog, setShowRangeDialog] = useState(false);
  const [rangeStart, setRangeStart] = useState('1');
  const [rangeEnd, setRangeEnd] = useState('1');

  if (numPages === 0) return null;

  const total = numPages;
  const pruned = excludedPages.size;
  const active = total - pruned;
  const percentSaved = total > 0 ? Math.round((pruned / total) * 100) : 0;
  const estimatedMinutesSaved = pruned * minutesSavedPerPage;

  const formatSavedTime = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins} min`;
  };

  const getDaysToExam = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysToGo = getDaysToExam(examDate);

  const handleApplyBatchPrune = () => {
    const s = parseInt(rangeStart, 10);
    const e = parseInt(rangeEnd, 10);
    if (!isNaN(s) && !isNaN(e) && s >= 1 && e <= numPages && s <= e) {
      onBatchPrune(s, e);
      setShowRangeDialog(false);
    }
  };

  return (
    <div className={`border-b px-3.5 py-1.5 flex flex-wrap items-center justify-between text-xs gap-2 shadow-xs transition-colors ${
      isLight 
        ? 'bg-[#F7F7F5] border-slate-200 text-slate-700' 
        : 'bg-[#0A0D14] border-white/[0.08] text-slate-300'
    }`}>
      {/* Mind Burden Relief Indicator (§17.2) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold">
          <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-white font-medium">{active} pages to master</span>
          <span className="text-slate-500 text-[11px]">of {total}</span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          {pruned > 0 ? (
            <div className="flex items-center gap-3 text-[11px]">
              {/* Pruned count */}
              <span className="flex items-center gap-1 text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
                {pruned} pruned
              </span>

              {/* Time saved */}
              <span className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                ≈ {formatSavedTime(estimatedMinutesSaved)} saved
              </span>

              {/* Burden reduction with mini progress bar */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>{percentSaved}% less burden</span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentSaved}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <span className="text-slate-500 text-[11px] italic">
              Tip: Prune non-examinable pages to reduce revision burden
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Helpers */}
      <div className="flex items-center gap-2">
        {daysToGo !== null && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{daysToGo} days to exam</span>
          </div>
        )}

        {/* Batch Prune Range Popover */}
        <div className="relative">
          <button
            onClick={() => setShowRangeDialog(!showRangeDialog)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-[#171C29] text-slate-300 hover:text-white border border-white/[0.08] text-xs transition-colors cursor-pointer"
            title="Prune multiple pages at once (Ctrl+Shift+D)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Batch Prune</span>
          </button>

          {showRangeDialog && (
            <div className="absolute right-0 top-8 z-50 w-72 bg-[#171C29] border border-white/10 rounded-2xl p-4 shadow-2xl text-slate-200">
              <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Batch Prune Pages
              </h4>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Enter page range to exclude from your exam deck (e.g. historical appendix or heavy proofs):
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">From Page</label>
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">To Page</label>
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRangeDialog(false)}
                  className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchPrune}
                  className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
                >
                  Prune Range
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
