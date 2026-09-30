# Intuition First — Agent Guide

## 1. Project Overview & Architecture

*Intuition First* is an interactive, explorable scientific and mathematical publishing series explaining complex physics, mathematics, and information theory from the ground up using intuitive visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.

### Core Architectural Invariants
- **100% Static & Zero Build Step**: No npm, webpack, vite, or bundlers. Every page runs directly via `file://` or GitHub Pages.
- **Single Source of Truth**:
  - Global styles: `css/style.css`
  - Universal runtime utilities & theme engine: `js/core.js`
  - Modular essay simulation engines: `js/post-01.js`, `js/post-02.js`, `js/post-03.js`, `js/post-04.js`, etc.
  - Landing hub: `index.html`
  - Longform essays: `posts/01-motion-and-time.html`, `posts/02-light-cone.html`, `posts/03-spacetime-loaf.html`, `posts/04-understanding-entropy.html`

---

## 2. Editorial Philosophy

This series teaches physics and mathematics **bottom-up**, not top-down. Every agent working on prose must internalize and consistently apply these 8 core principles.

### 1. Build from what the reader already knows — never from what they don't
Every new concept must grow organically out of direct physical intuition, everyday experience, or knowledge established in a previous section. Never start from the destination (a formula or textbook concept) and work backward to justify it.
- ✅ *"That picture tells us how velocity is partitioned — but not where anyone actually is. The natural next question is: can we draw a map?"*
- ❌ *"Textbooks use a spacetime diagram with space on the horizontal axis. This can be confusing because…"*

### 2. Never introduce confusion first
Do not frame a section by announcing what is confusing, contradictory, or commonly misunderstood before the reader encounters it themselves. Approach concepts as discoveries, not fixes for misconceptions.
- ✅ Pose open questions: *"But what angle does a photon's worldline actually make?"*
- ❌ Pre-announce answers: *"Watch how 90° in Velocity Space maps directly into a 45° diagonal."*
- ❌ Contrast with external curricula: *"In traditional textbooks, the photon is at 45°, not 90° — why?"*

### 3. Pure Constructive Elevation (Zero Complaining)
Teach by illuminating the natural beauty and geometric inevitability of ideas. Never disparage other educators, textbooks, or pedagogical approaches. The universe stands on its own merits without needing a foil.
- ✅ *"Let us follow the geometry to its natural conclusion."*
- ❌ *"Unlike dry university courses that bog students down in meaningless algebra..."*

### 4. The "Pacing of Wonder": Earned Revelation
Build tension through tangible setups (two cars on a field, two synchronized clocks, a loaf of film frames) before revealing deep cosmic symmetries.
- **Narrative Arc**:
  1. *Familiar Anchor*: Everyday tangible intuition.
  2. *The Natural Question*: Pushing intuition toward physical extremes.
  3. *The Geometric Bridge*: Mapping intuition into clean coordinate space.
  4. *The Inevitable Insight*: The mathematical formulation arrives purely as a description of what was already drawn.

### 5. Let visualizations deliver the insight — prose sets up the question
Simulations are moments of active discovery, not redundant illustrations of pre-explained facts.
- **Before the widget**: Establish context, introduce characters, name the open question.
- **The widget itself**: Delivers the answer through direct interaction.
- **After the widget**: Explain why the answer occurred and connect it to the broader picture.

### 6. Introduce characters and terms before using them
Every named entity (Alice, Bob, a photon, a muon) must be introduced with a clear physical situation before being referenced. Every technical term (worldline, proper time, light cone, entropy) must be coined at the exact moment it becomes necessary.

### 7. Self-contained — no assumed external knowledge
The reader arrives with everyday intuition and curiosity. Do not reference what "physicists know" or what "general relativity states". If a concept matters, derive or motivate it directly from first principles.

### 8. Section headings reflect discovery, not taxonomy
Headings should sound like steps in an unfolding journey, not chapter titles from an encyclopedia.
- ✅ *"Drawing the Map: Coordinate Spacetime"*
- ✅ *"The Angle of 'Now'"*
- ❌ *"The Side-by-Side Bridge: Speed Space vs Coordinate Spacetime"*
- ❌ *"Why Spacetime Cannot Have a 90° Worldline"*

