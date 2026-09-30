# Intuition First — Agent Guide

## Project Overview
An interactive, explorable scientific and mathematical publishing series explaining complex physics, mathematics, and machine learning from the ground up using intuitive visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.
The project is **100% static** (zero build step, zero npm dependencies, runs directly via `file://` or GitHub Pages).

---

## Editorial Philosophy

This series teaches physics and mathematics **bottom-up**, not top-down. Every agent working on prose must internalise and consistently apply the following principles.

### 1. Build from what the reader already knows — never from what they don't

Every new concept must grow organically out of something the reader already holds: direct physical intuition, everyday experience, or knowledge established in a previous section or article. We do not start from the destination (a fact, a formula, a named concept) and work backward to justify it. We start from what is already solid and ask the natural next question.

- ✅ *"That picture tells us how velocity is partitioned — but not where anyone actually is. The natural next question is: can we draw a map?"*
- ❌ *"Textbooks use a spacetime diagram with space on the horizontal axis. This can be confusing because…"*

### 2. Never introduce confusion first

Do not frame a new section by announcing what is confusing, contradictory, or commonly misunderstood before the reader has encountered it themselves. That approach assumes prior textbook exposure and makes the reader feel lost before they have a reason to be. A reader who has never seen a spacetime diagram is not confused by it — they simply haven't seen it yet. Approach it as something new to discover, not something to fix.

- ✅ Pose open questions from within the narrative: *"But what angle does a photon's worldline actually make?"*
- ❌ Pre-announce the answer: *"Watch how 90° in Velocity Space maps directly into a 45° diagonal."*
- ❌ Frame via contrast with external knowledge: *"In those textbook diagrams, the photon is at 45°, not 90° — why?"*

### 3. Pure Constructive Elevation (Zero Complaining)

We teach by illuminating the natural beauty and geometric inevitability of ideas, not by contrasting against poor pedagogy or complaining about the outside world.
- ✅ Frame physics as an adventure of direct deduction: *"Let us follow the geometry to its natural conclusion."*
- ❌ Never dismiss other media or educators: *"Unlike conventional dry courses that bog students down in meaningless algebra..."* or *"Traditional physics professors confuse students with..."*
- The universe stands on its own merits without needing a foil to look profound.

### 4. The "Pacing of Wonder": Earned Revelation

Revelations must feel inevitable yet breathtaking. We build tension through simple, concrete setups (two cars on a field, two clocks, a loaf of film frames) before revealing deep cosmic symmetries.
- Every section should end on an unanswered question or a tantalizing geometric consequence that creates natural momentum into the next section.
- **Narrative Arc**:
  1. *Familiar Anchor*: Everyday analogies rooted in tangible physical intuition.
  2. *The Natural Question*: Pushing that intuition toward its physical extremes.
  3. *The Geometric Bridge*: Mapping that intuition into clean coordinate space.
  4. *The Inevitable Insight*: The mathematical formulation arrives purely as a description of what was already drawn.

### 5. Let visualizations deliver the insight — prose sets up the question

Interactive simulations are not illustrations of something the prose has already fully explained. They are the moment of discovery. Prose before a widget should build the setup, name the travellers, pose the open question, and explain what the axes mean. The widget then answers the question. Prose after the widget unpacks what was observed and draws conclusions.

- **Before the widget**: establish context, introduce characters, name the open question.
- **The widget itself**: delivers the answer through direct interaction.
- **After the widget**: explain why the answer is what it is, connect it to the broader picture.

### 6. Introduce characters and terms before using them

Any named entity (Alice, Bob, a photon, a muon) must be introduced with a clear description of their situation before being referenced. The reader should never encounter a name that hasn't been given a face. Similarly, any technical term (worldline, proper time, light cone) must be coined within the prose at the moment it first becomes necessary — not assumed.

### 7. The series is self-contained — no assumed external knowledge

The reader is assumed to arrive with only everyday intuition and curiosity. No physics education, no textbook exposure. Do not reference how "physicists" map things, what "any textbook" shows, or what "general relativity" says. If a concept matters, we derive or motivate it ourselves from first principles within the series.

### 8. Section headings reflect discovery, not taxonomy

Section headings should sound like the next step in an unfolding journey, not like chapter labels in a textbook.

- ✅ *"Drawing the Map: Coordinate Spacetime"*
- ✅ *"Building Up the Picture"*
- ❌ *"The Side-by-Side Bridge: Speed Space vs Coordinate Spacetime"*
- ❌ *"Why Spacetime Cannot Have a 90° Worldline"*

