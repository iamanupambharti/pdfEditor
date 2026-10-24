export type ToolType = 
  | 'select' 
  | 'hand'
  | 'pen' 
  | 'highlighter' 
  | 'eraser' 
  | 'text' 
  | 'shape' 
  | 'audio';

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'line';

export type PaperTone = 'dark' | 'sepia' | 'night';

export type PruneReason = 'mastered' | 'syllabus' | 'low_yield' | 'other';

export interface Point {
  x: number;
  y: number;
}

export interface StrokeAnnotation {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  width: number;
  opacity: number;
  points: Point[];
}

export interface ShapeAnnotation {
  id: string;
  type: ShapeType;
  color: string;
  width: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TextNoteAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  width?: number;
  height?: number;
}

export interface AudioMemo {
  id: string;
  pageNumber: number;
  title: string;
  audioBase64: string;
  durationSeconds: number;
  createdAt: string;
  x?: number;
  y?: number;
  xPct?: number;
  yPct?: number;
}

export interface PageAnnotations {
  strokes: StrokeAnnotation[];
  shapes: ShapeAnnotation[];
  textNotes: TextNoteAnnotation[];
}

export interface Snapshot {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  excludedPages: number[];
  annotations: Record<number, PageAnnotations>;
  audioMemos: AudioMemo[];
  tags: Record<number, string[]>;
  pruneReasons?: Record<number, PruneReason>;
  isAuto?: boolean;
}

export interface PDFDocumentState {
  fileName: string;
  fileBuffer: ArrayBuffer | null;
  numPages: number;
  excludedPages: Set<number>;
  currentPage: number;
  scale: number;
  annotations: Record<number, PageAnnotations>;
  snapshots: Snapshot[];
  audioMemos: AudioMemo[];
  tags: Record<number, string[]>;
  bookmarks: number[];
  pruneReasons?: Record<number, PruneReason>;
  paperTone?: PaperTone;
}

export interface PomodoroState {
  isRunning: boolean;
  timeLeft: number; // in seconds
  mode: 'study' | 'shortBreak' | 'longBreak';
  sessionsCompleted: number;
  targetMinutes: number;
}

export interface SettingsState {
  minutesSavedPerPage: number;
  pomodoroStudyMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  chimeEnabled: boolean;
  chimeVolume: number;
  examDate?: string | null;
  examTitle?: string | null;
  defaultPaperTone: PaperTone;
}

export interface FocusDeckBundle {
  version: "1.0.0" | "legacy";
  appName: "FocusDeck PDF" | "LuminaPDF";
  timestamp: number;
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
}
