# FocusDeck PDF — Website Design & Engineering Specification

> **Document type:** Product website design system + build specification
> **Version:** 1.0 · **Status:** Ready for build · **Audience:** Designers, front-end engineers, AI site generators
> **Scope:** (A) the public marketing & download website, (B) the in-browser interactive product demo, (C) the product UI reference (every region, button, dropdown and state) so the site and demo stay faithful to the app.
> Items marked **✚ NEW** are additions that were *not* in the original brief (see §18 for the rationale and priority of each).

---

## 0. How to use this document

1. **Humans:** read §1–§4 first (strategy + tokens), then build page by page from §9.
2. **AI generators (v0, Lovable, Bolt, Cursor, Claude, etc.):** paste the whole file, then paste the *Master Generation Prompt* in §21. Every colour, size, spacing value, copy string and interaction is specified so no design decision is left to guesswork.
3. **Precedence when rules conflict:** Accessibility (§14) > Tokens (§4) > Component specs (§7) > Page specs (§9) > Motion (§12).
4. **Naming convention:** tokens are `--kebab-case`; components are `PascalCase`; files are `kebab-case.tsx`.
5. All measurements are CSS px unless stated. `rem` = 16px.

---

# PART A — Strategy, brand & website design

## 1. Understanding of the product (analysis of the brief)

### 1.1 What FocusDeck PDF is
A desktop (Electron) academic PDF workstation for **competitive-exam aspirants** (GATE, UPSC, USMLE, Bar, CFA and similar). Its single big idea is **subtraction**: students *prune* the pages they will not study, annotate what remains, and export a lean, exam-ready deck. Everything else (pen, highlighter, voice memos, Pomodoro, snapshots) supports that loop.

### 1.2 The core loop (drives the whole site narrative)
```
Import PDF  →  Prune the noise  →  Annotate & tag what matters  →  Study in Zen mode  →  Snapshot  →  Export a clean deck
```

### 1.3 Target audiences
| Persona | Need | Website message |
|---|---|---|
| **Exam aspirant (primary)** | Cut 1,000-page books to what is examinable | "Study less. Retain more." |
| **Medical / law / finance student** | Annotate heavy texts, revise fast | "Your textbook, trimmed to the exam." |
| **Coaching-institute educator** | Share curated decks | "Hand students a deck, not a library." |
| **Self-learner / researcher** | Offline, private PDF workflow | "Your files never leave your machine." |

### 1.4 Assumptions I made (change them if wrong)
| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | "Website" = **public marketing + download site** for the desktop app, *including* a working in-browser demo of the product UI. | If you wanted the product itself as a web app, use Part C (§16–§17) as the app spec; Part A still applies to its landing page. |
| A2 | Final name = **FocusDeck PDF** (brief's top recommendation). LuminaPDF appears only in legacy file extensions. | Search/replace the brand string; tokens unaffected. |
| A3 | **Light "Paper" theme is the default for the marketing site**; the product itself is dark, and appears in dark "stage" panels. A site-wide dark toggle is provided. | Set `defaultTheme="dark"` in the theme provider. |
| A4 | Pricing, version numbers and download URLs in this doc are **proposed, concrete values** so the build has no blanks. They are marked *(proposed)* and live in one config file (§15.4). | Edit `site.config.ts` only. |
| A5 | No customer testimonials, user counts or ratings are included, because none were provided. The proof section uses *product-derived facts* instead. | Add a `Testimonials` block later (spec in §9.1, section 10). |

### 1.5 Inconsistencies and gaps found in the brief (resolved here)
| # | Finding in brief | Resolution in this spec |
|---|---|---|
| G1 | Brand is "FocusDeck" but the bundle extension is `.lumina` and the app was "LuminaPDF". | Introduce `.fdeck` as the new bundle extension; app keeps reading `.lumina` for backward compatibility ✚. |
| G2 | Timeline tab mentions "manual **and auto**-checkpoints", but features only define manual ones. | Add auto-checkpoint rules (§17.7) ✚. |
| G3 | Dependency versions in the brief (Electron 45, React 19.3, TS 6, Vite 8, Tailwind 4.3…) are far ahead of what can be verified. | Website stack in §15 uses "latest stable, pinned by lockfile" instead of hard-coding unverifiable numbers. |
| G4 | "Pomodoro widget" is both a titlebar chip and a floating draggable widget, with no rule for how they relate. | Chip toggles run state; click on chip opens the widget; widget is the single source of truth (§17.6). |
| G5 | Shortcuts: `Del` prunes, but `T`, `S`, `E`, `V` etc. conflict with text typing inside sticky notes / inputs. | Global shortcuts are suppressed while any input, textarea or contenteditable is focused (§17.10). |
| G6 | Safety-bin and snapshot rollback are destructive-ish with no confirmation pattern defined. | Undo-toast pattern for restore; confirm dialog for rollback (§17.7). |
| G7 | Audio stored as base64 inside the bundle can bloat files. | Cap memo length, compress to Opus/WebM, show size meter ✚ (§17.8). |
| G8 | No accessibility, offline, privacy, settings, onboarding or empty-state definitions. | Added in §14, §17.11–17.13 ✚. |
| G9 | "Estimated study time saved ≈ 3 min/pruned page" is a fixed assumption. | Make it a user setting (min/page) with 3 as default ✚. |

---

## 2. Brand foundations

### 2.1 Name & positioning
- **Product name:** FocusDeck PDF (short form: FocusDeck). Always one word, capital F and D.
- **Category:** Exam-prep PDF workstation.
- **One-line positioning:** *The PDF reader that helps you study less and remember more.*
- **Tagline options (A/B test order):**
  1. **Study less. Retain more.** ← primary hero headline
  2. Prune the noise. Master the rest.
  3. Your textbook, trimmed to the exam.

### 2.2 Personality
Calm · Precise · Quietly confident · Academic but modern. Think *Linear × Raycast × a well-kept library.* Never gamified, never loud.

### 2.3 Voice & tone
| Do | Don't |
|---|---|
| Short, concrete sentences. | Hype words: "revolutionary", "game-changing", "AI-powered" (unless true). |
| Talk about the student's outcome (pages saved, focus gained). | List technology for its own sake on marketing pages. |
| Second person ("you"), active voice. | Fear-based urgency ("Don't fail!"). |
| Honest limits ("Works offline. No cloud sync yet."). | Unverifiable numbers or fake social proof. |

### 2.4 Logo specification
- **Mark:** a rounded square (radius 28% of side) containing a stack of three horizontal bars of decreasing length, the **bottom bar struck through in rose** — a "deck with one page pruned". Single-colour version: ink on paper / paper on ink.
- **Wordmark:** "FocusDeck" set in **Geist 600**, letter-spacing −0.02em, followed by a **PDF** pill (see Badge/Pro).
- **Lock-ups:** horizontal (default), icon-only (favicon, app icon), stacked (footer, press kit).
- **Clear space:** 0.5 × mark height on all sides. **Minimum size:** 20px mark / 96px lock-up.
- **Favicon set:** `favicon.ico` (32), `icon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, maskable icon with 20% safe padding.
- **Do not:** recolour outside tokens, add shadows to the mark, rotate, outline, or place on busy imagery.

---

## 3. Design principles
1. **Subtract first.** Every section earns its place; if removing it changes nothing, remove it. (The product's own philosophy is the site's discipline.)
2. **Show the product, not stock photos.** Real UI, real interactions, rendered live in HTML.
3. **Quiet surfaces, one loud colour.** Neutral paper + ink; indigo is the only accent; rose/emerald carry meaning (prune / keep) and nothing else.
4. **Typographic hierarchy over decoration.** Scale, weight and whitespace do the work. No gradient washes, no glow blobs, no emoji as icons.
5. **Fast is a feature.** Target LCP < 1.8s on a mid-range phone on 4G. Zero layout shift.
6. **Accessible by default.** WCAG 2.2 AA minimum; keyboard-complete; reduced-motion honoured.
7. **Honest.** No dark patterns, no fake urgency, privacy stated plainly.

---

## 4. Design tokens (single source of truth)

> Paste §4.1 into `src/styles/tokens.css`. Contrast ratios below were computed (WCAG 2.x relative luminance) against the stated backgrounds.

### 4.1 CSS variables (ready to paste)
```css
:root {
  /* ── Neutrals: "Paper" (light) ───────────────────────────── */
  --paper-0:   #FFFFFF;   /* cards, inputs */
  --paper-50:  #F7F7F5;   /* page background */
  --paper-100: #EFEFEC;   /* subtle fills, hover rows */
  --paper-200: #E4E4E0;   /* borders, dividers */
  --paper-300: #CFCFC9;   /* strong borders, disabled outlines */

  --ink-900: #0E1220;     /* headings, primary text      18.65:1 on #FFF */
  --ink-700: #2B3142;     /* body text                   12.08:1 on paper-50 */
  --ink-500: #566074;     /* secondary text               5.90:1 on paper-50 (AA) */
  --ink-400: #7A8294;     /* placeholder / decorative     3.59:1 — large text & UI only */

  /* ── Accent: Indigo ──────────────────────────────────────── */
  --accent-50:  #EEF2FF;
  --accent-100: #E0E7FF;
  --accent-300: #A5B4FC;  /* accent text on dark          9.75:1 on dark-bg */
  --accent-400: #818CF8;
  --accent-600: #4F46E5;  /* primary fill / links         6.29:1 on white (AA) */
  --accent-700: #4338CA;  /* hover / pressed              7.90:1 white-on */
  --accent-900: #312E81;

  /* ── Semantic (always paired with icon + label, never colour alone) ── */
  --keep-50:   #ECFDF5;  --keep-600: #059669;  --keep-700: #047857;  /* 5.11:1 text on paper-50 */
  --prune-50:  #FFF1F2;  --prune-600:#E11D48;  --prune-700:#BE123C;  /* 5.72:1 text on prune-50 */
  --warn-50:   #FFFBEB;  --warn-600: #D97706;  --warn-700: #B45309;  /* 4.84:1 text on warn-50 */

  /* ── Sticky-note palette (product + demo) ────────────────── */
  --note-yellow:   #FEF3C7;  --note-yellow-edge:   #FCD34D;
  --note-mint:     #D1FAE5;  --note-mint-edge:     #6EE7B7;
  --note-sky:      #E0F2FE;  --note-sky-edge:      #7DD3FC;
  --note-lavender: #EDE9FE;  --note-lavender-edge: #C4B5FD;

  /* ── Semantic aliases (components consume ONLY these) ────── */
  --bg:            var(--paper-50);
  --surface:       var(--paper-0);
  --surface-2:     var(--paper-100);
  --border:        var(--paper-200);
  --border-strong: var(--paper-300);
  --text:          var(--ink-900);
  --text-body:     var(--ink-700);
  --text-muted:    var(--ink-500);
  --text-faint:    var(--ink-400);
  --link:          var(--accent-600);
  --link-hover:    var(--accent-700);
  --focus-ring:    var(--accent-600);

  /* ── "Stage" (dark product surfaces, used in BOTH themes) ── */
  --stage-bg:       #0A0D14;
  --stage-surface:  #11151F;   /* panels */
  --stage-elevated: #171C29;   /* toolbars, popovers */
  --stage-line:     rgba(255,255,255,.08);
  --stage-line-strong: rgba(255,255,255,.14);
  --stage-text:     #E8EAF0;   /* 16.16:1 on stage-bg */
  --stage-muted:    #9AA3B5;   /*  7.66:1 on stage-bg */
  --stage-accent:   #818CF8;   /*  6.12:1 on stage-surface */
  --stage-keep:     #34D399;   /*  9.49:1 on stage-surface */
  --stage-prune:    #FB7185;   /*  6.78:1 on stage-surface */

  /* ── Type ────────────────────────────────────────────────── */
  --font-sans:    "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-display: "Instrument Serif", "Iowan Old Style", Georgia, serif; /* used ONLY for 1 emphasised phrase per headline */
  --font-mono:    "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* ── Radius ──────────────────────────────────────────────── */
  --r-xs: 4px;  --r-sm: 6px;  --r-md: 10px;  --r-lg: 14px;  --r-xl: 20px;  --r-2xl: 28px;  --r-pill: 999px;

  /* ── Shadow (soft, low-contrast; never coloured) ─────────── */
  --shadow-xs: 0 1px 2px rgba(14,18,32,.05);
  --shadow-sm: 0 1px 2px rgba(14,18,32,.06), 0 2px 6px rgba(14,18,32,.05);
  --shadow-md: 0 4px 12px rgba(14,18,32,.07), 0 2px 4px rgba(14,18,32,.04);
  --shadow-lg: 0 16px 40px rgba(14,18,32,.10), 0 4px 10px rgba(14,18,32,.05);
  --shadow-stage: 0 40px 80px -20px rgba(14,18,32,.35), 0 0 0 1px rgba(255,255,255,.06);

  /* ── Motion ──────────────────────────────────────────────── */
  --ease-out:   cubic-bezier(.22,1,.36,1);
  --ease-in-out:cubic-bezier(.65,0,.35,1);
  --dur-1: 120ms; --dur-2: 200ms; --dur-3: 320ms; --dur-4: 560ms;

  /* ── Z-index scale ───────────────────────────────────────── */
  --z-base:0; --z-sticky:20; --z-nav:40; --z-dropdown:50; --z-overlay:60; --z-modal:70; --z-toast:80; --z-skip:100;

  /* ── Layout ──────────────────────────────────────────────── */
  --container: 1200px;       /* content max width */
  --container-wide: 1360px;  /* product stage max width */
  --gutter: 24px;            /* 16px < 640, 24px ≥ 640, 32px ≥ 1024 */
  --nav-h: 64px;
}

/* Dark site theme (user toggle or prefers-color-scheme) */
:root[data-theme="dark"] {
  --bg: #0A0D14;  --surface: #11151F;  --surface-2: #171C29;
  --border: rgba(255,255,255,.08);  --border-strong: rgba(255,255,255,.16);
  --text: #F3F4F8;  --text-body: #CDD2DE;  --text-muted: #9AA3B5;  --text-faint: #6B7487;
  --link: #A5B4FC;  --link-hover: #C7D2FE;  --focus-ring: #A5B4FC;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.5);  --shadow-md: 0 4px 14px rgba(0,0,0,.5);  --shadow-lg: 0 18px 44px rgba(0,0,0,.55);
}
/* No prefers-color-scheme media block is needed: next-themes (enableSystem) resolves the OS preference
   and writes data-theme="light|dark" on <html> via a blocking inline script, so the block above is the only dark definition. */
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; scroll-behavior:auto !important; }
}
```

### 4.2 Tailwind v4 `@theme` mapping (ready to paste into `globals.css`)
```css
@import "tailwindcss";
@theme inline {
  --color-bg: var(--bg);           --color-surface: var(--surface);   --color-surface-2: var(--surface-2);
  --color-border: var(--border);   --color-border-strong: var(--border-strong);
  --color-text: var(--text);       --color-body: var(--text-body);    --color-muted: var(--text-muted);
  --color-accent: var(--accent-600); --color-accent-hover: var(--accent-700); --color-accent-soft: var(--accent-50);
  --color-keep: var(--keep-700);   --color-keep-soft: var(--keep-50);
  --color-prune: var(--prune-700); --color-prune-soft: var(--prune-50);
  --color-warn: var(--warn-700);   --color-warn-soft: var(--warn-50);
  --font-sans: var(--font-sans);   --font-display: var(--font-display); --font-mono: var(--font-mono);
  --radius-md: var(--r-md);        --radius-lg: var(--r-lg);          --radius-xl: var(--r-xl);
  --shadow-card: var(--shadow-sm); --shadow-pop: var(--shadow-lg);
  --breakpoint-sm: 640px; --breakpoint-md: 768px; --breakpoint-lg: 1024px; --breakpoint-xl: 1280px; --breakpoint-2xl: 1536px;
}
```

### 4.3 Typography scale
Fonts load from Google Fonts: **Geist** (400, 500, 600), **Geist Mono** (400, 500), **Instrument Serif** (400 italic). `font-display: swap`, preconnect, subset Latin. Body uses `font-feature-settings: "ss01","cv11"`; numerals tabular (`font-variant-numeric: tabular-nums`) in metrics, timers, pricing.

| Role | Size / Line-height (≥1024) | Mobile (<640) | Weight | Tracking | Font |
|---|---|---|---|---|---|
| Display (hero H1) | 72 / 76 | 40 / 44 | 600 | −0.035em | Geist; one emphasised phrase in Instrument Serif *italic*, +6% size |
| H2 (section title) | 44 / 50 | 30 / 36 | 600 | −0.025em | Geist |
| H3 (card title) | 24 / 30 | 20 / 26 | 600 | −0.015em | Geist |
| H4 | 18 / 26 | 17 / 24 | 600 | −0.01em | Geist |
| Lead paragraph | 20 / 32 | 18 / 28 | 400 | −0.005em | Geist, `--text-muted` |
| Body | 16 / 26 | 16 / 26 | 400 | 0 | Geist, `--text-body` |
| Small | 14 / 22 | 14 / 22 | 400/500 | 0 | Geist |
| Caption / legal | 12 / 18 | 12 / 18 | 400 | 0.01em | Geist (min 12px) |
| Eyebrow (section label) | 13 / 16 | 12 / 16 | 500 | +0.08em, UPPERCASE | Geist Mono, `--accent-600` |
| Code / kbd | 13 / 20 | 13 / 20 | 500 | 0 | Geist Mono |

Rules: max line length 68ch for body, 22ch for H1 (use `text-wrap: balance`), `text-wrap: pretty` for paragraphs. Never centre-align paragraphs longer than 3 lines.

### 4.4 Spacing scale (4px base)
`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160`. Section vertical padding: **128px ≥1024 · 96px ≥640 · 72px <640**. Gap between a section header and its content: 56px (40px mobile). Card inner padding: 24px (20px mobile). Stack gap inside cards: 12px.

### 4.5 Grid & breakpoints
- 12-column grid, container `--container` centred, gutter 16/24/32px, column gap equals gutter.
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Design **mobile-first**; QA widths: 360, 390, 768, 1024, 1280, 1440, 1920.
- The "Stage" (product screenshot/demo) may break out to `--container-wide` and bleeds to the viewport edge below 1024px (rounded 0 on bleed sides).

### 4.6 Elevation & surfaces
| Level | Use | Background | Border | Shadow |
|---|---|---|---|---|
| 0 | Page | `--bg` | – | – |
| 1 | Cards, inputs | `--surface` | 1px `--border` | `--shadow-xs` |
| 2 | Hover cards, sticky nav (scrolled) | `--surface` | 1px `--border` | `--shadow-md` |
| 3 | Popover, dropdown, command palette | `--surface` | 1px `--border-strong` | `--shadow-lg` |
| Stage | Product mock | `--stage-bg` | 1px `--stage-line` | `--shadow-stage` |

---

## 5. Iconography, imagery & illustration
- **Icon set:** Lucide (outline). 24px grid, stroke **1.75px**, round caps/joins, `currentColor`. Sizes: 16 (inline/chips), 20 (buttons/nav), 24 (feature cards), 32 (feature heroes). Icon-only buttons need `aria-label`; decorative icons get `aria-hidden="true"`.
- **Never** use emoji as icons or bullets in the UI.
- **Imagery:** product UI only (live HTML demo or crisp 2× AVIF/WebP screenshots, 1600w & 2400w). No stock photos of students at laptops.
- **Illustration:** none required. Where a visual accent is needed, use CSS-drawn "page stacks": white rectangles (aspect 1 : 1.414, radius 6px, `--shadow-sm`) with grey skeleton text lines; pruned pages get a rose diagonal hatch overlay (`repeating-linear-gradient(45deg, rgba(225,29,72,.14) 0 6px, transparent 6px 12px)`) and a rose 1px border.
- **Backgrounds:** flat `--bg`. One permitted texture: a faint 24px dot grid (`radial-gradient(var(--paper-300) 1px, transparent 1px)`, 24px spacing, 40% opacity, masked to fade at edges) behind the hero only.
- **Image rules:** always `width`/`height` attributes (no CLS), `loading="lazy"` below the fold, `fetchpriority="high"` on the hero visual, alt text describing the *information* in the image.

---

## 6. Layout system & page chrome

### 6.1 Global page frame
```
[Skip-to-content link]
[Announcement bar — optional, dismissible]  ← 40px
[Sticky Nav]                                ← 64px
<main id="main"> sections… </main>
[Footer]
[Cookie/consent banner — only if analytics enabled]
[Toast region (aria-live=polite)]
```

### 6.2 Navigation bar (`SiteNav`)
- **Desktop (≥1024):** height 64px, transparent at top → on scroll >8px: `--surface` at 80% opacity + `backdrop-filter: blur(14px) saturate(1.4)`, bottom 1px `--border`, `--shadow-xs`. Inner container 3 zones:
  - **Left:** logo lock-up (links to `/`).
  - **Centre:** links — *Features · How it works · Shortcuts · Pricing · Docs · Changelog*. 15px/500, `--text-muted`, hover `--text`; active page has a 2px accent underline offset 22px. Gap 28px.
  - **Right:** theme toggle (icon button 40×40, cycles Light/Dark/System with tooltip) · **Download** primary button (small).
- **Tablet/mobile (<1024):** logo left; right: theme toggle + hamburger (44×44). Menu opens as a full-height sheet sliding from the right (width min(88vw, 380px)), focus-trapped, `Esc` closes, body scroll locked. Links stack at 20px/600 with 56px row height; Download CTA pinned at the bottom.
- **Announcement bar (optional):** `--accent-50` bg, 14px text, one link, dismiss `X` (44px target), remembered in `localStorage` (try/catch).

### 6.3 Footer (`SiteFooter`)
Background `--surface-2`, top border 1px. Padding 80px/48px. 5 columns ≥1024 (brand 2 cols + 3 link columns), 2 columns ≥640, 1 column mobile.
- **Brand column:** logo, one-sentence description ("An exam-prep PDF workstation that helps you study less and remember more."), version chip (`v1.0.0`), system-status-style chip "Works offline".
- **Product:** Features, How it works, Shortcuts, Pricing, Download, Changelog.
- **Resources:** Docs, Keyboard cheat-sheet (PDF), Sample deck, FAQ, Roadmap ✚, Press kit ✚.
- **Company:** About, Contact, Privacy, Terms, Licences (open-source credits ✚).
- **Bottom bar:** © {current year} FocusDeck · language selector ✚ · theme toggle · "Made for people who have exams."
- Link style: 14px `--text-muted`, hover `--text` + underline offset 3px.

---
## 7. Component library (website)

Every interactive component must implement: **default · hover · focus-visible · active · disabled · loading** (where relevant). Focus ring for all: `outline: 2px solid var(--focus-ring); outline-offset: 2px;` (never remove outlines). Minimum target size **44×44** (visual size may be smaller if padding extends the hit area). Transitions use `--dur-2 var(--ease-out)` and only animate `color, background-color, border-color, box-shadow, transform, opacity`.

### 7.1 Button
| Variant | Background | Text | Border | Hover | Active |
|---|---|---|---|---|---|
| **Primary** | `--accent-600` | #FFF | none | `--accent-700`, lift `translateY(-1px)` + `--shadow-md` | `--accent-700`, `translateY(0)` |
| **Secondary** | `--surface` | `--text` | 1px `--border-strong` | `--surface-2` | `--paper-200` |
| **Ghost** | transparent | `--text-muted` | none | bg `--surface-2`, text `--text` | bg `--paper-200` |
| **Danger-soft** | `--prune-50` | `--prune-700` | 1px `rgba(225,29,72,.25)` | bg `#FFE4E8` | – |
| **On-stage** | `rgba(255,255,255,.08)` | `--stage-text` | 1px `--stage-line-strong` | `rgba(255,255,255,.14)` | – |

