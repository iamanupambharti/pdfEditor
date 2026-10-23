# 📋 Product & UI Specification Brief: FocusDeck PDF (formerly LuminaPDF)

---

## 🏷️ 1. Application Name & Rebranding Proposals

Currently named **LuminaPDF**, the application is an enterprise academic reader and cognitive exam-prep tool. Below are premium, targeted naming options designed to align with its core value proposition—**eliminating study bloat, cutting cognitive load, and preparing for high-stakes exams**:

| Proposed Name | Tone & Persona | Why It Fits |
| :--- | :--- | :--- |
| **FocusDeck PDF** *(Top Recommendation)* | Modern, productivity-focused, academic | Directly highlights turning sprawling textbooks into lean, mastered "decks" of exam-ready pages. |
| **Kanso PDF** | Minimalist, Zen, Japanese aesthetic (*Kanso* = simplicity/eliminating clutter) | Matches the app's mission: stripping away non-essential clutter so students retain peak focus. |
| **PruneDesk** | Technical, action-oriented, sharp | Focuses on the core cognitive feature: pruning irrelevant appendices, proofs, and fluff. |
| **ExamiFlux** | High-velocity, competitive student | Sounds dynamic and high-performance; tailored for fast exam revision cycles. |
| **ApexReader PRO** | Enterprise, authoritative, premium | Positioned as an elite workstation tool for competitive exam aspirants (GATE, USMLE, Bar Exam, CFA). |
| **CramCraft** | Approachable, student-centric | Emphasizes transforming heavy course material into tailored revision packs. |

> **Recommended Decision**: **FocusDeck PDF** (or **Kanso PDF** if leaning into a Zen Raycast aesthetic).

---

## 🛠️ 2. Comprehensive Tech Stack

| Layer | Technologies & Libraries | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Core Runtime** | **Electron v45.0.0** + **Node.js v24.x** | Cross-platform desktop wrapper with native Windows framing, custom frameless titlebar integration, and local OS file dialogs via IPC (`electronAPI`). |
| **Frontend Framework** | **React 19.3.1** (Hooks, StrictMode, Concurrent rendering) | Modern UI component hierarchy with state persistence, reactive canvases, and modal drawers. |
| **Language & Typings** | **TypeScript 6.0.3** | Strict type safety for document models, vector geometry, stroke serialization, and IPC bindings. |
| **Build Tooling & Bundler** | **Vite 8.3.4** + `@vitejs/plugin-react` | Instant HMR development server (`<50ms`), ES module bundling, tree-shaking, and production asset compression. |
| **Linting & Code Quality** | **Oxlint v1.88.0** | Ultra-fast Rust-based linter ensuring zero runtime syntax regressions. |
| **CSS & Design System** | **Tailwind CSS v4.3.3** (`@tailwindcss/vite`) | Utility-first styling with modern dark theme palette (Slate 900/950, Indigo 600 accents, Emerald highlights, Rose prune alerts). |
| **Iconography** | **Lucide React v1.61.0** | Consistent, feather-weight 24x24 vector stroke icons across toolbars, tabs, and menus. |
| **PDF Rendering Engine** | **Mozilla pdfjs-dist v6.4.299** | Hardware-accelerated HTML5 `<canvas>` rendering with dynamic DPI scaling, text layer mapping, and fast thumbnail generation. |
| **PDF Mutation & Vector Baking** | **pdf-lib v1.17.1** | Vector stream manipulation: removes pruned pages, bakes vector strokes, shapes, and sticky notes directly into standard compliant PDF files. |
| **Audio Processing** | **HTML5 MediaRecorder API** + **Web Audio API** | Captures microphone voice memos into base64 data URIs; synthesizes pleasant acoustic chime notifications for Pomodoro breaks. |
| **Celebration & UX Delight** | **canvas-confetti v1.9.4** | Physics-based particle confetti burst triggered upon successful export of clean exam revision decks. |
| **Development Concurrency** | **concurrently v10.0.6** + **wait-on v9.5.1** | Orchestrates simultaneous Vite frontend server and Electron native window boot in single command `npm run electron:dev`. |

---

## 🚀 3. Complete List of Features

### A. Cognitive Load Pruner & Exam Focus Deck
1. **One-Click Page Pruner**: Exclude/keep individual pages with one click or shortcut (`Del`).
2. **Cognitive Relief Metrics**: Real-time HUD displaying total pages, active pages, pruned pages, percentage burden reduction, and estimated study time saved (~3 min/pruned page).
3. **Batch Range Pruning**: Modal allowing bulk pruning of full page ranges (e.g., pages 45–90 for historical appendices).
4. **Safety Bin (Pruned Drawer)**: Dedicated sidebar tab listing every discarded page with instant one-click individual restore or "Restore All" recovery.
5. **Visual Prune Overlay**: Pruned pages in viewer display a translucent red warning overlay to prevent accidental study of excluded material.

