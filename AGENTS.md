# Relativity Blog Series — Agent Guide

## Project Overview
An interactive, explorable scientific blog series explaining Special Relativity from the ground up using intuitive visual thought experiments, interactive HTML5/Canvas simulations, and clean typography.
The project is **100% static** (zero build step, zero npm dependencies, runs directly via `file://` or GitHub Pages).

---

## File Architecture & Sync Requirements

When updating blog posts or interactive simulations, **always keep the corresponding files synchronized**:

1. **Part 1 Live Article**:
   - `posts/01-why-motion-through-space-affects-time/index.html`
   - Loads `js/site.js` and `css/style.css`.
2. **Universal Script (Primary Widget Engine)**:
   - `js/site.js`: Contains all active widget logic initialized by `window.UniverseSimulations.initAllPost01()`.
3. **Modular Widget Module**:
   - `js/widgets/post-01-widgets.js`: ES module export versions of Part 1 widgets.
4. **All-in-One Standalone Distribution**:
   - `standalone/01-why-motion-through-space-affects-time-standalone.html`: Fully self-contained version with inlined CSS, HTML, and JS. Any simulation or markup change in Part 1 should also be reflected here.
5. **Shared Styles**:
   - `css/style.css`: Design system supporting Light Mode (default) and Obsidian Dark Mode (`[data-theme="dark"]`).

---

## Simulation Catalog (Part 1)

| # | Container ID | Function | Purpose |
|---|--------------|----------|---------|
| **01** | `widget-cars` | `initWidgetCars` | Two cars on 2D grid ($V_E = 60\sin\theta, V_N = 60\cos\theta$) |
| **02** | `widget-stationary` | `initWidgetStationary` | Sitting at rest ($x=0$) carries you forward through Time at 100% |
| **03** | `widget-tradeoff` | `initWidgetTradeoff` | Thought experiment: trading space for time ($v_t = \sqrt{V^2 - v_x^2}$) |
| **04** | `widget-time-dilation` | `initWidgetTimeDilation` | Live Twin Clocks and time dilation ($t' = t / \gamma$) |
| **05** | `widget-speed-limit` | `initWidgetSpeedLimit` | Cosmic speed limit $c$ and the timeless photon |
| **06** | `widget-muon` | `initWidgetMuon` | Relativistic atmospheric muon decay vs. Newtonian prediction |
| **07** | `widget-3d-spacetime` | `initWidget3DSpacetime` | 3D spacetime volume ($x_1, x_2, t$) with rotatable camera and Now-Slice |

---

## Canvas & UI Conventions

- **Canvas Rendering**:
  - Always use `setupRetinaCanvas(canvas)` for crisp display on high-DPI screens.
  - Pull colors dynamically via `getThemeColors()` (`c.timeColor`, `c.spaceColor`, `c.invariantColor`, `c.axisLine`, `c.gridColor`, etc.).
  - Register render callbacks with `registerDraw(draw)` and `window.addEventListener('resize', draw)` to handle theme switching and responsive resizes.
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
