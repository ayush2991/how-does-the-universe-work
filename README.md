# Intuition First

An interactive, curiosity-driven visual publication created to explain **deep ideas in physics, mathematics, and computing** from the ground up using intuitive visual geometry and explorable interactive simulations.

Live Site: [https://ayush2991.github.io/intuition-first/](https://ayush2991.github.io/intuition-first/)  
GitHub Repository: [https://github.com/ayush2991/intuition-first](https://github.com/ayush2991/intuition-first)

---

## The Philosophy: Explorable Explanations

Rather than front-loading heavy algebra, dry formulas, or detached textbook definitions, this series uses:
- **Intuitive Geometric Mental Models**: Starting with familiar, tangible physical intuition.
- **Active Controls & Scrubber Sliders**: Readers can drag time forward and backward, adjust velocities, tweak probabilities, and rotate reference frames.
- **Live Synchronized Clocks & Projections**: Watch relativistic time dilation and simultaneity shifts unfold live rather than imagining abstract equations.
- **Modern Scientific Aesthetics & Dual Themes**: Clean, high-contrast **Light Mode by default** with crisp editorial typography, plus a one-click **Dark Obsidian Mode** toggle in the top navigation with dynamic Canvas re-rendering.

---

## Series Directory

### Series 01: Special Relativity — The Fabric of Spacetime

#### [Part 1: Why Motion Through Space Affects Time](./posts/01-motion-and-time.html)
- **Live Explorable**: [`posts/01-motion-and-time.html`](./posts/01-motion-and-time.html)
- **Interactive Simulations**:
  1. **Two Cars on a 2D Grid**: Time scrubber and heading angle slider demonstrating $V_{\text{East}} = 60\sin\theta$ and $V_{\text{North}} = 60\cos\theta$.
  2. **Motion Purely Through Time (At Rest)**: Visualizing that sitting motionless in space ($x=0$) still carries you forward along the Time axis at $100\%$ speed.
  3. **The Thought Experiment**: Sliding spatial velocity or toggling autoplay to watch how motion across space directly reduces speed through time ($v_{\text{time}} = \sqrt{c^2 - v_{\text{space}}^2}$).
  4. **Live Twin Clocks & Time Dilation**: Dial rocket speed from $0$ to $0.99c$ to watch the Earth clock and Rocket clock run simultaneously at their exact relativistic ratio.
  5. **The Cosmic Boundary & Timeless Photon**: Snapping the vector 100% into space completely freezes the photon's clock at $0.000\text{ s}$.
  6. **Atmospheric Muon Survival Simulator**: Interactive altitude descent comparing Newtonian classical decay at 660m vs. relativistic survival to sea level detectors.
  7. **3D Spacetime & Spacetime Loaf Foundation (x₁, x₂, t)**: Rotatable 3D volume with ground floor steering, spherical dome constraint $v_t = \sqrt{c^2 - v_{x_1}^2 - v_{x_2}^2}$, and interactive "Now-Slice" plane.

#### [Part 2: The Cosmic Light Cone: Mapping Space & Time](./posts/02-light-cone.html)
- **Live Explorable**: [`posts/02-light-cone.html`](./posts/02-light-cone.html)
- Visualizing why 90° in velocity space becomes 45° in coordinate spacetime, expanding circles of light, the 3D Light Cone, and your 80-year cosmic horizon.

#### [Part 3: The Spacetime Loaf & Length Contraction](./posts/03-spacetime-loaf.html)
- **Live Explorable**: [`posts/03-spacetime-loaf.html`](./posts/03-spacetime-loaf.html)
- Oblique simultaneity slicing through 4D spacetime, moving rulers shortening, and atmospheric muons from both reference frames.

### Series 02: Information & Entropy — The Order of the Universe

#### [Part 1: An Intuitive Guide To Entropy](./posts/04-understanding-entropy.html)
- **Live Explorable**: [`posts/04-understanding-entropy.html`](./posts/04-understanding-entropy.html)
- Predictability spectrum, logarithmic surprise curve ($S(p) = -\log_2(p)$), Shannon entropy ($H(p)$), and microstates vs macrostates.

---

## 100% Static & Zero-Backend Architecture

This project requires **zero backend server, zero Node.js, zero build steps, and zero database maintenance**:
- **Pure Client-Side**: Written in clean Vanilla HTML5, CSS3, and JavaScript Canvas simulations.
- **Double-Click & View (`file://`)**: You can open any HTML file (`index.html` or `posts/*.html`) directly from your file manager by double-clicking it—no local server needed!
- **Zero Cost & Maintenance**: Can be hosted indefinitely for free on **GitHub Pages**, Cloudflare Pages, Netlify, or any static storage bucket.

### Viewing Locally

You have two easy ways to view the project locally:

1. **Option A: Direct Double-Click (Zero Setup)**
   Simply double-click `index.html` or any file in `posts/` in your file explorer. It will open instantly in Chrome, Firefox, Safari, or Edge.

2. **Option B: Optional Local Server**
   If you prefer running a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
   Then open `http://localhost:8080`.

---

## Deploying to GitHub Pages

To make the site accessible worldwide via your GitHub URL:

1. Open your repository on GitHub: `https://github.com/ayush2991/intuition-first`
2. Go to **Settings** → **Pages** (under "Code and automation").
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click **Save**.

Within a couple of minutes, your interactive explorable site will be live at:  
👉 **`https://ayush2991.github.io/intuition-first/`**