### B. High-Performance Academic Annotation Suite
6. **Freehand Pen Tool (`P`)**: Low-latency vector stroke drawing with configurable stroke width, opacity, and palette.
7. **Smart Exam Highlighter (`H`)**: Multi-colored translucent marker mode with automatic composite blending that never obscures underlying PDF typography.
8. **Precision Stroke & Area Eraser (`E`)**: Collision-based vector stroke remover that deletes drawn paths on touch.
9. **Positionable Sticky Notes (`T`)**: Interactive draggable text notes with editable content, custom note color themes, and quick-delete handles.
10. **Geometric Diagrams (`S`)**: Vector rectangle, circle, directional arrow, and rule line generation for diagramming workflows.
11. **Multi-Level Undo & Redo (`Ctrl+Z` / `Ctrl+Y`)**: In-memory historical state stack tracking up to 30 actions across drawing, typing, and pruning.

### C. Voice Memo Dictation Engine
12. **Audio Voice Memos (`Mic`)**: Record spoken concept summaries and exam doubts directly onto specific pages.
13. **In-App Playback**: Built-in audio player inside the sidebar and directly over pages with play/pause and duration indicators.
14. **Audio Management**: Name memos, filter by page, and delete outdated voice snippets.

### D. Snapshot Timeline & 1-Click Rollback
15. **Manual Named Checkpoints**: Save complete document state snapshots with names and descriptions (e.g., "Pre-Midterm Prune").
16. **Chronological Snapshot Feed**: Visual timeline in the sidebar with relative timestamps and descriptions.
17. **1-Click Rollback**: Instantly revert the entire document's excluded pages, annotations, tags, and memos to any previous checkpoint.

### E. Exam Productivity & Focus Tools
18. **Integrated Pomodoro Study Timer**: 25-minute study sessions, 5-minute short breaks, 15-minute long breaks, and session completion counter.
19. **Acoustic Synthesizer Chimes**: Web Audio chime sounds alerting students when study/break intervals conclude.
20. **Zen Cram Mode (`Z` / `F11`)**: Distraction-free full-screen mode that collapses sidebars and banners for deep revision.
21. **High-Yield Tags & Bookmarks**: Custom page tags (`#HighYield`, `#Formula`, `#ExamDoubt`) with instant filtering and navigation.

### F. Dual Export & Project Portability
22. **Clean Exam PDF Export**: Compiles an optimized PDF containing *only* active pages with all vector drawings and sticky notes baked in.
23. **Project Bundle Archive (`.lumina` / JSON)**: Saves complete state (source PDF, annotations, snapshots, voice memos, tags) to reload on another machine.

### G. Command Palette & Navigation
24. **Raycast-Style Command Palette (`Ctrl+K`)**: Instant fuzzy search across every action, tool, modal, and command.
25. **Hardware Accelerated Zooming**: Smooth zoom from 50% to 300% plus "Fit Width" calculation.
26. **Built-in Sample Deck Generator**: Onboarding CS & System Design prep document with pre-configured diagrams and prunable appendices.

---

## 🎛️ 4. Exhaustive Catalog of Every Button in the UI

### 1. TitleBar (Top Window Header)
- **App Logo / Brand Pill**: Displays app badge (`FocusDeck PRO`).
- **Command Palette Button**: Opens command search (`Search` icon + "Command Palette" + `Ctrl+K` chip).
- **Pomodoro Quick Chip Button**: Toggles study timer running/paused with animated timer icon and countdown clock.
- **Snapshots Timeline Button**: Opens the Version History modal (`History` icon + "Snapshots").
- **Export Action Button**: Primary CTA opening the export engine (`Download` icon + "Export").
- **Window Minimize Button** *(Electron only)*: Minimizes desktop window (`Minus` icon).
- **Window Maximize/Restore Button** *(Electron only)*: Toggles fullscreen/windowed (`Square` icon).
- **Window Close Button** *(Electron only)*: Closes desktop window with red hover state (`X` icon).

