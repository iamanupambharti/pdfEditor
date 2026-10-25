# FocusDeck PDF — Design Specification (v1.1, "Graphite & Bone")

A calm, subtractive PDF study tool. The app shell recedes; the document is the hero. This version replaces the original indigo/navy theme with a neutral graphite shell and a single warm "bone" accent. Layout, features, and every button are unchanged.

---

## 1. Principles

1. **Subtract first.** The product exists to remove noise (prune pages), so the interface must be quiet. No decorative gradients, no loud animation.
2. **Two worlds.** A dark *Stage* (the app) and a light *Paper* (the document). Never mix their palettes.
3. **One accent, three meanings.** Bone is the only interactive accent. Rose, emerald and amber are reserved for prune, restore/success and bookmark/high-yield. They are never decorative.
4. **Color is never alone.** Every semantic state pairs color with an icon and a text label.
5. **Numbers don't jump.** All counters, timers and readouts use tabular monospace.

---

## 2. Color tokens

### Stage (app shell)
| Token | Hex | Use |
| --- | --- | --- |
| `--s0` | `#0B0B0D` | App canvas, title bar, viewport |
| `--s1` | `#131315` | Panels: sidebar, HUD banner, inset wells |
| `--s2` | `#1A1A1D` | Elevated: tool ribbon, modals, cards |
| `--hover` | `rgba(255,255,255,.05)` | Hover fill |
| `--hair` | `rgba(255,255,255,.08)` | Default 1px border |
| `--hair-2` | `rgba(255,255,255,.14)` | Hover/active border |
| `--tx` | `#F1EFEA` | Primary text |
| `--mu` | `#A3A09A` | Secondary text (≥ 6:1 on `--s2`) |

### Accent — Bone
| Token | Hex | Use |
| --- | --- | --- |
| `--accent` | `#F1EFEA` | Primary button fill (text `#151513`), active indicators, progress, kept-pages bar |
| `--accent-soft` | `#DDD8CC` | Focus ring, pulsing dot, small accent text/icons |
| `--accent-tint` | `rgba(241,239,234,.14)` | Selected rows, active tab background |
| `--accent-hover` | `#FFFFFF` | Primary button hover |
| `--tool-on` | `#2A2A2E` | Active tool pill background (plus 2px accent underline) |

### Semantic
| Role | Stage | Strong | Use |
| --- | --- | --- | --- |
| Prune / danger / recording | `#FB7185` (text `#FDA4AF`) | `#E11D48` | Pruned badges, hatch, rollback, record |
| Retention / restore | `#34D399` (text `#6EE7B7`) | `#047857` button | Restore, success, break intervals |
| Bookmark / high-yield | `#F59E0B` (text `#FBBF24`) | — | Bookmarks, #HighYield, timer alerts |

### Paper (document)
| Token | Hex |
| --- | --- |
| Sheet | `#FFFFFF` |
| Page fill | `#F7F7F5` |
| Border | `#E4E4E0` |
| Ink | `#151513` |
| Body ink | `#22211E` |
| Muted ink | `#6A665E` |

Annotation inks are user content, not UI color: black, teal, violet (default), pink, red, orange, gold, green. Sticky papers: yellow `#FDE68A`, mint `#A7F3D0`, sky `#BAE6FD`, lavender `#DDD6FE`.

---

## 3. Typography

| Role | Family | Notes |
| --- | --- | --- |
| Interface | Geist Sans | 11–13px controls, weight 500, letter-spacing −0.005em |
| Editorial | Instrument Serif | Drawer titles (21px), modal titles (30px), page title (36px) |
| Numeric | Geist Mono | `font-variant-numeric: tabular-nums` for zoom, page counter, timers, stats, key hints |
| Paper body | Newsreader | 12px / 18px on the document page |

Labels: 10px, uppercase, 0.08em tracking, `--mu`.

---

## 4. Spacing, radius, elevation

- 4/8 grid: 4, 8, 12, 16, 20, 24, 32, 48.
- Heights: title bar 40, HUD 48, tool ribbon 52. Buttons 28/32/36/40. Touch targets ≥ 44 where touch is expected.
- Radius: chips/tags 4–6, buttons/inputs 8, cards 12–14, modals and floating widgets 20–24.
- Elevation uses hairlines, not heavy shadows. Overlays: `0 16px 40px rgba(0,0,0,.45)` plus `backdrop-filter: blur`.

---

## 5. Layout regions

| # | Region | Size | Contents |
| --- | --- | --- | --- |
| 1 | Title bar | h 40 | Brand mark + PRO, command palette trigger (Ctrl K), Pomodoro chip, snapshots, settings, **Export Deck**, window controls |
| 2 | Relief HUD | h 48 | Pages to master, pruned, minutes saved, % lighter, kept/pruned bar, Batch Prune, Restore All |
| 3 | Tool ribbon | h 52 | Prune/Restore, bookmark, undo/redo · tool pill · contextual strip · zoom, paper tone, Zen |
| 4 | Sidebar | 48 rail + 272 drawer | Thumbnails, Safety bin, Timeline, Tags, Voice memos |
| 5 | Viewport | fluid | Page, minimap (10px), pagination pill |
| — | Floating | — | Pomodoro widget, command palette, export modal |

