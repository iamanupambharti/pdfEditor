import React, { useState, useEffect, useCallback, useRef } from 'react';
import type * as pdfjsLib from 'pdfjs-dist';
import { PDFService } from './services/pdfService';
import { ExportService } from './services/exportService';
import { generateSampleExamPDF } from './services/sampleGenerator';
import type { 
  ToolType, 
  ShapeType, 
  PageAnnotations, 
  Snapshot, 
  AudioMemo, 
  PomodoroState,
  PaperTone,
  PruneReason,
  SettingsState
} from './types/document';

// Components
import { TitleBar } from './components/TitleBar';
import { Toolbar } from './components/Toolbar';
import { ExamBanner } from './components/ExamBanner';
import { Sidebar } from './components/Sidebar';
import type { SidebarTab } from './components/Sidebar';
import { PDFViewer } from './components/PDFViewer';
import { SnapshotModal } from './components/SnapshotModal';
import { ExportModal } from './components/ExportModal';
import { AudioRecordModal } from './components/AudioRecordModal';
import { CommandPalette } from './components/CommandPalette';
import { PomodoroWidget } from './components/PomodoroWidget';
import { SettingsModal } from './components/SettingsModal';

import { Minimize2, FileUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HistoryState {
  excludedPages: Set<number>;
  annotations: Record<number, PageAnnotations>;
}

export function App() {
  // Document state
  const [fileName, setFileName] = useState<string>('');
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [excludedPages, setExcludedPages] = useState<Set<number>>(new Set());
  const [annotations, setAnnotations] = useState<Record<number, PageAnnotations>>({});
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [audioMemos, setAudioMemos] = useState<AudioMemo[]>([]);
  const [tags, setTags] = useState<Record<number, string[]>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [pruneReasons, setPruneReasons] = useState<Record<number, PruneReason>>({});
  const [paperTone, setPaperTone] = useState<PaperTone>('dark');
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Sync theme with document attributes (§4.1)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme]);

  const handleToggleTheme = () => {
    setAppTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    minutesSavedPerPage: 3,
    pomodoroStudyMinutes: 25,
    pomodoroShortBreakMinutes: 5,
    pomodoroLongBreakMinutes: 15,
    chimeEnabled: true,
    chimeVolume: 0.2,
    examDate: null,
    examTitle: null,
    defaultPaperTone: 'dark',
  });
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // History stack for in-session Undo/Redo
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Tool states
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedColor, setSelectedColor] = useState<string>('#f59e0b');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');

  // Modals & Drawers
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('thumbnails');
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPomodoroWidget, setShowPomodoroWidget] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Pomodoro state
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'study',
    sessionsCompleted: 0,
    targetMinutes: 25,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to push history state
  const pushHistory = useCallback((newExcluded?: Set<number>, newAnnots?: Record<number, PageAnnotations>) => {
    setUndoStack((prev) => [
      ...prev.slice(-30),
      {
        excludedPages: new Set(newExcluded ?? excludedPages),
        annotations: newAnnots ?? annotations,
      },
    ]);
    setRedoStack([]);
    setHasUnsavedChanges(true);
  }, [excludedPages, annotations]);

  // Push Auto Snapshot helper (§17.7 & §18.2 P1)
  const pushAutoSnapshot = useCallback((reason: string) => {
    const autoSnap: Snapshot = {
      id: `auto-snap-${Date.now()}`,
      name: `Auto: ${reason}`,
      description: `Snapshot created before ${reason.toLowerCase()}`,
      timestamp: Date.now(),
      excludedPages: Array.from(excludedPages),
      annotations,
      audioMemos,
      tags,
      pruneReasons,
      isAuto: true,
    };
    setSnapshots((prev) => [autoSnap, ...prev.slice(0, 19)]);
  }, [excludedPages, annotations, audioMemos, tags, pruneReasons]);

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [
      ...prev,
      {
        excludedPages: new Set(excludedPages),
        annotations,
      },
    ]);
    setExcludedPages(new Set(previous.excludedPages));
    setAnnotations(previous.annotations);
    setUndoStack((prev) => prev.slice(0, -1));
  }, [undoStack, excludedPages, annotations]);

  // Handle Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [
      ...prev,
      {
        excludedPages: new Set(excludedPages),
        annotations,
      },
    ]);
    setExcludedPages(new Set(next.excludedPages));
    setAnnotations(next.annotations);
    setRedoStack((prev) => prev.slice(0, -1));
  }, [redoStack, excludedPages, annotations]);

  // Load PDF Buffer into State
  const loadPdfData = async (buffer: ArrayBuffer, name: string) => {
    try {
      const doc = await PDFService.loadDocument(buffer);
      setPdfBuffer(buffer);
      setPdfDoc(doc);
      setFileName(name);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setExcludedPages(new Set());
      setAnnotations({});
      setUndoStack([]);
      setRedoStack([]);
      setAudioMemos([]);
      setBookmarks([]);
      setTags({});
      setPruneReasons({});
      setPaperTone(settings.defaultPaperTone);
      setHasUnsavedChanges(false);

      // Create initial baseline snapshot
      const initialSnap: Snapshot = {
        id: `snap-${Date.now()}`,
        name: 'Original Document Baseline',
        description: 'Auto-saved baseline when document was opened',
        timestamp: Date.now(),
        excludedPages: [],
        annotations: {},
        audioMemos: [],
        tags: {},
        isAuto: false,
      };
      setSnapshots([initialSnap]);
    } catch (err: any) {
      alert(`Error opening PDF: ${err?.message || err}`);
    }
  };

  // Open file via native Electron dialog or fallback HTML input
  const handleOpenFile = async () => {
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;
    if (isElectron) {
      try {
        const result = await (window as any).electronAPI.openPdfDialog();
        if (result && result.data) {
          if (result.name.endsWith('.fdeck') || result.name.endsWith('.lumina')) {
            const dec = new TextDecoder();
            const json = dec.decode(result.data);
            handleLoadProjectBundle(json);
          } else {
            await loadPdfData(result.data, result.name);
          }
        }
      } catch (err) {
        console.error('Electron open dialog failed:', err);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  // Browser file input fallback
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.fdeck') || file.name.endsWith('.lumina')) {
      const text = await file.text();
      handleLoadProjectBundle(text);
    } else {
      const buffer = await file.arrayBuffer();
      await loadPdfData(buffer, file.name);
    }
    e.target.value = '';
  };

  // Load built-in sample exam study PDF
  const handleLoadSample = async () => {
    const sampleBuffer = await generateSampleExamPDF();
    await loadPdfData(sampleBuffer, 'CS_Exam_Revision_Deck.pdf');
  };

  // Toggle page exclusion (Pruning)
  const handleToggleExcludePage = (pageNumber: number) => {
    setExcludedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      pushHistory(next);
      return next;
    });
  };

  // Batch prune range with safety checkpoint
  const handleBatchPrune = (start: number, end: number) => {
    pushAutoSnapshot(`Batch Prune Pages ${start}-${end}`);
    setExcludedPages((prev) => {
      const next = new Set(prev);
      for (let i = start; i <= end; i++) {
        next.add(i);
      }
      pushHistory(next);
      return next;
    });
  };

  // Restore all pruned pages
  const handleRestoreAllPruned = () => {
    if (excludedPages.size === 0) return;
    pushAutoSnapshot('Before Restoring All Pruned');
    pushHistory(new Set());
    setExcludedPages(new Set());
  };

  // Update annotations
  const handleUpdateAnnotations = (pageNumber: number, newAnnots: PageAnnotations) => {
    pushHistory(undefined, { ...annotations, [pageNumber]: newAnnots });
    setAnnotations((prev) => ({
      ...prev,
      [pageNumber]: newAnnots,
    }));
  };

  // Update prune reason
  const handleUpdatePruneReason = (page: number, reason: PruneReason) => {
    setPruneReasons((prev) => ({ ...prev, [page]: reason }));
    setHasUnsavedChanges(true);
  };

  // Snapshot Checkpoints
  const handleTakeSnapshot = (name: string, description: string) => {
    const snap: Snapshot = {
      id: `snap-${Date.now()}`,
      name,
      description,
      timestamp: Date.now(),
      excludedPages: Array.from(excludedPages),
      annotations,
      audioMemos,
      tags,
      pruneReasons,
      isAuto: false,
    };
    setSnapshots((prev) => [snap, ...prev]);
  };

  // Rollback to Snapshot with auto-checkpoint before rollback
  const handleRollbackSnapshot = (snapshotId: string) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return;

    pushAutoSnapshot(`Before Rollback to ${snap.name}`);
    pushHistory();
    setExcludedPages(new Set(snap.excludedPages));
    setAnnotations(snap.annotations || {});
    setAudioMemos(snap.audioMemos || []);
    setTags(snap.tags || {});
    if (snap.pruneReasons) setPruneReasons(snap.pruneReasons);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Save Audio Memo
  const handleSaveAudioMemo = (title: string, audioBase64: string, durationSeconds: number) => {
    const memo: AudioMemo = {
      id: `audio-${Date.now()}`,
      pageNumber: currentPage,
      title,
      audioBase64,
      durationSeconds,
      createdAt: new Date().toISOString(),
    };
    setAudioMemos((prev) => [memo, ...prev]);
    setHasUnsavedChanges(true);
  };

  // Delete Audio Memo
  const handleDeleteAudioMemo = (memoId: string) => {
    setAudioMemos((prev) => prev.filter((m) => m.id !== memoId));
    setHasUnsavedChanges(true);
  };

  // Add Tag
  const handleAddTagToPage = (page: number, tag: string) => {
    setTags((prev) => {
      const current = prev[page] || [];
      if (current.includes(tag)) return prev;
      return { ...prev, [page]: [...current, tag] };
    });
    setHasUnsavedChanges(true);
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    setBookmarks((prev) => {
      if (prev.includes(currentPage)) {
        return prev.filter((p) => p !== currentPage);
      }
      return [...prev, currentPage];
    });
    setHasUnsavedChanges(true);
  };

  // Fit width
  const handleFitWidth = () => {
    setScale(1.35);
  };

  // Export clean PDF
  const handleExportCleanPDF = async () => {
    if (!pdfBuffer) return;
    pushAutoSnapshot('Before Clean PDF Export');
    const bytes = await ExportService.exportCleanPDF(
      pdfBuffer,
      excludedPages,
      annotations,
      scale
    );

    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;
    const cleanName = fileName.replace(/\.pdf$/i, '') + '_Pruned_Exam_Deck.pdf';

    if (isElectron) {
      await (window as any).electronAPI.saveFileDialog({
        defaultName: cleanName,
        filters: [{ name: 'Cleaned PDF Document', extensions: ['pdf'] }],
        data: bytes,
      });
    } else {
      ExportService.triggerBrowserDownload(bytes, cleanName, 'application/pdf');
    }
  };

  // Export Project Bundle (.fdeck)
  const handleExportProjectBundle = async () => {
    if (!pdfBuffer) return;
    const jsonStr = await ExportService.createProjectBundle(
      fileName,
      pdfBuffer,
      excludedPages,
      annotations,
      snapshots,
      audioMemos,
      tags,
      bookmarks,
      pruneReasons,
      paperTone
    );

    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;
    const bundleName = fileName.replace(/\.pdf$/i, '') + '_FocusDeck.fdeck';

    if (isElectron) {
      const enc = new TextEncoder();
      await (window as any).electronAPI.saveFileDialog({
        defaultName: bundleName,
        filters: [
          { name: 'FocusDeck Project Bundle', extensions: ['fdeck'] },
          { name: 'Legacy Lumina Project', extensions: ['lumina'] }
        ],
        data: enc.encode(jsonStr),
      });
    } else {
      ExportService.triggerBrowserDownload(jsonStr, bundleName, 'application/json');
    }
    setHasUnsavedChanges(false);
  };

  // Load Project Bundle (.fdeck or .lumina)
  const handleLoadProjectBundle = async (jsonString: string) => {
    try {
      const parsed = ExportService.parseProjectBundle(jsonString);
      const doc = await PDFService.loadDocument(parsed.pdfBuffer);
      setPdfBuffer(parsed.pdfBuffer);
      setPdfDoc(doc);
      setFileName(parsed.fileName);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setExcludedPages(parsed.excludedPages);
      setAnnotations(parsed.annotations);
      setSnapshots(parsed.snapshots);
      setAudioMemos(parsed.audioMemos);
      setTags(parsed.tags);
      setBookmarks(parsed.bookmarks);
      if (parsed.pruneReasons) setPruneReasons(parsed.pruneReasons);
      if (parsed.paperTone) setPaperTone(parsed.paperTone);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      alert(`Failed to load FocusDeck Project: ${err.message || err}`);
    }
  };

  // Drag and drop PDF / .fdeck onto window (§17.5)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.fdeck') || file.name.endsWith('.lumina')) {
        const text = await file.text();
        handleLoadProjectBundle(text);
      } else {
        const buffer = await file.arrayBuffer();
        await loadPdfData(buffer, file.name);
      }
    }
  };

  // Global Keyboard Shortcuts (§17.10)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Suppress when typing in inputs/textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExportModal(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSnapshotModal(true);
      } else if (e.key === 'Delete') {
        handleToggleExcludePage(currentPage);
      } else if (e.key.toLowerCase() === 'p') {
        setActiveTool('pen');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('highlighter');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('eraser');
      } else if (e.key.toLowerCase() === 't') {
        setActiveTool('text');
      } else if (e.key.toLowerCase() === 's') {
        setActiveTool('shape');
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'm') {
        setShowAudioModal(true);
      } else if (e.key.toLowerCase() === 'b') {
        handleToggleBookmark();
      } else if (e.key.toLowerCase() === 'z' || e.key === 'F11') {
        setIsZenMode((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isZenMode) setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentPage, handleUndo, handleRedo, isZenMode]);

  // Load sample on first run if no document
  useEffect(() => {
    handleLoadSample();
  }, []);

  const isCurrentPageExcluded = excludedPages.has(currentPage);
  const isBookmarked = bookmarks.includes(currentPage);
  const activePagesCount = numPages - excludedPages.size;

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none relative transition-colors duration-200 ${
        appTheme === 'light' ? 'bg-[#F7F7F5] text-[#0E1220]' : 'bg-[#0A0D14] text-[#E8EAF0]'
      }`}
    >
      {/* Visual Full-Screen Drag and Drop Overlay (§17.5) */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-8 pointer-events-none">
          <div className="w-full max-w-md border-2 border-dashed border-indigo-500 rounded-3xl p-10 text-center bg-indigo-950/30 shadow-2xl">
            <FileUp className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">Drop your PDF to open it</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Drop any standard <span className="text-indigo-300 font-mono">.pdf</span> file or <span className="text-indigo-300 font-mono">.fdeck</span> project bundle here.
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.fdeck,.lumina"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Top Window TitleBar (§17.1) */}
      {!isZenMode && (
        <TitleBar
          fileName={fileName}
          activePagesCount={activePagesCount}
          excludedPagesCount={excludedPages.size}
          theme={appTheme}
          onToggleTheme={handleToggleTheme}
          onOpenFile={handleOpenFile}
          onOpenSnapshotModal={() => setShowSnapshotModal(true)}
          onOpenExportModal={() => setShowExportModal(true)}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          pomodoroTimeLeft={pomodoro.timeLeft}
          isPomodoroRunning={pomodoro.isRunning}
          onTogglePomodoro={() => setPomodoro((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
          hasUnsavedChanges={hasUnsavedChanges}
          snapshotCount={snapshots.length}
        />
      )}

      {/* Primary Study Toolbar (§17.3) */}
      {!isZenMode && (
        <Toolbar
          activeTool={activeTool}
          onChangeTool={setActiveTool}
          selectedColor={selectedColor}
          onChangeColor={setSelectedColor}
          strokeWidth={strokeWidth}
          onChangeStrokeWidth={setStrokeWidth}
          shapeType={shapeType}
          onChangeShapeType={setShapeType}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          scale={scale}
          onChangeScale={setScale}
          onFitWidth={handleFitWidth}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(true)}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          isCurrentPageExcluded={isCurrentPageExcluded}
          onToggleExcludeCurrentPage={() => handleToggleExcludePage(currentPage)}
          currentPage={currentPage}
          totalPages={numPages}
          onStartAudioRecording={() => setShowAudioModal(true)}
          paperTone={paperTone}
          onChangePaperTone={setPaperTone}
          theme={appTheme}
        />
      )}

      {/* Exam Focus Banner (§17.2) */}
      {!isZenMode && (
        <ExamBanner
          numPages={numPages}
          excludedPages={excludedPages}
          minutesSavedPerPage={settings.minutesSavedPerPage}
          examDate={settings.examDate}
          onBatchPrune={handleBatchPrune}
          onRestoreAllPruned={handleRestoreAllPruned}
          onOpenSnapshotModal={() => setShowSnapshotModal(true)}
          onOpenSidebarToTab={(tab) => setSidebarTab(tab)}
          theme={appTheme}
        />
      )}

      {/* Main Workspace: Collapsible Sidebar + Canvas Viewer */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isZenMode && (
          <Sidebar
            pdfDoc={pdfDoc}
            numPages={numPages}
            currentPage={currentPage}
            excludedPages={excludedPages}
            bookmarks={bookmarks}
            tags={tags}
            audioMemos={audioMemos}
            snapshots={snapshots}
            pruneReasons={pruneReasons}
            activeTab={sidebarTab}
            onChangeTab={setSidebarTab}
            onSelectPage={setCurrentPage}
            onToggleExcludePage={handleToggleExcludePage}
            onRestoreAllPruned={handleRestoreAllPruned}
            onRollbackSnapshot={handleRollbackSnapshot}
            onDeleteAudioMemo={handleDeleteAudioMemo}
            onAddTagToPage={handleAddTagToPage}
            onUpdatePruneReason={handleUpdatePruneReason}
            theme={appTheme}
          />
        )}

        {/* Central PDF Canvas Stage (§17.5) */}
        <PDFViewer
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          numPages={numPages}
          scale={scale}
          excludedPages={excludedPages}
          bookmarks={bookmarks}
          activeTool={activeTool}
          selectedColor={selectedColor}
          strokeWidth={strokeWidth}
          shapeType={shapeType}
          annotations={annotations}
          audioMemos={audioMemos}
          paperTone={paperTone}
          theme={appTheme}
          onUpdateAnnotations={handleUpdateAnnotations}
          onPageChange={setCurrentPage}
          onToggleExcludeCurrentPage={() => handleToggleExcludePage(currentPage)}
        />

        {/* Zen Mode Exit Button */}
        {isZenMode && (
          <button
            onClick={() => setIsZenMode(false)}
            className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-[#11151F]/90 border border-white/20 text-slate-300 hover:text-white hover:bg-[#171C29] backdrop-blur-md shadow-xl transition-all cursor-pointer"
            title="Exit Zen Mode (Press Z or Esc)"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Floating Pomodoro Widget (§17.6) */}
      {showPomodoroWidget && (
        <PomodoroWidget
          state={pomodoro}
          onChangeState={setPomodoro}
          onClose={() => setShowPomodoroWidget(false)}
          theme={appTheme}
        />
      )}

      {/* Modals */}
      <SnapshotModal
        isOpen={showSnapshotModal}
        onClose={() => setShowSnapshotModal(false)}
        snapshots={snapshots}
        onTakeSnapshot={handleTakeSnapshot}
        onRollback={handleRollbackSnapshot}
        theme={appTheme}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        fileName={fileName}
        numPages={numPages}
        excludedPages={excludedPages}
        onExportCleanPDF={handleExportCleanPDF}
        onExportProjectBundle={handleExportProjectBundle}
        theme={appTheme}
      />

      <AudioRecordModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        pageNumber={currentPage}
        onSaveAudioMemo={handleSaveAudioMemo}
        theme={appTheme}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTool={setActiveTool}
        onToggleExcludeCurrentPage={() => handleToggleExcludePage(currentPage)}
        onOpenSnapshotModal={() => setShowSnapshotModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onToggleZenMode={() => setIsZenMode((prev) => !prev)}
        onTogglePomodoro={() => {
          setPomodoro((prev) => ({ ...prev, isRunning: !prev.isRunning }));
          setShowPomodoroWidget(true);
        }}
        onOpenFile={handleOpenFile}
        onLoadSample={handleLoadSample}
        onOpenSettings={() => setShowSettingsModal(true)}
        onChangePaperTone={setPaperTone}
        isCurrentPageExcluded={isCurrentPageExcluded}
        currentPage={currentPage}
        theme={appTheme}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSaveSettings={setSettings}
        theme={appTheme}
      />
    </div>
  );
}

export default App;
