# Relativity Blog Series — Agent Guide

## Project Overview
An interactive, explorable scientific blog series explaining Special Relativity from the ground up using intuitive visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.
The project is **100% static** (zero build step, zero npm dependencies, runs directly via `file://` or GitHub Pages).

---

## File Architecture & Sync Requirements

When updating blog posts or interactive simulations, **always keep the corresponding files synchronized**:

1. **Series Hub / Landing Page**:
   - `index.html`
   - Loads `js/site.js` and `css/style.css`.
   - Contains the live interactive hero widget (`#widget-hero` powered by `initWidgetTimeDilation`) and series directory cards.
2. **Live Essay Articles**:
   - Part 1: `posts/01-why-motion-through-space-affects-time/index.html`
   - Part 2 (Upcoming): `posts/02-the-spacetime-loaf-and-length-contraction/index.html`
   - Loads `js/site.js` and `css/style.css`.
3. **Universal Script (Primary Widget Engine)**:
   - `js/site.js`: Contains all active widget logic, theme manager, and reading progress tracking initialized by post-specific init functions (e.g. `window.UniverseSimulations.initAllPost01()`, `initAllPost02()`).
4. **Modular Widget Modules**:
   - `js/widgets/post-01-widgets.js`: ES module export versions of Part 1 widgets.
   - `js/widgets/post-02-widgets.js`: ES module export versions of Part 2 widgets.
5. **All-in-One Standalone Distributions**:
   - `standalone/01-why-motion-through-space-affects-time-standalone.html`
   - `standalone/02-the-spacetime-loaf-and-length-contraction-standalone.html`
   - Fully self-contained versions with inlined CSS, HTML, and JS. Any simulation or markup change in an essay must also be reflected in its standalone file.
6. **Shared Styles**:
   - `css/style.css`: Unified design system supporting Light Mode (default, warm paper minimal), Obsidian Dark Mode (`[data-theme="dark"]`), reading progress bar, math badges, and responsive mobile layouts.

---

## Simulation Catalog (Part 1)

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

---

## Part 2 Blueprint: Starting Fresh

All legacy/outdated draft folders (`post_02_*`) have been removed to build Part 2 cleanly from the ground up matching Part 1's architecture:

- **Article Location**: `posts/02-the-spacetime-loaf-and-length-contraction/index.html`
- **Standalone Location**: `standalone/02-the-spacetime-loaf-and-length-contraction-standalone.html`
- **Core Topics & Simulations to Build**:
  1. **The Spacetime Loaf & Angle of "Now"**: Slicing the 3D block of space and time. Motion tilts the simultaneity hyperplane.
  2. **Relativity of Simultaneity**: Front and rear clock desynchronization ($\Delta t' = -\gamma v \Delta x / c^2$).
  3. **Length Contraction as Oblique Slicing**: How tilted slices of 2D/3D worldlines/worldtubes yield contracted physical measurements ($L = L_0 \sqrt{1 - v^2/c^2}$).
  4. **The Twin Paradox Resolution**: The acceleration turnaround and the sweeping "Now" slice across the distant twin's timeline.
  5. **Interactive Spacetime Slicer**: Scrubber allowing readers to dial velocity $v$ and visually observe the simultaneous slice tilt and length contract in real time.

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
