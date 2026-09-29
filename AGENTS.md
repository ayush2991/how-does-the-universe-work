# Relativity Blog Series — Agent Guide

## Project Overview
An interactive, explorable scientific blog series explaining Special Relativity from the ground up using intuitive visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.
The project is **100% static** (zero build step, zero npm dependencies, runs directly via `file://` or GitHub Pages).

---

## Editorial Philosophy

This series teaches physics **bottom-up**, not top-down. Every agent working on prose must internalise and consistently apply the following principles.

### 1. Build from what the reader already knows — never from what they don't

Every new concept must grow organically out of something the reader already holds: direct physical intuition, everyday experience, or knowledge established in a previous section or article. We do not start from the destination (a fact, a formula, a named concept) and work backward to justify it. We start from what is already solid and ask the natural next question.

- ✅ *"That picture tells us how velocity is partitioned — but not where anyone actually is. The natural next question is: can we draw a map?"*
- ❌ *"Textbooks use a spacetime diagram with space on the horizontal axis. This can be confusing because…"*

### 2. Never introduce confusion first

Do not frame a new section by announcing what is confusing, contradictory, or commonly misunderstood before the reader has encountered it themselves. That approach assumes prior textbook exposure and makes the reader feel lost before they have a reason to be. A reader who has never seen a spacetime diagram is not confused by it — they simply haven't seen it yet. Approach it as something new to discover, not something to fix.

- ✅ Pose open questions from within the narrative: *"But what angle does a photon's worldline actually make?"*
- ❌ Pre-announce the answer: *"Watch how 90° in Velocity Space maps directly into a 45° diagonal."*
- ❌ Frame via contrast with external knowledge: *"In those textbook diagrams, the photon is at 45°, not 90° — why?"*

### 3. Let visualizations deliver the insight — prose sets up the question

Interactive simulations are not illustrations of something the prose has already fully explained. They are the moment of discovery. Prose before a widget should build the setup, name the travellers, pose the open question, and explain what the axes mean. The widget then answers the question. Prose after the widget unpacks what was observed and draws conclusions.

- **Before the widget**: establish context, introduce characters, name the open question.
- **The widget itself**: delivers the answer through direct interaction.
- **After the widget**: explain why the answer is what it is, connect it to the broader picture.

### 4. Introduce characters and terms before using them

Any named entity (Alice, Bob, a photon, a muon) must be introduced with a clear description of their situation before being referenced. The reader should never encounter a name that hasn't been given a face. Similarly, any technical term (worldline, proper time, light cone) must be coined within the prose at the moment it first becomes necessary — not assumed.

### 5. The series is self-contained — no assumed external knowledge

The reader is assumed to arrive with only everyday intuition and curiosity. No physics education, no textbook exposure. Do not reference how "physicists" map things, what "any textbook" shows, or what "general relativity" says. If a concept matters, we derive or motivate it ourselves from first principles within the series.

### 6. Section headings reflect discovery, not taxonomy

Section headings should sound like the next step in an unfolding journey, not like chapter labels in a textbook.

- ✅ *"Drawing the Map: Coordinate Spacetime"*
- ✅ *"Building Up the Picture"*
- ❌ *"The Side-by-Side Bridge: Speed Space vs Coordinate Spacetime"*
- ❌ *"Why Spacetime Cannot Have a 90° Worldline"*

---

## File Architecture & Sync Requirements

When updating blog posts or interactive simulations, **always keep the corresponding files synchronized**:

1. **Series Hub / Landing Page**:
   - `index.html`
   - Loads `js/site.js` and `css/style.css`.
   - Contains the live interactive hero widget (`#widget-hero` powered by `initWidgetTimeDilation`) and series directory cards.
2. **Live Essay Articles**:
   - Part 1: `posts/01-why-motion-through-space-affects-time/index.html`
   - Part 2: `posts/02-the-cosmic-light-cone/index.html`
   - Part 3: `posts/03-the-spacetime-loaf-and-length-contraction/index.html`
   - Loads `js/site.js` and `css/style.css`.
3. **Universal Script (Primary Widget Engine)**:
   - `js/site.js`: Contains all active widget logic, theme manager, and reading progress tracking initialized by post-specific init functions (`window.UniverseSimulations.initAllPost01()`, `initAllPost02()`, `initAllPost03()`).
4. **Modular Widget Modules**:
   - `js/widgets/post-01-widgets.js`: ES module export versions of Part 1 widgets.
   - `js/widgets/post-02-widgets.js`: ES module export versions of Part 2 widgets.
   - `js/widgets/post-03-widgets.js`: ES module export versions of Part 3 widgets.
5. **All-in-One Standalone Distributions**:
   - `standalone/01-why-motion-through-space-affects-time-standalone.html`
   - `standalone/02-the-cosmic-light-cone-standalone.html`
   - `standalone/03-the-spacetime-loaf-and-length-contraction-standalone.html`
   - Fully self-contained versions with inlined CSS, HTML, and JS. Any simulation or markup change in an essay must also be reflected in its standalone file.
6. **Shared Styles**:
   - `css/style.css`: Unified design system supporting Light Mode (default, warm paper minimal), Obsidian Dark Mode (`[data-theme="dark"]`), reading progress bar, math badges, and responsive mobile layouts.

---

## Simulation Catalog

