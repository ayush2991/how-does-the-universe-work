#!/usr/bin/env python3
"""
generate_visuals.py
Generates publication-quality diagrams and animated GIFs for Post 1 of the Relativity Blog Series.
Uses Python to render SVGs and ImageMagick/ffmpeg to assemble high-DPI PNGs and smooth GIFs.
"""

import math
import os
import shutil
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = os.path.join(PROJECT_DIR, "assets")
TEMP_DIR = os.path.join(PROJECT_DIR, "temp_frames")

os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)


def cleanup_temp():
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR, exist_ok=True)


# ==========================================
# 1. VISUAL 1: The Two Cars on a 2D Plane
# ==========================================
def render_car_frame(progress, width=800, height=520):
    """
    Renders one frame of the 2D plane car motion.
    progress: float from 0.0 to 1.0.
    """
    ox, oy = 140, 420  # Origin
    scale = 320        # Max travel length in pixels
    V_total = 60       # mph
    angle_deg = 60     # Car 2 angle relative to North (x2)
    angle_rad = math.radians(angle_deg)

    # Car 1 (Pure North along x2)
    car1_x = ox
    car1_y = oy - (progress * scale)

    # Car 2 (60 deg from North -> eastward vx1 = V*sin(60), northward vx2 = V*cos(60))
    vx1 = V_total * math.sin(angle_rad)  # ~51.96 mph
    vx2 = V_total * math.cos(angle_rad)  # 30.0 mph

    car2_x = ox + (progress * scale * math.sin(angle_rad))
    car2_y = oy - (progress * scale * math.cos(angle_rad))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <marker id="cyan-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="amber-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#fb923c"/>
    </marker>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#0b0f19"/>

  <!-- Subtitle / Title -->
  <text x="40" y="42" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5">The Open Field: Motion on a 2D Grid</text>
  <text x="40" y="66" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">Both cars have cruise control set to 60 mph. Watch what happens to Northward speed.</text>

  <!-- Grid lines -->
  <g stroke="#1e293b" stroke-width="1">
    {"".join(f'<line x1="{ox + i*50}" y1="80" x2="{ox + i*50}" y2="{oy}" stroke-dasharray="2,4"/>' for i in range(1, 10))}
    {"".join(f'<line x1="{ox}" y1="{oy - i*50}" x2="620" y2="{oy - i*50}" stroke-dasharray="2,4"/>' for i in range(1, 7))}
  </g>

  <!-- Coordinate Axes -->
  <!-- Horizontal Axis: East (x1) -->
  <line x1="{ox}" y1="{oy}" x2="630" y2="{oy}" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="640" y="{oy + 5}" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600">East (x₁)</text>

  <!-- Vertical Axis: North (x2) -->
  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="{ox - 10}" y="70" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" text-anchor="middle">North (x₂)</text>

  <!-- Origin label -->
  <text x="{ox - 18}" y="{oy + 22}" fill="#64748b" font-family="monospace" font-size="13">(0,0)</text>

  <!-- Constant Speed Arc (quarter circle showing equal total speed V) -->
  <path d="M {ox} {oy - scale} A {scale} {scale} 0 0 1 {ox + scale} {oy}" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="{ox + scale * 0.73}" y="{oy - scale * 0.73 - 6}" fill="#64748b" font-family="monospace" font-size="11">Radius = Constant Speed V (60 mph)</text>

  <!-- Car 1 Trajectory & Vector -->
  <line x1="{ox}" y1="{oy}" x2="{car1_x}" y2="{car1_y}" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="{car1_x}" cy="{car1_y}" r="7" fill="#38bdf8" filter="url(#glow)"/>
  <circle cx="{car1_x}" cy="{car1_y}" r="3" fill="#ffffff"/>
  <text x="{car1_x - 16}" y="{car1_y - 12}" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold">Car 1 (North)</text>

  <!-- Car 2 Trajectory & Vector -->
  <line x1="{ox}" y1="{oy}" x2="{car2_x}" y2="{car2_y}" stroke="#fb923c" stroke-width="3"/>
  <circle cx="{car2_x}" cy="{car2_y}" r="7" fill="#fb923c" filter="url(#glow)"/>
  <circle cx="{car2_x}" cy="{car2_y}" r="3" fill="#ffffff"/>
  <text x="{car2_x + 14}" y="{car2_y + 4}" fill="#fb923c" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold">Car 2 (60° Northeast)</text>

  <!-- Car 2 Decomposition Projection Lines -->
  {f'''
  <line x1="{car2_x}" y1="{car2_y}" x2="{ox}" y2="{car2_y}" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8"/>
  <line x1="{car2_x}" y1="{car2_y}" x2="{car2_x}" y2="{oy}" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8"/>
  <circle cx="{ox}" cy="{car2_y}" r="4" fill="#fb923c"/>
  <text x="{ox - 10}" y="{car2_y + 4}" fill="#fb923c" font-family="monospace" font-size="11" text-anchor="end">V_North = 30 mph</text>
  <circle cx="{car2_x}" cy="{oy}" r="4" fill="#f43f5e"/>
  <text x="{car2_x}" y="{oy + 20}" fill="#f43f5e" font-family="monospace" font-size="11" text-anchor="middle">V_East = 52 mph</text>
  ''' if progress > 0.05 else ''}

  <!-- LAGGING GAP: Horizontal line comparing Northward positions -->
  {f'''
  <line x1="{ox}" y1="{car1_y}" x2="{ox + 80}" y2="{car1_y}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>
  <line x1="{ox}" y1="{car2_y}" x2="{ox + 80}" y2="{car2_y}" stroke="#fb923c" stroke-width="1" stroke-dasharray="2,2"/>
  <line x1="{ox + 70}" y1="{car1_y}" x2="{ox + 70}" y2="{car2_y}" stroke="#e2e8f0" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="{ox + 82}" y="{(car1_y + car2_y)/2 + 4}" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600">Northward Lag</text>
  ''' if progress > 0.3 else ''}

  <!-- Information Card / Sidebar -->
  <g transform="translate(530, 90)">
    <rect width="240" height="230" rx="10" fill="#131b2e" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">Speed Breakdown</text>
    
    <text x="18" y="56" fill="#94a3b8" font-family="sans-serif" font-size="12">Total Speed (Cruise Control):</text>
    <text x="18" y="74" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="700">V = 60 mph</text>

    <line x1="18" y1="88" x2="222" y2="88" stroke="#1e293b"/>

    <text x="18" y="110" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Car 1 (Pure North):</text>
    <text x="18" y="128" fill="#cbd5e1" font-family="monospace" font-size="12">• North: 60 mph (100%)</text>
    <text x="18" y="144" fill="#cbd5e1" font-family="monospace" font-size="12">• East:   0 mph (0%)</text>

    <text x="18" y="172" fill="#fb923c" font-family="sans-serif" font-size="12" font-weight="bold">Car 2 (60° Angle):</text>
    <text x="18" y="190" fill="#cbd5e1" font-family="monospace" font-size="12">• East:  52 mph (sin 60°)</text>
    <text x="18" y="206" fill="#f87171" font-family="monospace" font-size="12">• North: 30 mph (cos 60°)</text>
  </g>

  <!-- Key Insight Footer Banner -->
  <g transform="translate(40, 460)">
    <rect width="720" height="42" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="360" y="26" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" text-anchor="middle">
      <tspan font-weight="bold" fill="#38bdf8">The Principle:</tspan> Motion in one direction is <tspan fill="#f87171" font-weight="bold">stolen</tspan> by motion in another:  <tspan font-family="monospace" fill="#fb923c" font-weight="bold">V_North = √( V² - V_East² )</tspan>
    </text>
  </g>