### Document compositing (z-order, bottom to top)
1. PDF canvas · 2. Multiply highlighter (`mix-blend-mode: multiply`) · 3. Vector SVG ink · 4. Sticky notes (DOM) · 5. Audio pins · 6. Prune hatch overlay with Quick Restore.

---

## 6. Components and states

Every interactive element implements six states:

| State | Treatment |
| --- | --- |
| Rest | Hairline border, `--tx` or `--mu` label |
| Hover | Tint `rgba(255,255,255,.05)`, border `--hair-2`, 1px lift, tooltip on icon-only controls |
| Pressed | `scale(.98)` |
| Focus-visible | 2px `--accent-soft` ring, 2px offset. Never removed without replacement |
| Disabled | 40% opacity, `not-allowed`, pointer events off |
| Loading | Shimmer skeleton with the exact bounding box of the loaded element |

### Key components
- **Primary button:** bone fill, graphite text, hover white. Used for Export Deck, Save checkpoint, Export clean PDF, play/pause.
- **Prune toggle (fixed 200px, no layout shift):** rest = rose outline with trash icon "Prune Page 7"; pruned = emerald solid with check "Page 7 Pruned · Restore".
- **Tool pill:** radio group `Select V · Pen P · Highlighter H · Eraser E · Sticky T · Shapes S · Voice M`. Active = `--tool-on` background plus bone underline. Roving tabindex.
- **Contextual strip:** Pen/Highlighter show 8 ink swatches, custom conic picker, 1–16px width slider with readout. Shapes show Rectangle/Circle/Arrow/Line. Sticky shows four paper swatches.
- **HUD chips:** pruned = rose tint; time saved = neutral; "% lighter" = bone fill, graphite text (highest-contrast badge).
- **Page thumbnails:** 114×148, page chip in mono, bookmark ribbon (amber), tag pills; pruned = rose hatch + "PRUNED" stamp; active = 2px bone ring.
- **Safety bin:** reason chips (Already mastered, Out of syllabus, Low-yield proof, Other), per-page restore, Restore all.
- **Timeline:** checkpoints with timestamp, kept/pruned/stroke counts, note, Rollback (rose, saves an emergency checkpoint first).
- **Tags:** #HighYield (amber), #Formula, #ExamDoubt, filter status line, bookmark list.
- **Voice memos:** record (rose), card with play, waveform, progress, duration, jump-to-page.
- **Pomodoro widget:** 168px ring, modes Study 25 / Short 5 / Long 15, snaps to corners. Ring uses bone for study, emerald for short break, sky for long break.
- **Command palette:** Ctrl K, fuzzy search, grouped results, selected row with bone indicator.
- **Export modal:** Clean exam PDF (strips pruned pages, bakes annotations) or Full project bundle `.fdeck`. Confetti on success.

---

## 7. Motion

- Micro-states 120–200ms, drawers and modals 240–320ms.
- Easing `cubic-bezier(.22, 1, .36, 1)`. No linear, no bouncy springs.
- `prefers-reduced-motion`: disable transitions and the timer pulse.

---

## 8. Accessibility (WCAG 2.2 AA)

- Text contrast ≥ 4.5:1 (muted `#A3A09A` on `#1A1A1D` ≈ 6.9:1; bone on graphite ≈ 15:1; ink `#151513` on white ≈ 18:1).
- Semantic roles: `toolbar`, `tablist`/`tab`, `radiogroup`/`radio`, `dialog`, `timer`; `aria-live="polite"` for HUD numbers, timer and recording status.
- Keyboard: `Ctrl K` palette, `Delete` prune, `Ctrl Z / Ctrl Y`, `V P H E T S M` tools, `Z` / `F11` Zen, `Esc` closes overlays. Arrow keys move within toolbars and tabs.
- Icons are 24×24 stroke icons (Lucide style) at 14–20px, stroke 1.75. No emoji.

---

## 9. What changed from v1.0

| Area | v1.0 (indigo) | v1.1 (graphite & bone) |
| --- | --- | --- |
| Shell surfaces | Navy `#0A0D14 / #11151F / #171C29` | Neutral graphite `#0B0B0D / #131315 / #1A1A1D` |
| Accent | Indigo `#4F46E5 / #818CF8` | Bone `#F1EFEA / #DDD8CC` |
| Primary button | Indigo fill, white text | Bone fill, graphite text |
| Text | Cool grays | Warm off-white and stone |
| Paper accents | Indigo labels and figure | Ink-only |
| Default pen ink | Blue | Violet |
| Features, layout, buttons | — | **Unchanged** |