### 2. Main Action & Annotation Toolbar
- **Prune / Restore Toggle Button**: Contextual button showing either *"Prune Page X"* with trash icon or *"Page X Pruned (Click to Restore)"* with green checkmark.
- **Bookmark Toggle Button**: Marks active page with golden ribbon bookmark icon.
- **Undo Button**: Reverts last canvas stroke or page action (`Undo2` icon; disabled when stack empty).
- **Redo Button**: Reapplies undone action (`Redo2` icon; disabled when stack empty).
- **Select / Pointer Tool (`V`)**: Activates default selection and scrolling mode.
- **Freehand Pen Tool (`P`)**: Activates vector drawing brush.
- **Smart Highlighter Tool (`H`)**: Activates translucent exam highlighter.
- **Eraser Tool (`E`)**: Activates stroke deletion tool.
- **Sticky Note Tool (`T`)**: Activates text note placement on canvas click.
- **Shapes Tool (`S`)**: Activates geometric diagram insertion.
- **Voice Memo Trigger Button**: Opens audio recording drawer with pulsing mic icon.
- **Zoom Out Button**: Decreases canvas scale by 15% (min 50%).
- **Zoom In Button**: Increases canvas scale by 15% (max 300%).
- **Fit Width Button**: Auto-scales document to viewer width.
- **Zen Mode Button**: Toggles full-screen distraction-free view (`Maximize2` icon).

### 3. Secondary Toolbars & In-Tool Sub-Buttons
- **Shape Type Sub-Buttons**:
  - *Rectangle Button*: Draws bounding boxes / algorithm frames.
  - *Circle Button*: Draws callout ovals.
  - *Arrow Button*: Draws directional workflow arrows.
  - *Line Button*: Draws clean underlines.
- **Color Swatch Buttons**: 8 circular color buttons (Amber, Red, Emerald, Electric Blue, Violet, Pink, White, Slate Dark).
- **Stroke Width Range Slider**: Interactive thumb to adjust stroke weight (1px to 16px).

### 4. Exam & Cognitive Burden Banner
- **Batch Prune Range Button**: Opens popover dialog to exclude multi-page intervals.
- **Batch Prune Apply Button**: Commits range exclusion (e.g., from Page A to Page B).
- **Batch Prune Cancel Button**: Dismisses range input popover.

### 5. Left Sidebar Controls & Tab Buttons
- **Collapse / Expand Sidebar Chevron Button**: Minimizes sidebar to 48px strip or expands to full 280px drawer.
- **Thumbnails Tab Button**: Grid preview of all document pages.
- **Excluded / Safety Bin Tab Button**: Displays pruned pages with page recovery actions.
- **Timeline / History Tab Button**: Displays snapshots and version checkpoints.
- **Bookmarks & Tags Tab Button**: Lists marked pages and active tag categories.
- **Voice Memos Tab Button**: Lists recorded audio memos with in-line players.
- **Thumbnail Page Card**: Clicking jumps viewer to that page.
- **Thumbnail Card Prune Icon Button**: Inline hover button to prune/unprune directly from thumbnail.
- **Restore All Pruned Pages Button** *(in Excluded Tab)*: Restores all excluded pages at once.
- **Single Page Restore Button** *(in Excluded Tab)*: Restores individual page back into active deck.
- **Rollback Snapshot Button** *(in Timeline Tab)*: Reverts entire document to that snapshot.
- **Audio Play / Pause Button** *(in Audio Tab)*: Plays or pauses recorded voice memo.
- **Delete Audio Memo Button** *(in Audio Tab)*: Deletes recorded audio note.
- **Add Tag Submit Button** *(in Bookmarks Tab)*: Appends new hashtag to current page.

### 6. PDF Viewer Canvas Overlay & Navigation Bar
- **Previous Page Button (`ChevronLeft`)**: Navigates to preceding page (disabled on page 1).
- **Next Page Button (`ChevronRight`)**: Navigates to subsequent page (disabled on last page).
- **Quick Restore Page Overlay Button**: Large button centered on pruned pages to immediately reinstate page.
- **Sticky Note Delete Button**: Trash can icon in header of sticky note card.
- **Sticky Note Drag Handle**: Header bar enabling note relocation across page.
- **Audio Memo Floating Chip**: Interactive badge on canvas displaying audio duration with 1-click listen.

### 7. Modal Buttons
- **Export Clean PDF Button** *(Export Modal)*: Generates and downloads pruned, flattened PDF with confetti effect.
- **Save Project Bundle Button** *(Export Modal)*: Downloads `.lumina` full workspace archive.
- **Close Modal Button (`X`)**: Present in Export, Snapshot, Audio, and Pomodoro modals.
- **Save Checkpoint Button** *(Snapshot Modal)*: Submits new snapshot name and description.
- **Start Recording Button** *(Audio Modal)*: Initiates microphone capture.
- **Stop & Save Recording Button** *(Audio Modal)*: Finalizes audio clip and attaches to page.
- **Cancel Recording Button** *(Audio Modal)*: Discards recorded audio.
- **Pomodoro Play / Pause Button** *(Pomodoro Widget)*: Starts or pauses 25min countdown.
- **Pomodoro Reset Button** *(Pomodoro Widget)*: Resets timer to interval start.

