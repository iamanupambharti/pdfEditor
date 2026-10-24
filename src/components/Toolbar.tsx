import React, { useState, useRef, useEffect } from 'react';
import type { ToolType, ShapeType, PaperTone } from '../types/document';
import { 
  MousePointer, 
  Hand,
  Pen, 
  Highlighter, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  ArrowRight, 
  Minus, 
  Mic, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  ChevronDown,
  Maximize2, 
  Bookmark, 
  Trash2, 
  CheckCircle2,
  Sun,
  Moon,
  Contrast,
  Palette
} from 'lucide-react';

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

const PRESET_COLORS = [
  '#f59e0b', // Amber / Highlighter Yellow
  '#ef4444', // Red
  '#10b981', // Emerald Green
  '#3b82f6', // Electric Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
  '#0f172a', // Slate Dark
];

const STICKY_NOTE_COLORS = [
  { label: 'Yellow', hex: '#FEF3C7', border: '#FCD34D' },
  { label: 'Mint', hex: '#D1FAE5', border: '#6EE7B7' },
  { label: 'Sky', hex: '#E0F2FE', border: '#7DD3FC' },
  { label: 'Lavender', hex: '#EDE9FE', border: '#C4B5FD' },
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
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setIsZoomMenuOpen(false);
      }
    };
    if (isZoomMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isZoomMenuOpen]);

  const zoomPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

  return (
    <div className={`flex items-center justify-between px-3 py-1.5 border-b backdrop-blur-md select-none shadow-xs transition-colors overflow-x-auto no-scrollbar gap-2 ${
      isLight
        ? 'bg-white/95 border-slate-200 text-slate-800'
        : 'bg-[#0A0D14]/95 border-white/[0.08] text-slate-200'
    }`}>
      {/* Group 1: Study & Prune Action Bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Prune / Keep Button for active page */}
        <button
          onClick={onToggleExcludeCurrentPage}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
            isCurrentPageExcluded
              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/40 hover:bg-rose-500/25'
              : isLight
              ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
              : 'bg-[#11151F] text-slate-200 border border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
          }`}
          title={isCurrentPageExcluded ? 'Restore Page into Study Deck (Delete)' : 'Prune (Delete) Page from Exam Deck (Delete)'}
        >
          {isCurrentPageExcluded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Page {currentPage} Pruned (Restore)</span>
              <span className="sm:hidden">Restored</span>
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Prune Page {currentPage}</span>
              <span className="sm:hidden">Prune</span>
            </>
          )}
        </button>

        {/* Bookmark page */}
        <button
          onClick={onToggleBookmark}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-[#11151F] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-[#171C29]'
          }`}
          title={isBookmarked ? 'Remove Bookmark (B)' : 'Bookmark Page (B)'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        <div className={`h-5 w-px mx-0.5 sm:mx-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            canUndo 
              ? isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.08] text-slate-300' 
              : isLight ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            canRedo 
              ? isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.08] text-slate-300' 
              : isLight ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Group 2: Modern Toolset Pills */}
      <div className={`flex items-center gap-1 p-1 rounded-xl border shadow-inner shrink-0 ${
        isLight ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-[#11151F] border-white/[0.08]'
      }`}>
        {/* Select */}
        <button
          onClick={() => onChangeTool('select')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'select'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Pointer / Select (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Hand / Pan Tool */}
        <button
          onClick={() => onChangeTool('hand')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'hand'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Pan / Hand Tool (H or hold Space)"
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Pen */}
        <button
          onClick={() => onChangeTool('pen')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'pen'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Freehand Pen (P)"
        >
          <Pen className="w-4 h-4" />
        </button>

        {/* Highlighter */}
        <button
          onClick={() => onChangeTool('highlighter')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'highlighter'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Smart Exam Highlighter (H)"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {/* Eraser */}
        <button
          onClick={() => onChangeTool('eraser')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'eraser'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Stroke & Area Eraser (E)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Text Sticky Note */}
        <button
          onClick={() => onChangeTool('text')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'text'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Text Note / Sticky (T)"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Shapes selector */}
        <button
          onClick={() => onChangeTool('shape')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTool === 'shape'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Shapes (S)"
        >
          {shapeType === 'rectangle' && <Square className="w-4 h-4" />}
          {shapeType === 'circle' && <Circle className="w-4 h-4" />}
          {shapeType === 'arrow' && <ArrowRight className="w-4 h-4" />}
          {shapeType === 'line' && <Minus className="w-4 h-4" />}
        </button>

        {/* Sub-menu for shape types if shape is active */}
        {activeTool === 'shape' && (
          <div className="flex items-center gap-0.5 ml-1 border-l border-white/10 pl-1">
            <button
              onClick={() => onChangeShapeType('rectangle')}
              className={`p-1 rounded ${shapeType === 'rectangle' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:text-white'}`}
              title="Rectangle"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeShapeType('circle')}
              className={`p-1 rounded ${shapeType === 'circle' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:text-white'}`}
              title="Circle"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeShapeType('arrow')}
              className={`p-1 rounded ${shapeType === 'arrow' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:text-white'}`}
              title="Arrow"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeShapeType('line')}
              className={`p-1 rounded ${shapeType === 'line' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:text-white'}`}
              title="Line"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Audio Memo Trigger */}
        <button
          onClick={onStartAudioRecording}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
            isLight
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          }`}
          title="Record Voice Memo for this Page (M)"
        >
          <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span className="text-[11px] font-medium hidden sm:inline">Voice Memo</span>
        </button>

        {/* Sticky Note Color Palette */}
        {activeTool === 'text' && (
          <div className={`flex items-center gap-1 ml-1.5 border-l pl-2 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
            {STICKY_NOTE_COLORS.map((item) => (
              <button
                key={item.hex}
                onClick={() => onChangeColor(item.hex)}
                className={`w-4 h-4 rounded border transition-transform cursor-pointer ${
                  selectedColor === item.hex ? 'scale-125 ring-2 ring-indigo-400' : ''
                }`}
                style={{ backgroundColor: item.hex, borderColor: item.border }}
                title={`Note Color: ${item.label}`}
              />
            ))}
          </div>
        )}

        {/* Drawing Color Palette & Stroke Width */}
        {(activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'shape') && (
          <div className={`flex items-center gap-1.5 ml-1.5 border-l pl-2 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChangeColor(c)}
                className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                  selectedColor.toLowerCase() === c.toLowerCase() ? 'scale-125 border-white ring-2 ring-indigo-500/50' : 'border-slate-400/40'
                }`}
                style={{ backgroundColor: c }}
                title={`Color ${c}`}
              />
            ))}
            
            {/* Custom color picker */}
            <label className={`relative cursor-pointer p-0.5 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400'}`} title="Custom Color">
              <input
                type="color"
                value={selectedColor.startsWith('#') && selectedColor.length === 7 ? selectedColor : '#f59e0b'}
                onChange={(e) => onChangeColor(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <Palette className="w-3.5 h-3.5 hover:text-indigo-500 transition-colors" />
            </label>

            {/* Stroke size selector */}
            <input
              type="range"
              min={1}
              max={16}
              value={strokeWidth}
              onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
              className="w-12 sm:w-14 h-1 ml-1.5 accent-indigo-500 cursor-pointer"
              title={`Stroke width: ${strokeWidth}px ([ or ] to adjust)`}
            />
            <span className={`font-mono text-[10px] w-5 text-right ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{strokeWidth}p</span>
          </div>
        )}
      </div>

      {/* Group 3: Paper Tone, Zoom & Zen Mode */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Paper Tone 3-way toggle (Dark / Sepia / Night) */}
        <div className={`flex items-center p-0.5 rounded-lg border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#11151F] border-white/[0.08]'
        }`} title="Paper Tone">
          <button
            onClick={() => onChangePaperTone('dark')}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              paperTone === 'dark' ? 'bg-indigo-600 text-white' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Dark Paper Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangePaperTone('sepia')}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              paperTone === 'sepia' ? 'bg-amber-600 text-amber-100' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Sepia Paper Mode (Eye-strain relief)"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangePaperTone('night')}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              paperTone === 'night' ? 'bg-violet-600 text-white' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Night Inverted PDF (OLED Black Mode)"
          >
            <Contrast className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div ref={zoomMenuRef} className="relative flex items-center">
          <div className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-1 rounded-lg border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#11151F] border-white/[0.08] text-slate-200'
          }`}>
            <button
              onClick={() => onChangeScale(Math.max(0.25, Math.round((scale - 0.15) * 100) / 100))}
              className={`p-1 rounded transition-colors cursor-pointer ${isLight ? 'hover:text-slate-900 text-slate-500 hover:bg-slate-200/60' : 'hover:text-white text-slate-400 hover:bg-white/[0.06]'}`}
              title="Zoom Out (Ctrl -)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Interactive Zoom Dropdown Trigger */}
            <button
              onClick={() => setIsZoomMenuOpen((prev) => !prev)}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[11px] tabular-nums transition-colors cursor-pointer ${
                isLight 
                  ? 'hover:bg-slate-200/80 text-slate-800' 
                  : 'hover:bg-white/[0.08] text-slate-200'
              }`}
              title="Select Zoom Preset (Ctrl + Mouse Wheel to zoom)"
            >
              <span>{Math.round(scale * 100)}%</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => onChangeScale(Math.min(4.0, Math.round((scale + 0.15) * 100) / 100))}
              className={`p-1 rounded transition-colors cursor-pointer ${isLight ? 'hover:text-slate-900 text-slate-500 hover:bg-slate-200/60' : 'hover:text-white text-slate-400 hover:bg-white/[0.06]'}`}
              title="Zoom In (Ctrl +)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            
            <div className={`h-3.5 w-px mx-0.5 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />

            <button
              onClick={onFitWidth}
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                isLight ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-white/[0.08]'
              }`}
              title="Fit to Width (Ctrl 1)"
            >
              Fit
            </button>
          </div>

          {/* Zoom Popover Dropdown */}
          {isZoomMenuOpen && (
            <div className={`absolute top-full right-0 mt-1.5 z-50 w-44 rounded-xl border p-1 shadow-2xl backdrop-blur-md text-xs transition-all animate-in fade-in zoom-in-95 ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
                : 'bg-[#11151F]/95 border-white/10 text-slate-200 shadow-black/80'
            }`}>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Zoom Presets
              </div>
              {zoomPresets.map((preset) => {
                const percent = Math.round(preset * 100);
                const isSelected = Math.round(scale * 100) === percent;
                return (
                  <button
                    key={preset}
                    onClick={() => {
                      onChangeScale(preset);
                      setIsZoomMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? isLight ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-indigo-600/20 text-indigo-400 font-semibold'
                        : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.06] text-slate-300'
                    }`}
                  >
                    <span>{percent}%</span>
                    {preset === 1.0 && <span className="text-[10px] opacity-60">Actual</span>}
                  </button>
                );
              })}
              <div className={`my-1 h-px ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <button
                onClick={() => {
                  onFitWidth();
                  setIsZoomMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.06] text-slate-300'
                }`}
              >
                <span>Fit to Width</span>
                <span className="text-[10px] opacity-50 font-mono">Ctrl 1</span>
              </button>
              {onFitPage && (
                <button
                  onClick={() => {
                    onFitPage();
                    setIsZoomMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.06] text-slate-300'
                  }`}
                >
                  <span>Fit to Page</span>
                  <span className="text-[10px] opacity-50 font-mono">Ctrl 2</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Zen Mode Button */}
        <button
          onClick={onToggleZenMode}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            isZenMode
              ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-[#11151F] border-white/[0.08] text-slate-300 hover:text-white hover:bg-[#171C29]'
          }`}
          title="Zen Cram Mode (Press Z or F11)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden lg:inline">Zen</span>
        </button>
      </div>
    </div>
  );
};
