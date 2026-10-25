import React, { useRef, useEffect, useState } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { AnnotationCanvas } from './AnnotationCanvas';
import type { 
  ToolType, 
  ShapeType, 
  PageAnnotations, 
  AudioMemo,
  PaperTone
} from '../types/document';

interface PDFViewerProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  numPages: number;
  activePages?: number[];
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
  onUpdateAnnotations,
  onPageChange,
  onToggleExcludeCurrentPage,
  onChangeScale,
  onFitWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unscaledDimensions = useRef<{ width: number; height: number }>({ width: 595.28, height: 841.89 });
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  const [jumpInput, setJumpInput] = useState(String(currentPage));

  // Panning States
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const scaleRef = useRef<number>(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const pageAnnotations = annotations[currentPage] || { strokes: [], shapes: [], textNotes: [] };
  const pageAudioMemos = audioMemos.filter((m) => m.pageNumber === currentPage);
  const isPruned = excludedPages.has(currentPage);

  useEffect(() => {
    setJumpInput(String(currentPage));
  }, [currentPage]);

  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= numPages) {
      onPageChange(target);
    } else {
      setJumpInput(String(currentPage));
    }
  };

  // Render PDF Canvas with High-DPI Scaling
  useEffect(() => {
    if (!pdfDoc || currentPage < 1 || currentPage > numPages) return;
    let isCancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewportUnscaled = page.getViewport({ scale: 1.0 });
        unscaledDimensions.current = {
          width: viewportUnscaled.width,
          height: viewportUnscaled.height,
        };

        const targetViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(targetViewport.width * dpr);
        canvas.height = Math.floor(targetViewport.height * dpr);
        canvas.style.width = `${Math.floor(targetViewport.width)}px`;
        canvas.style.height = `${Math.floor(targetViewport.height)}px`;

        setDimensions({
          width: Math.floor(targetViewport.width),
          height: Math.floor(targetViewport.height),
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        await (page.render({
          canvasContext: ctx,
          viewport: targetViewport,
        } as any)).promise;
      } catch (err) {
        console.error('Error rendering PDF page in viewer:', err);
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, numPages]);

  // Keyboard navigation Left/Right
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
        if (currentPage < numPages) {
          onPageChange(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) {
          onPageChange(currentPage - 1);
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
  }, [currentPage, numPages, onPageChange]);

  // Pointer panning handler
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
      } catch {}
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
      } catch {}
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const nextScale = Math.min(Math.max(parseFloat((scale + delta).toFixed(2)), 0.4), 3.0);
      onChangeScale(nextScale);
    }
  };

  const getCanvasFilter = () => {
    if (paperTone === 'sepia') {
      return 'sepia(0.35) saturate(0.9) brightness(0.97)';
    }
    if (paperTone === 'night') {
      return 'invert(0.9) hue-rotate(180deg)';
    }
    return 'none';
  };

  const isPanActive = isPanning || isSpacePressed || activeTool === 'hand';

  return (
    <main 
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Document viewport"
      className="flex-1 min-w-0 relative overflow-auto select-none"
      style={{
        background: '#0B0B0D',
        cursor: isPanning ? 'grabbing' : isPanActive ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair'
      }}
    >
      {/* Central PDF Page Container */}
      <div className="min-w-full min-h-full flex items-center justify-center p-8 sm:p-12 box-border">
        <article 
          aria-label={`Page ${currentPage} of ${numPages}`}
          style={{
            position: 'relative',
            width: dimensions.width > 0 ? `${dimensions.width}px` : '560px',
            minHeight: dimensions.height > 0 ? `${dimensions.height}px` : '728px',
            background: '#fff',
            borderRadius: '3px',
            boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 16px 40px rgba(0,0,0,.5)',
            color: '#0E1220'
          }}
        >
          {/* Base PDF Canvas Layer */}
          <canvas 
            ref={canvasRef}
            className="block"
            style={{
              filter: getCanvasFilter(),
              width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
              height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto'
            }}
          />

          {/* Annotation Layer */}
          {dimensions.width > 0 && dimensions.height > 0 && !isPruned && (
            <div className={isPanActive ? 'pointer-events-none' : 'pointer-events-auto'}>
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

          {/* Spatial Audio Pins */}
          {pageAudioMemos.map((memo, idx) => (
            <div 
              key={memo.id}
              style={{
                position: 'absolute',
                left: `${40 + idx * 80}px`,
                top: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '26px',
                padding: '0 10px 0 8px',
                borderRadius: '13px',
                background: '#EEF0FF',
                border: '1px solid #C7D2FE',
                color: '#3730A3',
                boxShadow: '0 2px 8px rgba(14,18,32,.12)',
                zIndex: 20
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <path d="M12 19v3" />
              </svg>
              <span className="mono" style={{ fontSize: '10.5px', fontWeight: 500 }}>
                {Math.floor(memo.durationSeconds / 60)}:{(memo.durationSeconds % 60 < 10 ? '0' : '') + (memo.durationSeconds % 60)}
              </span>
            </div>
          ))}

          {/* Prune Shield Overlay (matches FocusDeck Workspace exact specification) */}
          {isPruned && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '3px',
                overflow: 'hidden',
                background: 'repeating-linear-gradient(135deg,rgba(225,29,72,.12) 0 12px,rgba(225,29,72,.24) 12px 24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30
              }}
            >
              <div 
                role="alert" 
                style={{
                  width: '300px',
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'rgba(11,11,13,.95)',
                  border: '1px solid rgba(255,255,255,.14)',
                  boxShadow: '0 16px 40px rgba(0,0,0,.45)',
                  textAlign: 'center',
                  fontFamily: "'Geist',sans-serif"
                }}
              >
                <span className="chip" style={{ background: 'rgba(251,113,133,.14)', color: '#FDA4AF' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Pruned
                </span>
                <div style={{ margin: '14px 0 6px', font: "400 24px/1.1 'Instrument Serif',Georgia,serif", color: '#F1EFEA' }}>
                  Page {currentPage} is out of your deck
                </div>
                <div style={{ marginBottom: '18px', fontSize: '12px', lineHeight: 1.5, color: '#A3A09A' }}>
                  It will not appear in your export. Restore it any time.
                </div>
                <button 
                  className="btn restore" 
                  onClick={onToggleExcludeCurrentPage}
                  style={{ height: '36px', padding: '0 18px' }}
                >
                  Quick Restore
                </button>
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Right-Edge Vertical Minimap Scrubber */}
      {numPages > 1 && (
        <div 
          role="img" 
          aria-label={`Document map: ${numPages} pages, ${excludedPages.size} pruned, current page ${currentPage}`}
          style={{
            position: 'fixed',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '10px',
            zIndex: 35
          }}
        >
          {Array.from({ length: Math.min(numPages, 36) }, (_, idx) => {
            const pageNum = Math.round((idx / (Math.min(numPages, 36) - 1 || 1)) * (numPages - 1)) + 1;
            const isCur = pageNum === currentPage;
            const isPr = excludedPages.has(pageNum);
            const isBm = bookmarks.includes(pageNum);

            let segClass = 'seg keep';
            if (isCur) segClass = 'seg cur';
            else if (isPr) segClass = 'seg pr';
            else if (isBm) segClass = 'seg bm';

            return (
              <div 
                key={idx}
                className={segClass}
                onClick={() => onPageChange(pageNum)}
                style={{ cursor: 'pointer' }}
                title={`Page ${pageNum}${isPr ? ' (Pruned)' : ''}${isBm ? ' (Bookmarked)' : ''}`}
              />
            );
          })}
        </div>
      )}

      {/* Floating Bottom Pagination Pill per ui.md §5 & §6 */}
      <nav 
        aria-label="Page navigation" 
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '16px',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          height: '40px',
          padding: '0 8px',
          borderRadius: '20px',
          background: 'rgba(26,26,29,.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.14)',
          boxShadow: '0 16px 40px rgba(0,0,0,.45)',
          zIndex: 40
        }}
      >
        <button 
          className="btn ic ghost" 
          aria-label="Previous page" 
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ borderRadius: '50%' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <span style={{ fontSize: '12px', color: '#A3A09A', paddingLeft: '4px' }}>Page</span>

        <form onSubmit={handleJumpSubmit} className="inline">
          <input 
            className="pageinput" 
            type="text" 
            inputMode="numeric" 
            value={jumpInput} 
            onChange={(e) => setJumpInput(e.target.value)}
            onBlur={handleJumpSubmit}
            aria-label="Jump to page" 
          />
        </form>

        <span style={{ fontSize: '12px', color: '#A3A09A', paddingRight: '4px' }}>
          of <span className="mono" style={{ color: '#F1EFEA' }}>{numPages}</span>
        </span>

        <button 
          className="btn ic ghost" 
          aria-label="Next page" 
          disabled={currentPage >= numPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ borderRadius: '50%' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <span className="sep" style={{ height: '16px', margin: '0 4px' }} />

        {onFitWidth && (
          <button 
            className="btn ghost" 
            onClick={onFitWidth}
            style={{ height: '28px', fontSize: '12px', padding: '0 10px' }}
          >
            Fit Width
          </button>
        )}
      </nav>
    </main>
  );
};
