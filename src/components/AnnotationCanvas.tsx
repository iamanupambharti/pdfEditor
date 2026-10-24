import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { 
  ToolType, 
  ShapeType, 
  Point, 
  StrokeAnnotation, 
  ShapeAnnotation, 
  TextNoteAnnotation, 
  PageAnnotations 
} from '../types/document';
import { Trash2, GripHorizontal } from 'lucide-react';

interface AnnotationCanvasProps {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  activeTool: ToolType;
  selectedColor: string;
  strokeWidth: number;
  shapeType: ShapeType;
  annotations: PageAnnotations;
  onUpdateAnnotations: (pageNumber: number, newAnnotations: PageAnnotations) => void;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  pageNumber,
  width,
  height,
  activeTool,
  selectedColor,
  strokeWidth,
  shapeType,
  annotations,
  onUpdateAnnotations,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs for zero-latency live drawing
  const isDrawingRef = useRef<boolean>(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const dragStartPointRef = useRef<Point | null>(null);

  // Active shape preview state
  const [shapePreview, setShapePreview] = useState<{ start: Point; current: Point } | null>(null);

  // Dragging state for sticky notes
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Redraw all stored annotations onto the canvas
  const redrawBase = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw stored shapes
    for (const shape of annotations.shapes) {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (shape.type === 'rectangle') {
        const x = Math.min(shape.startX, shape.endX);
        const y = Math.min(shape.startY, shape.endY);
        const w = Math.abs(shape.endX - shape.startX);
        const h = Math.abs(shape.endY - shape.startY);
        ctx.strokeRect(x, y, w, h);
      } else if (shape.type === 'circle') {
        const cx = (shape.startX + shape.endX) / 2;
        const cy = (shape.startY + shape.endY) / 2;
        const rx = Math.abs(shape.endX - shape.startX) / 2;
        const ry = Math.abs(shape.endY - shape.startY) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();

        if (shape.type === 'arrow') {
          const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
          const headLen = 14;
          ctx.beginPath();
          ctx.moveTo(shape.endX, shape.endY);
          ctx.lineTo(
            shape.endX - headLen * Math.cos(angle - Math.PI / 6),
            shape.endY - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(shape.endX, shape.endY);
          ctx.lineTo(
            shape.endX - headLen * Math.cos(angle + Math.PI / 6),
            shape.endY - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
    }

    // 2. Draw stored freehand strokes (pen & highlighter)
    for (const stroke of annotations.strokes) {
      if (stroke.points.length === 0) continue;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.38;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.globalAlpha = stroke.opacity || 0.95;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw live shape preview if user is currently dragging a shape
    if (shapePreview && activeTool === 'shape') {
      ctx.save();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([4, 4]);

      const start = shapePreview.start;
      const curr = shapePreview.current;

      if (shapeType === 'rectangle') {
        const x = Math.min(start.x, curr.x);
        const y = Math.min(start.y, curr.y);
        const w = Math.abs(curr.x - start.x);
        const h = Math.abs(curr.y - start.y);
        ctx.strokeRect(x, y, w, h);
      } else if (shapeType === 'circle') {
        const cx = (start.x + curr.x) / 2;
        const cy = (start.y + curr.y) / 2;
        const rx = Math.abs(curr.x - start.x) / 2;
        const ry = Math.abs(curr.y - start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shapeType === 'line' || shapeType === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();

        if (shapeType === 'arrow') {
          const angle = Math.atan2(curr.y - start.y, curr.x - start.x);
          const headLen = 14;
          ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(
            curr.x - headLen * Math.cos(angle - Math.PI / 6),
            curr.y - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(
            curr.x - headLen * Math.cos(angle + Math.PI / 6),
            curr.y - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }, [annotations, shapePreview, activeTool, selectedColor, shapeType, strokeWidth]);

  // Adjust canvas resolution on resize or base annotations change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.floor(width * dpr);
    const targetH = Math.floor(height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
    }
    redrawBase();
  }, [width, height, redrawBase]);

  // Coordinates helper
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Erase nearby elements
  const eraseNear = (pt: Point) => {
    const eraseRadius = 20;
    let modified = false;

    // Filter out strokes that intersect pt
    const remainingStrokes = annotations.strokes.filter((stroke) => {
      const hit = stroke.points.some((p) => {
        const dx = p.x - pt.x;
        const dy = p.y - pt.y;
        return Math.sqrt(dx * dx + dy * dy) < eraseRadius;
      });
      if (hit) modified = true;
      return !hit;
    });

    // Filter out shapes that intersect pt
    const remainingShapes = annotations.shapes.filter((shape) => {
      const minX = Math.min(shape.startX, shape.endX) - 10;
      const maxX = Math.max(shape.startX, shape.endX) + 10;
      const minY = Math.min(shape.startY, shape.endY) - 10;
      const maxY = Math.max(shape.startY, shape.endY) + 10;
      const inBox = pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
      if (inBox) modified = true;
      return !inBox;
    });

    if (modified) {
      onUpdateAnnotations(pageNumber, {
        ...annotations,
        strokes: remainingStrokes,
        shapes: remainingShapes,
      });
    }
  };

  // POINTER DOWN: Start live drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    // Capture pointer events to ensure live smooth strokes even if mouse moves fast
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    const pt = getCanvasCoords(e);
    isDrawingRef.current = true;
    lastPointRef.current = pt;
    dragStartPointRef.current = pt;
    currentStrokeRef.current = [pt];

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      // Draw initial point/dot immediately
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.beginPath();
          ctx.fillStyle = selectedColor;
          const radius = (strokeWidth * (activeTool === 'highlighter' ? 2.8 : 1)) / 2;
          if (activeTool === 'highlighter') {
            ctx.globalAlpha = 0.38;
            ctx.globalCompositeOperation = 'multiply';
          } else {
            ctx.globalAlpha = 0.95;
          }
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    } else if (activeTool === 'eraser') {
      eraseNear(pt);
    } else if (activeTool === 'text') {
      // Place new sticky note
      const isStickyColor = ['#FEF3C7', '#D1FAE5', '#E0F2FE', '#EDE9FE'].includes(selectedColor);
      const noteColor = isStickyColor ? selectedColor : '#FEF3C7';

      const newNote: TextNoteAnnotation = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        x: Math.min(Math.max(10, pt.x - 20), width - 200),
        y: Math.min(Math.max(10, pt.y - 15), height - 120),
        text: 'Exam Note: Write key formula or doubt here...',
        color: noteColor,
        fontSize: 13,
      };
      onUpdateAnnotations(pageNumber, {
        ...annotations,
        textNotes: [...annotations.textNotes, newNote],
      });
      isDrawingRef.current = false;
    }
  };

  // POINTER MOVE: Real-Time Live Ink Rendering with ZERO lag
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getCanvasCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      const last = lastPointRef.current;
      if (last && (last.x !== pt.x || last.y !== pt.y)) {
        // Direct canvas render: LIVE INK APPEARS INSTANTLY
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.beginPath();
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = strokeWidth * (activeTool === 'highlighter' ? 2.8 : 1);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (activeTool === 'highlighter') {
              ctx.globalAlpha = 0.38;
              ctx.globalCompositeOperation = 'multiply';
            } else {
              ctx.globalAlpha = 0.95;
            }

            ctx.moveTo(last.x, last.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
            ctx.restore();
          }
        }

        lastPointRef.current = pt;
        currentStrokeRef.current.push(pt);
      }
    } else if (activeTool === 'eraser') {
      eraseNear(pt);
    } else if (activeTool === 'shape' && dragStartPointRef.current) {
      setShapePreview({
        start: dragStartPointRef.current,
        current: pt,
      });
    }
  };

  // POINTER UP: Finalize and commit annotations
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const pt = getCanvasCoords(e);

    if ((activeTool === 'pen' || activeTool === 'highlighter') && currentStrokeRef.current.length > 0) {
      const newStroke: StrokeAnnotation = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tool: activeTool,
        color: selectedColor,
        width: strokeWidth * (activeTool === 'highlighter' ? 2.8 : 1),
        opacity: activeTool === 'highlighter' ? 0.38 : 0.95,
        points: [...currentStrokeRef.current],
      };

      onUpdateAnnotations(pageNumber, {
        ...annotations,
        strokes: [...annotations.strokes, newStroke],
      });
    } else if (activeTool === 'shape' && dragStartPointRef.current) {
      const start = dragStartPointRef.current;
      const dx = Math.abs(pt.x - start.x);
      const dy = Math.abs(pt.y - start.y);

      if (dx > 4 || dy > 4) {
        const newShape: ShapeAnnotation = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: shapeType,
          color: selectedColor,
          width: strokeWidth,
          startX: start.x,
          startY: start.y,
          endX: pt.x,
          endY: pt.y,
        };

        onUpdateAnnotations(pageNumber, {
          ...annotations,
          shapes: [...annotations.shapes, newShape],
        });
      }
      setShapePreview(null);
    }