</svg>"""
    return svg


# ========================================================
# 2A. VISUAL 2A: Object at Rest Moving Through Time
# ========================================================
def render_stationary_time_frame(progress, width=800, height=520):
    """
    Renders an observer sitting stationary at x=0, steadily progressing purely up the Time axis.
    progress: 0.0 to 1.0.
    """
    ox, oy = 260, 400
    scale = 280
    curr_y = oy - (progress * scale)
    time_elapsed = progress * 6.0

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <marker id="arr_stat" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <filter id="glow_stat" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#0b0f19"/>

  <!-- Titles -->
  <text x="40" y="42" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">An Object at Rest: Motion Through Time</text>
  <text x="40" y="66" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">Even with zero movement in space (x = 0), an object is constantly moving forward through time.</text>

  <!-- Grid lines -->
  <g stroke="#1e293b" stroke-width="1">
    {"".join(f'<line x1="{ox + i*50}" y1="80" x2="{ox + i*50}" y2="{oy}" stroke-dasharray="2,4"/>' for i in range(1, 8))}
    {"".join(f'<line x1="{ox - i*50}" y1="80" x2="{ox - i*50}" y2="{oy}" stroke-dasharray="2,4"/>' for i in range(1, 4))}
    {"".join(f'<line x1="80" y1="{oy - i*50}" x2="620" y2="{oy - i*50}" stroke-dasharray="2,4"/>' for i in range(1, 7))}
  </g>

  <!-- Axes -->
  <!-- Horizontal Axis: Space (x) -->
  <line x1="80" y1="{oy}" x2="620" y2="{oy}" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr_stat)"/>
  <text x="630" y="{oy + 5}" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600">Space (x)</text>

  <!-- Vertical Axis: Time (t) -->
  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr_stat)"/>
  <text x="{ox}" y="70" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Time (t)</text>

  <!-- Origin label -->
  <text x="{ox - 22}" y="{oy + 20}" fill="#64748b" font-family="monospace" font-size="13">x = 0</text>

  <!-- Motion along Time axis (pure vertical) -->
  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="{curr_y}" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="{ox}" cy="{curr_y}" r="8" fill="#38bdf8" filter="url(#glow_stat)"/>
  <circle cx="{ox}" cy="{curr_y}" r="3" fill="#ffffff"/>

  <!-- Floating Observer Label & Clock -->
  <g transform="translate({ox - 170}, {curr_y - 20})">
    <rect width="155" height="42" rx="6" fill="#131b2e" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="10" y="16" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold">OBSERVER AT REST</text>
    <text x="10" y="33" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">Clock: {time_elapsed:04.1f} s</text>
  </g>

  <!-- Zero Spatial Movement Marker -->
  <line x1="{ox}" y1="{oy + 6}" x2="{ox}" y2="{oy + 28}" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="{ox}" cy="{oy}" r="4" fill="#38bdf8"/>
  <text x="{ox + 10}" y="{oy + 24}" fill="#38bdf8" font-family="monospace" font-size="11">Δx = 0 (No spatial motion)</text>

  <!-- Information Card (Right) -->
  <g transform="translate(520, 100)">
    <rect width="250" height="210" rx="10" fill="#131b2e" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">Motion at Rest</text>

    <text x="18" y="56" fill="#94a3b8" font-family="sans-serif" font-size="12">Position in Space:</text>
    <text x="18" y="74" fill="#cbd5e1" font-family="monospace" font-size="13" font-weight="bold">x = 0 (Completely still)</text>

    <line x1="18" y1="88" x2="232" y2="88" stroke="#1e293b"/>

    <text x="18" y="110" fill="#94a3b8" font-family="sans-serif" font-size="12">Speed Through Space:</text>
    <text x="18" y="128" fill="#cbd5e1" font-family="monospace" font-size="12">v_space = 0 (0%)</text>

    <text x="18" y="152" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Speed Through Time:</text>
    <text x="18" y="170" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">v_time  = V (100%)</text>

    <line x1="18" y1="182" x2="232" y2="182" stroke="#1e293b"/>
    <text x="18" y="198" fill="#94a3b8" font-family="sans-serif" font-size="11">All motion is directed into the future.</text>
  </g>

  <!-- Banner -->
  <g transform="translate(40, 460)">
    <rect width="720" height="42" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="360" y="26" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" text-anchor="middle">
      <tspan font-weight="bold" fill="#38bdf8">Sitting still in space does not mean standing still:</tspan> 100% of your motion is carrying you forward through Time.
    </text>
  </g>
</svg>"""
    return svg


