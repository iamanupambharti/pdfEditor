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
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  fileName,
  numPages,
  excludedPages,
  onExportCleanPDF,
  onExportProjectBundle,
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                Export Options
              </h3>
              <p className="text-xs text-slate-400">
                Generate clean exam PDF or save .fdeck bundle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Document:</span>
              <span className="font-medium text-slate-200 truncate max-w-[200px]">{fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pages to Keep:</span>
              <span className="font-bold text-emerald-400">{active} of {total} pages</span>
            </div>
            {pruned > 0 && (
              <div className="flex items-center justify-between text-rose-400">
                <span>Pruned Pages Omitted:</span>
                <span>{pruned} pages removed</span>
              </div>
            )}
          </div>

          {/* Option 1: Clean Study PDF */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Recommended: Clean Exam Study PDF</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Creates a standard, lightweight PDF with excluded pages completely removed and your annotations, highlighters, and notes permanently baked in. Ready to print or view on iPad/tablets.
            </p>
            <button
              onClick={handleExportPDF}
              disabled={isExporting || active === 0}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <FileCheck className="w-4 h-4" />
              {isExporting ? 'Generating Clean PDF...' : `Export Clean PDF (${active} Pages)`}
            </button>
          </div>

          {/* Option 2: Project Bundle */}
          <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <Package className="w-4 h-4 text-indigo-400" />
              <span>FocusDeck Project Bundle (.fdeck)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Saves full raw PDF along with all annotations, snapshots, voice memos, tags, and bookmarks for complete re-editing. Opens on any device.
            </p>
            <button
              onClick={handleExportBundle}
              disabled={isExporting}
              className="w-full py-1.5 px-3 rounded-lg bg-[#171C29] hover:bg-[#1E2536] text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-white/10 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Save .fdeck Project Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
