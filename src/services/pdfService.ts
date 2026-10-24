import * as pdfjsLib from 'pdfjs-dist';

// Configure worker src reliably
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';
}

export interface RenderPageResult {
  width: number;
  height: number;
  viewport: pdfjsLib.PageViewport;
}

export class PDFService {
  private static activeTasks: Map<string, pdfjsLib.RenderTask> = new Map();

  public static async loadDocument(data: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/standard_fonts/',
    });
    return loadingTask.promise;
  }

  public static async renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.0,
    taskIdKey?: string
  ): Promise<RenderPageResult> {
    if (taskIdKey && this.activeTasks.has(taskIdKey)) {
      try {
        this.activeTasks.get(taskIdKey)!.cancel();
      } catch {
        // Ignored cancellation
      }
      this.activeTasks.delete(taskIdKey);
    }

    const page = await pdfDoc.getPage(pageNumber);
    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale });

    // High DPI crisp canvas setup
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Failed to get 2D canvas context');
    }

    context.save();
    context.scale(dpr, dpr);

    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    const renderTask = page.render(renderContext);
    if (taskIdKey) {
      this.activeTasks.set(taskIdKey, renderTask);
    }

    try {
      await renderTask.promise;
    } finally {
      context.restore();
      if (taskIdKey) {
        this.activeTasks.delete(taskIdKey);
      }
    }

    return {
      width: viewport.width,
      height: viewport.height,
      viewport,
    };
  }

  public static async renderThumbnail(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    targetWidth: number = 140
  ): Promise<string> {
    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext('2d');
    if (!context) return '';

    const renderContext: any = {
      canvasContext: context,
      viewport,
      canvas,
    };

    await page.render(renderContext).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