    currentStrokeRef.current = [];
    lastPointRef.current = null;
    dragStartPointRef.current = null;
  };

  const handleTextChange = (id: string, text: string) => {
    const updated = annotations.textNotes.map((note) =>
      note.id === id ? { ...note, text } : note
    );
    onUpdateAnnotations(pageNumber, {
      ...annotations,
      textNotes: updated,
    });
  };

  const handleDeleteTextNote = (id: string) => {
    const remaining = annotations.textNotes.filter((note) => note.id !== id);
    onUpdateAnnotations(pageNumber, {
      ...annotations,
      textNotes: remaining,
    });
  };

  // Sticky note dragging
  const handleNoteDragStart = (e: React.MouseEvent, note: TextNoteAnnotation) => {
    e.stopPropagation();
    setDraggingNoteId(note.id);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingNoteId) return;
      const newX = Math.max(0, Math.min(width - 180, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(height - 100, e.clientY - dragOffset.y));

      const updated = annotations.textNotes.map((n) =>
        n.id === draggingNoteId ? { ...n, x: newX, y: newY } : n
      );
      onUpdateAnnotations(pageNumber, { ...annotations, textNotes: updated });
    };

    const handleGlobalMouseUp = () => {
      setDraggingNoteId(null);
    };

    if (draggingNoteId) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingNoteId, dragOffset, width, height, annotations, onUpdateAnnotations, pageNumber]);

  return (
    <div 
      className="absolute inset-0 pointer-events-auto touch-none select-none"
      style={{
        cursor: 
          activeTool === 'select' ? 'default' :
          activeTool === 'eraser' ? 'crosshair' :
          activeTool === 'text' ? 'text' : 'crosshair'
      }}
    >
      {/* Interactive Canvas with Pointer Events for 100% Live Drawing */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 z-10 touch-none block"
      />

      {/* Render Sticky Text Notes overlay with Drag Handle and Color Tones */}
      {annotations.textNotes.map((note) => {
        const bg = note.color || '#FEF3C7';
        return (
          <div
            key={note.id}
            className="absolute z-20 group shadow-lg rounded-xl border p-2.5 min-w-[180px] max-w-[280px] transition-shadow focus-within:ring-2 focus-within:ring-indigo-500"
            style={{
              left: `${note.x}px`,
              top: `${note.y}px`,
              backgroundColor: bg,
              borderColor: 'rgba(0,0,0,0.15)',
              color: '#0E1220'
            }}
          >
            <div 
              onMouseDown={(e) => handleNoteDragStart(e, note)}
              className="flex items-center justify-between border-b border-black/10 pb-1 mb-1.5 text-xs text-slate-800/80 cursor-grab active:cursor-grabbing"
              title="Drag note"
            >
              <span className="font-semibold flex items-center gap-1 select-none">
                <GripHorizontal className="w-3.5 h-3.5 opacity-60" /> Note
              </span>
              <button
                onClick={() => handleDeleteTextNote(note.id)}
                className="p-0.5 hover:bg-black/10 rounded text-slate-800 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={note.text}
              onChange={(e) => handleTextChange(note.id, e.target.value)}
              className="w-full bg-transparent resize-none border-none outline-none text-xs leading-relaxed text-slate-900 placeholder-slate-500 font-sans"
              rows={3}
            />
          </div>
        );
      })}
    </div>
  );
};
