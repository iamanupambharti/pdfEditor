import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileCheck, 
  Package, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  numPages: number;
  excludedPages: Set<number>;
  onExportCleanPDF: () => Promise<void>;
  onExportProjectBundle: () => Promise<void>;
  theme?: 'dark' | 'light';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  fileName,
  numPages,
  excludedPages,
  onExportCleanPDF,
  onExportProjectBundle,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const total = numPages;
  const pruned = excludedPages.size;
  const active = total - pruned;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await onExportCleanPDF();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err: any) {
      alert(`Export failed: ${err?.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBundle = async () => {
    try {
      setIsExporting(true);
      await onExportProjectBundle();
      onClose();
    } catch (err: any) {
      alert(`Export bundle failed: ${err?.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className={`w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#11151F] border-white/10 text-slate-200'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600/20 text-emerald-400'}`}>
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Export Options
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Generate clean exam PDF or save .fdeck bundle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0D14] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Document:</span>
              <span className={`font-medium truncate max-w-[200px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Pages to Keep:</span>
              <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{active} of {total} pages</span>
            </div>
            {pruned > 0 && (
              <div className={`flex items-center justify-between ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                <span>Pruned Pages Omitted:</span>
                <span>{pruned} pages removed</span>
              </div>
            )}
          </div>

          {/* Option 1: Clean Study PDF */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight
              ? 'bg-indigo-50/60 border-indigo-200'
              : 'bg-gradient-to-br from-indigo-950/30 to-slate-950 border-indigo-500/30'
          }`}>
            <div className={`flex items-center gap-2 font-semibold text-xs ${isLight ? 'text-indigo-800' : 'text-indigo-300'}`}>
              <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <span>Recommended: Clean Exam Study PDF</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Creates a standard, lightweight PDF with excluded pages completely removed and your annotations, highlighters, and notes permanently baked in. Ready to print or view on iPad/tablets.
            </p>
            <button
              onClick={handleExportPDF}
              disabled={isExporting || active === 0}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              {isExporting ? 'Generating Clean PDF...' : `Export Clean PDF (${active} Pages)`}
            </button>
          </div>

          {/* Option 2: Project Bundle */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0D14] border-white/10'
          }`}>
            <div className={`flex items-center gap-2 font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              <Package className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <span>FocusDeck Project Bundle (.fdeck)</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Saves full raw PDF along with all annotations, snapshots, voice memos, tags, and bookmarks for complete re-editing. Opens on any device.
            </p>
            <button
              onClick={handleExportBundle}
              disabled={isExporting}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors border cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  : 'bg-[#171C29] hover:bg-[#1E2536] text-slate-200 border-white/10'
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Save .fdeck Project Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