# ========================================================
# 2B. VISUAL 2B: Thought Experiment - The Spacetime Plane
# ========================================================
def render_thought_experiment_frame(angle_interp, width=800, height=520):
    """
    Renders the thought experiment frame where the vector tilts from pure Time to diagonal.
    angle_interp: 0.0 (pointing purely up Time axis) to 1.0 (tilted 60 degrees into Space).
    """
    ox, oy = 260, 390
    R = 250  # Radius representing constant total speed V

    # Angle relative to vertical (Time axis): 0 deg to 60 deg
    current_angle_deg = angle_interp * 60.0
    rad = math.radians(current_angle_deg)

    vx = R * math.sin(rad)
    vt = R * math.cos(rad)

    tip_x = ox + vx
    tip_y = oy - vt

    # Normalised percentage values
    pct_space = math.sin(rad) * 100
    pct_time = math.cos(rad) * 100

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#0b0f19"/>

  <!-- Titles -->
  <text x="40" y="42" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">The Thought Experiment: Plotting Space vs. Time</text>
  <text x="40" y="66" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">What if every object moved through Space and Time at a single, unchanging total speed V?</text>

  <!-- Axes -->
  <!-- Horizontal Axis: Space (x) -->
  <line x1="{ox}" y1="{oy}" x2="620" y2="{oy}" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="630" y="{oy + 5}" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600">Space (x)</text>

  <!-- Vertical Axis: Time (t) -->
  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="90" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="{ox}" y="80" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Time (t)</text>

  <!-- Invariant Speed Arc -->
  <path d="M {ox} {oy - R} A {R} {R} 0 0 1 {ox + R} {oy}" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="{ox + R * 0.72}" y="{oy - R * 0.72 - 6}" fill="#64748b" font-family="monospace" font-size="11">Constraint: Total Speed Vector = V</text>

  <!-- Projections to Axes -->
  <line x1="{tip_x}" y1="{tip_y}" x2="{ox}" y2="{tip_y}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="{tip_x}" y1="{tip_y}" x2="{tip_x}" y2="{oy}" stroke="#fb923c" stroke-width="2" stroke-dasharray="4,4"/>

  <!-- Motion Vector -->
  <line x1="{ox}" y1="{oy}" x2="{tip_x}" y2="{tip_y}" stroke="#a855f7" stroke-width="4"/>
  <circle cx="{tip_x}" cy="{tip_y}" r="8" fill="#a855f7" filter="url(#glow2)"/>
  <circle cx="{tip_x}" cy="{tip_y}" r="3" fill="#ffffff"/>

  <!-- Angle Arc -->
  {f'''
  <path d="M {ox} {oy - 50} A 50 50 0 0 1 {ox + 50*math.sin(rad)} {oy - 50*math.cos(rad)}" fill="none" stroke="#f1f5f9" stroke-width="1.5"/>
  <text x="{ox + 25*math.sin(rad/2) + 10}" y="{oy - 50*math.cos(rad/2)}" fill="#f1f5f9" font-family="monospace" font-size="11">{int(current_angle_deg)}°</text>
  ''' if current_angle_deg > 5 else ''}

  <!-- Axis Markers & Callouts -->
  <!-- Vertical Time Component -->
  <rect x="{ox - 180}" y="{tip_y - 12}" width="165" height="26" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="{ox - 10}" y="{tip_y + 5}" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end">Speed in Time: {pct_time:.0f}%</text>

  <!-- Horizontal Space Component -->
  <rect x="{tip_x - 70}" y="{oy + 14}" width="140" height="26" rx="4" fill="#0f172a" stroke="#fb923c" stroke-width="1"/>
  <text x="{tip_x}" y="{oy + 31}" fill="#fb923c" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Speed in Space: {pct_space:.0f}%</text>

  <!-- Deduction Card (Right) -->
  <g transform="translate(520, 110)">
    <rect width="250" height="220" rx="10" fill="#131b2e" stroke="#334155" stroke-width="1.5"/>
    <text x="18" y="28" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">The Unavoidable Logic</text>

    <text x="18" y="56" fill="#94a3b8" font-family="sans-serif" font-size="12">If you sit still in space (x = 0):</text>
    <text x="18" y="74" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">→ 100% of V travels through Time</text>

    <line x1="18" y1="90" x2="232" y2="90" stroke="#1e293b"/>

    <text x="18" y="112" fill="#94a3b8" font-family="sans-serif" font-size="12">If you move sideways through space:</text>
    <text x="18" y="130" fill="#fb923c" font-family="monospace" font-size="12" font-weight="bold">→ V_space rises to {pct_space:.0f}%</text>
    <text x="18" y="152" fill="#f87171" font-family="monospace" font-size="12" font-weight="bold">→ V_time shrinks to {pct_time:.0f}%</text>

    <line x1="18" y1="168" x2="232" y2="168" stroke="#1e293b"/>

    <text x="18" y="190" fill="#cbd5e1" font-family="monospace" font-size="11">V_time = √( V² - V_space² )</text>
    <text x="18" y="206" fill="#a855f7" font-family="sans-serif" font-size="11" font-weight="600">Motion in space steals time!</text>
  </g>

  <!-- Banner -->
  <g transform="translate(40, 460)">
    <rect width="720" height="42" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="360" y="26" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" text-anchor="middle">
      <tspan font-weight="bold" fill="#a855f7">The Deduction:</tspan> If total speed through spacetime is fixed, <tspan fill="#f87171" font-weight="bold">moving through space automatically slows your passage through time.</tspan>
    </text>
  </g>