---

## 🔽 5. Exhaustive Catalog of Dropdowns, Selects, Sliders & Pickers

1. **Color Palette Picker**: 8 preset swatches with active ring indicator + active color preview.
2. **Stroke Width Slider**: Custom HTML5 range slider (`1px` to `16px`) controlling pen/highlighter/shape weight.
3. **Shape Selector Strip**: Dynamic segmented control switching between Rectangle, Circle, Arrow, and Line.
4. **Zoom Level Indicator & Controls**: Percentage display (`50%` to `300%`) with micro step buttons.
5. **Batch Prune Page Number Inputs**: Number pickers (`Start Page` and `End Page`) with bounds validation.
6. **Pomodoro Mode Selector Tabs**: Segmented control between `Study (25m)`, `Short Break (5m)`, and `Long Break (15m)`.
7. **Sidebar Navigation Segmented Control**: 5-tab switch (`Thumbnails`, `Safety Bin`, `Timeline`, `Tags`, `Audio`).
8. **Tag Input & Filter Box**: Text input accepting `#Hashtags` with interactive tag filter pills.
9. **Command Palette Search Input**: Auto-focused search input with keyboard navigation (`↑`/`↓`/`Enter`/`Esc`).
10. **File Uploader Picker**: Native hidden file input triggered via Command Palette or Drag & Drop zone.

---