---

## 3. Semantic Physics & Editorial Color Palette

Colors across the publication represent immutable physical concepts and editorial surfaces. Always pull colors dynamically from `UniverseSimulations.getThemeColors()` rather than hardcoding static hex codes into canvas scripts.

| Semantic Concept | Light Mode | Obsidian Dark Mode | Usage / Physical Meaning |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#fbfbf9` (`--bg-space`) | `#0d0f14` (`--bg-space`) | Main interactive canvas background |
| **Card Surface** | `#ffffff` (`--bg-card`) | `#131720` (`--bg-card`) | Simulation card wrapper & controls |
| **Card Subtle** | `#f6f6f2` (`--bg-card-subtle`) | `#090b0e` (`--bg-card-subtle`) | Readout dashboard cards, chip background |
| **Time / Rest Frame** | `#0969da` | `#58a6ff` | Motion through time, Alice's rest frame, $ct$-axis |
| **Space / Motion** | `#d95d18` | `#f0883e` | Spatial displacement, Bob's motion, $v_x$, coordinate distance |
| **Cosmic Invariant ($c$)** | `#6e40c9` | `#bc8cff` | Invariant speed hypotenuse $c$, 45° light cone boundary |
| **Light / Wavefronts** | `#b45309` | `#e3b341` | Outgoing photon wavefronts, beacon flashes, light signals |
| **Sync / Agreement / Entropy** | `#0f766e` | `#3dd68c` | Simultaneous events, invariant intervals, information entropy |
| **Forbidden / Causality Lag** | `#cf222e` | `#ff7b72` | Speeds exceeding $c$, causality disconnect, time lag |

---

## 4. Interactive Simulation Engineering

Every interactive simulation follows a standardized visual hierarchy, tactile control interface, and deterministic rendering lifecycle.

### Widget Anatomy
```
+-----------------------------------------------------------------------------------+
|  [SIMULATION 0X · TAXONOMY BADGE]                                                 |
|  Widget Title: The Intuitive Question or Action                                   |
|  1-2 sentence subtitle describing the exact physical tradeoff being observed       |
+-----------------------------------------------------------------------------------+
|  [CANVAS VIEWPORT] (Retina-scaled, crisp geometry, unified physics palette)       |
|    - High contrast axes with readable tick labels & arrows                        |
|    - Bounded label pills with viewport edge clamping                              |
|    - Color-coded vectors matching text & sliders (Blue=Time, Orange=Space, etc.)  |
|    - 3D projections with smooth touch/drag orbit, presets, and reset buttons     |
+-----------------------------------------------------------------------------------+
|  [READOUT DASHBOARD] (Multi-column live metric grid with tabular monospace nums)  |
|    [ v_space: 0.866 c ]   [ v_time: 0.500 c ]   [ Gamma: 2.00 ]   [ Delta-t: 0 ]  |
+-----------------------------------------------------------------------------------+
|  [INTERACTIVE CONTROLS & TIMELINE]                                                |
|    [ ▶ Auto Play / ⏸ Pause ]   [ ↺ Reset ]   [ Preset Chips: 0.0c, 0.6c, 0.866c ] |
|    Slider: Speed (v/c) / Time (t) / Probability (p) with live value badge         |
+-----------------------------------------------------------------------------------+
```

### Core Canvas & State Principles
1. **Retina DPI Setup**: Always initialize canvases with `setupRetinaCanvas(canvas)` to ensure crisp line drawing on high-DPI displays.
2. **Deterministic & Bidirectional**: Scrubbing forward and backward must never accumulate state drift. Speed or parameter adjustments must instantly and synchronously update readouts, sliders, and canvas graphics.
3. **Auto-Play + Manual Scrubbing**: Pair continuous animations with interactive range sliders (`.slider-speed`, `.slider-time`, `.slider-prob`). Auto-play demonstrates dynamics; scrubbing allows stop-and-inspect contemplation.
4. **Theme & Resize Awareness**: Register draw callbacks via `registerDraw(draw)` and `window.addEventListener('resize', draw)`. Never set inline canvas width/height attributes; dimensions are managed responsively via CSS.
5. **Edge Clamping for Label Pills**: Always clamp pill coordinates (`Math.min(width - padRight, Math.max(padLeft, x))`) so floating annotations never clip outside viewport boundaries on narrow screens.
6. **Tabular Numerals**: Numeric metrics and readouts must use monospace fonts with tabular numbers (`JetBrains Mono` / `tnum`) to eliminate layout jitter during live updates.