</svg>"""
    return svg


# ========================================================
# 3. VISUAL 3: The Grand Reveal - V is c (Time Dilation)
# ========================================================
def render_grand_reveal_frame(progress, width=800, height=520):
    """
    Renders the Grand Reveal where V = c, and shows two observers:
    Observer A (Stationary on Earth): pure time, normal clock ticking.
    Observer B (Rocket moving at 0.866c): moving through space, clock ticking at 0.5x speed!
    progress: 0.0 to 1.0.
    """
    ox, oy = 160, 410
    scale = 300
    angle_rad = math.radians(60)  # 60 degrees -> vx = c*sin(60)=0.866c, vt = c*cos(60)=0.5c

    # Observer A (Earth, sitting still in space)
    # Travels purely through time at speed c
    obsA_x = ox
    obsA_y = oy - (progress * scale)
    timeA = progress * 6.0  # e.g., 0 to 6.0 seconds

    # Observer B (Rocket at 0.866 c)
    # Travels at 60 deg angle through spacetime at speed c
    obsB_x = ox + (progress * scale * math.sin(angle_rad))
    obsB_y = oy - (progress * scale * math.cos(angle_rad))
    timeB = progress * 3.0  # exactly 0.5x rate: 0 to 3.0 seconds!

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <marker id="arr3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <filter id="glow3" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#0b0f19"/>

  <!-- Titles -->
  <text x="40" y="38" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">The Grand Revelation: The Cosmic Constant is "c"</text>
  <text x="40" y="60" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">All objects travel through spacetime at the speed of light. Moving through space dilates time.</text>

  <!-- Axes -->
  <line x1="{ox}" y1="{oy}" x2="620" y2="{oy}" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <text x="630" y="{oy + 5}" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600">Space (x)</text>

  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <text x="{ox}" y="70" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Time (t)</text>

  <!-- Invariant Spacetime Speed Arc (Radius = c) -->
  <path d="M {ox} {oy - scale} A {scale} {scale} 0 0 1 {ox + scale} {oy}" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="{ox + scale * 0.72}" y="{oy - scale * 0.72 - 6}" fill="#64748b" font-family="monospace" font-size="11">Invariant Spacetime Speed = c</text>

  <!-- Observer A: Pure Time (At Rest on Earth) -->
  <line x1="{ox}" y1="{oy}" x2="{obsA_x}" y2="{obsA_y}" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="{obsA_x}" cy="{obsA_y}" r="7" fill="#38bdf8" filter="url(#glow3)"/>
  <circle cx="{obsA_x}" cy="{obsA_y}" r="3" fill="#ffffff"/>

  <!-- Observer A Clock & Label -->
  <g transform="translate({obsA_x - 130}, {obsA_y - 20})">
    <rect width="115" height="38" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="8" y="16" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold">EARTH OBSERVER</text>
    <text x="8" y="31" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">Clock: {timeA:04.1f} s</text>
  </g>

  <!-- Observer B: Moving Rocket at 0.866 c -->
  <line x1="{ox}" y1="{oy}" x2="{obsB_x}" y2="{obsB_y}" stroke="#fb923c" stroke-width="3"/>
  <circle cx="{obsB_x}" cy="{obsB_y}" r="7" fill="#fb923c" filter="url(#glow3)"/>
  <circle cx="{obsB_x}" cy="{obsB_y}" r="3" fill="#ffffff"/>

  <!-- Observer B Clock & Label -->
  <g transform="translate({obsB_x + 15}, {obsB_y - 20})">
    <rect width="125" height="38" rx="6" fill="#0f172a" stroke="#fb923c" stroke-width="1.5"/>
    <text x="8" y="16" fill="#fb923c" font-family="sans-serif" font-size="10" font-weight="bold">ROCKET (v = 0.866 c)</text>
    <text x="8" y="31" fill="#f87171" font-family="monospace" font-size="13" font-weight="bold">Clock: {timeB:04.1f} s</text>
  </g>

  <!-- Lagging Time Level Projection -->
  {f'''
  <line x1="{ox}" y1="{obsB_y}" x2="{obsB_x}" y2="{obsB_y}" stroke="#fb923c" stroke-width="1" stroke-dasharray="3,3" opacity="0.7"/>
  <line x1="{obsB_x}" y1="{oy}" x2="{obsB_x}" y2="{obsB_y}" stroke="#fb923c" stroke-width="1" stroke-dasharray="3,3" opacity="0.7"/>
  <circle cx="{ox}" cy="{obsB_y}" r="4" fill="#fb923c"/>
  <text x="{ox - 10}" y="{obsB_y + 4}" fill="#fb923c" font-family="monospace" font-size="11" text-anchor="end">v_time = 0.50 c</text>
  ''' if progress > 0.05 else ''}

  <!-- Comparison Card -->
  <g transform="translate(530, 95)">
    <rect width="240" height="235" rx="10" fill="#131b2e" stroke="#334155" stroke-width="1.5"/>
    <text x="16" y="26" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">Time Dilation Revealed</text>
    
    <text x="16" y="52" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Stationary in Space:</text>
    <text x="16" y="70" fill="#cbd5e1" font-family="monospace" font-size="12">• v_space = 0</text>
    <text x="16" y="86" fill="#38bdf8" font-family="monospace" font-size="12">• v_time  = c (100% of time)</text>
    <text x="16" y="104" fill="#94a3b8" font-family="sans-serif" font-size="11">Aging at normal full speed.</text>

    <line x1="16" y1="116" x2="224" y2="116" stroke="#1e293b"/>

    <text x="16" y="136" fill="#fb923c" font-family="sans-serif" font-size="12" font-weight="bold">Moving at 86.6% Speed of Light:</text>
    <text x="16" y="154" fill="#cbd5e1" font-family="monospace" font-size="12">• v_space = 0.866 c</text>
    <text x="16" y="172" fill="#f87171" font-family="monospace" font-size="12" font-weight="bold">• v_time  = 0.50 c (Half speed!)</text>
    <text x="16" y="192" fill="#94a3b8" font-family="sans-serif" font-size="11">While Earth clocks tick 6 sec,</text>
    <text x="16" y="208" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="600">the rocket clock ticks only 3 sec!</text>
  </g>

  <!-- Banner -->
  <g transform="translate(40, 460)">
    <rect width="720" height="42" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="360" y="26" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" text-anchor="middle">
      <tspan font-weight="bold" fill="#38bdf8">The Grand Secret of Relativity:</tspan> Your speed through spacetime is always <tspan fill="#38bdf8" font-weight="bold">c</tspan>. Motion in space steals time.
    </text>
  </g>
</svg>"""
    return svg