## 🏛️ 6. UI Architecture & Structural Hierarchy (What Every UI Region Contains)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. TITLEBAR: Window Controls • Brand Pill • Search/Ctrl+K • Pomodoro • Export │
├────────────────────────────────────────────────────────────────────────┤
│ 2. EXAM COGNITIVE BANNER: Active/Pruned Counter • Time Saved • Batch Prune │
├────────────────────────────────────────────────────────────────────────┤
│ 3. MAIN TOOLBAR: Prune/Keep • Bookmark • Undo/Redo • Tool Pills • Zoom │
├─────────────────────────┬──────────────────────────────────────────────┤
│ 4. LEFT SIDEBAR (280px) │ 5. MAIN WORKSPACE / CANVAS VIEWPORT          │
│  - Tab Navigation Strip │  - Scaled Centered PDF Page Canvas           │
│  - Dynamic Tab Content: │  - Transparent Interactive Annotation Layer   │
│    • Page Thumbnails    │  - Movable Sticky Note Cards                 │
│    • Excluded Bin       │  - Audio Memo Badges & Inline Listeners      │
│    • Snapshot Timeline  │  - Bottom Pagination Float Bar               │
│    • Tags & Bookmarks   │                                              │
│    • Voice Memo List    │  [Floating Pomodoro Widget / Modals Overlay] │
└─────────────────────────┴──────────────────────────────────────────────┘
```

### Detailed Breakdown of Every UI Section:

#### A. TitleBar (Header)
- **Brand Identity**: Left-aligned icon, application name (`FocusDeck PRO`), and pro badge.
- **Active Document Status**: File name badge, live active page pill (green), and pruned page pill (rose).
- **Quick Action Bar**: Center command palette search box with `Ctrl+K` keycap, and quick-toggle Pomodoro timer pill.
- **Primary Actions & Window Frame**: Snapshot history button, export button, and native window minimize/maximize/close icons.

#### B. Exam Cognitive Relief Banner
- **Cognitive Status Summary**: Brain icon with active pages count (*"X pages to master"* out of total).
- **Relief Metrics**: Real-time counter of pruned pages, estimated cognitive study minutes saved, and percentage burden reduction.
- **Batch Range Action**: Compact button with flyout to batch prune page intervals.

#### C. Main Annotation & Tool Toolbar
- **Study Prune Control**: High-visibility prune/restore toggle for the current viewing page.
- **History Controls**: Quick bookmark star and paired Undo / Redo buttons.
- **Tool Center Segment**: Modern pill bar housing Pointer, Pen, Highlighter, Eraser, Sticky Note, Shapes, and Voice Memo.
- **Contextual Tool Settings**: Inline color palette swatches and stroke slider appearing dynamically when drawing tools are selected.
- **Zoom & Display Controls**: Zoom Out, Zoom In, numeric percentage readout, Fit Width button, and Zen Full-screen toggle.

#### D. Left Sidebar (Collapsible Drawer)
- **Tab Header**: 5 distinct icons corresponding to Thumbnails, Safety Bin, Checkpoints, Tags, and Audio Memos.
- **Thumbnails View**: Visual grid displaying rendered PDF pages with page numbers, bookmarks, tag badges, and prune overlays.
- **Safety Bin View**: Dedicated triage bin listing discarded slides with "Restore All" or individual restore buttons.
- **Snapshot Timeline View**: Chronological list of manual and auto-checkpoints with timestamps, descriptions, and 1-click rollback buttons.
- **Tags & Bookmarks View**: Tag management panel with new hashtag input and filter buttons.
- **Voice Memos View**: Recorded page audio recordings with custom titles, timestamps, and play/pause controls.

#### E. PDF Canvas & Viewport
- **Centered Document Stage**: Dark neutral background (`bg-slate-900/95`) with smooth shadow framing around the page.
- **Hardware Canvas Render**: Renders PDF page pixels via PDF.js at native display density.
- **Vector Annotation Canvas**: Transparent overlay matching PDF dimensions where pen strokes, highlighter passes, and shapes are drawn.
- **Interactive Sticky Notes Layer**: Draggable note cards containing multiline text areas, custom drag handles, and delete buttons.
- **Bottom Pagination Float**: Semi-transparent floating pill with Previous Page, Page X of Y indicator, and Next Page.

#### F. Modals & Overlays
- **Command Palette (`Ctrl+K`)**: Centered spotlight dialog with fuzzy search, categorized commands, and keyboard navigation.
- **Export Modal**: Summary card showing active vs. pruned page counts, Clean PDF export, and Project Bundle download.
- **Snapshot Checkpoint Modal**: Input form for naming checkpoints and visual snapshot rollbacks.
- **Voice Memo Modal**: Microphone authorization handler, live recording timer, wave pulsing indicator, and audio title input.
- **Pomodoro Floating Widget**: Draggable/dockable timer widget with study, short break, and long break interval switches.

---

## 💡 7. Actionable UI Modernization & Improvisation Guide

To elevate this application from functional to a world-class, **Linear / Raycast / Craft-grade desktop application**, implement the following enhancements:

### 1. Visual Hierarchy & Theme Polishing
- **Paper Tone Switcher**: Add a 3-way toggle in the toolbar for **Dark Mode (Default)**, **Sepia / Warm Paper (Eye strain relief)**, and **Inverted High-Contrast Dark PDF** (using CSS filter `invert(0.9) hue-rotate(180deg)` on the PDF canvas so white pages don't blind students at night).
- **Glassmorphic Floating Toolbar**: Convert the static top toolbar into a floating pill dock (macOS / Raycast style) centered at the bottom or top of the viewport with subtle backdrop blur (`backdrop-blur-xl bg-slate-900/80 border border-white/10`).

### 2. Annotation & Canvas Polish
- **Color Picker Customization**: Add a mini native `<input type="color">` button at the end of the preset color swatches so users can select any custom hex color.
- **Highlighter Blend Mode**: Use CSS `mix-blend-mode: multiply` on the highlighter canvas layer so marker strokes naturally sit behind black printed text rather than on top.
- **Sticky Note Color Themes**: Provide 4 sticky note color options (Yellow, Mint, Sky Blue, Lavender) rather than a single slate card.

### 3. Reading & Navigation Enhancements
- **Continuous Scroll Mode**: In addition to single-page flip, add a toggle for vertical continuous scrolling with intersection observers to update the active page.
- **Page Thumbnail Minimap**: A subtle vertical minimap strip on the right side of the canvas showing a miniature overview of pruned vs. active sections.
- **Direct Page Jump Input**: Make the "Page X of Y" label an editable input box so students can type `42` and press Enter to jump immediately.

### 4. Audio Memo & Multimedia Improvements
- **Interactive Audio Waveform**: Replace the plain timer in the Audio Record modal with an animated canvas visualizer using Web Audio `AnalyserNode`.
- **Draggable Canvas Audio Pins**: Allow students to click anywhere on the page to pin their voice memo icon directly next to a specific formula or diagram.

### 5. Exam Prep & Cognitive Enhancements
- **Formula / Flashcard Quick Clipper**: A one-click marquee tool that lets users drag a rectangle over an equation and save it as an exam flashcard.
- **Prune Confidence Rating**: Allow students to tag pruned pages with reasons: *Already Mastered*, *Out of Syllabus*, or *Low Yield Proof*.