---

## File Architecture & Single Source of Truth

The repository uses a strict **Single Source of Truth** architecture with **zero build step, zero npm dependencies, and 100% `file://` compatibility**:

1. **Series Hub / Landing Page**:
   - `index.html`
   - Loads `css/style.css` and `js/core.js`.
   - Features the "Why Intuition First?" manifesto, mission statement, and multi-series catalog (Series 01: Special Relativity, Series 02: Information and Entropy).
2. **Live Essay Articles**:
   - Part 1: `posts/01-motion-and-time.html` (loads `../css/style.css`, `../js/core.js`, `../js/post-01.js`)
   - Part 2: `posts/02-light-cone.html` (loads `../css/style.css`, `../js/core.js`, `../js/post-02.js`)
   - Part 3: `posts/03-spacetime-loaf.html` (loads `../css/style.css`, `../js/core.js`, `../js/post-03.js`)
3. **Core Utilities & Design Engine**:
   - `js/core.js`: Universal shared utilities (Light/Dark Theme Manager, reading progress bar, retina canvas setup, axis, grid, label pills, drawer navigation, and constraint primitives). Automatically initializes theme, progress bar, and series drawer on DOMContentLoaded.
   - `css/style.css`: Unified design system supporting Light Mode (default, warm paper minimal), Obsidian Dark Mode (`[data-theme="dark"]`), reading progress bar, math badges, series-specific color themes, and responsive mobile layouts.
4. **Modular Essay Simulation Engines**:
   - `js/post-01.js`: Part 1 simulation widgets (`initAllPost01`).
   - `js/post-02.js`: Part 2 simulation widgets (`initAllPost02`).
   - `js/post-03.js`: Part 3 simulation widgets (`initAllPost03`).
   *(Each script automatically initializes its widgets on DOMContentLoaded without boilerplate).*

---

## Simulation Catalog

