# How Does The Universe Work?

An interactive, curiosity-driven visual website created to explain **Special and General Relativity** from the ground up for lifelong learners, physics enthusiasts, and students.

Live Site / GitHub Repository: [https://github.com/ayush2991/how-does-the-universe-work](https://github.com/ayush2991/how-does-the-universe-work)

---

## The Philosophy: Explorable Explanations

Rather than front-loading heavy algebra, Lorentz formulas, or confusing thought experiments about train cars and mirrors, this series uses:
- **Intuitive Geometric Mental Models**: Starting with familiar two-dimensional flat fields.
- **Active Controls & Scrubber Sliders**: Readers can drag time forward and backward, adjust velocities, and rotate reference frames.
- **Live Synchronized Clocks**: Watch time dilation unfold live on digital wristwatches rather than imagining abstract equations.
- **Modern Scientific Aesthetics**: Deep obsidian dark palette (`#070a12`), electric cyan (`#38bdf8`) for Time/Earth, radiant amber (`#fb923c`) for Space/Motion, and photon gold (`#facc15`).

---

## Series Directory

### [Part 1: Why Motion Through Space Affects Time](./posts/01-why-motion-through-space-affects-time/)
- **Live Explorable**: [`posts/01-why-motion-through-space-affects-time/index.html`](./posts/01-why-motion-through-space-affects-time/index.html)
- **Interactive Simulations**:
  1. **Two Cars on a 2D Grid**: Time scrubber and heading angle slider demonstrating $V_{\text{East}} = 60\sin\theta$ and $V_{\text{North}} = 60\cos\theta$.
  2. **Motion Purely Through Time (At Rest)**: Visualizing that sitting motionless in space ($x=0$) still carries you forward along the Time axis at $100\%$ speed.
  3. **The Thought Experiment**: Sliding spatial velocity to watch the vector rotate along the circular speed constraint arc $v_{\text{time}} = \sqrt{V^2 - v_{\text{space}}^2}$.
  4. **Live Twin Clocks & Time Dilation**: Dial rocket speed from $0$ to $0.99c$ to watch the Earth clock and Rocket clock run simultaneously at their exact relativistic ratio.
  5. **The Cosmic Boundary & Timeless Photon**: Selecting the photon mode snaps the vector 100% into space, completely freezing the photon's clock at $0.000\text{ s}$.
  6. **Atmospheric Muon Survival Simulator**: Interactive altitude descent comparing Newtonian classical decay at 660m vs. relativistic survival to sea level detectors.

### Part 2: The Spacetime Loaf & Length Contraction *(In Development)*
- Resolving the Twin Paradox, the relativity of simultaneity, and why moving rulers shorten.

---

## 100% Static & Zero-Backend Architecture

This project requires **zero backend server, zero Node.js, zero build steps, and zero database maintenance**:
- **Pure Client-Side**: Written in clean Vanilla HTML5, CSS3, and JavaScript Canvas simulations.
- **Double-Click & View (`file://`)**: You can open any HTML file (`index.html`, `posts/.../index.html`, or `standalone/...html`) directly from your file manager by double-clicking it—no local server needed!
- **Zero Cost & Maintenance**: Can be hosted indefinitely for free on **GitHub Pages**, Cloudflare Pages, Netlify, or any static storage bucket.

### Viewing Locally

You have two easy ways to view the project locally:

1. **Option A: Direct Double-Click (Zero Setup)**
   Simply double-click `index.html` or `posts/01-why-motion-through-space-affects-time/index.html` in your file explorer. It will open instantly in Chrome, Firefox, Safari, or Edge.

2. **Option B: Optional Local Server**
   If you prefer running a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
   Then open `http://localhost:8080`.

---

## Deploying to GitHub Pages

To make the site accessible worldwide via your GitHub URL:

1. Open your repository on GitHub: `https://github.com/ayush2991/how-does-the-universe-work`
2. Go to **Settings** → **Pages** (under "Code and automation").
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click **Save**.

Within a couple of minutes, your interactive explorable site will be live at:  
👉 **`https://ayush2991.github.io/how-does-the-universe-work/`**