### Part 1: Why Motion Through Space Affects Time
| # | Container ID | Function | Purpose |
|---|--------------|----------|---------|
| **Hero** | `widget-hero` (on `index.html`) | `initWidgetTimeDilation` | Live speed-tradeoff and twin clocks preview on landing page |
| **01** | `widget-cars` | `initWidgetCars` | Two cars on 2D grid ($V_E = 60\sin\theta, V_N = 60\cos\theta$) |
| **02** | `widget-stationary` | `initWidgetStationary` | Sitting at rest ($x=0$) carries you forward through Time at 100% |
| **03** | `widget-tradeoff` | `initWidgetTradeoff` | Thought experiment: trading space for time ($v_t = \sqrt{V^2 - v_x^2}$) |
| **04** | `widget-time-dilation` | `initWidgetTimeDilation` | Live Twin Clocks and time dilation ($t' = t / \gamma$) |
| **05** | `widget-speed-limit` | `initWidgetSpeedLimit` | Cosmic speed limit $c$ and the timeless photon |
| **06** | `widget-muon` | `initWidgetMuon` | Relativistic atmospheric muon decay vs. Newtonian prediction |
| **07** | `widget-3d-spacetime` | `initWidget3DSpacetime` | 3D spacetime volume ($x_1, x_2, t$) with rotatable camera and Now-Slice |

### Part 2: The Cosmic Light Cone: Mapping Space & Time
| # | Container ID | Function | Purpose |
|---|--------------|----------|---------|
| **01** | `widget-dual-bridge` | `initWidgetDualSpeedSpacetime` | Side-by-side comparison: Speed Space vs Coordinate Spacetime Map |
| **02** | `widget-3d-light-cone` | `initWidget3DLightConeExplorer` | Full 3D rotatable Light Cone volume ($x_1, x_2, ct$) with dynamic Now-Slice |
| **03** | `widget-cosmic-horizon` | `initWidgetCosmicHorizon` | Human lifespan horizon vs. celestial events (Sun, Proxima, Vega, Betelgeuse) |

### Part 3: The Spacetime Loaf & Length Contraction
| # | Container ID | Function | Purpose |
|---|--------------|----------|---------|
| **01** | `widget-loaf-alice` | `initWidgetLoafAlice` | 3D spacetime loaf volume with Alice's horizontal slice and expanding light wavefront |
| **02** | `widget-loaf-bob` | `initWidgetLoafBob` | Bob in motion: slanting the worldtube across the spacetime loaf |
| **03** | `widget-simultaneity-slice` | `initWidgetSimultaneitySlice` | The angle of "Now": tilting the simultaneity hyperplane obliquely ($\tan\phi = v/c$) |
| **04** | `widget-length-contraction` | `initWidgetLengthContraction` | Oblique slicing: 3D loaf cutting Bob's tilted ribbon & 2D retina measurement |
| **05** | `widget-dual-frame` | `initWidgetDualFrame` | Mutual relativity: switching between Alice's frame and Bob's frame |
| **06** | `widget-muon-contraction` | `initWidgetMuonContraction` | Atmospheric muons from both perspectives (Time Dilation vs Length Contraction) |

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
  - Initialized automatically via `initReadingProgress()` in `js/site.js`.

---

## Mobile & Responsive Layout Rules

To ensure compact, space-efficient rendering without awkward layout shifts or excessive scrolling on mobile:

1. **Responsive Canvas Heights**:
   - Desktop (> 768px): `380px`
   - Tablet (<= 768px): `300px`
   - Mobile (<= 640px): `240px` (maintains landscape aspect ratio for physics coordinate systems)
   - Ultra-compact (<= 380px): `220px`
2. **Side-by-Side Twin Clocks**:
   - **Never collapse twin clocks into a vertical stack on mobile.** Clocks must remain side-by-side (`grid-template-columns: 1fr 1fr; gap: 0.5rem;`) to preserve direct visual comparison.
   - Use compact padding (`0.5rem 0.625rem`) and scaled clock digits (`1.25rem`) on mobile.
3. **Container & Margin Discipline**:
   - Mobile reading container padding is `1.5rem 1rem 3.5rem` (reclaiming horizontal canvas width).
   - `.canvas-viewport` padding is `0.5rem` on mobile.
   - Section heading (`h2`) margins are kept compact (`margin-top: 1.75rem; margin-bottom: 0.75rem; padding-top: 0;`).
4. **Sticky Navigation Bar**:
   - Mobile navbar height is `3.25rem` with `0 1rem` padding.
   - `.brand-tag` is hidden on mobile (`display: none;`).
   - Secondary nav links (`.nav-link-secondary`) are hidden on mobile to prevent navbar text collisions or line wraps.
5. **Canvas Label Bounds Checking**:
   - In 2D/3D canvas renderers, clamp label pill horizontal positions (e.g., `Math.min(width - 55, ...)`) to ensure label pills never clip outside canvas borders on narrow screens (`width < 420px`).
   - For vertical tracks (like the atmospheric Muon widget), adapt `padLeft` and `padRight` responsively when `width < 420px`.

---

## Git & Deployment Protocol

- **Zero-Build Deployment**: The repository deploys directly to GitHub Pages from the `main` branch root.
- **Pre-Commit Verification**:
  1. Test both **Light Mode** and **Obsidian Dark Mode**.
  2. Verify responsive simulation behavior down to 360px mobile width.
  3. Ensure standalone editions (`standalone/*.html`) are updated whenever changes are made to core styles, markup, or simulations.
- **Publishing**: Commit with clear semantic commit messages and push to `origin/main`.