# ========================================================
# 4. VISUAL 4: Cosmic Speed Limit & The Photon Trajectory
# ========================================================
def render_speed_limit_diagram(width=800, height=500):
    ox, oy = 180, 400
    R = 280

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <marker id="arr4" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8"/>
    </marker>
    <filter id="glow4" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#0b0f19"/>

  <!-- Titles -->
  <text x="40" y="40" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">The Ultimate Boundary: Why 'c' Cannot Be Exceeded</text>
  <text x="40" y="64" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">What happens when an object diverts 100% of its spacetime speed into space?</text>

  <!-- Axes -->
  <line x1="{ox}" y1="{oy}" x2="680" y2="{oy}" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr4)"/>
  <text x="690" y="{oy + 5}" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600">Space (x)</text>

  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="90" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr4)"/>
  <text x="{ox}" y="80" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Time (t)</text>

  <!-- Spacetime Arc -->
  <path d="M {ox} {oy - R} A {R} {R} 0 0 1 {ox + R} {oy}" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="5,5"/>

  <!-- Case 1: You on Earth (Pure Time) -->
  <line x1="{ox}" y1="{oy}" x2="{ox}" y2="{oy - R}" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="{ox}" cy="{oy - R}" r="6" fill="#38bdf8"/>
  <text x="{ox - 15}" y="{oy - R - 10}" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">1. At Rest (You on Earth)</text>
  <text x="{ox - 15}" y="{oy - R + 8}" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="end">v_space = 0, v_time = c</text>

  <!-- Case 2: Fast Rocket (Shared) -->
  <line x1="{ox}" y1="{oy}" x2="{ox + R*0.866}" y2="{oy - R*0.5}" stroke="#fb923c" stroke-width="3"/>
  <circle cx="{ox + R*0.866}" cy="{oy - R*0.5}" r="6" fill="#fb923c"/>
  <text x="{ox + R*0.866 + 12}" y="{oy - R*0.5 - 6}" fill="#fb923c" font-family="sans-serif" font-size="12" font-weight="bold">2. Fast Rocket</text>
  <text x="{ox + R*0.866 + 12}" y="{oy - R*0.5 + 10}" fill="#94a3b8" font-family="monospace" font-size="11">v_space = 0.866 c, v_time = 0.5 c</text>

  <!-- Case 3: The Photon (Pure Space) -->
  <line x1="{ox}" y1="{oy}" x2="{ox + R}" y2="{oy}" stroke="#facc15" stroke-width="4"/>
  <circle cx="{ox + R}" cy="{oy}" r="8" fill="#facc15" filter="url(#glow4)"/>
  <circle cx="{ox + R}" cy="{oy}" r="3" fill="#ffffff"/>
  <text x="{ox + R}" y="{oy - 16}" fill="#facc15" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">3. Photon (Light)</text>
  <text x="{ox + R}" y="{oy + 25}" fill="#facc15" font-family="monospace" font-size="11" text-anchor="middle">v_space = c, v_time = 0</text>

  <!-- Impossible Beyond c Zone -->
  <path d="M {ox + R} {oy} L 660 {oy}" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4"/>
  <text x="{ox + R + 30}" y="{oy - 30}" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold">IMPOSSIBLE REGION</text>
  <text x="{ox + R + 30}" y="{oy - 14}" fill="#ef4444" font-family="sans-serif" font-size="11">Requires diverting > 100% of speed</text>

  <!-- Explanation Card -->
  <g transform="translate(480, 100)">
    <rect width="280" height="190" rx="10" fill="#131b2e" stroke="#334155" stroke-width="1.5"/>
    <text x="16" y="26" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">The Photon's Timeless Journey</text>
    
    <text x="16" y="52" fill="#facc15" font-family="sans-serif" font-size="12" font-weight="bold">• 100% of speed is in space (v = c)</text>
    <text x="16" y="74" fill="#cbd5e1" font-family="sans-serif" font-size="12">• Speed through time:</text>
    <text x="24" y="96" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">v_time = √( c² - c² ) = 0</text>

    <text x="16" y="128" fill="#94a3b8" font-family="sans-serif" font-size="11">For a photon of light emitted billions of years ago from a distant quasar, <tspan fill="#f8fafc" font-weight="bold">zero time has elapsed</tspan>. From its own point of view, birth and absorption occur in the exact same instant.</text>
  </g>

  <!-- Banner -->
  <g transform="translate(40, 445)">
    <rect width="720" height="42" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="360" y="26" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" text-anchor="middle">
      <tspan font-weight="bold" fill="#facc15">Why can't you go faster than c?</tspan> For the same reason you can't go <tspan fill="#38bdf8" font-weight="bold">"more North than pure North"</tspan>. All speed is already used.
    </text>
  </g>
