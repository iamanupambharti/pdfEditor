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
  activePages: number[];
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
  onChangeScale: (newScale: number) => void;
  onFitWidth?: () => void;
  onFitPage?: () => void;
  onRestoreAllPruned?: () => void;
  onOpenPrunedHistory?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfDoc,
  currentPage,
  activePages,
  scale,
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
  onChangeScale,
  onRestoreAllPruned,
  onOpenPrunedHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unscaledDimensions = useRef<{ width: number; height: number }>({ width: 595.28, height: 841.89 });
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  // Current position in the active deck (0-based)
  const activeDeckIndex = activePages.indexOf(currentPage);
  const [jumpInput, setJumpInput] = useState(String(activeDeckIndex >= 0 ? activeDeckIndex + 1 : 1));

  // Panning & Navigation States
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  // Keep live scale ref for event listeners
  const scaleRef = useRef<number>(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const pageAnnotations = annotations[currentPage] || { strokes: [], shapes: [], textNotes: [] };
  const pageAudioMemos = audioMemos.filter((m) => m.pageNumber === currentPage);

  // Sync jump input with current active deck index
  useEffect(() => {
    const idx = activePages.indexOf(currentPage);
    setJumpInput(String(idx >= 0 ? idx + 1 : 1));
  }, [currentPage, activePages]);

  // Handle direct page jump by active deck index
  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= activePages.length) {
      onPageChange(activePages[target - 1]);
    } else {
      const idx = activePages.indexOf(currentPage);
      setJumpInput(String(idx >= 0 ? idx + 1 : 1));
    }
  };

  // Debounced High-DPI PDF.js Rendering
  useEffect(() => {
    if (!pdfDoc || activePages.length === 0 || !activePages.includes(currentPage) || !canvasRef.current) return;

    let isCancelled = false;

    // Immediately update layout dimensions based on unscaled page size
    if (unscaledDimensions.current.width > 0 && unscaledDimensions.current.height > 0) {
      setDimensions({
        width: Math.round(unscaledDimensions.current.width * scale),
        height: Math.round(unscaledDimensions.current.height * scale),
      });
    }

    const renderTimer = setTimeout(async () => {
      try {
        const result = await PDFService.renderPageToCanvas(
          pdfDoc,
          currentPage,
          canvasRef.current!,
          scale,
          `page-${currentPage}-${scale}`
        );

        if (!isCancelled) {
          unscaledDimensions.current = {
            width: result.unscaledWidth,
            height: result.unscaledHeight,
          };
          setDimensions({ width: result.width, height: result.height });
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page rendering failed:', err);
        }
      }
    }, 80);

    return () => {
      isCancelled = true;
      clearTimeout(renderTimer);
    };
  }, [pdfDoc, currentPage, scale, activePages]);

  // Keyboard navigation: Left/Right arrows through active pages & Spacebar tracking for Pan Hand mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        const idx = activePages.indexOf(currentPage);
        if (idx >= 0 && idx < activePages.length - 1) {
          onPageChange(activePages[idx + 1]);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        const idx = activePages.indexOf(currentPage);
        if (idx > 0) {
          onPageChange(activePages[idx - 1]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentPage, activePages, onPageChange]);

  // Wheel Handler: Smooth Ctrl + Wheel / Trackpad Pinch Zoom (Cursor Anchored) & Shift + Wheel horizontal scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Prevent Electron / browser native window zoom
        e.preventDefault();
        e.stopPropagation();

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Content coordinate under pointer before zoom
        const contentX = container.scrollLeft + mouseX;
        const contentY = container.scrollTop + mouseY;

        // Smooth exponential zoom scaling
        const zoomSensitivity = 0.002;
        const factor = Math.exp(-e.deltaY * zoomSensitivity);
        const currentScale = scaleRef.current;
        const targetScale = Math.min(4.0, Math.max(0.25, Number((currentScale * factor).toFixed(3))));

        if (targetScale === currentScale) return;

        // Focal point anchoring formula
        const ratio = targetScale / currentScale;
        const targetScrollLeft = contentX * ratio - mouseX;
        const targetScrollTop = contentY * ratio - mouseY;

        onChangeScale(targetScale);

        // Adjust scroll position to maintain focal point
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollLeft = targetScrollLeft;
            containerRef.current.scrollTop = targetScrollTop;
          }
        });
      } else if (e.shiftKey) {
        // Shift + Wheel = Smooth horizontal scrolling
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [onChangeScale]);

  // Pointer Panning: Middle-Click Drag, Spacebar + Click Drag, or Hand Tool
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;
    const canPan = isMiddleClick || (isLeftClick && (activeTool === 'hand' || isSpacePressed));

    if (canPan && containerRef.current) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture fallback
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning || !panStartRef.current || !containerRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Released
      }
    }
  };

  // Determine active cursor style
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (isSpacePressed || activeTool === 'hand') return 'grab';
    if (activeTool === 'select') return 'default';
    if (activeTool === 'eraser') return 'crosshair';
    if (activeTool === 'text') return 'text';
    return 'crosshair';
  };

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

  const isPanToolActive = isPanning || isSpacePressed || activeTool === 'hand';

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`flex-1 overflow-auto relative select-none overscroll-contain transition-colors duration-300 ${
        paperTone === 'sepia' 
          ? 'bg-[#1A1612]' 
          : paperTone === 'night' 
          ? 'bg-[#0A0D14]' 
          : theme === 'light' 
          ? 'bg-[#EAEAE8]' 
          : 'bg-[#0A0D14]'
      }`}
      style={{
        cursor: getCursorStyle(),
      }}
    >
      {/* Empty State when ALL pages have been pruned */}
      {activePages.length === 0 ? (
        <div className="min-w-full min-h-full flex items-center justify-center p-8">
          <div className={`p-8 rounded-2xl border max-w-md text-center backdrop-blur-md shadow-2xl ${
            theme === 'light'
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-[#11151F]/95 border-white/10 text-slate-200'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">All Pages Pruned into History</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Every page has been removed from your active PDF view. Your original pages and annotations are 100% safe in the Pruned History section.
            </p>
            <div className="flex items-center justify-center gap-3">
              {onRestoreAllPruned && (
                <button
                  onClick={onRestoreAllPruned}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Restore All Pages
                </button>
              )}
              {onOpenPrunedHistory && (
                <button
                  onClick={onOpenPrunedHistory}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-medium cursor-pointer transition-all"
                >
                  Open History
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Floating Bottom Page Navigator Pill */}
          <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md text-xs transition-colors pointer-events-auto ${
            theme === 'light'
              ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/50'
              : 'bg-[#11151F]/90 border-white/10 text-slate-200'
          }`}>
            <button
              onClick={() => onPageChange(activePages[activeDeckIndex - 1])}
              disabled={activeDeckIndex <= 0}
              className={`p-1 rounded-full disabled:opacity-30 transition-colors cursor-pointer ${
                theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300'
              }`}
              title="Previous Active Page (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Editable Jump-to-Page Input */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Page</span>
              <input
                type="text"
                inputMode="numeric"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                onBlur={handleJumpSubmit}
                className={`w-10 text-center rounded px-1 py-0.5 font-semibold outline-none border transition-all ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-indigo-600 focus:bg-white'
                    : 'bg-white/10 border-white/20 text-white focus:border-indigo-400 focus:bg-white/15'
                }`}
                title="Type deck page number and press Enter"
              />
              <span className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'}>of</span>
              <span className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                {activePages.length}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline ml-0.5">
                (Doc p.{currentPage})
              </span>
            </form>

            <button
              onClick={() => onPageChange(activePages[activeDeckIndex + 1])}
              disabled={activeDeckIndex >= activePages.length - 1}
              className={`p-1 rounded-full disabled:opacity-30 transition-colors cursor-pointer ${
                theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300'
              }`}
              title="Next Active Page (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className={`h-4 w-px mx-1 ${theme === 'light' ? 'bg-slate-300' : 'bg-white/10'}`} />

            {/* Delete / Prune Button */}
            <button
              onClick={onToggleExcludeCurrentPage}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                theme === 'light'
                  ? 'hover:bg-rose-50 hover:text-rose-600 text-slate-600'
                  : 'hover:bg-rose-500/20 hover:text-rose-400 text-slate-400'
              }`}
              title="Prune & remove page from active view (Saved in History)"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Prune Page</span>
            </button>
          </div>

          {/* Right Edge Vertical Minimap Strip */}
          {activePages.length > 1 && (
            <div 
              className={`fixed right-2 top-28 bottom-20 z-30 w-3 rounded-full border py-1.5 px-0.5 flex flex-col justify-between items-center backdrop-blur-sm transition-colors pointer-events-auto ${
                theme === 'light'
                  ? 'bg-slate-200/90 border-slate-300'
                  : 'bg-[#11151F]/80 border-white/10'
              }`}
              title="Document Minimap (Active pages)"
            >
              {Array.from({ length: Math.min(activePages.length, 48) }, (_, idx) => {
                const mappedIndex = Math.round((idx / (Math.min(activePages.length, 48) - 1 || 1)) * (activePages.length - 1));
                const pageIndex = activePages[mappedIndex];
                const pageBookmarked = bookmarks.includes(pageIndex);
                const isCurrent = pageIndex === currentPage;

                return (
                  <button
                    key={idx}
                    onClick={() => onPageChange(pageIndex)}
                    className={`w-2 h-1.5 rounded-[1px] transition-all cursor-pointer ${
                      isCurrent 
                        ? 'w-2.5 h-2 bg-indigo-600 ring-1 ring-indigo-400'
                        : pageBookmarked
                        ? 'bg-amber-500'
                        : theme === 'light'
                        ? 'bg-slate-400/70 hover:bg-slate-600'
                        : 'bg-white/40 hover:bg-white/80'
                    }`}
                    title={`Jump to Deck Page ${mappedIndex + 1} (Doc p.${pageIndex})${pageBookmarked ? ' (Bookmarked)' : ''}`}
                  />
                );
              })}
            </div>
          )}

          {/* Viewport Content Wrapper with Safe Centering */}
          <div className="min-w-full min-h-full flex items-center justify-center p-8 sm:p-12 box-border">
            {/* Main Page Canvas Stage */}
            <div 
              className="relative m-auto shadow-2xl transition-shadow duration-200 rounded-sm overflow-hidden bg-white select-none ring-1 ring-white/10"
              style={{
                width: dimensions.width > 0 ? `${dimensions.width}px` : 'auto',
                height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
              }}
            >
              {/* PDF Underlay Canvas with Paper Tone filter */}
              <canvas 
                ref={canvasRef} 
                className="block"
                style={{ 
                  filter: getCanvasFilter(),
                  width: dimensions.width > 0 ? `${dimensions.width}px` : 'auto',
                  height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
                }}
              />

              {/* Interactive Annotation Canvas Overlay */}
              {dimensions.width > 0 && dimensions.height > 0 && (
                <div className={isPanToolActive ? 'pointer-events-none' : 'pointer-events-auto'}>
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
        </>
      )}
    </div>
  );
};