---

## 5. Responsive Layout & Design Standards

### 1. Dual-Container Discipline
- **Narrow Prose Flow (`.editorial-prose`, max ~680px–740px)**: Longform reading text stays in a focused column where line length (characters per line) maintains optimal reading ergonomics.
- **Wide Interactive Viewport (`.wide-reading-container`, `.wide-container`, max ~1100px–1200px)**: Multi-panel comparative matrices, 3D coordinate volumes, and dual-observer views expand horizontally for optimal spatial clarity.

### 2. Responsive Canvas Heights
- **Desktop (> 768px)**: `380px` (or `420px` for 3D loaves)
- **Tablet (<= 768px)**: `300px`
- **Mobile (<= 640px)**: `240px` (preserves landscape aspect ratio for coordinate systems)
- **Ultra-compact (<= 380px)**: `220px`

### 3. Mobile Layout Rules
- **Side-by-Side Twin Clocks**: **Never collapse twin clocks into a vertical stack on mobile.** Clocks must remain side-by-side (`grid-template-columns: 1fr 1fr; gap: 0.5rem;`) to preserve direct visual comparison.
- **Multi-Panel & 2×2 Grids**: On screens `<= 720px`, collapse 2×2 comparative grids into a single-column stack (`grid-template-columns: 1fr;`) using standardized classes (`.multi-panel-grid`, `.synthesis-grid`, `.expanding-circles-grid`) to give canvas axes adequate horizontal resolution.
- **Sticky Navigation Bar**: On mobile, keep navigation clean (`height: 3.25rem; padding: 0 1rem;`). Auxiliary badges (`.brand-tag`) and secondary navigation links (`.nav-link-secondary`) are hidden on small viewports to prevent collisions.

### 4. Home Page & Section Cadence
- **Brand Identity**: Monogram seal (`IF`) with clean monospaced brand text `INTUITION FIRST` without decorative gimmick ribbons or build bragging.
- **Zero Gap Stacking**: Avoid multiple stacked paddings. The first series group has `border-top: none; padding-top: 0;` so content flows naturally without empty visual voids.
- **Structured 2-Column Grid**: `.series-grid` renders as `repeat(2, minmax(0, 1fr))` on desktop, collapsing to `1fr` on mobile.

---

## 6. Live Simulation Catalog

### Series 01: Special Relativity — The Fabric of Spacetime

