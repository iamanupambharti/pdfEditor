# 🎓 FocusDeck PDF — Study less. Retain more.

> **Offline Exam-Prep PDF Workstation for High-Stakes Competitive Exams (GATE, UPSC, USMLE, Bar, CFA).**

Designed with a high-end **Raycast & Linear-inspired dark aesthetic**, FocusDeck PDF was engineered around the philosophy of **subtraction**: students *prune* the non-examinable pages they won't be tested on, annotate and tag high-yield concepts, record voice explanations, and export lean, exam-ready revision decks.

---

## ✨ Flagship Capabilities

### 1. 🧠 Cognitive Load Page Pruner & Safety Bin
- **Instant Page Triage**: Press `Delete` or click Prune on the toolbar or thumbnail to exclude irrelevant material.
- **Cognitive Relief HUD**: Real-time counter showing active pages to master, pruned pages, burden reduction %, and estimated study time saved.
- **Prune Reasons**: Tag pruned pages with reasons (*Already Mastered*, *Out of Syllabus*, *Low-Yield Proof*, *Other*).
- **Safety Bin**: Discarded pages are 100% preserved in a safety drawer and can be restored individually or all at once.
- **Batch Range Pruning**: Exclude entire sections (e.g., historical appendix or non-examinable proofs) with one command.

### 2. 📖 Adaptive Reading & Viewport Suite
- **3-Way Paper Tone Switcher**:
  - **Dark Mode**: Default dark workstation backdrop.
  - **Sepia Paper**: Gentle warm tone for reduced eye strain during late-night cram sessions.
  - **Night Inverted PDF**: OLED black mode (`invert(0.9) hue-rotate(180deg)` applied directly to the PDF canvas without altering colored annotations).
- **Editable Page Jump**: Click and type directly into the bottom floating pagination pill (`Page [ 14 ] of 412`) to jump instantly.
- **Right-Edge Vertical Minimap**: 48-tick vertical overview displaying active (white), pruned (rose), and bookmarked (amber) pages.

### 3. 🎨 Vector Annotation & Diagramming Engine
- **Freehand Pen (`P`)**: Low-latency vector strokes with custom color palette, stroke slider, and custom hex color picker.
- **Smart Exam Highlighter (`H`)**: Composite `multiply` blending that naturally preserves underlying textbook typography.
- **Precision Eraser (`E`)**: Deletes drawn paths dynamically on touch.
- **Positionable Sticky Notes (`T`)**: 4-color note cards (Yellow, Mint, Sky, Lavender) with drag handles and auto-sizing text areas.
- **Geometric Diagrams (`S`)**: Rectangles, Circles, Arrows, and Rule Lines.
- **Audio Voice Memos (`M`)**: Record verbal concept summaries and exam doubts directly onto specific pages.

### 4. ⏳ Snapshot Timeline & Safety Rollback
- **Safety Auto-Checkpoints**: Automatically saves snapshots before batch prunes, rollbacks, and exports.
- **Manual Named Snapshots**: Save named checkpoints (e.g., *"Pre-Midterm Prune"*).
- **1-Click Rollback**: Revert your entire document, annotations, tags, and pruned pages to any previous version.
- **Multi-Level Undo/Redo**: 30-level `Ctrl+Z` and `Ctrl+Y` stack.

### 5. ⏱️ Exam Productivity & Focus Tools
- **Integrated Pomodoro Timer**: 25m study / 5m short break / 15m long break intervals with soft acoustic chime notifications.
- **Target Exam Countdown**: Set your exam date in Settings to view a live `X days to exam` chip in the banner.
- **Distraction-Free Zen Mode (`Z` or `F11`)**: Collapses sidebars and toolbars for deep, uninterrupted revision.
- **Custom Hashtags & Bookmarks**: Tag pages with `#HighYield`, `#Formula`, `#ExamDoubt` and filter instantly.
- **Raycast-Style Command Palette (`Ctrl+K`)**: Rapid keyboard search for every command, tool, and setting.

### 6. 🚀 Dual Export & Portability
- **Export Clean Exam PDF**: Generates an optimized, standard PDF with pruned pages excluded and vector annotations baked in.
- **FocusDeck Project Bundle (`.fdeck`)**: Complete workspace save including original PDF, annotations, snapshots, voice memos, tags, and prune reasons (with full backward compatibility for legacy `.lumina` files).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` | Open Command Palette |
| `Delete` | Prune or Restore Current Page |
| `P` | Freehand Pen tool |
| `H` | Smart Highlighter tool |
| `E` | Precision Eraser tool |
| `T` | Sticky Text Note |
| `S` | Geometric Shapes tool |
| `V` | Pointer / Select tool |
| `M` | Record Audio Voice Memo |
| `B` | Bookmark Page |
| `Z` or `F11` | Toggle Zen Cram Mode |
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo action |
| `Ctrl + O` | Open PDF or `.fdeck` bundle |
| `Ctrl + E` | Open Export Modal |
| `Ctrl + Shift + S` | Save Version Checkpoint |
| `← / →` | Previous Page / Next Page |

---

## 🖥️ Launching on your PC

### Native Desktop Window (Electron)
```bash
npm run electron:dev
```

### Browser Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```
