import React, { useState, useRef, useEffect } from 'react';
import type { ToolType, ShapeType, PaperTone } from '../types/document';

interface ToolbarProps {
  activeTool: ToolType;
  onChangeTool: (tool: ToolType) => void;
  selectedColor: string;
  onChangeColor: (color: string) => void;
  strokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  shapeType: ShapeType;
  onChangeShapeType: (shape: ShapeType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  scale: number;
  onChangeScale: (scale: number) => void;
  onFitWidth: () => void;
  onFitPage?: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isCurrentPageExcluded: boolean;
  onToggleExcludeCurrentPage: () => void;
  currentPage: number;
  totalPages: number;
  onStartAudioRecording: () => void;
  paperTone: PaperTone;
  onChangePaperTone: (tone: PaperTone) => void;
  theme?: 'dark' | 'light';
}

const INK_PALETTE = [
  { name: 'Black', c: '#151513' },
  { name: 'Teal', c: '#0D9488' },
  { name: 'Violet', c: '#8B5CF6' },
  { name: 'Pink', c: '#EC4899' },
  { name: 'Red', c: '#EF4444' },
  { name: 'Orange', c: '#F97316' },
  { name: 'Gold', c: '#EAB308' },
  { name: 'Green', c: '#10B981' },
];

const STICKY_PAPERS = [
  { name: 'Yellow', c: '#FDE68A', border: '#F59E0B' },
  { name: 'Mint', c: '#A7F3D0', border: '#10B981' },
  { name: 'Sky', c: '#BAE6FD', border: '#38BDF8' },
  { name: 'Lavender', c: '#DDD6FE', border: '#A855F7' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onChangeTool,
  selectedColor,
  onChangeColor,
  strokeWidth,
  onChangeStrokeWidth,
  shapeType,
  onChangeShapeType,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  scale,
  onChangeScale,
  onFitWidth,
  onFitPage,
  isZenMode,
  onToggleZenMode,
  isBookmarked,
  onToggleBookmark,
  isCurrentPageExcluded,
  onToggleExcludeCurrentPage,
  currentPage,
  onStartAudioRecording,
  paperTone,
  onChangePaperTone,
}) => {
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const zoomDropdownRef = useRef<HTMLDivElement>(null);

  // Close zoom dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(e.target as Node)) {
        setShowZoomDropdown(false);
      }
    };
    if (showZoomDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showZoomDropdown]);

  const zoomPercent = Math.round(scale * 100);

  const handleZoomIn = () => {
    onChangeScale(Math.min(3.0, Math.round((scale + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    onChangeScale(Math.max(0.5, Math.round((scale - 0.15) * 100) / 100));
  };

  // Tool definitions for Group 2 per ui.md §6
  const tools = [
    {
      id: 'select' as ToolType,
      label: 'Select (V)',
      tip: 'Select · V',
      d: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z',
    },
    {
      id: 'hand' as ToolType,
      label: 'Hand Pan (H)',
      tip: 'Hand pan · H',
      d: 'M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3 M14 9V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7 M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8 M10 14a4 4 0 0 0-4-4v0a2 2 0 0 0-2 2v3a9 9 0 0 0 9 9h3a6 6 0 0 0 6-6v-5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2',
    },
    {
      id: 'pen' as ToolType,
      label: 'Pen (P)',
      tip: 'Pen · P',
      d: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
    },
    {
      id: 'highlighter' as ToolType,
      label: 'Highlighter (H)',
      tip: 'Highlighter · H',
      d: 'm9 11-6 6v3h3l6-6m-3-3 7-7a2 2 0 0 1 3 3l-7 7m-3-3 3 3',
    },
    {
      id: 'eraser' as ToolType,
      label: 'Eraser (E)',
      tip: 'Eraser · E',
      d: 'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21 M22 21H7 M5 11l9 9',
    },
    {
      id: 'text' as ToolType,
      label: 'Sticky Note (T)',
      tip: 'Sticky note · T',
      d: 'M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z M15 3v6h6',
    },
    {
      id: 'shape' as ToolType,
      label: 'Shapes (S)',
      tip: 'Shapes · S',
      d: 'M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3.1a.7.7 0 0 1 1.198 0l3.726 5.82A.7.7 0 0 1 15.7 10H8.3zm7.2 9a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7z',
    },
  ];

  const shapes = [
    { type: 'rectangle' as ShapeType, label: 'Rectangle', d: 'M4 4h16v16H4z' },
    { type: 'circle' as ShapeType, label: 'Circle', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' },
    { type: 'arrow' as ShapeType, label: 'Arrow', d: 'M5 12h14 M12 5l7 7-7 7' },
    { type: 'line' as ShapeType, label: 'Line', d: 'M5 12h14' },
  ];

  return (
    <div 
      role="toolbar" 
      aria-label="Document tools" 
      className="h-[52px] flex-none select-none z-30"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        background: '#1A1A1D',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      {/* Group 1: Prune/Restore Toggle, Bookmark, Undo/Redo */}
      {!isCurrentPageExcluded ? (
        <button 
          className="btn prune" 
          onClick={onToggleExcludeCurrentPage} 
          style={{ width: '200px', flex: 'none' }}
          aria-label={`Prune page ${currentPage}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Prune Page {currentPage}
        </button>
      ) : (
        <button 
          className="btn restore" 
          onClick={onToggleExcludeCurrentPage} 
          style={{ width: '200px', flex: 'none' }}
          aria-label={`Page ${currentPage} pruned, restore`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Page {currentPage} Pruned · Restore
        </button>
      )}

      {/* Bookmark Toggle */}
      <button 
        className={`btn ic ${isBookmarked ? 'bm-on' : 'ghost'}`}
        onClick={onToggleBookmark}
        data-tip={isBookmarked ? 'Remove bookmark' : 'Bookmark page · B'}
        aria-label="Bookmark page"
        aria-pressed={isBookmarked}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? '#F59E0B' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Undo & Redo */}
      <div className="flex gap-1">
        <button 
          className="btn ic ghost" 
          onClick={onUndo} 
          disabled={!canUndo} 
          data-tip="Undo · Ctrl Z" 
          aria-label="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button 
          className="btn ic ghost" 
          onClick={onRedo} 
          disabled={!canRedo} 
          data-tip="Redo · Ctrl Y" 
          aria-label="Redo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>
      </div>

      <span className="sep" />

      {/* Group 2: The Core Tool Pill */}
      <div 
        role="radiogroup" 
        aria-label="Tool selection" 
        style={{
          display: 'flex',
          gap: '2px',
          padding: '3px',
          borderRadius: '10px',
          background: '#131315',
          border: '1px solid rgba(255,255,255,.08)'
        }}
      >
        {tools.map((t) => {
          const isSelected = activeTool === t.id;
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={isSelected}
              className={`tool ${isSelected ? 'on' : ''}`}
              data-tip={t.tip}
              aria-label={t.label}
              onClick={() => onChangeTool(t.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={t.d} />
              </svg>
            </button>
          );
        })}
        {/* Voice Memo Action Trigger (M) */}
        <button
          className="tool"
          data-tip="Voice memo · M"
          aria-label="Voice Memo (M)"
          onClick={onStartAudioRecording}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FB7185" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3" />
          </svg>
        </button>
      </div>

      <span className="sep" />

      {/* Group 3: Contextual Settings Strip */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {/* Context: Pen or Highlighter */}
        {(activeTool === 'pen' || activeTool === 'highlighter') && (
          <>
            <span className="lbl">{activeTool === 'highlighter' ? 'Highlight' : 'Ink'}</span>
            <div className="flex items-center gap-0.5">
              {INK_PALETTE.map((s) => {
                const isSel = selectedColor.toLowerCase() === s.c.toLowerCase();
                return (
                  <button
                    key={s.c}
                    className="sw"
                    aria-label={s.name}
                    aria-pressed={isSel}
                    onClick={() => onChangeColor(s.c)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="7" fill={s.c} />
                      <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        fill="none" 
                        stroke={isSel ? '#DDD8CC' : 'none'} 
                        strokeWidth={isSel ? 2 : 0} 
                      />
                    </svg>
                  </button>
                );
              })}

              {/* Custom Conic Gradient Native Color Picker */}
              <button 
                className="sw relative" 
                aria-label="Custom colour"
                onClick={() => colorInputRef.current?.click()}
              >
                <span 
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'conic-gradient(#F43F5E,#F59E0B,#84CC16,#14B8A6,#3B82F6,#8B5CF6,#F43F5E)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,.2)'
                  }}
                />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onChangeColor(e.target.value)}
                  className="sr-only"
                />
              </button>
            </div>

            <span className="sep" />

            <span className="lbl">Width</span>
            <input
              type="range"
              min="1"
              max="16"
              value={strokeWidth}
              onChange={(e) => onChangeStrokeWidth(parseInt(e.target.value, 10))}
              aria-label="Stroke width"
              className="w-24 accent-[#DDD8CC] cursor-pointer"
            />
            <span className="mono text-[12px] text-[#F1EFEA] w-8">
              {strokeWidth} px
            </span>

            {/* Live Preview Circle */}
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#131315" stroke="rgba(255,255,255,.08)" />
              <circle 
                cx="12" 
                cy="12" 
                r={Math.min(9, Math.max(2, strokeWidth / 1.5))} 
                fill={selectedColor} 
                opacity={activeTool === 'highlighter' ? 0.6 : 1}
              />
            </svg>
          </>
        )}

        {/* Context: Shapes */}
        {activeTool === 'shape' && (
          <>
            <span className="lbl">Shape</span>
            <div 
              role="radiogroup" 
              aria-label="Shape" 
              style={{
                display: 'flex',
                gap: '2px',
                padding: '3px',
                borderRadius: '10px',
                background: '#131315',
                border: '1px solid rgba(255,255,255,.08)'
              }}
            >
              {shapes.map((h) => {
                const isSelected = shapeType === h.type;
                return (
                  <button
                    key={h.type}
                    role="radio"
                    aria-checked={isSelected}
                    className={`tool ${isSelected ? 'on' : ''}`}
                    data-tip={h.label}
                    onClick={() => onChangeShapeType(h.type)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={h.d} />
                    </svg>
                  </button>
                );
              })}
            </div>
            <span className="text-[12px] text-[#A3A09A]">
              Hold <span className="kbd">Shift</span> for square or circle
            </span>
          </>
        )}

        {/* Context: Sticky Note */}
        {activeTool === 'text' && (
          <>
            <span className="lbl">Paper</span>
            <div className="flex items-center gap-1">
              {STICKY_PAPERS.map((p) => {
                const isSelected = selectedColor.toLowerCase() === p.c.toLowerCase();
                return (
                  <button
                    key={p.c}
                    className="sw"
                    aria-label={p.name}
                    aria-pressed={isSelected}
                    onClick={() => onChangeColor(p.c)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="5" y="5" width="14" height="14" rx="3" fill={p.c} />
                      <rect 
                        x="2.5" 
                        y="2.5" 
                        width="19" 
                        height="19" 
                        rx="5" 
                        fill="none" 
                        stroke={isSelected ? '#DDD8CC' : 'none'} 
                        strokeWidth={isSelected ? 2 : 0} 
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
            <span className="text-[12px] text-[#A3A09A]">Click page to place note</span>
          </>
        )}

        {/* Context: Select / Eraser / Pointer */}
        {activeTool === 'select' && (
          <span className="text-[12px] text-[#A3A09A]">Drag across page to pan, click notes to edit or drag</span>
        )}
        {activeTool === 'eraser' && (
          <span className="text-[12px] text-[#A3A09A]">Touch any drawn vector stroke to delete it</span>
        )}
      </div>

      <span className="sep" />

      {/* Group 4: Zoom Controls, Paper Tone, Zen Mode */}
      <div className="flex items-center gap-0.5 relative" ref={zoomDropdownRef}>
        <button 
          className="btn ic ghost" 
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          data-tip="Zoom out · Ctrl -" 
          aria-label="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14" />
          </svg>
        </button>

        <button 
          className="btn ghost mono" 
          onClick={() => setShowZoomDropdown((prev) => !prev)}
          style={{ width: '68px', padding: '0 8px', gap: '4px' }} 
          aria-label={`Zoom level ${zoomPercent} percent`}
        >
          {zoomPercent}%
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#98A0B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <button 
          className="btn ic ghost" 
          onClick={handleZoomIn}
          disabled={scale >= 3.0}
          data-tip="Zoom in · Ctrl +" 
          aria-label="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14 M12 5v14" />
          </svg>
        </button>

        {/* Zoom Presets Dropdown */}
        {showZoomDropdown && (
          <div 
            className="absolute top-full mt-1.5 left-0 w-36 rounded-xl p-1 shadow-2xl z-50 text-xs"
            style={{
              background: '#1A1A1D',
              border: '1px solid rgba(255,255,255,.14)',
              color: '#F1EFEA'
            }}
          >
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  onChangeScale(preset);
                  setShowZoomDropdown(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-white/10 ${
                  scale === preset ? 'text-[#F1EFEA] font-semibold' : 'text-[#A3A09A]'
                }`}
              >
                <span>{Math.round(preset * 100)}%</span>
                {scale === preset && <span>✓</span>}
              </button>
            ))}
            <div className="h-px bg-white/10 my-1" />
            <button
              onClick={() => {
                onFitWidth();
                setShowZoomDropdown(false);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-[#F1EFEA]"
            >
              Fit Width
            </button>
            {onFitPage && (
              <button
                onClick={() => {
                  onFitPage();
                  setShowZoomDropdown(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-[#F1EFEA]"
              >
                Fit Page
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3-way Paper Tone Selector */}
      <div 
        role="radiogroup" 
        aria-label="Paper tone" 
        style={{
          display: 'flex',
          gap: '2px',
          padding: '3px',
          borderRadius: '10px',
          background: '#131315',
          border: '1px solid rgba(255,255,255,.08)'
        }}
      >
        <button 
          role="radio" 
          className={`tool ${paperTone === 'dark' ? 'on' : ''}`}
          aria-checked={paperTone === 'dark'}
          aria-label="Dark stage" 
          data-tip="Dark stage"
          onClick={() => onChangePaperTone('dark')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="#F7F7F5" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        </button>
        <button 
          role="radio" 
          className={`tool ${paperTone === 'sepia' ? 'on' : ''}`}
          aria-checked={paperTone === 'sepia'}
          aria-label="Sepia" 
          data-tip="Sepia"
          onClick={() => onChangePaperTone('sepia')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="#E6D5AE" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        </button>
        <button 
          role="radio" 
          className={`tool ${paperTone === 'night' ? 'on' : ''}`}
          aria-checked={paperTone === 'night'}
          aria-label="Night mode" 
          data-tip="Night mode"
          onClick={() => onChangePaperTone('night')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="#1B2030" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        </button>
      </div>

      {/* Zen Mode Button */}
      <button 
        className={`btn ic ${isZenMode ? 'primary' : 'ghost'}`}
        onClick={onToggleZenMode}
        data-tip="Zen mode · Z" 
        aria-label="Zen mode"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </button>
    </div>
  );
};