#### Part 1: Why Motion Through Space Affects Time (`posts/01-motion-and-time.html` / `js/post-01.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-cars` | `initWidgetCars` | Two cars on a 2D grid partitioning total velocity ($V_E = 60\sin\theta, V_N = 60\cos\theta$) |
| **02** | `widget-stationary` | `initWidgetStationary` | Sitting at rest ($x=0$) carries you forward through Time at 100% capacity |
| **03** | `widget-tradeoff` | `initWidgetTradeoff` | Spatial velocity tradeoffs reducing speed through time ($v_t = \sqrt{c^2 - v_x^2}$) |
| **04** | `widget-time-dilation` | `initWidgetTimeDilation` | Live Twin Clocks demonstrating time dilation ($t' = t / \gamma$) |
| **05** | `widget-speed-limit` | `initWidgetSpeedLimit` | Cosmic speed limit $c$, the timeless photon, and forbidden regions |
| **06** | `widget-muon` | `initWidgetMuon` | Atmospheric muon decay: Relativistic survival vs Newtonian prediction |
| **07** | `widget-3d-spacetime` | `initWidget3DSpacetime` | 3D spacetime volume ($x_1, x_2, t$) with rotatable camera and Now-Slice |

#### Part 2: The Cosmic Light Cone: Mapping Space & Time (`posts/02-light-cone.html` / `js/post-02.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-dual-bridge` | `initWidgetDualSpeedSpacetime` | Side-by-side comparison: Speed Space vs Coordinate Spacetime Map |
| **01b** | `widget-expanding-circles` | `initWidgetExpandingCircles` | 2×2 grid of outgoing light circles at $t=0,1,2,3$ in the $x$–$y$ plane |
| **01c** | `widget-synthesis-grid` | `initWidgetSynthesisGrid` | 2×2 synthesis grid bridging Velocity Space ($v_x, v_t$) to Spacetime ($\phi$) across 4 archetypes |
| **02** | `widget-3d-light-cone` | `initWidget3DLightConeExplorer` | Full 3D rotatable Light Cone volume ($x_1, x_2, ct$) with dynamic Now-Slice |
| **03** | `widget-cosmic-horizon` | `initWidgetCosmicHorizon` | Coordinated dual-view: Physical stellar radar bubble vs $(x, ct)$ past light cone |

#### Part 3: The Spacetime Loaf & Length Contraction (`posts/03-spacetime-loaf.html` / `js/post-03.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-loaf-alice` | `initWidgetLoafAlice` | 3D spacetime loaf volume with Alice's horizontal slice and expanding wavefront |
| **02** | `widget-loaf-bob` | `initWidgetLoafBob` | Bob in motion: slanting the worldtube across the spacetime loaf |
| **03** | `widget-beacons-bob` | `initWidgetBeaconsBob` | Bob's rest frame: simultaneous light beacon hits inside the coach ($\Delta t = 0$) |
| **04** | `widget-beacons-alice` | `initWidgetBeaconsAlice` | Alice's frame: moving coach causes desynchronized beacon hits ($\Delta t > 0$) |
| **05** | `widget-simultaneity-slice` | `initWidgetSimultaneitySlice` | Tilting the simultaneity hyperplane obliquely ($\tan\phi = v/c$) |
| **06** | `widget-length-contraction` | `initWidgetLengthContraction` | Geometric projection: Bob's tilted coach projecting onto Alice's present via $\cos\theta$ |
| **07** | `widget-dual-frame` | `initWidgetDualFrame` | Mutual relativity: invariant 10m coaches and reciprocal $\cos\theta$ projections |
| **08** | `widget-muon-contraction` | `initWidgetMuonContraction` | Atmospheric muons from both perspectives (Time Dilation vs Length Contraction) |

---

### Series 02: Information & Entropy — The Order of the Universe

#### Part 1: An Intuitive Guide To Entropy (`posts/04-understanding-entropy.html` / `js/post-04.js`)
| # | Container ID | Function | Physical Concept & Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `widget-certainty-coin` | `initWidgetCertaintyCoin` | The Predictability Spectrum: Certain coin vs uncertain coin outcomes |
| **02** | `widget-surprise-curve` | `initWidgetSurpriseCurve` | The Logarithmic Surprise Curve ($S(p) = -\log_2(p)$) and bit-depth of surprise |
| **03** | `widget-expected-entropy` | `initWidgetExpectedEntropy` | Expected Surprise / Shannon Entropy Curve ($H(p) = -p\log_2 p - (1-p)\log_2(1-p)$) |
| **04** | `widget-household-chaos` | `initWidgetHouseholdChaos` | Microstates vs Macrostates: Why messy rooms are statistically inevitable |

---

## 7. Verification & Quality Checklist

Before completing changes or authoring new simulations, verify:
- [ ] **Dual Theme Support**: Check both Light Mode (Warm Paper) and Dark Mode (Obsidian Cosmic) for contrast and color consistency.
- [ ] **Responsive Breakpoints**: Test layout down to 360px width. Ensure label pills do not clip canvas edges and twin clocks remain side-by-side.
- [ ] **Bidirectional Determinism**: Verify sliders and scrubbers update in real time without state accumulation or drift.
- [ ] **Zero Console Errors**: Confirm pure vanilla JS execution with zero external runtime dependencies.
