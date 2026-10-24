import React, { useRef, useEffect, useState } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { PDFService } from '../services/pdfService';
import { AnnotationCanvas } from './AnnotationCanvas';
import type { 
  ToolType, 
  ShapeType, 
  PageAnnotations, 
  AudioMemo,
  PaperTone
} from '../types/document';
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  RotateCcw, 
  Volume2
} from 'lucide-react';

interface PDFViewerProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  numPages: number;
  scale: number;
  excludedPages: Set<number>;
  bookmarks?: number[];
  activeTool: ToolType;
  selectedColor: string;
  strokeWidth: number;
  shapeType: ShapeType;
  annotations: Record<number, PageAnnotations>;
  audioMemos: AudioMemo[];
  paperTone: PaperTone;
  theme?: 'dark' | 'light';
  onUpdateAnnotations: (pageNumber: number, newAnnotations: PageAnnotations) => void;
  onPageChange: (pageNumber: number) => void;
  onToggleExcludeCurrentPage: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfDoc,
  currentPage,
  numPages,
  scale,
  excludedPages,
  bookmarks = [],
  activeTool,
  selectedColor,
  strokeWidth,
  shapeType,
  annotations,
  audioMemos,
  paperTone,
  theme = 'dark',
  onUpdateAnnotations,
  onPageChange,
  onToggleExcludeCurrentPage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 800 });
  const [jumpInput, setJumpInput] = useState(String(currentPage));

  const isExcluded = excludedPages.has(currentPage);
  const pageAnnotations = annotations[currentPage] || { strokes: [], shapes: [], textNotes: [] };
  const pageAudioMemos = audioMemos.filter((m) => m.pageNumber === currentPage);

  // Sync jump input with current page
  useEffect(() => {
    setJumpInput(String(currentPage));
  }, [currentPage]);

  // Handle direct page jump
  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= numPages) {
      onPageChange(target);
    } else {
      setJumpInput(String(currentPage));
    }
  };

  // Render current page when pdfDoc, currentPage, or scale changes
  useEffect(() => {
    if (!pdfDoc || currentPage < 1 || currentPage > numPages || !canvasRef.current) return;

    let isCancelled = false;

    const render = async () => {
      try {
        const result = await PDFService.renderPageToCanvas(
          pdfDoc,
          currentPage,
          canvasRef.current!,
          scale,
          `page-${currentPage}-${scale}`
        );

        if (!isCancelled) {
          setDimensions({ width: result.width, height: result.height });
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page rendering failed:', err);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, numPages]);

  // Keyboard navigation: Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentPage < numPages) {
          onPageChange(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) {
          onPageChange(currentPage - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, onPageChange]);

  // CSS filter applied to the PDF canvas only (annotations remain unfiltered)
  const getCanvasFilter = () => {
    if (paperTone === 'sepia') {
      return 'sepia(0.35) saturate(0.9) brightness(0.97)';
    }
    if (paperTone === 'night') {
      return 'invert(0.9) hue-rotate(180deg)';
    }
    return 'none';
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-auto flex flex-col items-center justify-start p-6 relative select-none transition-colors duration-300 ${
        paperTone === 'sepia' 
          ? 'bg-[#1A1612]' 
          : paperTone === 'night' 
          ? 'bg-[#0A0D14]' 
          : theme === 'light' 
          ? 'bg-[#EAEAE8]' 
          : 'bg-[#0A0D14]'
      }`}
    >
      {/* Floating Bottom Page Navigator Pill */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#11151F]/90 border border-white/10 shadow-2xl backdrop-blur-md text-xs text-slate-200">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Editable Jump-to-Page Input */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-400">Page</span>
          <input
            type="text"
            inputMode="numeric"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onBlur={handleJumpSubmit}
            className="w-10 text-center bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white font-semibold outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
            title="Type page number and press Enter"
          />
          <span className="text-slate-500">of</span>
          <span className="text-slate-400 font-semibold">{numPages}</span>
        </form>

        <button
          onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
          className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition-colors cursor-pointer"
          title="Next Page (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <button
          onClick={onToggleExcludeCurrentPage}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
            isExcluded
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'hover:bg-rose-500/10 hover:text-rose-400 text-slate-400'
          }`}
          title={isExcluded ? 'Restore Page into Deck (Delete)' : 'Prune Page from Deck (Delete)'}
        >
          {isExcluded ? <RotateCcw className="w-3 h-3 text-rose-400" /> : <Trash2 className="w-3 h-3" />}
          <span>{isExcluded ? 'Restore' : 'Prune'}</span>
        </button>
      </div>

      {/* Right Edge Vertical Minimap Strip (§17.5) */}
      {numPages > 1 && (
        <div 
          className="fixed right-2 top-28 bottom-20 z-30 w-3 bg-[#11151F]/80 rounded-full border border-white/10 py-1.5 px-0.5 flex flex-col justify-between items-center backdrop-blur-sm"
          title="Document Minimap: White=Active, Rose=Pruned, Amber=Bookmarked"
        >
          {Array.from({ length: Math.min(numPages, 48) }, (_, idx) => {
            const pageIndex = Math.round((idx / (Math.min(numPages, 48) - 1 || 1)) * (numPages - 1)) + 1;
            const pagePruned = excludedPages.has(pageIndex);
            const pageBookmarked = bookmarks.includes(pageIndex);
            const isCurrent = pageIndex === currentPage;

            return (
              <button
                key={idx}
                onClick={() => onPageChange(pageIndex)}
                className={`w-2 h-1.5 rounded-[1px] transition-all cursor-pointer ${
                  isCurrent 
                    ? 'w-2.5 h-2 bg-indigo-400 ring-1 ring-white'
                    : pageBookmarked
                    ? 'bg-amber-400'
                    : pagePruned
                    ? 'bg-rose-500/80'
                    : 'bg-white/40 hover:bg-white/80'
                }`}
                title={`Jump to Page ${pageIndex}${pagePruned ? ' (Pruned)' : ''}${pageBookmarked ? ' (Bookmarked)' : ''}`}
              />
            );
          })}
        </div>
      )}

      {/* Main Page Canvas Stage */}
      <div 
        className={`relative shadow-2xl transition-all duration-200 rounded-sm overflow-hidden bg-white ${
          isExcluded ? 'ring-4 ring-rose-500/60 opacity-60' : 'ring-1 ring-white/10'
        }`}
        style={{
          width: dimensions.width > 0 ? `${dimensions.width}px` : 'auto',
          height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
        }}
      >
        {/* PDF Underlay Canvas with Paper Tone filter */}
        <canvas 
          ref={canvasRef} 
          className="block"
          style={{ filter: getCanvasFilter() }}
        />

        {/* Interactive Annotation Canvas Overlay */}
        {dimensions.width > 0 && dimensions.height > 0 && (
          <AnnotationCanvas
            pageNumber={currentPage}
            width={dimensions.width}
            height={dimensions.height}
            scale={scale}
            activeTool={activeTool}
            selectedColor={selectedColor}
            strokeWidth={strokeWidth}
            shapeType={shapeType}
            annotations={pageAnnotations}
            onUpdateAnnotations={onUpdateAnnotations}
          />
        )}

        {/* Pruned Status Watermark Banner if page is excluded */}
        {isExcluded && (
          <div className="absolute top-4 right-4 z-30 pointer-events-none bg-rose-950/90 border border-rose-500 text-rose-300 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pruned from Exam Deck
            </span>
          </div>
        )}

        {/* Audio Memos Badges on Page */}
        {pageAudioMemos.map((memo) => (
          <div
            key={memo.id}
            className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[#11151F]/90 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-full shadow-lg text-xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-[11px] font-medium">{memo.title || 'Voice Memo'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
