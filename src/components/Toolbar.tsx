import React from 'react';
import type { ToolType, ShapeType, PaperTone } from '../types/document';
import { 
  MousePointer, 
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

  return (
    <div className={`flex items-center justify-between px-3 py-1.5 border-b backdrop-blur-md select-none shadow-xs transition-colors ${
      isLight
        ? 'bg-white/95 border-slate-200 text-slate-800'
        : 'bg-[#0A0D14]/95 border-white/[0.08] text-slate-200'
    }`}>
      {/* Group 1: Study & Prune Action Bar */}
      <div className="flex items-center gap-1.5">
        {/* Prune / Keep Button for active page */}
        <button
          onClick={onToggleExcludeCurrentPage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
            isCurrentPageExcluded
              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/40 hover:bg-rose-500/25'
              : isLight
              ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600'
              : 'bg-[#11151F] text-slate-200 border border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
          }`}
          title={isCurrentPageExcluded ? 'Restore Page into Study Deck (Delete)' : 'Prune (Delete) Page from Exam Deck (Delete)'}
        >
          {isCurrentPageExcluded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Page {currentPage} Pruned (Restore)</span>
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Prune Page {currentPage}</span>
            </>
          )}
        </button>

        {/* Bookmark page */}
        <button
          onClick={onToggleBookmark}
          className={`p-1.5 rounded-lg border transition-all ${
            isBookmarked
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-[#11151F] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-[#171C29]'
          }`}
          title={isBookmarked ? 'Remove Bookmark (B)' : 'Bookmark Page (B)'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-colors ${
            canUndo ? 'hover:bg-white/[0.08] text-slate-300' : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-colors ${
            canRedo ? 'hover:bg-white/[0.08] text-slate-300' : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Group 2: Modern Toolset Pills */}
      <div className="flex items-center gap-1 bg-[#11151F] p-1 rounded-xl border border-white/[0.08] shadow-inner">
        {/* Select */}
        <button
          onClick={() => onChangeTool('select')}
          className={`p-1.5 rounded-lg transition-all ${
            activeTool === 'select'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Pointer / Select (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Pen */}
        <button
          onClick={() => onChangeTool('pen')}
          className={`p-1.5 rounded-lg transition-all ${
            activeTool === 'pen'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Freehand Pen (P)"
        >
          <Pen className="w-4 h-4" />
        </button>

        {/* Highlighter */}
        <button
          onClick={() => onChangeTool('highlighter')}
          className={`p-1.5 rounded-lg transition-all ${
            activeTool === 'highlighter'
              ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Smart Exam Highlighter (H)"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {/* Eraser */}
        <button
          onClick={() => onChangeTool('eraser')}
          className={`p-1.5 rounded-lg transition-all ${
            activeTool === 'eraser'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Stroke & Area Eraser (E)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Text Sticky Note */}
        <button
          onClick={() => onChangeTool('text')}
          className={`p-1.5 rounded-lg transition-all ${
            activeTool === 'text'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
          title="Text Note / Sticky (T)"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Shapes selector */}
        <button
          onClick={() => onChangeTool('shape')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
            activeTool === 'shape'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
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
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
          title="Record Voice Memo for this Page (M)"
        >
          <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[11px] font-medium hidden sm:inline">Voice Memo</span>
        </button>

        {/* Sticky Note Color Palette */}
        {activeTool === 'text' && (
          <div className="flex items-center gap-1 ml-1.5 border-l border-white/10 pl-2">
            {STICKY_NOTE_COLORS.map((item) => (
              <button
                key={item.hex}
                onClick={() => onChangeColor(item.hex)}
                className={`w-4 h-4 rounded border transition-transform ${
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
          <div className="flex items-center gap-1.5 ml-1.5 border-l border-white/10 pl-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChangeColor(c)}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  selectedColor.toLowerCase() === c.toLowerCase() ? 'scale-125 border-white ring-2 ring-indigo-500/50' : 'border-slate-700'
                }`}
                style={{ backgroundColor: c }}
                title={`Color ${c}`}
              />
            ))}
            
            {/* Custom color picker */}
            <label className="relative cursor-pointer p-0.5 rounded hover:bg-white/10" title="Custom Color">
              <input
                type="color"
                value={selectedColor.startsWith('#') && selectedColor.length === 7 ? selectedColor : '#f59e0b'}
                onChange={(e) => onChangeColor(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <Palette className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            </label>

            {/* Stroke size selector */}
            <input
              type="range"
              min={1}
              max={16}
              value={strokeWidth}
              onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
              className="w-14 h-1 ml-1.5 accent-indigo-500 cursor-pointer"
              title={`Stroke width: ${strokeWidth}px ([ or ] to adjust)`}
            />
            <span className="font-mono text-[10px] text-slate-400 w-5 text-right">{strokeWidth}p</span>
          </div>
        )}
      </div>

      {/* Group 3: Paper Tone, Zoom & Zen Mode */}
      <div className="flex items-center gap-2">
        {/* Paper Tone 3-way toggle (Dark / Sepia / Night) */}
        <div className="flex items-center bg-[#11151F] p-0.5 rounded-lg border border-white/[0.08]" title="Paper Tone">
          <button
            onClick={() => onChangePaperTone('dark')}
            className={`p-1 rounded text-xs transition-colors ${
              paperTone === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Dark Paper Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangePaperTone('sepia')}
            className={`p-1 rounded text-xs transition-colors ${
              paperTone === 'sepia' ? 'bg-amber-600 text-amber-100' : 'text-slate-400 hover:text-white'
            }`}
            title="Sepia Paper Mode (Eye-strain relief)"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangePaperTone('night')}
            className={`p-1 rounded text-xs transition-colors ${
              paperTone === 'night' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Night Inverted PDF (OLED Black Mode)"
          >
            <Contrast className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#11151F] px-2 py-1 rounded-lg border border-white/[0.08] text-xs">
          <button
            onClick={() => onChangeScale(Math.max(0.5, scale - 0.15))}
            className="p-0.5 hover:text-white text-slate-400 transition-colors"
            title="Zoom Out (Ctrl -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] w-12 text-center text-slate-300 tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onChangeScale(Math.min(3.0, scale + 0.15))}
            className="p-0.5 hover:text-white text-slate-400 transition-colors"
            title="Zoom In (Ctrl +)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitWidth}
            className="ml-1 text-[10px] text-slate-400 hover:text-indigo-400 px-1 py-0.5 rounded hover:bg-white/[0.08]"
            title="Fit Width (Ctrl 0)"
          >
            Fit
          </button>
        </div>

        {/* Zen Mode Button */}
        <button
          onClick={onToggleZenMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isZenMode
              ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
              : 'bg-[#11151F] border-white/[0.08] text-slate-300 hover:text-white hover:bg-[#171C29]'
          }`}
          title="Zen Cram Mode (Press Z or F11)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden md:inline">Zen</span>
        </button>
      </div>
    </div>
  );
};
