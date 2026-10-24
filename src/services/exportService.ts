import { PDFDocument, rgb } from 'pdf-lib';
import type { PageAnnotations, AudioMemo, Snapshot, PruneReason, PaperTone } from '../types/document';

export interface ProjectBundle {
  version: string;
  appName?: string;
  fileName: string;
  pdfBase64: string;
  excludedPages: number[];
  annotations: Record<number, PageAnnotations>;
  snapshots: Snapshot[];
  audioMemos: AudioMemo[];
  tags: Record<number, string[]>;
  bookmarks: number[];
  pruneReasons?: Record<number, PruneReason>;
  paperTone?: PaperTone;
  lastSaved: number;
}

// Convert hex color to rgb [0..1]
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export class ExportService {
  /**
   * Generates a clean PDF containing ONLY kept pages with annotations baked in.
   */
  public static async exportCleanPDF(
    originalBuffer: ArrayBuffer,
    excludedPages: Set<number>,
    annotations: Record<number, PageAnnotations>,
    viewScale: number = 1.0
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(originalBuffer);
    const outDoc = await PDFDocument.create();

    const totalPages = srcDoc.getPageCount();
    const keptIndices: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (!excludedPages.has(i)) {
        keptIndices.push(i - 1); // 0-based
      }
    }

    if (keptIndices.length === 0) {
      throw new Error('All pages have been excluded. Keep at least 1 page to export.');
    }

    const copiedPages = await outDoc.copyPages(srcDoc, keptIndices);

    for (let i = 0; i < keptIndices.length; i++) {
      const originalPageNumber = keptIndices[i] + 1;
      const page = copiedPages[i];
      outDoc.addPage(page);

      const pageAnnots = annotations[originalPageNumber];
      if (!pageAnnots) continue;

      const { height } = page.getSize();

      // Bake shapes
      for (const shape of pageAnnots.shapes) {
        const c = hexToRgb(shape.color);
        const normStartX = shape.startX / viewScale;
        const normStartY = shape.startY / viewScale;
        const normEndX = shape.endX / viewScale;
        const normEndY = shape.endY / viewScale;

        // In PDF coordinates, (0,0) is bottom-left, while canvas (0,0) is top-left
        const pdfStartY = height - normStartY;
        const pdfEndY = height - normEndY;

        if (shape.type === 'rectangle') {
          const x = Math.min(normStartX, normEndX);
          const y = Math.min(pdfStartY, pdfEndY);
          const w = Math.abs(normEndX - normStartX);
          const h = Math.abs(pdfEndY - pdfStartY);

          page.drawRectangle({
            x,
            y,
            width: w,
            height: h,
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: shape.width / viewScale,
          });
        } else if (shape.type === 'circle') {
          const cx = (normStartX + normEndX) / 2;
          const cy = (pdfStartY + pdfEndY) / 2;
          const rx = Math.abs(normEndX - normStartX) / 2;
          const ry = Math.abs(pdfEndY - pdfStartY) / 2;

          page.drawEllipse({
            x: cx,
            y: cy,
            xScale: rx,
            yScale: ry,
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: shape.width / viewScale,
          });
        } else if (shape.type === 'line' || shape.type === 'arrow') {
          page.drawLine({
            start: { x: normStartX, y: pdfStartY },
            end: { x: normEndX, y: pdfEndY },
            color: rgb(c.r, c.g, c.b),
            thickness: shape.width / viewScale,
          });
        }
      }

      // Bake freehand strokes & highlighters
      for (const stroke of pageAnnots.strokes) {
        if (stroke.points.length < 2) continue;
        const c = hexToRgb(stroke.color);
        const strokeWidth = (stroke.width / viewScale) * (stroke.tool === 'highlighter' ? 2.5 : 1);
        const opacity = stroke.tool === 'highlighter' ? 0.35 : (stroke.opacity || 0.9);

        for (let p = 0; p < stroke.points.length - 1; p++) {
          const p1 = stroke.points[p];
          const p2 = stroke.points[p + 1];

          page.drawLine({
            start: { x: p1.x / viewScale, y: height - p1.y / viewScale },
            end: { x: p2.x / viewScale, y: height - p2.y / viewScale },
            color: rgb(c.r, c.g, c.b),
            thickness: strokeWidth,
            opacity: opacity,
          });
        }
      }

      // Bake text notes
      for (const note of pageAnnots.textNotes) {
        const c = hexToRgb(note.color || '#fef08a');
        const pdfY = height - (note.y / viewScale) - 24;

        // Background callout box
        page.drawRectangle({
          x: note.x / viewScale,
          y: pdfY - 4,
          width: Math.max(120, note.text.length * 7),
          height: 22,
          color: rgb(0.98, 0.96, 0.8),
          borderColor: rgb(c.r, c.g, c.b),
          borderWidth: 1,
        });

        page.drawText(note.text, {
          x: (note.x / viewScale) + 6,
          y: pdfY,
          size: 10,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
    }

    return outDoc.save();
  }

  /**
   * Bundles full state into a JSON project archive (.fdeck).
   */
  public static async createProjectBundle(
    fileName: string,
    pdfBuffer: ArrayBuffer,
    excludedPages: Set<number>,
    annotations: Record<number, PageAnnotations>,
    snapshots: Snapshot[],
    audioMemos: AudioMemo[],
    tags: Record<number, string[]>,
    bookmarks: number[],
    pruneReasons?: Record<number, PruneReason>,
    paperTone?: PaperTone
  ): Promise<string> {
    const uint8 = new Uint8Array(pdfBuffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const pdfBase64 = btoa(binary);

    const bundle: ProjectBundle = {
      version: '1.0.0',
      appName: 'FocusDeck PDF',
      fileName,
      pdfBase64,
      excludedPages: Array.from(excludedPages),
      annotations,
      snapshots,
      audioMemos,
      tags,
      bookmarks,
      pruneReasons,
      paperTone,
      lastSaved: Date.now(),
    };

    return JSON.stringify(bundle, null, 2);
  }

  /**
   * Parses project bundle file back to memory (.fdeck or legacy .lumina).
   */
  public static parseProjectBundle(jsonString: string): {
    fileName: string;
    pdfBuffer: ArrayBuffer;
    excludedPages: Set<number>;
    annotations: Record<number, PageAnnotations>;
    snapshots: Snapshot[];
    audioMemos: AudioMemo[];
    tags: Record<number, string[]>;
    bookmarks: number[];
    pruneReasons?: Record<number, PruneReason>;
    paperTone?: PaperTone;
  } {
    const bundle: ProjectBundle = JSON.parse(jsonString);
    const binary = atob(bundle.pdfBase64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return {
      fileName: bundle.fileName,
      pdfBuffer: bytes.buffer,
      excludedPages: new Set(bundle.excludedPages || []),
      annotations: bundle.annotations || {},
      snapshots: bundle.snapshots || [],
      audioMemos: bundle.audioMemos || [],
      tags: bundle.tags || {},
      bookmarks: bundle.bookmarks || [],
      pruneReasons: bundle.pruneReasons || {},
      paperTone: bundle.paperTone || 'dark',
    };
  }

  /**
   * Trigger native browser download if Electron API isn't present
   */
  public static triggerBrowserDownload(data: Uint8Array | string, filename: string, mimeType: string) {
    const blob = new Blob([data as any], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