### Part 1: Why Motion Through Space Affects Time
| #        | Container ID                    | Function                 | Purpose                                                                 |
| -------- | ------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| **01**   | `widget-cars`                   | `initWidgetCars`         | Two cars on 2D grid ($V_E = 60\sin\theta, V_N = 60\cos\theta$)          |
| **02**   | `widget-stationary`             | `initWidgetStationary`   | Sitting at rest ($x=0$) carries you forward through Time at 100%        |
| **03**   | `widget-tradeoff`               | `initWidgetTradeoff`     | Thought experiment: trading space for time ($v_t = \sqrt{V^2 - v_x^2}$) |
| **04**   | `widget-time-dilation`          | `initWidgetTimeDilation` | Live Twin Clocks and time dilation ($t' = t / \gamma$)                  |
| **05**   | `widget-speed-limit`            | `initWidgetSpeedLimit`   | Cosmic speed limit $c$ and the timeless photon                          |
| **06**   | `widget-muon`                   | `initWidgetMuon`         | Relativistic atmospheric muon decay vs. Newtonian prediction            |
| **07**   | `widget-3d-spacetime`           | `initWidget3DSpacetime`  | 3D spacetime volume ($x_1, x_2, t$) with rotatable camera and Now-Slice |

### Part 2: The Cosmic Light Cone: Mapping Space & Time
| #       | Container ID               | Function                        | Purpose                                                                                                                                 |
| ------- | -------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **01**  | `widget-dual-bridge`       | `initWidgetDualSpeedSpacetime`  | Side-by-side comparison: Speed Space vs Coordinate Spacetime Map                                                                        |
| **01b** | `widget-expanding-circles` | `initWidgetExpandingCircles`    | 2×2 grid of four static panels showing the outgoing circle of light at $t=0,1,2,3$ in the $x$–$y$ plane (eases reader into the 3D cone) |
| **01c** | `widget-synthesis-grid`    | `initWidgetSynthesisGrid`       | 2×2 visual synthesis grid bridging Velocity Space ($v_x, v_t$) to Coordinate Spacetime ($\phi$) across 4 archetypes                     |
| **02**  | `widget-3d-light-cone`     | `initWidget3DLightConeExplorer` | Full 3D rotatable Light Cone volume ($x_1, x_2, ct$) with dynamic Now-Slice                                                             |
| **03**  | `widget-cosmic-horizon`    | `initWidgetCosmicHorizon`       | Coordinated Dual-View: physical stellar radar & lifespan bubble vs $(x, ct)$ spacetime past light cone                                  |

### Part 3: The Spacetime Loaf & Length Contraction
| #      | Container ID                | Function                      | Purpose                                                                              |
| ------ | --------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| **01** | `widget-loaf-alice`         | `initWidgetLoafAlice`         | 3D spacetime loaf volume with Alice's horizontal slice and expanding light wavefront |
| **02** | `widget-loaf-bob`           | `initWidgetLoafBob`           | Bob in motion: slanting the worldtube across the spacetime loaf                      |
| **03** | `widget-beacons-bob`        | `initWidgetBeaconsBob`        | Bob's rest frame: simultaneous light beacon arrival inside the coach ($\Delta t = 0$) |
| **04** | `widget-beacons-alice`      | `initWidgetBeaconsAlice`      | Alice's platform frame: moving coach causes desynchronized beacon hits ($\Delta t > 0$) |
| **05** | `widget-simultaneity-slice` | `initWidgetSimultaneitySlice` | The angle of "Now": tilting the simultaneity hyperplane obliquely ($\tan\phi = v/c$) |
| **06** | `widget-length-contraction` | `initWidgetLengthContraction` | Geometric projection: Bob's tilted 10m coach projecting onto Alice's horizontal present via cos(θ) & real-world tracks |
| **07** | `widget-dual-frame`         | `initWidgetDualFrame`         | Mutual relativity: invariant 10m coaches and cos(θ) projections from both Alice's and Bob's frames   |
| **08** | `widget-muon-contraction`   | `initWidgetMuonContraction`   | Atmospheric muons from both perspectives (Time Dilation vs Length Contraction)       |

---

---

## Interactive Simulation Anatomy & Interaction Principles

Interactive simulations are the heartbeat of the publication. Every widget must adhere to a strict visual and functional anatomy.

```
+-----------------------------------------------------------------------------------+
|  [SIMULATION 0X · TAXONOMY BADGE]                                                 |
|  Widget Title: The Intuitive Question or Action                                   |
|  1-2 sentence subtitle describing the exact physical tradeoff being observed       |
+-----------------------------------------------------------------------------------+
|  [CANVAS VIEWPORT] (Retina-scaled, crisp geometry, unified physics palette)       |
|                                                                                   |
|    - High contrast axes (ct vs x) with readable tick labels & arrows              |
|    - Bounded pill labels with auto-clamping on narrow viewports                   |
|    - Color-coded vectors matching text & sliders (Sky=Time, Radiant=Space, etc.)  |
|    - 3D projections with smooth touch/drag orbit, presets, and reset buttons     |
+-----------------------------------------------------------------------------------+
|  [READOUT DASHBOARD] (Multi-column live metric grid)                               |
|    [ v_space: 0.866 c ]   [ v_time: 0.500 c ]   [ Gamma: 2.00 ]   [ Delta-t: 0 ]  |
+-----------------------------------------------------------------------------------+
|  [INTERACTIVE CONTROLS & TIMELINE]                                                |
|    [ ▶ Auto Play / ⏸ Pause ]   [ ↺ Reset ]   [ Preset Chips: 0.0c, 0.6c, 0.866c ] |
|    Slider: Speed (v/c) / Time (t) / Angle (θ) with live value badge               |
+-----------------------------------------------------------------------------------+
```

### Core Visualization Rules
1. **Interactive, Not Passive**: Every visual must offer a degree of freedom (time scrub, velocity slider, 3D orbit angle, preset buttons) so the reader proves the concept to themselves through tactile manipulation.
2. **Deterministic & Bidirectional**:
   - Scrubbing forward and backward must behave cleanly without state drift or accumulation errors.
   - When a user changes speed, all dependent readouts (spatial speed, time speed, Lorentz factor, angle) update synchronously in lockstep across canvas and text badges.
3. **No Decorative Clutter**: Every line, dot, dashed guide, and angle arc in the canvas must represent a physical quantity or coordinate boundary. If it does not build intuition, cut it.
4. **Auto-Play + Manual Scrubbing**: Always pair continuous auto-play animations with scrubbable range inputs. Auto-play demonstrates continuous flow; manual scrubbing allows stop-and-inspect contemplation.

---

## Semantic Physics & Editorial Color Palette (Single Source of Truth)

Colors across the series represent immutable physical concepts and editorial surfaces. Never pick colors arbitrarily:

- **Surface & Background Tokens**:
  - Light Mode: Canvas `--bg-space: #fbfbf9` (Warm natural paper/parchment), Card `--bg-card: #ffffff`, Subtle `--bg-card-subtle: #f6f6f2`.
  - Dark Mode: Canvas `--bg-space: #0d0f14` (Deep obsidian cosmic canvas), Card `--bg-card: #131720`, Subtle `--bg-card-subtle: #090b0e`.
- **Time / Rest / Earth Observer**:
  - Light Mode: `#0969da` (Deep Cobalt) | Dark Mode: `#58a6ff` (Prismatic Azure)
  - Meaning: Forward motion through time, Alice's rest frame, Earth frame, stationary coordinate axes.
- **Space / Motion / Velocity**:
  - Light Mode: `#d95d18` (Radiant Terracotta) | Dark Mode: `#f0883e` (Radiant Amber-Coral)
  - Meaning: Spatial displacement, Bob's motion, spatial velocity vectors $v_x$, coordinate distance.
- **Universal Invariant / Cosmic Speed Limit ($c$)**:
  - Light Mode: `#6e40c9` (Deep Violet) | Dark Mode: `#bc8cff` (Prismatic Violet)
  - Meaning: The total invariant speed needle $c$, the quarter-circle hypotenuse arc, the 45° spacetime light cone boundary.
- **Light / Photons / Causality Boundaries**:
  - Light Mode: `#b45309` (Warm Amber) | Dark Mode: `#e3b341` (Golden Sun)
  - Meaning: Outgoing light wavefronts, photon paths, beacons, flash events.
- **Agreement / Synchronization / Entropy**:
  - Light Mode: `#0f766e` (Verdigris / Antique Pine) | Dark Mode: `#3dd68c` (Phosphor Mint)
  - Meaning: Synchronized beacon hits, rest length agreement, invariant intervals, Series 02 Information & Entropy theme.
- **Forbidden / Lag / Causality Violation**:
  - Light Mode: `#cf222e` (Crimson) | Dark Mode: `#ff7b72` (Soft Red)
  - Meaning: Speeds exceeding $c$, time lag, causal disconnect.

---

## Static Figures, Diagramming & Image Asset Guidelines

When static figures, diagrams, or generated image assets are incorporated:
1. **Identical Lighting & Background**: Use neutral transparent backgrounds or match `--bg-card` / `--bg-canvas` (`#ffffff` light, `#0d0f14` dark).
2. **Minimalist Vector Linework**: Diagrams must echo our 2D canvas primitives: clean 1.5px - 2px hairline strokes, circular nodes with white centers, dashed projection lines (`[4, 4]`), and pill callouts.
3. **No Skeuomorphic Clutter**: Avoid photorealistic 3D rendering of cars, trains, or people. Use clean stylized wireframes, geometric silhouettes, or 2D/3D stick figures (as codified in `post-03.js`).
4. **Dark/Light Mode Dual Assets**: When an image asset is rasterized, provide light/dark adaptive rendering (via CSS `<picture>` tags or SVG `currentColor`).
5. **Tabular Numerals**: Numeric metrics and formulas must use monospace fonts with tabular numbers (`JetBrains Mono` / `tnum`) so layouts never jitter or shift during updates.

---

## Home Page & Editorial Hub Architecture

To maintain a bespoke, museum-grade aesthetic that avoids generic AI presets:
1. **Brand Identity**: Monogram seal (`IF`) in monospaced geometry with hairline framing and tactile elevation.
2. **Hero Header**: Balanced vertical padding (`4rem 1.5rem 2.5rem` desktop, `2.25rem 0.5rem 1.75rem` mobile), display serif accents, volume badge (`Volume 01`), and an editorial publication ribbon.
3. **Split Series Headers**: Dual-column layout on desktop (`.series-group-header-split`) pairing title and taxonomy on the left with narrative scope on the right; collapsing gracefully to single-column on mobile.
4. **Structured 2-Column Grid**: `.series-grid` strictly renders as `repeat(2, minmax(0, 1fr))` on desktop to avoid orphan wrapping, collapsing to `1fr` on mobile with tactile hover states (`translateY(-3px)` + top accent bar).
5. **Upcoming Essays**: Understated architectural wireframe treatment (`dashed` border, subtle muted background) rather than low-opacity faded cards.

---

## Canvas & UI Conventions

- **Canvas Rendering**:
  - Always use `setupRetinaCanvas(canvas)` for crisp display on high-DPI screens.
  - Pull colors dynamically via `getThemeColors()` (`c.timeColor`, `c.spaceColor`, `c.invariantColor`, `c.axisLine`, `c.gridLine`, etc.).
  - Register render callbacks with `registerDraw(draw)` and `window.addEventListener('resize', draw)` to handle theme switching and responsive resizes.
  - Never hardcode canvas `height` or `width` inside HTML inline styles; dimensions are governed responsively by CSS.
- **Controls & Playback**:
  - Sliders use standard classes: `.slider-speed`, `.slider-time`, `.slider-angle`.
  - Readouts use: `.readout-*` (e.g. `.readout-vx`, `.readout-vt`, `.readout-gamma`) and `.val-*`.
  - Autoplay buttons use `.btn-primary.btn-play` with standard markup:
    ```html
    <button class="btn-primary btn-play">
      <span>▶</span><span>Auto Play</span>
    </button>
    ```
    and toggle to `<span>⏸</span><span>Pause</span>` during `requestAnimationFrame` playback.
- **Reading Progress Bar**:
  - Fixed at the top of the viewport: `<div class="reading-progress-bar" id="reading-progress"></div>`.
  - Initialized automatically via `initReadingProgress()` in `js/core.js`.

---

## Mobile & Responsive Layout Rules

To ensure compact, space-efficient rendering without awkward layout shifts or excessive scrolling on mobile:

1. **Dual-Container Layout Discipline**:
   - **Narrow Prose Flow (`.editorial-prose`, max ~680px-740px)**: Longform reading text stays in a focused column where line length (characters per line) maintains optimal reading ergonomics.
   - **Wide Interactive Viewport (`.wide-reading-container`, `.wide-container`, max ~1100px-1200px)**: Interactive artifacts, dual comparison matrices, 3D loaves, and stellar radar diagrams expand into wide viewports to present spatial relationships side-by-side.
2. **Responsive Canvas Heights**:
   - Desktop (> 768px): `380px` (or `420px` for 3D loaves)
   - Tablet (<= 768px): `300px`
   - Mobile (<= 640px): `240px` (maintains landscape aspect ratio for physics coordinate systems)
   - Ultra-compact (<= 380px): `220px`
3. **Side-by-Side Twin Clocks**:
   - **Never collapse twin clocks into a vertical stack on mobile.** Clocks must remain side-by-side (`grid-template-columns: 1fr 1fr; gap: 0.5rem;`) to preserve direct visual comparison.
   - Use compact padding (`0.5rem 0.625rem`) and scaled clock digits (`1.25rem`) on mobile.
4. **Container & Margin Discipline**:
   - Mobile reading container padding is `1.5rem 1rem 3.5rem` (reclaiming horizontal canvas width).
   - `.canvas-viewport` padding is `0.5rem` on mobile.
   - Section heading (`h2`) margins are kept compact (`margin-top: 1.75rem; margin-bottom: 0.75rem; padding-top: 0;`).
5. **Sticky Navigation Bar**:
   - Mobile navbar height is `3.25rem` with `0 1rem` padding.
   - `.brand-tag` is hidden on mobile (`display: none;`).
   - Secondary nav links (`.nav-link-secondary`) are hidden on mobile to prevent navbar text collisions or line wraps.
6. **Canvas Label Bounds Checking**:
   - In 2D/3D canvas renderers, clamp label pill horizontal positions (e.g., `Math.min(width - 55, ...)`) to ensure label pills never clip outside canvas borders on narrow screens (`width < 420px`).
   - For vertical tracks (like the atmospheric Muon widget), adapt `padLeft` and `padRight` responsively when `width < 420px`.
7. **Multi-Panel & 2×2 Comparative Grids**:
   - **Desktop / Tablet (> 720px)**: Render as a 2×2 matrix (`grid-template-columns: 1fr 1fr; gap: 0.875rem;`). This allows compact spatial scanning without vertical bloat.
   - **Mobile (<= 720px)**: **Always collapse into a single-column stack** (`grid-template-columns: 1fr;`). Unlike twin numeric clocks (which must stay side-by-side), multi-panel canvas diagrams require adequate horizontal width (~320px–380px) to render axes, tick marks, and projection rays legibly.
   - Use standardized classes (`.multi-panel-grid`, `.synthesis-grid`, `.expanding-circles-grid`) rather than hardcoded inline styles so responsive stacking is strictly maintained.

---

## Git & Deployment Protocol

- **Zero-Build Deployment**: The repository deploys directly to GitHub Pages from the `main` branch root.
- **Pre-Commit Verification**:
  1. Test both **Light Mode** and **Obsidian Dark Mode**.
  2. Verify responsive simulation behavior down to 360px mobile width.
- **Publishing**: Commit with clear semantic commit messages and push to `origin/main`.