Sizes: **sm** 36h / 14px / px-14 · **md** 44h / 15px / px-18 (default) · **lg** 52h / 16px / px-24. Radius `--r-md` (pill `--r-pill` for hero CTAs). Gap icon↔label 8px. Weight 500. Loading: label stays, spinner (16px, 1.5px stroke) replaces leading icon, `aria-busy="true"`, click disabled. Disabled: 45% opacity, `cursor:not-allowed`, still contrast-legible as disabled state (exempt from AA).

### 7.2 Link
Inline links `--link`, underline offset 3px, thickness 1px → 2px on hover. External links get a 12px `arrow-up-right` icon and `rel="noopener noreferrer"`.

### 7.3 Badge / Pill
Height 24, px 10, 12px/500, radius pill. Variants: `neutral` (surface-2 / ink-700), `accent` (accent-50 / accent-700), `keep` (keep-50 / keep-700 with 6px dot), `prune` (prune-50 / prune-700), `new` (accent-600 / #FFF — used for ✚ new features), `pro` (ink-900 / #FFF, 11px caps, tracking .06em).

### 7.4 Keycap (`<kbd>`)
Mono 12px/500, height 22, min-width 22, px 6, radius 6, bg `--surface`, 1px `--border-strong`, bottom border 2px `--border-strong` (physical key look), text `--text-muted`. On stage: bg `rgba(255,255,255,.06)`, border `--stage-line-strong`, text `--stage-text`. Key combos render as separate keycaps with 4px gap; use the platform glyph (`⌘` on macOS, `Ctrl` elsewhere) via UA detection with a no-JS fallback "Ctrl".

### 7.5 Card
bg `--surface`, 1px `--border`, radius `--r-xl` (20), padding 24, `--shadow-xs`. Interactive cards: hover → border `--border-strong`, `--shadow-md`, `translateY(-2px)`; whole card is one `<a>` or has a stretched-link pseudo element (single tab stop). **Feature card:** 40×40 icon tile (radius 10, bg `--accent-50`, icon `--accent-600`) → H3 → 2-line body → optional shortcut keycap row.

### 7.6 Input / Textarea / Select
Height 44 (textarea min 120), px 14, radius `--r-md`, bg `--surface`, 1px `--border-strong`, text 16px (prevents iOS zoom). Hover border `--ink-400`. Focus: border `--accent-600` + 3px ring `rgba(79,70,229,.18)`. Error: border `--prune-700`, helper text `--prune-700` with `alert-circle` icon, `aria-invalid="true"`, `aria-describedby` → message. Label above (14px/500), required marked "(required)" in text (not just `*`). Custom select = native `<select>` styled, chevron icon right 14px.

### 7.7 Tabs / Segmented control
Segmented: container bg `--surface-2`, radius `--r-lg`, padding 4; items 36h, radius `--r-md`; selected item bg `--surface`, `--shadow-xs`, text `--text`. Animated thumb slides (`--dur-3 --ease-out`). Roving tabindex, `←/→` moves, `Home/End`. ARIA `tablist/tab/tabpanel`.

### 7.8 Accordion (FAQ)
Row 64 min-height, divider 1px `--border`. Trigger = `<button>` with chevron rotating 180°. Panel animates `grid-template-rows: 0fr → 1fr` (`--dur-3`). Only one open by default; `aria-expanded`, `aria-controls`.

### 7.9 Tooltip
Appears after 400ms hover or on keyboard focus, max-width 240, bg `--ink-900`, text #FFF 13px, radius 8, padding 6×10, 6px offset, arrow-less. `role="tooltip"`; dismissible with `Esc`. Never hides essential info (touch devices get a visible label instead).

### 7.10 Modal / Dialog (also used for the demo's Export & Snapshot modals)
Overlay `rgba(10,13,20,.55)` + `backdrop-filter: blur(4px)`. Panel width min(92vw, 520px), radius `--r-2xl`, `--shadow-lg`, padding 28. Enter: opacity+`scale(.97→1)` 200ms. Focus trap, initial focus on first control, `Esc` and overlay click close (not for destructive confirms), return focus to opener, `aria-modal="true"`, labelled by title.

### 7.11 Toast
Bottom-centre, max 420 wide, bg `--ink-900`, text #FFF, radius 12, 14px; optional action button (ghost, accent-300 text) e.g. "Undo". Auto-dismiss 5s, pause on hover/focus, `role="status"`.

### 7.12 Command palette (marketing site ✚ and demo)
`⌘/Ctrl + K` anywhere. Width min(92vw, 640), radius 20, top offset 14vh. Search input 56h, no border, 17px. Results grouped (*Pages, Features, Actions, Theme*), row 44h, selected row bg `--accent-50` (dark: `rgba(129,140,248,.14)`), shows right-aligned keycap hints. Footer strip with `↑↓ navigate · ↵ open · esc close`. Fuzzy match with highlighted matched characters (`<mark>` → accent text, no bg). Empty state: "No results for “{query}”. Try “prune” or “export”."

### 7.13 Section header (`SectionHeader`)
Eyebrow (mono caps, accent) → H2 → lead (max 56ch). Left-aligned by default; centred only in Home sections *Final CTA* and *FAQ*. Stack gap: 12 / 16.

### 7.14 Metric tile (`Metric`)
Large number 40/44 mono-numeral 600 + label 14px muted. Used for "pages, active, pruned, % reduced, minutes saved" in the demo and product-facts strip. Numbers count up on first view (600ms, ease-out) unless reduced motion.

### 7.15 Code / terminal block
bg `--stage-surface`, radius 14, padding 20, mono 13/20, copy button top-right (32×32) → toast "Copied". Used on Docs only (build-from-source, CLI flags ✚).

### 7.16 Download button group (`DownloadCTA`)
Detects OS (`navigator.userAgentData?.platform` / UA fallback) → primary button label "Download for Windows", "Download for macOS", or "Download for Linux"; below it 13px muted text "v1.0.0 · 148 MB · Windows 10+ " and a link "Other platforms ▾" opening a popover with all builds, SHA-256 checksums (copy buttons) ✚, and "Portable .zip". Always show requirements. On mobile: replace with "Send me the link" (email field) ✚ because the app is desktop-only.

---

## 8. Information architecture & sitemap

```
/                      Home
/features              Features (all 26 + new)
/how-it-works          Workflow walkthrough (5 steps)
/demo                  Full-screen interactive demo (also embedded on Home)
/shortcuts             Keyboard shortcuts reference + downloadable cheat sheet
/pricing               Plans, comparison, FAQ
/download              Platform builds, requirements, checksums, release notes
/changelog             Version history (RSS ✚)
/docs                  Documentation hub
  /docs/getting-started
  /docs/pruning
  /docs/annotation
  /docs/voice-memos
  /docs/snapshots
  /docs/export-and-bundles
  /docs/shortcuts
  /docs/troubleshooting
/use-cases/[exam]      GATE · UPSC · Medical (USMLE/NEET-PG) · Law/Bar · CFA ✚ (one template, 5 content files)
/roadmap               Public roadmap ✚
/about                 Story & principles
/contact               Form + email
/privacy  /terms  /licenses
/404  /500
/sitemap.xml  /robots.txt  /rss.xml (changelog)  /manifest.webmanifest
```
Primary nav = 6 links (§6.2). Max depth 3. Every page reachable within 2 clicks from Home; breadcrumb on Docs and use-case pages.

---

## 9. Page specifications

> Format for each section: **Purpose → Layout → Content (exact copy) → Behaviour → States/Responsive.** Copy is final unless the brand owner edits `content/*.ts`.

### 9.1 Home `/`

**Section 1 — Hero** (min-height `calc(100svh - 64px)` max 880)
- *Layout:* centred column, max 880 text width; below it the **Stage** (live demo, §10) overlapping the fold by ~120px on desktop. Dot-grid background fading to `--bg` at the bottom.
- *Eyebrow badge (link to /changelog):* `accent` badge "v1.0 — Now available for Windows" + arrow icon.
- *H1:* "Study less. *Retain more.*" (italic serif on "Retain more.")
- *Lead:* "FocusDeck is the PDF reader built for exam season. Prune the pages you won't be tested on, annotate the ones you will, and export a clean deck."
- *CTAs:* `DownloadCTA` (primary lg pill) + Secondary "Try the live demo ↓" (scrolls to Stage). Under CTAs, 13px muted: "Free to start · Works offline · Your files never leave your device".
- *Trust strip (below the Stage, not above):* 4 facts, mono 13px, separated by 1px dividers: `100% offline` · `No account needed` · `Exports standard PDF` · `Open file format (.fdeck)` ✚.
- *Behaviour:* H1 words fade-up staggered 40ms (once). Stage scales from `.98` and fades in on load. Hero visual has `fetchpriority="high"`.
- *Mobile:* H1 40/44; CTAs stack full-width; Stage becomes a swipeable 3-screenshot carousel (demo is hidden <768 and replaced by a "Try the demo on desktop" card + short looping muted video ≤ 800 KB).

**Section 2 — The problem / premise** (`--surface` band)
- *Eyebrow:* THE PROBLEM · *H2:* "A 1,200-page book. A 6-week window."
- *Body (two columns ≥1024):* left paragraph: "Most exam material is padded — appendices, derivations you will never be asked, chapters outside the syllabus. Reading everything is not discipline; it is a tax on your attention."  Right: animated **page-stack** graphic — 24 pages in a 6×4 grid; on scroll-in, 9 of them hatch rose and shrink to 60% opacity while a counter beneath reads "9 pruned · 15 to master · 37% less to read · ≈27 min saved" (uses the app's 3 min/page rule; footnote "Estimate at 3 min per page. Adjustable in Settings.").

**Section 3 — Core loop** (id `how`)
- *Eyebrow:* HOW IT WORKS · *H2:* "Five moves from overwhelmed to exam-ready."
- *Layout:* horizontal stepper on desktop (5 equal columns with a 1px connector line and numbered mono nodes 01–05); vertical timeline on mobile. Each step: icon tile, title, 2-line text, and a 3-second looped muted illustration (CSS-animated mini UI).
  1. **Import** — "Drop in any PDF or load the built-in sample deck."
  2. **Prune** — "Press Delete to exclude a page, or batch-prune a range."
  3. **Annotate** — "Pen, highlighter, shapes, sticky notes and voice memos — drawn as vectors."
  4. **Focus** — "Zen mode, Pomodoro timer, high-yield tags."
  5. **Export** — "A clean PDF with only the pages you kept, annotations baked in."
- *Interaction:* hovering/focusing a step highlights its node and swaps the Stage screenshot (desktop) if the Stage is in view.

**Section 4 — Feature bento** (id `features`)
- *Eyebrow:* FEATURES · *H2:* "Everything an exam needs. Nothing it doesn't."
- *Layout:* 12-col bento, row height 280, gap 20. Six cards (large cards have a live mini-demo, small ones icon + text):
  1. **Cognitive Load Pruner** (span 7×2) — mini-demo: click pages to prune; metric tiles update.
  2. **Annotation suite** (span 5×1) — animated pen stroke + highlighter multiply blend.
  3. **Voice memos** (span 5×1) — animated waveform bars (CSS), mono "00:42".
  4. **Snapshots & rollback** (span 4×1) — vertical timeline with three checkpoints.
  5. **Pomodoro & Zen mode** (span 4×1) — ring timer 25:00 → counts down visually.
  6. **Clean export & bundles** (span 4×1) — PDF icon shrinking from "412 pp" to "268 pp" with confetti-dot burst (single, once).
- *CTA below grid:* Secondary button "See all 26 features →" → `/features`.

**Section 5 — Cognitive Relief dashboard** (dark Stage band, `--stage-bg`, full-bleed)
- *H2 (on dark):* "See exactly how much you've cut." · *Lead:* "A live HUD tells you pages to master, pages pruned, burden reduced and study time saved — updated with every keystroke."
- *Layout:* left copy, right large HUD (`CognitiveBanner`, §17.2) with an interactive slider "Pages in your PDF" (50–2000) and "Pages you'll prune" (0–100%); metrics recompute live. Accessible via native `<input type="range">` with labels and `aria-valuetext`.

**Section 6 — Precision details** (3 columns of "micro-features")
- *H2:* "Small details, taken seriously."
- Cards: *Paper tones* (Dark · Sepia · Inverted night mode), *Command palette* (⌘K), *Hardware-accelerated zoom 50–300%*, *Smart highlighter that never covers text*, *30-step undo*, *Sticky notes in four colours*, *Direct page jump*, *Continuous scroll* ✚ — each as icon + one line, in a 4×2 grid.

**Section 7 — Privacy & offline** (`--surface` band)
- *H2:* "Your notes stay yours." · Three statements with check icons: "Runs entirely on your device." · "No account, no tracking inside the app." · "Open `.fdeck` bundle you can move between computers." + link "Read our privacy promise →".

**Section 8 — Use-case switcher**
- *H2:* "Built for the exams that matter." · Segmented tabs: **GATE · UPSC · Medical · Law · CFA**. Each panel: one-sentence outcome, 3 bullet "what to prune / what to tag", link to `/use-cases/[exam]`. *(Copy for each in `content/use-cases.ts`; never claim affiliation with any exam body — footer disclaimer: "Exam names are trademarks of their respective owners. FocusDeck is not affiliated with them.")*

**Section 9 — Pricing teaser** — three-card summary from `/pricing` (see §9.5) with "Compare plans" link.

**Section 10 — Testimonials (hidden until real quotes exist)** — component `Testimonials` renders nothing when `content.testimonials.length === 0`. Spec when used: 3 cards, quote 18px, name, exam, optional avatar initials; no star ratings unless sourced from a verifiable store listing.

**Section 11 — FAQ** (centred, accordion, max 760) — 8 questions (full copy §19.3).

**Section 12 — Final CTA** (`--accent-600` band is **not** used; keep minimal): centred H2 "Ready to study less?" · lead "Download FocusDeck and open your first deck in under a minute." · `DownloadCTA` + secondary "Read the docs".

### 9.2 Features `/features`
- *Hero:* eyebrow FEATURES, H1 "Every tool, tuned for revision." Sticky left **table of contents** (≥1024) with scrollspy for the seven groups (A–G below); mobile = horizontal chips.
- *Layout:* for each group — H2 + lead, then a 2-column list of feature rows. Each row: icon tile · name · 1–2 line description · shortcut keycaps · `new` badge for ✚ items. Alternate rows may include a 16:10 looped media on the right (muted, `playsinline`, poster image, paused when off-screen, respects reduced motion by showing the poster).
- *Groups (map to brief §3):* A Cognitive Load Pruner · B Annotation Suite · C Voice Memos · D Snapshots & Rollback · E Exam Productivity (Pomodoro, Zen, Tags) · F Export & Portability · G Command Palette & Navigation · **H Study Tools ✚** (Flashcard clipper, Prune reasons, Exam countdown, Search, Goals).
- *Bottom CTA:* DownloadCTA.

### 9.3 How it works `/how-it-works`
Vertical long-form walkthrough: 5 chapters (matching Home §3) with sticky left step indicator and right-hand Stage screenshot that crossfades per chapter (IntersectionObserver). Each chapter: H2, 80-word explanation, a "Try it" link that opens `/demo` with the relevant tool pre-selected (`/demo?tool=prune`).

### 9.4 Shortcuts `/shortcuts`
- *Search box* ("Filter shortcuts…") + OS toggle (Windows/Linux ⇄ macOS).
- Grouped tables (Tools, Pages, View, Editing, Productivity, Global). Each row: action · keycaps. Full list in §17.10.
- Button "Download cheat sheet (PDF)" ✚ and "Print" (print stylesheet: single A4 page, black on white, 2 columns).

### 9.5 Pricing `/pricing`  *(proposed — edit in `site.config.ts`)*
- *H1:* "Simple pricing. Serious studying." · Billing toggle **Monthly / Yearly (save 33%)** — the toggle is a segmented control; price numbers animate with `tabular-nums`.
- *Plans (3 cards, middle emphasised with 2px `--accent-600` border and "Most popular" badge):*

| | **Starter** | **Pro** *(emphasised)* | **Campus** ✚ |
|---|---|---|---|
| Price | ₹0 / $0 forever | ₹299 / $4.99 per month · ₹2,399 / $39.99 per year | ₹199 / $2.99 per seat per month, min 10 seats |
| For | Trying it out | Serious aspirants | Coaching institutes & colleges |
| Documents | 3 projects | Unlimited | Unlimited |
| Pruning, batch prune, safety bin | ✓ | ✓ | ✓ |
| Pen, highlighter, shapes, notes | ✓ | ✓ | ✓ |
| Voice memos | 5 memos | Unlimited | Unlimited |
| Snapshots | 3 per project | Unlimited + auto-checkpoints | Unlimited + auto-checkpoints |
| Clean PDF export | With small footer mark | Clean, no mark | Clean, no mark |
| `.fdeck` bundles | ✓ | ✓ | ✓ + shared deck library |
| Flashcard clipper & Anki export ✚ | – | ✓ | ✓ |
| Priority support | – | Email | Dedicated |
| CTA | Download free | Start 14-day trial | Contact sales |

- *Below table:* "All plans work offline. Prices exclude applicable taxes." · student discount note "Students: 40% off with a verified .edu / .ac.in address ✚".
- *Comparison table:* full feature matrix, sticky header row, `scope="col"` headers, check icons with visually-hidden "Included"/"Not included" text.
- *FAQ (billing):* 5 items (refunds within 14 days, switching plans, offline licence check every 14 days ✚, taxes, student discount).

### 9.6 Download `/download`
- Hero with auto-detected `DownloadCTA` (lg) and "Release notes" link.
- *Platform cards (3):* Windows (.exe installer + portable .zip), macOS (.dmg universal), Linux (.AppImage + .deb). Each: icon, version, size, architecture, min OS, SHA-256 (copy), "Download" button.
- *System requirements table:* OS, RAM (4 GB min, 8 GB recommended), disk (400 MB), large-PDF guidance (thumbnails load as you scroll).
- *Install help:* 3-step accordion per OS (including "Windows SmartScreen" and "macOS Gatekeeper" notes). Auto-update note.

### 9.7 Changelog `/changelog`
Reverse-chronological list. Entry: version badge, date (`<time datetime>`), grouped bullets with badges `New / Improved / Fixed`. Left sticky version index on desktop. Subscribe via RSS ✚. Anchored by `#v1-0-0`.

### 9.8 Docs `/docs`
Three-column layout ≥1280: left nav (260), content (max 720), right "On this page" (220) with scrollspy. Search (⌘K) over docs using a static JSON index built at compile time. Callout components: *Note* (accent), *Tip* (keep), *Warning* (warn), *Danger* (prune) — each with icon, left 3px bar is **not** used; use tinted bg + 1px border + icon. "Was this helpful? Yes / No" ✚ and "Edit this page" link. Prev/Next page cards at the bottom.

### 9.9 Use-case template `/use-cases/[exam]`
Hero (H1 "FocusDeck for {Exam}"), "Typical prune targets" list, "Suggested tags" chips (`#HighYield`, `#Formula`…), a sample workflow (3 steps), related docs, DownloadCTA. Disclaimer in footer of page.

### 9.10 About `/about`
Short story (≤200 words), 4 principles (Subtract · Stay offline · Respect attention · Ship quietly), "Built with" list (open-source credits: Electron, React, PDF.js, pdf-lib, Lucide…) and contact link. No team photos unless provided.

### 9.11 Contact `/contact`
Form: Name, Email, Topic (select: Support / Sales (Campus) / Press / Feedback), Message, consent checkbox. Honeypot + rate-limit + server-side validation. Success state replaces form with confirmation and reference number. Direct email shown as text link. Response-time statement "We reply within 2 working days."

### 9.12 Legal `/privacy` `/terms` `/licenses`
Single-column 720px prose (`.prose` styles: H2 28/34, H3 20/28, list marker accent, table borders `--border`). "Last updated" `<time>` at top; table of contents for >1,500 words. *Privacy must state:* desktop app is offline; website analytics (if any) are cookieless and anonymous; no document content is ever uploaded.

### 9.13 Roadmap `/roadmap` ✚
Three columns **Now · Next · Later** (kanban-style, read-only cards with tag chips and optional "Under consideration" badge). Mobile: stacked accordion. Feedback link to Contact.

### 9.14 404 / 500
Centred; large mono "404" in `--ink-400`; H1 "This page was pruned."; body "The page you are looking for isn't in the deck."; buttons "Go home" + "Open command palette (⌘K)". 500: "Something went wrong on our side." + retry button + status link. Both set `noindex`.

---
# PART B — Interactive demo, behaviour & engineering

## 10. The interactive product demo ("Stage")

The most persuasive asset on the site is the product itself, rebuilt in HTML/CSS/JS — not a video. It is a **simplified, sandboxed replica** of the app UI (Part C) loaded with a built-in 24-page sample deck ("CS & System Design Prep", pages drawn in CSS — no copyrighted material).

### 10.1 Stage frame
- Container: radius `--r-2xl`, `--shadow-stage`, bg `--stage-bg`, 1px `--stage-line`. Aspect ratio 16:10 (min-height 560, max-width `--container-wide`). Fake window chrome: 40px title bar with three 10px neutral dots (no red/yellow/green), centred title "FocusDeck — System-Design-Prep.pdf". (Window controls are decorative: `aria-hidden`.)
- A visible caption below: "This is a live demo. Nothing is uploaded." and a **Reset demo** ghost button.
- Keyboard: the Stage is a landmark `role="application"` with `aria-label="FocusDeck interactive demo"`; a **Skip demo** link precedes it.

### 10.2 Demo capabilities (all client-side, no network)
| Capability | Behaviour in demo |
|---|---|
| Thumbnails sidebar | 24 page cards; click selects; hover shows prune icon; pruned cards show hatch + dimmed |
| Prune / restore | `Delete` key, toolbar button or card icon; HUD updates immediately |
| Batch prune | Popover with two number inputs (validated 1–24, start ≤ end) |
| Safety bin | Tab lists pruned pages; single restore + Restore all |
| Pen / highlighter / eraser | Pointer-event drawing on an SVG overlay; highlighter uses `mix-blend-mode: multiply` |
| Sticky note | Click to place; drag by header; 4 colours; delete |
| Tags | Add `#HighYield` etc.; filter chips |
| Snapshots | Save checkpoint (name), rollback with confirm |
| Pomodoro | Chip + widget (25:00 → real countdown, 10× speed toggle hidden behind `?fast=1` for QA) |
| Paper tone | Dark / Sepia / Night-invert |
| Zen mode | Collapses sidebar + banner; `Esc` exits |
| Export | Shows modal with counts and a **fake** "Export" that triggers the confetti burst and a toast "Demo only — download the app to export real PDFs." |
| Command palette | `⌘/Ctrl+K` scoped to demo actions |
| Voice memo | **Simulated** (no mic permission requested): shows the record UI with a looped waveform and canned 8-second memo. |

### 10.3 Guided tour ✚
First visit only (state in `sessionStorage`, try/catch): 5 coach-marks anchored to *Thumbnails → Prune button → HUD → Pen → Export*. Each is a popover with step counter "2 of 5", **Next / Back / Skip tour**. `Esc` skips. Auto-start only once the Stage is ≥60% in view for 1.5s; never auto-start on `prefers-reduced-motion` (show a "Take the tour" button instead).

### 10.4 Performance rules for the demo
Code-split (`dynamic import`, `ssr:false` after an SSR skeleton with identical dimensions); hydrate on visibility (IntersectionObserver, rootMargin 400px); pages rendered as lightweight SVG/HTML, not canvas bitmaps; pointer drawing uses a single `<path>` per stroke with `requestAnimationFrame` throttling; total demo JS ≤ 90 KB gzipped.

---

## 11. State patterns (loading, empty, error, success)

| Pattern | Spec |
|---|---|
| **Skeleton** | `--surface-2` blocks with 1.4s shimmer (`linear-gradient`, disabled under reduced motion → static). Same dimensions as final content (no CLS). |
| **Empty state** | Icon tile 48px, H4, one-line help, one primary action. E.g. Safety bin empty: "Nothing pruned yet. Press Delete on any page to move it here." |
| **Inline error** | Alert box: `--prune-50` bg, 1px prune border at 25%, `alert-circle` icon, message + corrective action. `role="alert"`. |
| **Form success** | Replace form with confirmation panel (check icon in `--keep-50` tile), reference ID in mono, "Send another" ghost button. |
| **Offline (site)** ✚ | Service worker caches shell + docs; offline banner "You are offline — showing saved pages." |
| **Destructive confirm** | Dialog with explicit verb button ("Roll back to *Pre-Midterm Prune*"), cancel is default focus. |
| **Undo toast** | Non-destructive removals (restore, delete memo, delete note) happen instantly with a 5-second "Undo" toast. |

---

## 12. Motion & interaction specification

**Principles:** motion explains cause and effect; nothing loops forever on the marketing page except the small illustrations (which pause when off-screen); everything respects `prefers-reduced-motion` (replace movement with 120ms opacity fades).

| Interaction | Property | Duration | Easing | Notes |
|---|---|---|---|---|
| Button hover | bg, translateY(-1px), shadow | 200 | ease-out | |
| Card hover | translateY(-2px), border, shadow | 200 | ease-out | |
| Nav scroll state | bg-opacity, blur, border | 200 | ease-out | Triggered at scrollY > 8 |
| Section reveal | opacity 0→1, translateY 16→0 | 560 | ease-out | Once, IntersectionObserver threshold .15; siblings stagger 60ms (max 6) |
| H1 word reveal | opacity, translateY 12→0 | 560 | ease-out | 40ms stagger; run on first paint only |
| Tabs thumb | transform, width | 320 | ease-out | |
| Accordion | grid-template-rows | 320 | ease-in-out | |
| Modal enter / exit | opacity, scale .97↔1 | 200 / 140 | ease-out / ease-in-out | |
| Sidebar collapse (demo) | width 280↔48 | 320 | ease-in-out | content fades 120ms first |
| Prune a page (demo) | opacity→.45, hatch fade-in | 200 | ease-out | counters tick 400ms |
| Number count-up | value | 600 | ease-out | `tabular-nums` |
| Toast | translateY(12px)→0, opacity | 240 | ease-out | |
| Confetti | canvas-confetti, 90 particles, 1 burst, 2.2s | – | – | Only on export action; disabled for reduced motion |
| Page transitions | View Transitions API cross-fade 180ms | 180 | linear | Progressive enhancement |

Cursor rules: pointer on all interactive elements; `grab/grabbing` on draggable notes; `crosshair` for pen; custom cursors are PNG/SVG ≤ 32px.

---

## 13. Responsive behaviour

| Region | ≥1280 | 1024–1279 | 768–1023 | <768 |
|---|---|---|---|---|
| Nav | Full links | Full links (gap 20) | Hamburger | Hamburger |
| Hero H1 | 72/76 | 64/68 | 52/56 | 40/44 |
| Stage | Full interactive, 16:10 | Interactive | Interactive, sidebar collapsed by default | Replaced by carousel + video |
| Bento | 12-col | 12-col | 6-col (cards span 6 or 3) | 1 column |
| How-it-works stepper | Horizontal | Horizontal | Vertical | Vertical |
| Pricing | 3 cards | 3 cards | 3 cards compact | Stacked, Pro first |
| Docs | 3-col | 2-col (right TOC hidden) | 1-col + top TOC dropdown | 1-col |
| Footer | 5-col | 5-col | 2-col | 1-col accordion |

Rules: no horizontal page scroll at 320px; tables scroll inside a bordered container with a visible scroll shadow; images `max-width:100%`; respect safe-area insets (`env(safe-area-inset-*)`) for the sticky mobile download bar ✚ (shown after scrolling past the hero, hidden on `/download`).

---

## 14. Accessibility (WCAG 2.2 AA — mandatory)

1. **Structure:** one `<h1>` per page; headings never skip levels; landmarks `header / nav / main / footer`; skip link is the first focusable element.
2. **Keyboard:** every action reachable by keyboard; visible focus (`2px` ring, 3:1 against adjacent colours); logical tab order; no keyboard traps except modals (with `Esc` exit). Focus is *not obscured* by sticky nav — use `scroll-margin-top: calc(var(--nav-h) + 16px)` (WCAG 2.2 · 2.4.11).
3. **Targets:** ≥ 24×24 CSS px minimum, ≥ 44×44 for primary controls (WCAG 2.2 · 2.5.8).
4. **Contrast:** text ≥ 4.5:1 (≥ 3:1 for ≥ 24px or ≥ 19px bold); UI components and focus indicators ≥ 3:1. Use only the validated token pairs in §4.1; `--ink-400` is never used for body text.
5. **Colour is never the only signal:** keep = green **+ check icon + "Active"**; prune = rose **+ trash icon + hatch pattern + "Pruned"**. Chosen pair also differs in lightness for colour-blind users.
6. **Motion:** honour `prefers-reduced-motion`; no auto-playing media with sound; video has pause control (WCAG 2.2.2).
7. **Forms:** visible labels, instructions before inputs, errors announced (`role="alert"`) and associated, no placeholder-only labels, `autocomplete` tokens set, no CAPTCHA that blocks assistive tech (use honeypot + rate limiting).
8. **ARIA:** prefer native elements; icon-only buttons have `aria-label`; live regions for toasts (`status`) and form errors (`alert`); tabs/accordion/dialog/combobox follow WAI-ARIA APG patterns.
9. **Media:** meaningful alt text; decorative images `alt=""`; videos have captions or are purely decorative with a text equivalent adjacent.
10. **Language & zoom:** `<html lang>`; layout works at 400% zoom and 320px viewport without 2-D scrolling; text spacing overrides don't break layout.
11. **Demo accessibility:** all demo actions reachable through the command palette and keyboard shortcuts; pen drawing is a pointer-only action — a note under the Stage states this and offers sticky-note placement via keyboard as the accessible alternative.
12. **Testing gates:** axe-core in CI (0 serious/critical), manual screen-reader pass (NVDA + VoiceOver) on Home, Pricing, Download, Docs; keyboard-only walkthrough; 200% text-size check.

---

## 15. Engineering specification (website)

### 15.1 Stack (use latest stable releases, pinned by lockfile)
| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript (strict)** | SSG/ISR, metadata API, image optimisation, RSC for zero-JS static sections |
| Styling | **Tailwind CSS v4** + CSS variables from §4 | Token-driven, tiny CSS output |
| Components | **Radix UI primitives** (Dialog, Tabs, Accordion, Popover, Tooltip, Select, Slider) wrapped in own `ui/` components | Accessible behaviour for free |
| Motion | **Motion (Framer Motion) – `LazyMotion` + `domAnimation` only** | ≤ 6 KB; CSS for simple transitions |
| Icons | **lucide-react** (tree-shaken, named imports) | Same family as the product |
| Content | **MDX** (docs, changelog, legal) via `@next/mdx` + `content/*.ts` typed objects for marketing copy | Writers edit text, not JSX |
| Forms | **react-hook-form + zod**, server action / API route, Resend-compatible email adapter | Type-safe validation both sides |
| Theme | **next-themes** (`attribute="data-theme"`, `enableSystem`) — no-flash inline script | Resolves system preference server-safe |
| Search | **Pagefind** or build-time JSON index + Fuse.js | Static, no backend |
| Confetti | **canvas-confetti** (dynamic import on first export click) | Same as product |
| Analytics | **Plausible/Umami (cookieless)**; consent banner **not required**; events listed in §15.7 | Privacy-first |
| Hosting | **Vercel / Cloudflare Pages**; images via platform optimiser; CDN for installers (R2/S3) with signed checksums | |
| Quality | **ESLint (flat) + Prettier**, `tsc --noEmit`, **Vitest + Testing Library**, **Playwright** (E2E + visual), **axe-playwright**, **Lighthouse CI** | |
| CI/CD | GitHub Actions: install → lint → typecheck → unit → build → e2e → a11y → LHCI → preview deploy; main → production | |

### 15.2 Folder structure
```
/app
  (marketing)/page.tsx                 # Home
  (marketing)/features/page.tsx
  (marketing)/how-it-works/page.tsx
  (marketing)/pricing/page.tsx
  (marketing)/download/page.tsx
  (marketing)/shortcuts/page.tsx
  (marketing)/use-cases/[exam]/page.tsx
  (marketing)/roadmap/page.tsx
  (marketing)/about/page.tsx
  (marketing)/contact/page.tsx
  demo/page.tsx
  changelog/page.tsx  changelog/rss.xml/route.ts
  docs/[[...slug]]/page.tsx
  (legal)/privacy|terms|licenses/page.tsx
  api/contact/route.ts  api/download/route.ts   # download = redirect + count
  not-found.tsx  error.tsx  sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx
/components
  ui/            button.tsx badge.tsx kbd.tsx card.tsx input.tsx select.tsx tabs.tsx accordion.tsx
                 dialog.tsx tooltip.tsx toast.tsx command-palette.tsx metric.tsx section-header.tsx
  layout/        site-nav.tsx site-footer.tsx announcement-bar.tsx theme-toggle.tsx mobile-sheet.tsx
  marketing/     hero.tsx premise.tsx loop-stepper.tsx feature-bento.tsx relief-hud.tsx
                 micro-features.tsx privacy-band.tsx use-case-tabs.tsx pricing-cards.tsx
                 pricing-matrix.tsx faq.tsx final-cta.tsx download-cta.tsx platform-card.tsx
  demo/          stage.tsx app-shell.tsx titlebar.tsx cognitive-banner.tsx toolbar.tsx sidebar/*.tsx
                 viewer.tsx annotation-layer.tsx sticky-note.tsx modals/*.tsx pomodoro.tsx tour.tsx
                 use-demo-store.ts   # zustand store, see §15.5
/content        site.config.ts features.ts shortcuts.ts faq.ts use-cases.ts pricing.ts changelog/*.mdx docs/*.mdx
/lib            cn.ts detect-os.ts format.ts seo.ts analytics.ts
/styles         tokens.css globals.css prose.css
/public         fonts/ (self-hosted subset woff2) og/ icons/ media/ (webm/mp4 posters)
/tests          unit/ e2e/ a11y/
```

### 15.3 Key component contracts (TypeScript)
```ts
// components/ui/button.tsx
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger-soft" | "on-stage";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// components/marketing/download-cta.tsx
type DownloadCTAProps = { size?: "md" | "lg"; showMeta?: boolean; align?: "start" | "center" };
type Platform = "windows" | "macos" | "linux" | "mobile" | "unknown";

// components/ui/metric.tsx
type MetricProps = { value: number; label: string; suffix?: string; format?: "int" | "percent" | "minutes"; animate?: boolean };

// content/features.ts
type Feature = {
  id: string; group: "pruner" | "annotation" | "voice" | "snapshots" | "productivity" | "export" | "navigation" | "study";
  title: string; description: string; icon: LucideIconName; shortcut?: string[]; isNew?: boolean; media?: { src: string; poster: string; alt: string };
};
```

### 15.4 `site.config.ts` (all editable constants live here)
```ts
export const site = {
  name: "FocusDeck PDF",
  shortName: "FocusDeck",
  url: "https://focusdeck.app",                 // proposed domain – change on launch
  description: "An exam-prep PDF workstation. Prune the pages you won't be tested on, annotate the rest, and export a clean deck.",
  version: "1.0.0",
  releaseDate: "2026-11-01",                    // proposed
  contactEmail: "hello@focusdeck.app",          // proposed
  minutesPerPrunedPage: 3,
  downloads: {
    windows: { label: "Windows 10+ (64-bit)", file: "FocusDeck-Setup-1.0.0.exe", size: "148 MB", sha256: "published at release" },
    macos:   { label: "macOS 12+ (Universal)", file: "FocusDeck-1.0.0.dmg",       size: "162 MB", sha256: "published at release" },
    linux:   { label: "Linux (AppImage)",       file: "FocusDeck-1.0.0.AppImage",  size: "151 MB", sha256: "published at release" },
  },
  social: { github: "https://github.com/focusdeck", x: "https://x.com/focusdeck" },
} as const;
```
*(Sizes and checksums are shown as "proposed — replace at release". Build must fail in CI if `sha256` equals the literal "published at release" on a production deploy.)*

### 15.5 Demo state model (zustand + immer)
```ts
type DemoState = {
  totalPages: 24; currentPage: number; zoom: number;           // 50–300, step 15
  pruned: Set<number>; bookmarks: Set<number>;
  tags: Record<number, string[]>; tagFilter: string | null;
  tool: "select" | "pen" | "highlighter" | "eraser" | "note" | "shape";
  shape: "rect" | "circle" | "arrow" | "line"; color: string; width: number; // 1–16
  strokes: Stroke[]; notes: Note[]; memos: Memo[]; snapshots: Snapshot[];
  paperTone: "dark" | "sepia" | "night"; zen: boolean; sidebarOpen: boolean; sidebarTab: "thumbs"|"bin"|"timeline"|"tags"|"audio";
  history: HistoryEntry[]; future: HistoryEntry[];              // max 30
};
// Derived: active = total − pruned.size; reduction% = round(pruned.size / total * 100); minutesSaved = pruned.size * site.minutesPerPrunedPage
```

### 15.6 SEO & metadata
- Per-page `generateMetadata` with unique `<title>` (≤ 60 chars, pattern `"{Page} — FocusDeck PDF"`), meta description (120–155 chars), canonical, Open Graph + Twitter large image (1200×630, generated by `opengraph-image.tsx`, ink background, serif-italic headline).
- JSON-LD: `Organization`, `WebSite` (+ `SearchAction`), `SoftwareApplication` (applicationCategory `EducationalApplication`, operatingSystem list, offers from pricing), `FAQPage` on Home/Pricing, `BreadcrumbList` on Docs/use-cases. *Do not include `aggregateRating` unless real.*
- `sitemap.xml`, `robots.txt` (disallow `/api`, `/demo?*`), hreflang ready for i18n ✚, 301 for trailing-slash normalisation.

### 15.7 Analytics events (cookieless)
`download_click {platform}`, `demo_start`, `demo_tour_complete`, `demo_prune`, `demo_export_attempt`, `pricing_toggle {billing}`, `plan_cta {plan}`, `contact_submit`, `theme_change {mode}`, `cmdk_open`. No PII; IP not stored.

### 15.8 Performance budgets (CI-enforced)
| Metric | Budget |
|---|---|
| LCP | ≤ 1.8 s (mobile, 4G Slow) |
| INP | ≤ 200 ms |
| CLS | ≤ 0.02 |
| TBT | ≤ 150 ms |
| JS per marketing route (gzip, excl. demo) | ≤ 110 KB |
| Demo chunk | ≤ 90 KB gzip, loaded on visibility |
| CSS | ≤ 25 KB gzip |
| Fonts | Self-hosted woff2 subsets, ≤ 3 files above the fold, `font-display: swap`, preloaded |
| Lighthouse (mobile) | Performance ≥ 95, Accessibility 100, Best-Practices ≥ 95, SEO 100 |

### 15.9 Security & privacy
CSP (no inline scripts except nonce'd theme script), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/geolocation/mic denied — demo never requests mic), HSTS. Contact form: server validation, rate limit 5/hour/IP, honeypot, no PII logging. Download endpoint serves signed URLs and publishes SHA-256 for each build.

### 15.10 i18n ✚
`next-intl`, locales **en** (default), **hi** (Hindi) in v1.1; all strings in `/messages/{locale}.json`; avoid text in images; layouts tolerate 40% longer strings; Devanagari font fallback "Noto Sans Devanagari".

---
# PART C — Product UI reference (the app, and what the demo replicates)

> Everything in the original brief's button/dropdown catalogue is mapped here with exact dimensions, icons, states and behaviour. Use it for (a) the website demo, (b) marketing screenshots, and (c) a future web-app version.

## 16. Product design language

| Aspect | Spec |
|---|---|
| Theme | Dark "Stage" palette (§4.1 `--stage-*`) by default; Sepia and Night-invert are *PDF-page* tones (the chrome stays dark). |
| Density | Compact: control height 32 (toolbar), 28 (sidebar rows), 36 (inputs in modals). |
| Radius | Controls 8, cards 12, modals 20, pills 999. |
| Text | UI 13px / 20 (Geist 500 for labels, 400 for values); mono 12px for shortcuts, timers and counts. |
| Icons | Lucide 16px (toolbar 18px), stroke 1.75. |
| Borders | Hairlines `--stage-line`; separators between toolbar groups are 1px × 20px `--stage-line-strong`. |
| Selected tool | bg `rgba(129,140,248,.16)`, icon `--stage-accent`, 1px inset ring `rgba(129,140,248,.45)`. |
| Focus | 2px ring `#A5B4FC`, offset 2. |

### 16.1 Window metrics (desktop 1440×900 reference)
| Region | Height / Width | Notes |
|---|---|---|
| TitleBar | 44px | Draggable region except interactive children (`-webkit-app-region`). Window buttons 46×44 (Win), traffic-light inset on macOS ✚. |
| Cognitive banner | 40px | Collapsible to 0 in Zen. |
| Main toolbar | 52px | Horizontally scrolls with fade masks <1100px; overflow menu "⋯" ✚. |
| Left sidebar | 280px open / 48px collapsed | Resizable 240–360 by drag handle ✚ (4px hit area 12px); width persisted. |
| Viewport | Remaining | Background `--stage-bg` with subtle `rgba(255,255,255,.015)` noise-free flat fill. |
| Page frame | Scaled PDF page | Shadow `0 12px 40px rgba(0,0,0,.55)`; 24px minimum margin; centred. |
| Pagination float | 40h pill, bottom 20px centred | bg `rgba(17,21,31,.78)` + blur 14px, 1px `--stage-line-strong`. |

---

## 17. Region-by-region specification

### 17.1 TitleBar
Layout (left → right): `[Brand] [Doc status] ……… [Command palette] [Pomodoro chip] ……… [Snapshots] [Export] [— ☐ ✕]`

| Element | Spec | States / behaviour |
|---|---|---|
| **Brand pill** | Mark 20px + "FocusDeck" 13/600 + `PRO` badge (ink-900 on #FFF, 10px caps). Click → About popover (version, licences) ✚. | hover bg `rgba(255,255,255,.06)` |
| **Document badge** | Truncated file name (max 28ch, ellipsis, full name in tooltip) with `file-text` icon, then **Active pill** (`keep`: "{n} active") and **Pruned pill** (`prune`: "{n} pruned"). Pills update with count-tick animation (200ms). Unsaved-changes dot (6px accent) before file name ✚. | Pills hidden <1100px (counts move to banner). |
| **Command palette button** | 280×30 search-style field: `search` icon, "Command Palette" placeholder text muted, `Ctrl K` keycap right. Click or shortcut opens palette (§17.14). | focus ring; ≥ 1100px only, below → icon-only 32×32 |
| **Pomodoro chip** | Pill 30h: `timer` icon + `MM:SS` mono. Idle shows "25:00" muted; running → icon stays static and a 6px dot pulses (1.6s, `keep` colour); paused → static amber dot; break → sky-blue dot. Click = open Pomodoro widget (§17.6); `Ctrl Alt P` toggles run state. | `aria-label="Pomodoro timer, 24 minutes 12 seconds remaining, running"` updated each minute (not each second). |
| **Snapshots button** | `history` icon + "Snapshots", ghost style. Opens Snapshot modal. Badge with count if > 0 ✚. | |
| **Export button** | Primary: bg `--accent-600`, text #FFF, `download` icon + "Export", height 30, radius 8. Disabled with tooltip "Open a PDF first" when no document. | |
| **Window controls** *(Electron only)* | Minimise (`minus`), Maximise/Restore (`square` / `copy`), Close (`x`). 46×44, hover bg `rgba(255,255,255,.08)`; Close hover bg `#E81123` + white icon. **Not rendered in the web demo / website.** | |

### 17.2 Exam cognitive banner (`CognitiveBanner`)
Left → right: `brain` icon in 24px accent tile · **"{active} pages to master"** (13/600) with muted " of {total}" · divider · **Pruned** metric (`trash-2` rose icon, "{n} pruned") · **Time saved** (`clock`, "≈ {m} min saved") · **Burden** (`trending-down`, "{p}% less to read") + 96×4 progress bar (rose fill on `rgba(255,255,255,.08)` track, animated 320ms) · spacer · **Batch prune** button.
- Numbers: `tabular-nums`; plural rules ("1 page", "2 pages"); 0 pruned shows muted "Nothing pruned yet".
- Time saved = pruned × `minutesPerPrunedPage` (default 3, user-configurable, see §17.11); ≥ 60 min renders "≈ 1 h 12 min".
- **Batch Prune button** (ghost, `scissors` icon, "Batch prune"): opens a 300px popover anchored below: title "Prune a page range", two **number inputs** *Start page* / *End page* (36h, min 1, max total, stepper-less, `inputmode="numeric"`), live preview line "Will prune {k} pages (45–90)" or error "Start must be ≤ End" (`aria-live`), buttons **Cancel** (ghost) and **Prune {k} pages** (primary, disabled until valid). `Enter` applies, `Esc` cancels. After applying → toast "Pruned {k} pages — Undo". Already-pruned pages are skipped and counted in the preview ("3 already pruned").

### 17.3 Main toolbar
Groups separated by 1px dividers; all icon buttons 32×32, radius 8, with tooltips showing name + keycap.

**Group 1 — Page actions**
| Control | Icon / label | Spec |
|---|---|---|
| **Prune / Restore toggle** | Active page: `trash-2` + "Prune page {n}" (rose-tinted outline button: text `--stage-prune`, border `rgba(251,113,133,.35)`, hover bg `rgba(251,113,133,.10)`). Pruned page: `check` + "Page {n} pruned · Click to restore" (emerald-tinted: text `--stage-keep`, border `rgba(52,211,153,.35)`). Width 200px fixed to prevent layout shift. | Shortcut `Delete`; `aria-pressed` reflects pruned state. |
| **Bookmark** | `bookmark` (outline) → filled `#F59E0B` when set | `B`; toast "Bookmarked page {n}"; `aria-pressed`. |
| **Undo** | `undo-2` | `Ctrl Z`; disabled when stack empty; tooltip shows last action name ("Undo pen stroke") ✚. |
| **Redo** | `redo-2` | `Ctrl Y` / `Ctrl Shift Z`; same rules. |

**Group 2 — Tool pill** (segmented, radio-group semantics, roving tabindex)
`Select` (`mouse-pointer-2`, `V`) · `Pen` (`pen-line`, `P`) · `Highlighter` (`highlighter`, `H`) · `Eraser` (`eraser`, `E`) · `Sticky note` (`sticky-note`, `T`) · `Shapes` (`shapes`, `S`) · `Voice memo` (`mic`, `M`) — the mic shows a 6px rose dot pulsing while recording. Active tool has the "selected" style (§16). Switching tools changes the viewer cursor (§12) and shows the matching contextual settings strip.

**Group 3 — Contextual tool settings** (appears with 160ms slide/fade directly right of the tool pill; hidden for Select/Eraser/Voice)
| Control | Spec |
|---|---|
| **Colour palette** | 8 swatches, 20px circles, 8px gap: Amber `#F59E0B`, Red `#EF4444`, Emerald `#10B981`, Electric Blue `#3B82F6`, Violet `#8B5CF6`, Pink `#EC4899`, White `#FFFFFF`, Slate Dark `#334155`. Active = 2px ring `#A5B4FC` with 2px stage-bg gap + tiny check for colour-blind redundancy ✚. Each is `<button role="radio" aria-label="Amber">`. Final slot ✚: **Custom** `<input type="color">` styled as a 20px conic-gradient circle → picked colour becomes a 9th recent swatch. Highlighter applies 35% alpha to the chosen colour automatically. |
| **Stroke width** | Native range 1–16, step 1, 120px track 4px high (`rgba(255,255,255,.14)`) with accent fill, 14px thumb; live numeric readout (mono 12px "6 px") + 24px **preview dot** showing width/colour. `[` and `]` change width ±1 ✚. `aria-label="Stroke width"`, `aria-valuetext="6 pixels"`. |
| **Opacity** ✚ | Range 10–100% (pen only; highlighter fixed range 20–50%). |
| **Shape selector** *(Shapes tool only)* | Segmented strip with `square` (Rectangle), `circle` (Circle), `move-up-right` (Arrow), `minus` (Line); tooltips; active styling; remembers last choice. Hold `Shift` for perfect square/circle/45° line ✚. Optional **Fill** toggle ✚ (off by default). |
| **Note colour** *(Sticky tool only)* | 4 swatches: Yellow `#FEF3C7`, Mint `#D1FAE5`, Sky `#E0F2FE`, Lavender `#EDE9FE` (with dark-ink text, 12.9:1+). |

**Group 4 — View controls** (right-aligned)
| Control | Spec |
|---|---|
| **Zoom out** `zoom-out` | −15% steps, min 50%, disabled at min. `Ctrl −`. |
| **Zoom readout** | Mono "100%" in a 56×28 button; click opens a **zoom dropdown** ✚: 50, 75, 100, 125, 150, 200, 300, Fit width, Fit page. Menu role `menu`, items 32h. |
| **Zoom in** `zoom-in` | +15%, max 300%. `Ctrl +`. |
| **Fit width** `move-horizontal` | Computes viewport − 48px gutters. `Ctrl 0`. |
| **Paper tone** ✚ (3-way segmented `moon` / `sun` / `contrast`) | *Dark* (page as-is on dark stage), *Sepia* (`filter: sepia(.35) saturate(.9) brightness(.97)`; stage turns `#1A1612`), *Night* (`filter: invert(.9) hue-rotate(180deg)` applied to the PDF canvas **only**, annotation layer excluded so colours stay true). |
| **View mode** ✚ | `file` single page ⇄ `scroll` continuous (IntersectionObserver updates current page; scroll position persisted per document). |
| **Zen mode** `maximize-2` | `Z` / `F11`. Hides sidebar, banner, titlebar secondary controls; toolbar auto-hides after 2s of mouse inactivity and returns on top-edge hover; subtle chip "Zen · Esc to exit" fades after 3s. |

### 17.4 Left sidebar
- **Collapse / expand chevron:** 24×24 button on the sidebar's top-right edge (`chevrons-left` / `chevrons-right`), `Ctrl \`; collapsed = 48px icon rail with tab icons stacked and tooltips right-aligned.
- **Tab strip (segmented control, 5 tabs, icon-only with tooltip + label on active tab when width ≥ 280):**

| Tab | Icon | Content | Count badge |
|---|---|---|---|
| Thumbnails | `layout-grid` | Grid of page cards | – |
| Safety Bin | `archive-restore` | Pruned pages | rose count |
| Timeline | `history` | Snapshots | accent count |
| Tags | `tags` | Bookmarks + hashtags | neutral count |
| Audio | `mic` | Voice memos | neutral count |

**Thumbnails view**
- 2-column grid (collapsible to 1 column via density toggle ✚), card = rendered page thumbnail (aspect 1 : 1.414, radius 8, 1px border) with **page number** in a mono chip bottom-left, **bookmark** ribbon top-right if set, up to 2 **tag badges** bottom-right (overflow "+n").
- States: *current page* 2px accent ring; *hover* shows **prune icon button** (24×24, top-left, `trash-2`/`undo-2`) and lifts 1px; *pruned* thumbnail 45% opacity + rose hatch + "PRUNED" label; *focus* ring.
- Keyboard: arrow keys move across the grid, `Enter` opens page, `Delete` toggles prune. Click on card jumps; `Shift+click` selects a range for multi-prune ✚ (selection bar appears: "{n} selected · Prune · Cancel").
- Lazy render with virtualisation (≥ 200 pages); thumbnails 160px wide at DPR 2.

**Safety Bin view**
- Header: "{n} pruned pages" + **Restore all** (secondary, sm) — confirm not needed (undo toast instead).
- List rows 56h: mini thumbnail 32×45, "Page {n}", reason chip ✚ (*Already mastered · Out of syllabus · Low-yield proof · Other*) with a small select to change it, **Restore** button (`undo-2`, ghost).
- Empty: "Nothing pruned yet. Press Delete on any page to move it here."

**Timeline view**
- Header: **New checkpoint** (primary sm, `bookmark-plus`).
- Vertical timeline: 8px node on 1px line; each entry card: name (13/600), description (2 lines max, muted), relative time ("12 min ago", `<time datetime>`), type chip (*Manual* / *Auto* ✚), meta ("268 active · 144 pruned"), **Rollback** button (`rotate-ccw`, secondary sm) → confirm dialog (§17.7).
- Empty: "No checkpoints yet. Save one before big changes."

**Tags view**
- Top: **Tag input** (36h, `hash` prefix icon, placeholder "Add tag to this page — e.g. HighYield") with **Add** button (`plus`, submit; `Enter` also submits). Autocomplete suggests existing tags; defaults seeded: `#HighYield`, `#Formula`, `#ExamDoubt`. Validation: 2–24 chars, letters/numbers/underscore, auto-prefix `#`, duplicates ignored with message.
- **Filter pills** (toggle chips, multi-select ✚) with counts; selecting filters the Thumbnails grid and shows "Filtered by #Formula · Clear".
- **Bookmarks list:** rows "Page {n} — {first line of page text or note title}" with remove button.

**Audio view**
- List of memo cards: title (inline-editable on double-click / `F2`), page chip ("p. 14"), duration mono, created time, **Play/Pause** (`play`/`pause`, 32×32 accent-tinted circle), progress scrubber (native range, 4px), **Delete** (`trash-2`, ghost with undo toast).
- Filter: segmented *All pages / This page*.
- Empty: "Record a quick explanation to your future self." + **Record memo** button.

### 17.5 PDF viewport
- **Stack (z-order):** page canvas → highlighter layer (`mix-blend-mode: multiply`) → pen/shape layer (SVG) → sticky-note layer (DOM) → audio-pin layer → prune overlay → selection handles.
- **Prune overlay (pruned page):** `rgba(190,18,60,.18)` tint + hatch pattern + centred card (radius 16, bg `rgba(17,21,31,.9)`, border `rgba(251,113,133,.4)`): `trash-2` icon, "This page is pruned", sub "It won't be included in your export", and **Quick restore** button (primary-keep: bg `#059669`, white text, 44h). Annotation is disabled on pruned pages.
- **Sticky note card:** 200×140 default, radius 10, colour from §17.3; header 28h with **drag handle** (`grip-horizontal`, `cursor:grab`) and **delete** (`trash-2` 20×20); body `<textarea>` autosizes (min 3 rows, 14px, ink-900 text); resize handle bottom-right ✚; focus ring when selected; keyboard: `Tab` into note, arrow keys nudge 4px (`Shift` 16px) while the header is focused.
- **Audio memo chip (pin):** pill on page — `mic` icon + "0:42"; click plays; drag to reposition ✚ (stores x/y as % of page). Playing state shows 3 animated bars.
- **Pagination float:** `chevron-left` (Prev) · **"Page [ 14 ] of 412"** where the number is an editable `<input inputmode="numeric">` (select-all on focus, `Enter` jumps, invalid reverts with shake 160ms) ✚ · `chevron-right` (Next). Prev disabled on page 1, Next on last. Keys `←/→`, `PgUp/PgDn`; `Home/End`.
- **Minimap** ✚: 10px vertical strip at the right edge; every page is a 2px tick (active = white, pruned = rose, bookmarked = amber); hover shows page number tooltip; click jumps.
- **Drag & drop:** dragging a file over the window shows a full-viewport drop zone: dashed 2px accent border, radius 20, `file-up` icon, "Drop your PDF to open it". Non-PDF → inline error "Only PDF files are supported."
- **Loading:** skeleton page + progress "Rendering page {n}…"; password-protected PDFs open a password dialog ✚; corrupt file shows an error panel with "Choose another file".

### 17.6 Pomodoro widget
- **Floating, draggable** card 280×(auto ≈ 260), radius 20, bg `--stage-elevated`, border `--stage-line-strong`, `--shadow-lg`; snaps to the 4 viewport corners (24px inset) when released within 80px; position persisted. Close `x` (28×28) hides it (timer keeps running — chip stays).
- **Mode selector:** segmented control `Study 25m · Short break 5m · Long break 15m` (durations editable in Settings ✚).
- **Ring:** 168px SVG ring, 6px stroke; track `rgba(255,255,255,.08)`; progress stroke colour by mode (Study `--stage-accent`, Short `--stage-keep`, Long `#38BDF8`); centre time mono 44/48 `tabular-nums`; under it "Session {n}" and 4 dots indicating the cycle position (long break after 4).
- **Controls:** Play/Pause (primary circle 56px, `play`/`pause`) · Reset (`rotate-ccw`, 40px ghost circle) · Skip ✚ (`skip-forward`, 40px).
- **Completion:** acoustic chime (Web Audio: two sine tones 880 Hz → 1175 Hz, 120ms attack, 900ms exponential decay, gain ≤ 0.15), toast + desktop notification (permission requested lazily on first start), auto-advance Study → Break (setting ✚). Sound mutable (`volume-2` toggle). **Visual chime fallback** (ring flashes) for users with sound off.
- **Accessibility:** timer announces start/pause/finish via `aria-live="polite"`, not every second.

### 17.7 Snapshot (Timeline) modal & rollback
- **Modal:** width 520. Title "Save a checkpoint". Fields: **Name** (required, 3–60 chars, default "Checkpoint {n}"), **Description** (optional textarea, 160 chars with counter). Summary strip: "{active} active · {pruned} pruned · {strokes} strokes · {notes} notes · {memos} memos". Buttons: **Cancel**, **Save checkpoint** (primary, `Ctrl Enter`). Close `x` top-right.
- Below the form (same modal) a read-only list of the 5 latest snapshots with **Rollback** buttons.
- **Rollback confirm dialog:** "Roll back to “{name}”?" body "Your current pruned pages, annotations, tags and memos will be replaced. A safety checkpoint “Before rollback” is created automatically so you can undo this." Buttons **Cancel** (default focus) / **Roll back** (danger-soft). ✚ auto-safety checkpoint.
- **Auto-checkpoints ✚:** created (a) every 20 minutes of active edits, (b) before batch prune, rollback, or export; keep latest 10 auto + all manual; labelled *Auto*.

### 17.8 Voice memo modal
- **Permission step:** card with `mic` icon "FocusDeck needs microphone access to record voice memos. Audio stays on this device." + **Allow microphone** (primary). Denied state: instructions per OS and **Try again**.
- **Idle:** large 64px record button (rose `--prune-600` circle with white dot), caption "Record memo for page {n}", **Title** input (placeholder "e.g. Why quicksort is O(n²) worst case"), **Cancel** ghost.
- **Recording:** live timer mono 32px (max **5:00** ✚ with last-10-seconds amber warning), **waveform visualiser** (canvas, `AnalyserNode`, 48 bars, 2px gap, accent-300, 60fps, falls back to pulsing ring under reduced motion), buttons **Stop & save** (primary, `square` icon) and **Cancel recording** (ghost danger). Pulsing 8px rose dot + `aria-live` "Recording".
- **Review step** ✚: tiny player + **Save** / **Re-record**.
- **Storage:** WebM/Opus ≈ 24 kbps mono, stored as base64 in the bundle; per-document **size meter** in Audio tab ("2.1 MB of audio") ✚. Errors: no mic found, recording failed — inline alert with retry.

### 17.9 Export modal
- Width 560, title "Export your deck". **Summary card** (`--stage-surface`, radius 14): large metrics "**{active}** pages in · **{pruned}** pruned · **{p}%** lighter" + a mini-bar of kept vs pruned segments.
- **Option list (radio cards):**
  1. **Clean exam PDF** (`file-check`, default): "Only your {active} active pages, with pen, highlights, shapes and sticky notes baked in." Sub-options (checkboxes ✚): *Include sticky notes* (on) · *Include bookmarks as PDF outline* (on) · *Flatten annotations* (on) · *Add page numbers of original* (off).
  2. **Project bundle** (`package`): "Everything — source PDF, annotations, snapshots, voice memos, tags — in one `.fdeck` file." (also opens `.lumina`).
  3. ✚ **Flashcards (CSV for Anki)** (`layers`): export clipped formulas/cards.
  4. ✚ **Annotations summary (Markdown / PDF)**: all notes and tags by page.
- **Actions:** **Export clean PDF** / **Save project bundle** (label changes with selected option), **Cancel**. Progress: determinate bar "Baking page 31 of 268…" with cancel; success → confetti burst (canvas-confetti, 90 particles, spread 70, origin y .7), toast "Saved to {path}" with **Show in folder** action, modal closes after 1.2s. Error → inline alert with Retry.

### 17.10 Keyboard shortcuts (authoritative list)
Shortcuts are **ignored while focus is in an input, textarea, select or contenteditable**. macOS shows `⌘` for `Ctrl`.

| Group | Action | Keys |
|---|---|---|
| Tools | Select / Pointer | `V` |
| | Pen | `P` |
| | Highlighter | `H` |
| | Eraser | `E` |
| | Sticky note | `T` |
| | Shapes | `S` |
| | Voice memo | `M` ✚ |
| | Stroke width −/+ | `[` / `]` ✚ |
| Pages | Prune / restore page | `Delete` |
| | Bookmark page | `B` ✚ |
| | Previous / next page | `←` `→` / `PgUp` `PgDn` |
| | First / last page | `Home` / `End` |
| | Go to page | `Ctrl G` ✚ |
| | Batch prune | `Ctrl Shift D` ✚ |
| View | Zoom in / out | `Ctrl +` / `Ctrl −` |
| | Fit width | `Ctrl 0` |
| | Toggle sidebar | `Ctrl \` ✚ |
| | Zen mode | `Z` or `F11` |
| | Paper tone cycle | `Ctrl Shift T` ✚ |
| Editing | Undo / Redo | `Ctrl Z` / `Ctrl Y` (`Ctrl Shift Z`) |
| Productivity | Pomodoro start/pause | `Ctrl Alt P` |
| | Save checkpoint | `Ctrl Shift S` ✚ |
| | Export | `Ctrl E` ✚ |
| | Search in document | `Ctrl F` ✚ |
| Global | Command palette | `Ctrl K` |
| | Open file | `Ctrl O` |
| | Shortcut help overlay | `?` ✚ |
| | Close / cancel | `Esc` |

### 17.11 Settings ✚ (modal, 3 tabs)
- **General:** language, default paper tone, default view mode (single/continuous), minutes saved per pruned page (number 1–10, default 3), open last document on launch (toggle), auto-checkpoint (toggle + interval select 10/20/30 min).
- **Study:** Pomodoro durations (Study 15–60, Short 3–15, Long 10–30), auto-start next interval, chime volume slider, chime on/off, daily page goal ✚, exam date (date picker → "{d} days to go" chip in banner) ✚.
- **Accessibility & shortcuts:** reduce motion (system/on/off), high-contrast chrome toggle, UI text size (S/M/L), shortcut list (read-only v1; remap v1.2).

### 17.12 Welcome / onboarding ✚
Empty state (no document): centred card 560w — logo, "Open a PDF to begin", **Open PDF…** (primary), **Try the sample deck** (secondary), drop-zone hint, recent files list (up to 5, with remove "x"). First run shows a 4-step coach tour (Prune → Annotate → Zen → Export) skippable, never shown again after dismissal.

### 17.13 Empty, loading, error & edge states (product)
| Case | Behaviour |
|---|---|
| No document | Welcome card (§17.12) |
| All pages pruned | Banner turns warn tone "You pruned every page — restore some to export." Export disabled with tooltip. |
| Very large PDF (> 800 pages) | Info toast "Large document — thumbnails load as you scroll." |
| Unsaved changes on close | Dialog **Save bundle / Discard / Cancel**. |
| Crash recovery ✚ | Autosave to app-data every 30s; on relaunch offer "Restore unsaved session?" |
| Mic / notification denied | Inline guidance, feature degrades gracefully |
| Undo limit reached | Tooltip "Undo history holds the last 30 actions." |

### 17.14 Command palette (product) — default commands
*Pages:* Go to page… · Next/Previous page · Prune/Restore current page · Batch prune range… · Bookmark page · Restore all pruned.
*Tools:* Select · Pen · Highlighter · Eraser · Sticky note · Shapes · Record voice memo.
*View:* Zoom in/out · Fit width · Zen mode · Toggle sidebar · Paper tone: Dark / Sepia / Night · Continuous scroll.
*Study:* Start/Pause Pomodoro · Reset timer · Open Safety Bin · Open Timeline · Filter by tag…
*File:* Open PDF… · Load sample deck · Export clean PDF · Save project bundle · Save checkpoint · Settings · Keyboard shortcuts.
Each command: icon, label, optional keycap, group header; recently used float to top ("Recent"). Fuzzy ranking: prefix > word-start > subsequence.

### 17.15 Dropdown / picker / slider catalogue (complete)
| # | Control | Type | Options / range | Default | Where |
|---|---|---|---|---|---|
| 1 | Colour palette | radio-group of swatches (+ custom picker ✚) | 8 presets | Amber | Toolbar G3 |
| 2 | Stroke width | range slider | 1–16 px | 4 | Toolbar G3 |
| 3 | Opacity ✚ | range slider | 10–100% | 100% | Toolbar G3 (pen) |
| 4 | Shape selector | segmented | Rectangle · Circle · Arrow · Line | Rectangle | Toolbar G3 |
| 5 | Note colour | radio swatches | Yellow · Mint · Sky · Lavender | Yellow | Toolbar G3 |
| 6 | Zoom | stepper + dropdown ✚ | 50–300%, Fit width/page | 100% | Toolbar G4 |
| 7 | Paper tone ✚ | 3-way segmented | Dark · Sepia · Night | Dark | Toolbar G4 |
| 8 | View mode ✚ | toggle | Single · Continuous | Single | Toolbar G4 |
| 9 | Batch prune range | 2 number inputs | 1–total | – | Banner popover |
| 10 | Pomodoro mode | segmented | Study 25 · Short 5 · Long 15 | Study | Widget |
| 11 | Sidebar tabs | segmented (5) | Thumbs · Bin · Timeline · Tags · Audio | Thumbs | Sidebar |
| 12 | Tag input + filter pills | text + chips | `#` tags | – | Tags tab |
| 13 | Prune reason ✚ | select | Already mastered · Out of syllabus · Low-yield proof · Other | Other | Safety Bin |
| 14 | Memo filter | segmented | All pages · This page | All | Audio tab |
| 15 | Command search | combobox | fuzzy | – | Palette |
| 16 | File picker / drop zone | native file input + DnD | `.pdf`, `.fdeck`, `.lumina` | – | Palette / Welcome |
| 17 | Export option | radio cards | Clean PDF · Bundle · Flashcards ✚ · Summary ✚ | Clean PDF | Export modal |
| 18 | Exam date ✚ | date picker (native `<input type="date">`) | future dates | – | Settings |
| 19 | Language ✚ | select | English · हिन्दी | System | Settings / footer |

---
# PART D — Additions, content, QA and generation

## 18. Missing features added (✚) — rationale & priority

Priority: **M** = Must (ship v1.0) · **S** = Should (v1.1) · **C** = Could (later). Effort: S/M/L.

### 18.1 Website additions
| # | Addition | Why it matters | Pri | Effort |
|---|---|---|---|---|
| W1 | **Interactive in-browser demo + guided tour** | Highest-converting asset for a tool people must *feel*; removes install risk | M | L |
| W2 | **OS-aware download CTA, checksums, "send me the link" on mobile** | Desktop-only app, so mobile visitors would otherwise bounce | M | S |
| W3 | **Pricing page with plan matrix, billing toggle, student discount** | Brief had no commercial model; users must see cost before downloading | M | M |
| W4 | **Privacy / offline promise page** | The #1 trust question for people importing paid course material | M | S |
| W5 | **Docs hub with search, changelog, troubleshooting** | Reduces support load; helps SEO | M | M |
| W6 | **Use-case pages (GATE, UPSC, Medical, Law, CFA)** | Long-tail organic search; speaks to each aspirant | S | M |
| W7 | **Public roadmap + feedback link** | Builds trust, collects demand signals | S | S |
| W8 | **Website command palette (⌘K)** | Matches the product's own interaction model | S | S |
| W9 | **Dark/light/system theme + sepia reader mode for docs** | Night-time studiers | M | S |
| W10 | **i18n (Hindi first)** | Primary audience is in India; improves reach | S | M |
| W11 | **Accessible 404, status/offline handling, print stylesheets** | Quality bar | M | S |
| W12 | **Open-graph images per page, JSON-LD, sitemap, RSS** | Discoverability | M | S |
| W13 | **Press kit & brand assets download** | Reviewers, bloggers, coaching institutes | C | S |
| W14 | **Consent-free, cookieless analytics** | Privacy-aligned measurement | M | S |

### 18.2 Product additions (reflected in §17)
| # | Addition | Why it matters | Pri | Effort |
|---|---|---|---|---|
| P1 | **Auto-checkpoints + safety checkpoint before rollback/batch/export** | Brief mentions "auto" but never defines it; protects against data loss | M | M |
| P2 | **Prune reasons** (*Already mastered / Out of syllabus / Low-yield proof*) — in brief §7 as idea, specified here | Lets students revisit *why* a page was cut | S | S |
| P3 | **Flashcard / formula clipper + Anki CSV export** (marquee tool) | Converts reading into active recall — the strongest evidence-based study technique | S | L |
| P4 | **In-document search (`Ctrl F`) with result highlights** | A PDF reader without search feels incomplete | M | M |
| P5 | **Continuous-scroll mode, page-jump input, minimap** (from brief §7) | Navigation speed on long books | M | M |
| P6 | **Paper tones (Dark / Sepia / Night)** (from brief §7) | Eye strain at night | M | S |
| P7 | **Exam countdown & daily page goal / streak (non-gamified, optional)** | Pacing and motivation without noise | S | S |
| P8 | **Settings (minutes per page, Pomodoro lengths, chime, reduced motion)** | Brief hard-coded 3 min/page and 25/5/15 | M | S |
| P9 | **Multi-select + range-select in thumbnails** | Pruning 100 pages one by one is painful | M | S |
| P10 | **Crash recovery / autosave** | Trust: no lost work | M | M |
| P11 | **Recent files & welcome screen** | First-run and re-entry experience | M | S |
| P12 | **Password-protected PDFs, corrupt-file handling** | Real-world PDFs | M | S |
| P13 | **Keyboard-shortcut overlay (`?`) & remap (v1.2)** | Discoverability; accessibility | S | S |
| P14 | **Audio limits, compression, size meter, draggable audio pins** | Prevents bundle bloat (see G7) | M | M |
| P15 | **Annotations summary export (Markdown/PDF)** | Revision sheet from your own notes | C | M |
| P16 | **Opt-in cloud sync / cross-device bundle (E2E-encrypted)** | Long-term; keep offline-first | C | L |
| P17 | **OCR for scanned PDFs (on-device)** | Many exam scans are images; unlocks search and tags | S | L |
| P18 | **Multi-document tabs** | Students juggle several books | C | L |

### 18.3 Suggested release phasing
| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Foundations (week 1)** | Repo, CI, tokens, UI primitives, nav/footer, theme | Storybook/gallery of all §7 components; axe clean |
| **1 — Core site (weeks 2–3)** | Home, Features, Pricing, Download, legal, 404 | Lighthouse budgets met; copy approved |
| **2 — Demo (weeks 3–5)** | Stage with prune, HUD, annotate, snapshots, Pomodoro, export mock, tour | Demo ≤ 90 KB; keyboard-complete |
| **3 — Content (week 5–6)** | Docs, changelog, shortcuts, how-it-works, use-cases, roadmap | Docs search live; JSON-LD valid |
| **4 — Polish & launch (week 7)** | i18n scaffold, OG images, E2E + visual tests, performance pass | All §20 gates green |

---

## 19. Copy deck

### 19.1 Global microcopy
| Key | Text |
|---|---|
| Skip link | "Skip to main content" |
| Primary CTA | "Download for {OS}" |
| Secondary CTA | "Try the live demo" |
| Download meta | "v{version} · {size} · {minOS}" |
| Offline badge | "Works offline" |
| Theme toggle labels | "Light theme" · "Dark theme" · "System theme" |
| Copy success | "Copied to clipboard" |
| Form required note | "Fields marked (required) must be completed." |
| Generic error | "Something went wrong. Please try again." |
| Contact success | "Thanks — we've got your message. We reply within 2 working days." |
| Demo caption | "This is a live demo. Nothing is uploaded." |
| Exam disclaimer | "Exam names are trademarks of their respective owners. FocusDeck is not affiliated with them." |

### 19.2 Page metadata
| Page | Title | Description |
|---|---|---|
| Home | FocusDeck PDF — Study less. Retain more. | Prune the pages you won't be tested on, annotate the rest and export a clean exam deck. Offline PDF workstation for competitive exams. |
| Features | Features — FocusDeck PDF | Page pruner, vector annotation, voice memos, snapshots, Pomodoro and clean export — every tool built for exam revision. |
| Pricing | Pricing — FocusDeck PDF | Start free. Upgrade for unlimited projects, snapshots and flashcards. Student discounts available. |
| Download | Download — FocusDeck PDF | Get FocusDeck for Windows, macOS or Linux. Offline, private and quick to install. |
| Shortcuts | Keyboard shortcuts — FocusDeck PDF | Every shortcut for pruning, annotating and navigating, with a printable cheat sheet. |
| Docs | Documentation — FocusDeck PDF | Learn pruning, annotation, snapshots and export with step-by-step guides. |

### 19.3 FAQ (Home + Pricing)
*Policy statements below (licence checks, device limits, discount) follow the proposed pricing in §9.5 — confirm with the business owner before launch.*
1. **Does FocusDeck upload my PDFs?** No. Everything runs on your device. The only network calls are optional update checks and licence validation (Pro), and neither includes document content.
2. **What happens to pruned pages — are they deleted?** No. Pruned pages stay in your project and in the Safety Bin until you export. Your original PDF is never modified.
3. **Can I undo a prune or a rollback?** Yes. Restores show an Undo toast, and a safety checkpoint is created automatically before any rollback.
4. **Which file types can I open?** PDF files, plus `.fdeck` project bundles (and legacy `.lumina` bundles).
5. **Does the exported PDF keep my annotations?** Yes. Pen strokes, highlights, shapes and sticky notes are baked into the exported pages. Voice memos stay in the project bundle.
6. **Can I use it on more than one computer?** Move your `.fdeck` bundle to another computer and open it there. Pro licences cover up to 3 devices.
7. **Is there a student discount?** Yes — 40% off with a verified academic email address.
8. **Do you support scanned PDFs?** You can open, prune and annotate scanned PDFs today. Text search on scans needs OCR, which is on the roadmap.

### 19.4 Hero & section headline alternates (A/B)
- "Study less. *Retain more.*" (control) · "Prune the noise. *Master the rest.*" · "Your textbook, *trimmed to the exam.*"

---

## 20. Quality gates & Definition of Done

### 20.1 Design QA checklist
- [ ] Every colour in the build resolves to a token in §4.1 (no raw hex in components outside the demo's annotation palette).
- [ ] Type scale matches §4.3 at 360, 768, 1280, 1440 widths; no orphan words in H1/H2 (`text-wrap: balance`).
- [ ] 8-pt rhythm: all spacing from the scale in §4.4; section padding as specified.
- [ ] Only one accent colour on screen at a time; rose/emerald appear **only** for prune/keep semantics.
- [ ] Every interactive element shows hover, focus-visible, active, disabled states.
- [ ] Dark and light themes both pass contrast; Stage looks identical in both.
- [ ] No emoji used as icons; all icons Lucide at the specified size/stroke.
- [ ] Images have fixed dimensions; no CLS on load.

### 20.2 Engineering gates (all must pass in CI)
- [ ] `tsc --noEmit` and ESLint: zero errors/warnings.
- [ ] Unit tests: ≥ 85% coverage on `lib/`, `use-demo-store`, `detect-os`, pricing logic.
- [ ] Playwright E2E: *download CTA by OS*, *theme persistence*, *nav at mobile*, *prune→HUD update→export mock*, *contact form validation & success*, *command palette open/search/navigate*, *pricing toggle*.
- [ ] Visual regression at 3 viewports for Home, Pricing, Download, Docs.
- [ ] axe: 0 serious/critical on all routes; keyboard-only run-through scripted.
- [ ] Lighthouse budgets (§15.8) met on Home, Pricing, Docs.
- [ ] Broken-link check, sitemap validity, JSON-LD validation (Rich Results test), OG image render check.
- [ ] Production build fails if `site.config.downloads.*.sha256 === "published at release"` or if `site.url` is not HTTPS.

### 20.3 Content gates
- [ ] No unverifiable claims, ratings or user counts.
- [ ] Every ✚ feature that is *not yet shipped* is labelled "Coming soon" on the site (never presented as available).
- [ ] Legal pages reviewed by counsel; exam-affiliation disclaimer present.

### 20.4 Browser / device matrix
Latest two versions of Chrome, Edge, Firefox, Safari (macOS & iOS), Samsung Internet; Android Chrome mid-range device (4 GB RAM); desktop 1280–1920; 320px minimum.

---

## 21. Master generation prompt (copy–paste into an AI site builder)

```text
You are a senior product designer and staff front-end engineer. Build the complete marketing and download website for "FocusDeck PDF" — an offline exam-prep PDF workstation — strictly following the attached specification document (design.md).

STACK: Next.js App Router + TypeScript (strict) + Tailwind CSS v4 + Radix UI primitives + Motion (LazyMotion) + lucide-react + next-themes + zustand. Self-host Geist, Geist Mono and Instrument Serif (Latin subsets).

NON-NEGOTIABLES
1. Use ONLY the tokens in §4.1 (colours, radii, shadows, motion, spacing). Light "Paper" theme is default; dark theme via data-theme. The product "Stage" is always dark.
2. Minimal, quiet, editorial look: flat backgrounds, hairline borders, generous whitespace, ONE accent (indigo-600). Rose and emerald are reserved for prune/keep meaning. No gradient blobs, no glassmorphism except the sticky nav and the pagination pill, no emoji icons, no stock photos.
3. Pages & sections exactly as specified in §6 (frame), §7 (components) and §9 (pages), using the copy in §9 and §19. Build all 14 page types in §8.
4. Build the interactive demo ("Stage") per §10 with the state model in §15.5 and the UI details in §16–§17 (toolbar, sidebar tabs, HUD, annotation tools, snapshots, Pomodoro, Zen mode, export mock, command palette, tour). Code-split and hydrate on visibility.
5. Accessibility per §14 (WCAG 2.2 AA): semantic landmarks, visible focus, 44px targets, reduced-motion support, ARIA patterns for tabs/dialog/accordion/combobox, keyboard-complete demo.
6. Performance budgets per §15.8; SEO and JSON-LD per §15.6; analytics events per §15.7; security headers per §15.9.
7. Put all editable constants in content/site.config.ts and typed content in /content/*.ts as described in §15.2–§15.4. No lorem ipsum, no fake testimonials, no invented statistics.
8. Responsive behaviour per §13; QA at 360, 768, 1024, 1280, 1440 widths.

DELIVERABLES: runnable repository with README (setup, scripts, env), Storybook or /dev/components gallery, unit + E2E + a11y tests, and CI workflow. Start by scaffolding tokens, UI primitives and layout; then Home; then Pricing/Download; then the demo; then Docs/Changelog/Use-cases; finally polish and tests. After each milestone, list which spec sections are complete.
```

---

## 22. Appendix

### 22.1 Spec ↔ brief traceability (nothing dropped)
| Brief item | Where it lives in this spec |
|---|---|
| §1 Naming | §1.4 A2, §2.1 |
| §2 Tech stack (product) | §15.1 (site) — product stack unchanged and referenced in §1.5 G3 |
| §3 Features 1–26 | §9.2 Features groups A–G; demo coverage §10.2; product behaviour §17 |
| §4 Buttons (TitleBar → Modals) | §17.1 TitleBar · §17.3 Toolbar · §17.2 Banner · §17.4 Sidebar · §17.5 Viewport · §17.6–17.9 Modals/widgets |
| §5 Dropdowns/selects/sliders | §17.15 catalogue |
| §6 UI architecture | §16.1 metrics + §17 region specs |
| §7 Modernisation guide | §17.3 (paper tone, colour picker, sticky colours), §17.5 (minimap, page-jump, audio pins), §17.8 (waveform), §18.2 P2/P3/P5/P6 |

### 22.2 Wireframe — Home (desktop 1440)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Logo FocusDeck PDF     Features How it works Shortcuts Pricing Docs Changelog │ ◐  [Download]
├──────────────────────────────────────────────────────────────────────────────┤
│                     (v1.0 — Now available ▸)                                  │
│                        Study less.                                            │
│                        Retain more.                                           │
│         Prune the pages you won't be tested on, annotate the rest…            │
│              [ Download for Windows ]   [ Try the live demo ↓ ]               │
│           Free to start · Works offline · Your files stay on your device      │
│  ┌──────────────────────── STAGE (live demo, dark) ────────────────────────┐ │
│  │ ▪▪▪        FocusDeck — System-Design-Prep.pdf                            │ │
│  │ [brain] 15 pages to master of 24 │ 9 pruned │ ≈27 min saved │ 37% less │ Batch │ │
│  │ [Prune p.7] ☆ ↶ ↷ │ ⌖ ✎ ▮ ⌫ ▤ ◇ mic │ ●●●●●●●● ─── │ − 100% + ⤢ ◐ ⛶     │ │
│  │ ┌──────┬─────────────────────────────────────────────┐                  │ │
│  │ │ ▦ ☰ ⟲│        ┌──────────────┐                     │                  │ │
│  │ │ □ □  │        │  PDF page    │   ‹ Page 7 of 24 ›  │                  │ │
│  │ │ □ ▨  │        └──────────────┘                     │                  │ │
│  │ └──────┴─────────────────────────────────────────────┘                  │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│   100% offline │ No account needed │ Exports standard PDF │ Open .fdeck       │
├──────────────────────────────────────────────────────────────────────────────┤
│  THE PROBLEM — A 1,200-page book. A 6-week window.      [ page-stack graphic ]│
│  HOW IT WORKS — ① Import ─ ② Prune ─ ③ Annotate ─ ④ Focus ─ ⑤ Export          │
│  FEATURES — bento 6 cards                                                     │
│  RELIEF HUD (dark band) · DETAILS grid · PRIVACY · USE CASES · PRICING · FAQ  │
│  FINAL CTA                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```
*(The wireframe uses plain glyphs and `[icon]` labels for brevity; in the build every one is a Lucide icon — never emoji.)*

### 22.3 Glossary
**Prune** — exclude a page from study and export, reversibly. **Safety Bin** — list of pruned pages. **Deck** — the set of active pages. **Snapshot / Checkpoint** — a named copy of the document state. **Bundle** — `.fdeck` file containing PDF + all state. **Stage** — dark product surface (demo or screenshot). **HUD / Cognitive banner** — live metrics strip.

---
*End of specification.*