</svg>"""
    return svg


# ========================================================
# Compilation & Execution
# ========================================================
def generate_all():
    print("1. Generating Visual 1: Two Cars on 2D Plane...")
    cleanup_temp()
    num_frames = 36
    # 28 moving frames, 8 pause frames at end
    for i in range(28):
        progress = i / 27.0
        svg_content = render_car_frame(progress)
        svg_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.svg")
        with open(svg_path, "w") as f:
            f.write(svg_content)
        png_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.png")
        subprocess.run(["convert", "-density", "150", svg_path, png_path], check=True)

    # Duplicate last frame for hold
    last_png = os.path.join(TEMP_DIR, "frame_027.png")
    for i in range(28, num_frames):
        shutil.copy(last_png, os.path.join(TEMP_DIR, f"frame_{i:03d}.png"))

    # Also save static PNG
    shutil.copy(last_png, os.path.join(ASSETS_DIR, "01_cars_2d_plane.png"))

    # Convert frames to GIF
    gif_out = os.path.join(ASSETS_DIR, "01_cars_2d_plane.gif")
    cmd = ["convert", "-delay", "8", "-loop", "0", os.path.join(TEMP_DIR, "frame_*.png"), gif_out]
    subprocess.run(cmd, check=True)
    print(f"   Saved {gif_out} ({os.path.getsize(gif_out) // 1024} KB)")

    print("2A. Generating Visual 2A: Stationary Motion Through Time...")
    cleanup_temp()
    for i in range(28):
        progress = i / 27.0
        svg_content = render_stationary_time_frame(progress)
        svg_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.svg")
        with open(svg_path, "w") as f:
            f.write(svg_content)
        png_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.png")
        subprocess.run(["convert", "-density", "150", svg_path, png_path], check=True)

    last_png = os.path.join(TEMP_DIR, "frame_027.png")
    for i in range(28, num_frames):
        shutil.copy(last_png, os.path.join(TEMP_DIR, f"frame_{i:03d}.png"))

    shutil.copy(last_png, os.path.join(ASSETS_DIR, "02a_stationary_motion_time.png"))
    gif_out_stat = os.path.join(ASSETS_DIR, "02a_stationary_motion_time.gif")
    cmd = ["convert", "-delay", "8", "-loop", "0", os.path.join(TEMP_DIR, "frame_*.png"), gif_out_stat]
    subprocess.run(cmd, check=True)
    print(f"   Saved {gif_out_stat} ({os.path.getsize(gif_out_stat) // 1024} KB)")

    print("2B. Generating Visual 2B: The Thought Experiment (Space vs Time Trade-Off)...")
    cleanup_temp()
    for i in range(28):
        # Eased tilt from 0 to 1
        t = i / 27.0
        t_eased = 0.5 - 0.5 * math.cos(math.pi * t)
        svg_content = render_thought_experiment_frame(t_eased)
        svg_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.svg")
        with open(svg_path, "w") as f:
            f.write(svg_content)
        png_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.png")
        subprocess.run(["convert", "-density", "150", svg_path, png_path], check=True)

    last_png = os.path.join(TEMP_DIR, "frame_027.png")
    for i in range(28, num_frames):
        shutil.copy(last_png, os.path.join(TEMP_DIR, f"frame_{i:03d}.png"))

    shutil.copy(last_png, os.path.join(ASSETS_DIR, "02b_spacetime_tradeoff.png"))
    shutil.copy(last_png, os.path.join(ASSETS_DIR, "02_spacetime_thought_exp.png"))

    gif_out2 = os.path.join(ASSETS_DIR, "02b_spacetime_tradeoff.gif")
    cmd = ["convert", "-delay", "8", "-loop", "0", os.path.join(TEMP_DIR, "frame_*.png"), gif_out2]
    subprocess.run(cmd, check=True)
    shutil.copy(gif_out2, os.path.join(ASSETS_DIR, "02_spacetime_thought_exp.gif"))
    print(f"   Saved {gif_out2} ({os.path.getsize(gif_out2) // 1024} KB)")

    print("3. Generating Visual 3: The Grand Reveal (V = c & Ticking Clocks)...")
    cleanup_temp()
    for i in range(28):
        progress = i / 27.0
        svg_content = render_grand_reveal_frame(progress)
        svg_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.svg")
        with open(svg_path, "w") as f:
            f.write(svg_content)
        png_path = os.path.join(TEMP_DIR, f"frame_{i:03d}.png")
        subprocess.run(["convert", "-density", "150", svg_path, png_path], check=True)

    last_png = os.path.join(TEMP_DIR, "frame_027.png")
    for i in range(28, num_frames):
        shutil.copy(last_png, os.path.join(TEMP_DIR, f"frame_{i:03d}.png"))

    shutil.copy(last_png, os.path.join(ASSETS_DIR, "03_spacetime_revealed_c.png"))

    gif_out3 = os.path.join(ASSETS_DIR, "03_spacetime_revealed_c.gif")
    cmd = ["convert", "-delay", "8", "-loop", "0", os.path.join(TEMP_DIR, "frame_*.png"), gif_out3]
    subprocess.run(cmd, check=True)
    print(f"   Saved {gif_out3} ({os.path.getsize(gif_out3) // 1024} KB)")

    print("4. Generating Visual 4: Cosmic Speed Limit & Photon Trajectory (Static PNG)...")
    svg_content = render_speed_limit_diagram()
    svg_path = os.path.join(TEMP_DIR, "speed_limit.svg")
    with open(svg_path, "w") as f:
        f.write(svg_content)
    png_out4 = os.path.join(ASSETS_DIR, "04_cosmic_speed_limit.png")
    subprocess.run(["convert", "-density", "150", svg_path, png_out4], check=True)
    print(f"   Saved {png_out4} ({os.path.getsize(png_out4) // 1024} KB)")

    cleanup_temp()
    print("All visuals successfully generated!")


if __name__ == "__main__":
    generate_all()
