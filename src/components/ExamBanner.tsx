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
        ? 'bg-[#F7F7F5] border-slate-200 text-slate-800' 
        : 'bg-[#0A0D14] border-white/[0.08] text-slate-300'
    }`}>
      {/* Mind Burden Relief Indicator (§17.2) */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-semibold">
          <div className={`w-5 h-5 rounded flex items-center justify-center ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{active} pages to master</span>
          <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-[11px]`}>of {total}</span>
        </div>

        <div className={`h-4 w-px hidden sm:block ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />

        <div className="flex items-center gap-2.5 flex-wrap">
          {pruned > 0 ? (
            <div className="flex items-center gap-3 text-[11px] flex-wrap">
              {/* Pruned count */}
              <span className={`flex items-center gap-1 ${isLight ? 'text-rose-600 font-medium' : 'text-rose-400'}`}>
                <Trash2 className="w-3.5 h-3.5" />
                {pruned} pruned
              </span>

              {/* Time saved */}
              <span className={`flex items-center gap-1 ${isLight ? 'text-emerald-700 font-medium' : 'text-emerald-400'}`}>
                <Clock className="w-3.5 h-3.5" />
                ≈ {formatSavedTime(estimatedMinutesSaved)} saved
              </span>

              {/* Burden reduction with mini progress bar */}
              <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <TrendingDown className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                <span>{percentSaved}% less burden</span>
                <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentSaved}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-[11px] italic`}>
              Tip: Prune non-examinable pages to reduce revision burden
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Helpers */}
      <div className="flex items-center gap-2">
        {daysToGo !== null && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isLight
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}>
            <Calendar className={`w-3 h-3 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>{daysToGo} days to exam</span>
          </div>
        )}

        {/* Batch Prune Range Popover */}
        <div className="relative">
          <button
            onClick={() => setShowRangeDialog(!showRangeDialog)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer border ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300 shadow-xs'
                : 'bg-[#11151F] hover:bg-[#171C29] text-slate-300 hover:text-white border-white/[0.08]'
            }`}
            title="Prune multiple pages at once (Ctrl+Shift+D)"
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <span>Batch Prune</span>
          </button>

          {showRangeDialog && (
            <div className={`absolute right-0 top-8 z-50 w-72 rounded-2xl p-4 shadow-2xl border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#171C29] border-white/10 text-slate-200'
            }`}>
              <h4 className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Batch Prune Pages
              </h4>
              <p className={`text-[11px] mb-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Enter page range to exclude from your exam deck (e.g. historical appendix or heavy proofs):
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>From Page</label>
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className={`w-full rounded-lg px-2.5 py-1 text-xs outline-none border focus:border-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#11151F] border-white/15 text-white'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>To Page</label>
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className={`w-full rounded-lg px-2.5 py-1 text-xs outline-none border focus:border-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#11151F] border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-1 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <button
                  type="button"
                  onClick={() => setShowRangeDialog(false)}
                  className={`px-2.5 py-1 rounded text-xs ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
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
