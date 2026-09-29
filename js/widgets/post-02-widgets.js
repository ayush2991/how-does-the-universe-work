/**
 * post-02-widgets.js
 * Interactive Explorable Widgets for Post 2: The Cosmic Light Cone: Mapping Space & Time
 * 100% Static, Serverless, Zero-Dependency. Works directly over file:// and any static host.
 */

// ============================================================================
// Shared Canvas Utilities
// ============================================================================
function setupRetinaCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height, dpr };
}

function getThemeColors() {
  const isLight = document.documentElement.getAttribute('data-theme') !== 'dark';
  if (isLight) {
    return {
      isLight: true,
      gridLine: 'rgba(15, 23, 42, 0.06)',
      axisLine: '#334155',
      axisArrow: '#1e293b',
      axisLabel: '#0f172a',
      timeColor: '#0284c7',
      timeColorSubtle: 'rgba(2, 132, 199, 0.12)',
      spaceColor: '#ea580c',
      spaceColorSubtle: 'rgba(234, 88, 12, 0.12)',
      invariantColor: '#7c3aed',
      photonColor: '#d97706',
      photonColorGlow: 'rgba(217, 119, 6, 0.25)',
      emeraldColor: '#059669',
      emeraldSubtle: 'rgba(5, 150, 105, 0.12)',
      dangerColor: '#dc2626',
      dangerSubtle: 'rgba(220, 38, 38, 0.08)',
      pillBg: 'rgba(255, 255, 255, 0.95)',
      pillBorder: 'rgba(15, 23, 42, 0.12)',
      pillText: '#0f172a',
      subtleText: '#64748b',
      coneFill: 'rgba(2, 132, 199, 0.07)',
      elsewhereFill: 'rgba(100, 116, 139, 0.04)'
    };
  } else {
    return {
      isLight: false,
      gridLine: 'rgba(255, 255, 255, 0.06)',
      axisLine: '#64748b',
      axisArrow: '#94a3b8',
      axisLabel: '#f8fafc',
      timeColor: '#38bdf8',
      timeColorSubtle: 'rgba(56, 189, 248, 0.2)',
      spaceColor: '#fb923c',
      spaceColorSubtle: 'rgba(251, 146, 60, 0.2)',
      invariantColor: '#a855f7',
      photonColor: '#facc15',
      photonColorGlow: 'rgba(250, 204, 21, 0.25)',
      emeraldColor: '#10b981',
      emeraldSubtle: 'rgba(16, 185, 129, 0.2)',
      dangerColor: '#f87171',
      dangerSubtle: 'rgba(248, 113, 113, 0.12)',
      pillBg: 'rgba(14, 18, 26, 0.95)',
      pillBorder: 'rgba(255, 255, 255, 0.12)',
      pillText: '#f8fafc',
      subtleText: '#94a3b8',
      coneFill: 'rgba(56, 189, 248, 0.09)',
      elsewhereFill: 'rgba(148, 163, 184, 0.03)'
    };
  }
}

function drawGrid(ctx, ox, oy, width, height, step = 35, color = 'rgba(128, 128, 128, 0.08)') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ox + step; x < width - 10; x += step) {
    ctx.moveTo(x, 10);
    ctx.lineTo(x, height - 10);
  }
  for (let x = ox - step; x > 10; x -= step) {
    ctx.moveTo(x, 10);
    ctx.lineTo(x, height - 10);
  }
  for (let y = oy - step; y > 10; y -= step) {
    ctx.moveTo(10, y);
    ctx.lineTo(width - 10, y);
  }
  for (let y = oy + step; y < height - 10; y += step) {
    ctx.moveTo(10, y);
    ctx.lineTo(width - 10, y);
  }
  ctx.stroke();
}

function drawGlowingDot(ctx, x, y, color, radius = 6) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 3D Isometric Projection Helper
function project3D(x, y, z, cx, cy, scale, azimuth, elevation) {
  const cosAz = Math.cos(azimuth);
  const sinAz = Math.sin(azimuth);
  const xRot = x * cosAz - y * sinAz;
  const yRot = x * sinAz + y * cosAz;

  const cosEl = Math.cos(elevation);
  const sinEl = Math.sin(elevation);
  const yFinal = yRot * cosEl - z * sinEl;
  const zFinal = yRot * sinEl + z * cosEl;

  return {
    x: cx + xRot * scale,
    y: cy - zFinal * scale,
    depth: yFinal
  };
}


// ============================================================================
// SIMULATION 1: The Side-by-Side Bridge: Speed Space vs Coordinate Spacetime
// ============================================================================
export function initWidgetDualSpeedSpacetime(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvasSpeed = container.querySelector('.canvas-speed');
  const canvasSpacetime = container.querySelector('.canvas-spacetime');
  const sliderTheta = container.querySelector('.slider-theta');
  const btnPlay = container.querySelector('.btn-play');

  // Readouts
  const elTheta = container.querySelector('.val-theta');
  const elVx = container.querySelector('.val-vx');
  const elVt = container.querySelector('.val-vt');
  const elPhi = container.querySelector('.val-phi');
  const elGamma = container.querySelector('.val-gamma');
  const elProperRate = container.querySelector('.val-proper-rate');

  // Presets
  const presetBtns = container.querySelectorAll('.preset-btn');

  let thetaDeg = parseFloat(sliderTheta ? sliderTheta.value : 0) || 0;
  let isPlaying = false;
  let playAnimId = null;
  let playDirection = 1;

  function updateReadouts() {
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const vx = Math.sin(thetaRad); // v_space / c
    const vt = Math.cos(thetaRad); // v_time / c
    const phiRad = Math.atan(vx);  // Spacetime angle = arctan(vx/c)
    const phiDeg = (phiRad * 180) / Math.PI;
    const gamma = vt > 0.001 ? 1 / vt : 999.9;
    const properRate = vt; // dtau/dt = cos(theta)

    if (sliderTheta) sliderTheta.value = thetaDeg.toFixed(1);
    if (elTheta) elTheta.textContent = thetaDeg.toFixed(1) + '°';
    if (elVx) elVx.textContent = vx.toFixed(3) + ' c';
    if (elVt) elVt.textContent = vt.toFixed(3) + ' c';
    if (elPhi) elPhi.textContent = phiDeg.toFixed(1) + '°';
    if (elGamma) elGamma.textContent = gamma > 100 ? '∞' : gamma.toFixed(2);
    if (elProperRate) elProperRate.textContent = (properRate * 100).toFixed(1) + '%';
  }

  // --- Render Left Canvas: Speed Space (v_space vs v_time) ---
  function drawSpeedSpace() {
    if (!canvasSpeed) return;
    const { ctx, width, height } = setupRetinaCanvas(canvasSpeed);
    const colors = getThemeColors();

    ctx.clearRect(0, 0, width, height);

    // Coordinate Origin: bottom-left with margin
    const ox = 50;
    const oy = height - 45;
    const radius = Math.min(width - 80, height - 75);

    drawGrid(ctx, ox, oy, width, height, 32, colors.gridLine);

    // Axes
    ctx.strokeStyle = colors.axisLine;
    ctx.lineWidth = 2;

    // Horizontal Axis (v_space)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + radius + 25, oy);
    ctx.stroke();

    // Arrowhead X
    ctx.fillStyle = colors.axisArrow;
    ctx.beginPath();
    ctx.moveTo(ox + radius + 25, oy - 4);
    ctx.lineTo(ox + radius + 32, oy);
    ctx.lineTo(ox + radius + 25, oy + 4);
    ctx.fill();

    // Vertical Axis (v_time)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy - radius - 25);
    ctx.stroke();

    // Arrowhead Y
    ctx.beginPath();
    ctx.moveTo(ox - 4, oy - radius - 25);
    ctx.lineTo(ox, oy - radius - 32);
    ctx.lineTo(ox + 4, oy - radius - 25);
    ctx.fill();

    // Labels
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.spaceColor;
    ctx.fillText('v_space (Motion)', ox + radius - 60, oy + 22);

    ctx.fillStyle = colors.timeColor;
    ctx.fillText('v_time (Aging)', ox + 8, oy - radius - 12);

    // 0 and c markers
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.subtleText;
    ctx.fillText('0', ox - 14, oy + 14);
    ctx.fillText('c', ox + radius - 3, oy + 16);
    ctx.fillText('c', ox - 16, oy - radius + 4);

    // Invariant Speed Arc: R = c
    ctx.strokeStyle = colors.invariantColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arc Label
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.invariantColor;
    ctx.fillText('Total Speed = c', ox + radius * 0.55, oy - radius * 0.75);

    // Vector calculations
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const vx = Math.sin(thetaRad);
    const vt = Math.cos(thetaRad);

    const tipX = ox + vx * radius;
    const tipY = oy - vt * radius;

    // Component Projections
    ctx.strokeStyle = colors.spaceColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX, oy);
    ctx.stroke();

    ctx.strokeStyle = colors.timeColor;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(ox, tipY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle theta arc (from vertical axis)
    if (thetaDeg > 1) {
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.arc(ox, oy, 32, -Math.PI / 2, -Math.PI / 2 + thetaRad, false);
      ctx.stroke();

      const labelAngle = -Math.PI / 2 + thetaRad / 2;
      const lx = ox + Math.cos(labelAngle) * 44;
      const ly = oy + Math.sin(labelAngle) * 44;
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.photonColor;
      ctx.fillText('θ=' + thetaDeg.toFixed(0) + '°', lx - 10, ly + 4);
    }

    // Velocity Vector Arrow
    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    drawGlowingDot(ctx, tipX, tipY, colors.photonColor, 6);

    // Interactive Pill at top
    ctx.fillStyle = colors.pillBg;
    ctx.strokeStyle = colors.pillBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 14, width - 28, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.pillText;
    if (thetaDeg === 0) {
      ctx.fillText('θ = 0° : 100% Motion in Time (Sitting at Rest)', 24, 32);
    } else if (thetaDeg >= 89.9) {
      ctx.fillText('θ = 90° : 100% Motion in Space (Speed of Light, v = c)', 24, 32);
    } else {
      ctx.fillText(`θ = ${thetaDeg.toFixed(1)}° : v_space = ${(vx * 100).toFixed(1)}%c, v_time = ${(vt * 100).toFixed(1)}%c`, 24, 32);
    }
  }

  // --- Render Right Canvas: Coordinate Spacetime (x vs ct) ---
  function drawSpacetime() {
    if (!canvasSpacetime) return;
    const { ctx, width, height } = setupRetinaCanvas(canvasSpacetime);
    const colors = getThemeColors();

    ctx.clearRect(0, 0, width, height);

    // Origin: centered horizontally, near bottom
    const ox = width / 2;
    const oy = height - 45;
    const scale = Math.min((width / 2) - 40, height - 75);

    drawGrid(ctx, ox, oy, width, height, 32, colors.gridLine);

    // Light Cone 45-degree Boundary (x = ± ct)
    const coneXLeft = ox - scale;
    const coneXRight = ox + scale;
    const coneYTop = oy - scale;

    // Shaded Future Causal Cone
    ctx.fillStyle = colors.coneFill;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(coneXLeft, coneYTop);
    ctx.lineTo(coneXRight, coneYTop);
    ctx.closePath();
    ctx.fill();

    // Shaded Elsewhere (Forbidden)
    ctx.fillStyle = colors.dangerSubtle;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(coneXLeft, coneYTop);
    ctx.lineTo(10, coneYTop);
    ctx.lineTo(10, oy);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(coneXRight, coneYTop);
    ctx.lineTo(width - 10, coneYTop);
    ctx.lineTo(width - 10, oy);
    ctx.closePath();
    ctx.fill();

    // Light Cone Boundary Lines
    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(coneXLeft, coneYTop);
    ctx.moveTo(ox, oy);
    ctx.lineTo(coneXRight, coneYTop);
    ctx.stroke();
    ctx.setLineDash([]);

    // 45° Labels along Light Cone
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.photonColor;
    ctx.fillText('Photon (45°)', coneXRight - 65, coneYTop + 16);
    ctx.fillText('Light Cone (v = c)', coneXLeft + 8, coneYTop + 16);

    // Axes
    ctx.strokeStyle = colors.axisLine;
    ctx.lineWidth = 2;

    // Horizontal Space Axis x
    ctx.beginPath();
    ctx.moveTo(25, oy);
    ctx.lineTo(width - 25, oy);
    ctx.stroke();

    // Arrowhead Right (+x)
    ctx.fillStyle = colors.axisArrow;
    ctx.beginPath();
    ctx.moveTo(width - 25, oy - 4);
    ctx.lineTo(width - 18, oy);
    ctx.lineTo(width - 25, oy + 4);
    ctx.fill();

    // Vertical Time Axis ct
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy - scale - 25);
    ctx.stroke();

    // Arrowhead Up (+ct)
    ctx.beginPath();
    ctx.moveTo(ox - 4, oy - scale - 25);
    ctx.lineTo(ox, oy - scale - 32);
    ctx.lineTo(ox + 4, oy - scale - 25);
    ctx.fill();

    // Axis Labels
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.spaceColor;
    ctx.fillText('+x (Space)', width - 85, oy + 18);
    ctx.fillText('-x', 25, oy + 18);

    ctx.fillStyle = colors.timeColor;
    ctx.fillText('ct (Time)', ox + 8, oy - scale - 12);

    // Alice: Stationary Worldline (x = 0, along vertical axis)
    ctx.strokeStyle = colors.timeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, coneYTop);
    ctx.stroke();

    // Alice Proper Time Ticks
    const numTicks = 5;
    for (let i = 1; i <= numTicks; i++) {
      const ty = oy - (scale / numTicks) * i;
      ctx.strokeStyle = colors.timeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox - 4, ty);
      ctx.lineTo(ox + 4, ty);
      ctx.stroke();

      ctx.font = '500 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.timeColor;
      ctx.fillText(i + 's', ox + 7, ty + 3);
    }

    // Bob: Moving Worldline
    // Angle in Spacetime to vertical: tan(phi) = dx / c*dt = v/c = sin(theta)
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const vx = Math.sin(thetaRad); // v/c
    const phiRad = Math.atan(vx);
    const phiDeg = (phiRad * 180) / Math.PI;

    // Bob's top endpoint at ct = scale
    const bobTopX = ox + vx * scale;
    const bobTopY = oy - scale;

    ctx.strokeStyle = colors.spaceColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(bobTopX, bobTopY);
    ctx.stroke();

    // Bob's Proper Time Ticks along his tilted worldline
    // Coordinate time interval for 1s proper time: dt = gamma * 1s
    const vt = Math.cos(thetaRad);
    if (vt > 0.05) {
      const gamma = 1 / vt;
      for (let i = 1; i <= numTicks; i++) {
        const ctCoord = (scale / numTicks) * i * gamma;
        if (ctCoord <= scale) {
          const bx = ox + vx * ctCoord;
          const by = oy - ctCoord;

          // Perpendicular tick
          const perpAngle = phiRad + Math.PI / 2;
          const tickLen = 4;
          ctx.strokeStyle = colors.spaceColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx - Math.cos(perpAngle) * tickLen, by + Math.sin(perpAngle) * tickLen);
          ctx.lineTo(bx + Math.cos(perpAngle) * tickLen, by - Math.sin(perpAngle) * tickLen);
          ctx.stroke();

          ctx.font = '600 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.spaceColor;
          ctx.fillText(i + 's', bx + 6, by + 3);
        }
      }
    }

    // Angle phi arc at origin
    if (phiDeg > 1) {
      ctx.strokeStyle = colors.spaceColor;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.arc(ox, oy, 40, -Math.PI / 2, -Math.PI / 2 + phiRad, false);
      ctx.stroke();

      const labelAngle = -Math.PI / 2 + phiRad / 2;
      const lx = ox + Math.cos(labelAngle) * 52;
      const ly = oy + Math.sin(labelAngle) * 52;
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('φ=' + phiDeg.toFixed(1) + '°', lx - 12, ly);
    }

    // Glowing tip of Bob's worldline
    drawGlowingDot(ctx, bobTopX, bobTopY, colors.spaceColor, 6);

    // Interactive Pill at top
    ctx.fillStyle = colors.pillBg;
    ctx.strokeStyle = colors.pillBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 14, width - 28, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.pillText;
    if (thetaDeg === 0) {
      ctx.fillText('Bob Worldline: φ = 0° (Vertical, Standing Beside Alice)', 24, 32);
    } else if (thetaDeg >= 89.9) {
      ctx.fillText('Bob Worldline: φ = 45.0° (Lying on Light Cone! τ = 0.00s Frozen)', 24, 32);
    } else {
      ctx.fillText(`Bob Worldline: φ = ${phiDeg.toFixed(1)}° · Proper time ticks run at ${(vt * 100).toFixed(0)}% rate`, 24, 32);
    }
  }

  function renderAll() {
    updateReadouts();
    drawSpeedSpace();
    drawSpacetime();
  }

  // --- Controls & Event Listeners ---
  if (sliderTheta) {
    sliderTheta.addEventListener('input', (e) => {
      thetaDeg = parseFloat(e.target.value);
      if (isPlaying) stopPlay();
      renderAll();
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = parseFloat(btn.getAttribute('data-theta'));
      if (!isNaN(val)) {
        thetaDeg = val;
        if (isPlaying) stopPlay();
        renderAll();
      }
    });
  });

  function stopPlay() {
    isPlaying = false;
    if (playAnimId) cancelAnimationFrame(playAnimId);
    if (btnPlay) {
      btnPlay.innerHTML = '<span>▶</span><span>Auto Sweep</span>';
    }
  }

  function startPlay() {
    isPlaying = true;
    if (btnPlay) {
      btnPlay.innerHTML = '<span>⏸</span><span>Pause</span>';
    }
    let lastTime = performance.now();

    function step(now) {
      if (!isPlaying) return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      thetaDeg += playDirection * dt * 18; // 18 deg per sec (5s full sweep)
      if (thetaDeg >= 90) {
        thetaDeg = 90;
        playDirection = -1;
      } else if (thetaDeg <= 0) {
        thetaDeg = 0;
        playDirection = 1;
      }
      renderAll();
      playAnimId = requestAnimationFrame(step);
    }
    playAnimId = requestAnimationFrame(step);
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (isPlaying) {
        stopPlay();
      } else {
        startPlay();
      }
    });
  }

  // Initial draw & resize listener
  renderAll();
  window.addEventListener('resize', renderAll);
  document.addEventListener('themeChanged', renderAll);
}


// ============================================================================
// SIMULATION 2: 3D Light Cone Explorer (Future, Past, Elsewhere)
// ============================================================================
export function initWidget3DLightConeExplorer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const sliderTime = container.querySelector('.slider-time');
  const sliderAzimuth = container.querySelector('.slider-azimuth');
  const sliderElevation = container.querySelector('.slider-elevation');
  const btnReset = container.querySelector('.btn-reset-view');

  const elRegionBadge = container.querySelector('.badge-region');
  const elSliceTime = container.querySelector('.val-slice-time');
  const elWaveRadius = container.querySelector('.val-wave-radius');

  // Camera angles
  let azimuth = 0.65;    // ~37 degrees
  let elevation = 0.38;  // ~22 degrees
  let sliceT = parseFloat(sliderTime ? sliderTime.value : 0.4) || 0.4; // -1 to +1

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    const colors = getThemeColors();

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.38;

    // Draw Space Grid at ct = 0 plane
    const gridStep = 0.25;
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -1; x <= 1.01; x += gridStep) {
      const p1 = project3D(x, -1, 0, cx, cy, scale, azimuth, elevation);
      const p2 = project3D(x, 1, 0, cx, cy, scale, azimuth, elevation);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    for (let y = -1; y <= 1.01; y += gridStep) {
      const p1 = project3D(-1, y, 0, cx, cy, scale, azimuth, elevation);
      const p2 = project3D(1, y, 0, cx, cy, scale, azimuth, elevation);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // 3D Spatial Axes (x, y, ct)
    const origin = project3D(0, 0, 0, cx, cy, scale, azimuth, elevation);
    const axisX = project3D(1.15, 0, 0, cx, cy, scale, azimuth, elevation);
    const axisY = project3D(0, 1.15, 0, cx, cy, scale, azimuth, elevation);
    const axisZPos = project3D(0, 0, 1.25, cx, cy, scale, azimuth, elevation);
    const axisZNeg = project3D(0, 0, -1.25, cx, cy, scale, azimuth, elevation);

    // Vertical ct Axis
    ctx.strokeStyle = colors.axisLine;
    ctx.lineWidth = 1.75;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(axisZNeg.x, axisZNeg.y);
    ctx.lineTo(origin.x, origin.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(axisZPos.x, axisZPos.y);
    ctx.stroke();

    // Labels
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.timeColor;
    ctx.fillText('+ct (Future)', axisZPos.x + 8, axisZPos.y + 4);
    ctx.fillStyle = colors.subtleText;
    ctx.fillText('-ct (Past)', axisZNeg.x + 8, axisZNeg.y + 4);

    ctx.fillStyle = colors.spaceColor;
    ctx.fillText('x (Space 1)', axisX.x + 6, axisX.y + 4);
    ctx.fillText('y (Space 2)', axisY.x + 6, axisY.y + 4);

    // --- Draw the Double Cone (Past & Future) ---
    // Cone circles at various heights
    const coneLevels = [-1.0, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1.0];
    const numCirclePts = 36;

    coneLevels.forEach((level) => {
      const radius = Math.abs(level);
      ctx.strokeStyle = colors.photonColorGlow;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= numCirclePts; i++) {
        const angle = (i / numCirclePts) * Math.PI * 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        const pt = project3D(px, py, level, cx, cy, scale, azimuth, elevation);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    });

    // 8 Generator Rays along the 45° Cone Surface
    const numGenerators = 8;
    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 1.5;
    for (let g = 0; g < numGenerators; g++) {
      const angle = (g / numGenerators) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const pBottom = project3D(cosA, sinA, -1.0, cx, cy, scale, azimuth, elevation);
      const pTop = project3D(cosA, sinA, 1.0, cx, cy, scale, azimuth, elevation);

      ctx.beginPath();
      ctx.moveTo(pBottom.x, pBottom.y);
      ctx.lineTo(origin.x, origin.y);
      ctx.lineTo(pTop.x, pTop.y);
      ctx.stroke();
    }

    // --- Active Time Slice Plane at ct = sliceT ---
    const planeRadius = 1.15;
    const slicePlanePts = [
      project3D(-planeRadius, -planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
      project3D(planeRadius, -planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
      project3D(planeRadius, planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
      project3D(-planeRadius, planeRadius, sliceT, cx, cy, scale, azimuth, elevation)
    ];

    // Translucent Slice Plane
    ctx.fillStyle = sliceT >= 0 ? colors.coneFill : colors.elsewhereFill;
    ctx.beginPath();
    ctx.moveTo(slicePlanePts[0].x, slicePlanePts[0].y);
    for (let p = 1; p < 4; p++) ctx.lineTo(slicePlanePts[p].x, slicePlanePts[p].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colors.timeColor;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Expanding Light Wavefront (Circle on the Slice Plane)
    const waveR = Math.abs(sliceT);
    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= numCirclePts; i++) {
      const angle = (i / numCirclePts) * Math.PI * 2;
      const px = Math.cos(angle) * waveR;
      const py = Math.sin(angle) * waveR;
      const pt = project3D(px, py, sliceT, cx, cy, scale, azimuth, elevation);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Center of ripple
    const sliceCenter = project3D(0, 0, sliceT, cx, cy, scale, azimuth, elevation);
    drawGlowingDot(ctx, sliceCenter.x, sliceCenter.y, colors.timeColor, 4.5);

    // Observer at Present Origin: (0,0,0)
    drawGlowingDot(ctx, origin.x, origin.y, colors.emeraldColor, 6);

    // Label Origin: "You Are Here (t = 0)"
    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.emeraldColor;
    ctx.fillText('YOU: HERE & NOW (t=0)', origin.x + 12, origin.y + 4);

    // Update Telemetry & Region Banner
    if (elSliceTime) elSliceTime.textContent = (sliceT >= 0 ? '+' : '') + sliceT.toFixed(2) + ' c·t';
    if (elWaveRadius) elWaveRadius.textContent = waveR.toFixed(2) + ' light-dist';

    if (elRegionBadge) {
      if (Math.abs(sliceT) < 0.05) {
        elRegionBadge.textContent = 'THE PRESENT: HERE & NOW';
        elRegionBadge.style.color = colors.emeraldColor;
      } else if (sliceT > 0) {
        elRegionBadge.textContent = 'CAUSAL FUTURE (Expanding Light Ripple: r = ct)';
        elRegionBadge.style.color = colors.timeColor;
      } else {
        elRegionBadge.textContent = 'CAUSAL PAST (Converging Light: r = c|t|)';
        elRegionBadge.style.color = colors.photonColor;
      }
    }
  }

  // --- Interaction & Drag Handling ---
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    azimuth += dx * 0.01;
    elevation = Math.max(-0.6, Math.min(1.2, elevation + dy * 0.01));

    if (sliderAzimuth) sliderAzimuth.value = azimuth.toFixed(2);
    if (sliderElevation) sliderElevation.value = elevation.toFixed(2);
    draw();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMouseX;
    const dy = e.touches[0].clientY - lastMouseY;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;

    azimuth += dx * 0.01;
    elevation = Math.max(-0.6, Math.min(1.2, elevation + dy * 0.01));
    draw();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Sliders
  if (sliderTime) {
    sliderTime.addEventListener('input', (e) => {
      sliceT = parseFloat(e.target.value);
      draw();
    });
  }

  if (sliderAzimuth) {
    sliderAzimuth.addEventListener('input', (e) => {
      azimuth = parseFloat(e.target.value);
      draw();
    });
  }

  if (sliderElevation) {
    sliderElevation.addEventListener('input', (e) => {
      elevation = parseFloat(e.target.value);
      draw();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      azimuth = 0.65;
      elevation = 0.38;
      sliceT = 0.4;
      if (sliderTime) sliderTime.value = 0.4;
      if (sliderAzimuth) sliderAzimuth.value = 0.65;
      if (sliderElevation) sliderElevation.value = 0.38;
      draw();
    });
  }

  draw();
  window.addEventListener('resize', draw);
  document.addEventListener('themeChanged', draw);
}


// ============================================================================
// SIMULATION 3: The Cosmic Horizon & Human Lifespan Simulator
// ============================================================================
export function initWidgetCosmicHorizon(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const sliderDist = container.querySelector('.slider-distance');
  const sliderAge = container.querySelector('.slider-age');
  const presetBtns = container.querySelectorAll('.preset-celestial');

  const elEventName = container.querySelector('.val-event-name');
  const elEventDist = container.querySelector('.val-event-dist');
  const elLightArrival = container.querySelector('.val-light-arrival');
  const elStatusBanner = container.querySelector('.banner-status');

  // State
  let eventDistLy = parseFloat(sliderDist ? sliderDist.value : 25) || 25; // light-years
  let eventName = 'Vega Flare (25 ly)';
  let currentAge = parseFloat(sliderAge ? sliderAge.value : 30) || 30;   // human age 0 to 80

  const maxDistView = 100; // max light years shown on diagram
  const lifespanMax = 80;  // 80 year human lifetime

  function updateStatus() {
    const arrivalAge = eventDistLy; // because light travels 1 ly per year!
    const colors = getThemeColors();

    if (elEventName) elEventName.textContent = eventName;
    if (elEventDist) elEventDist.textContent = eventDistLy.toFixed(1) + ' light-years';

    if (eventDistLy < 0.001) {
      if (elLightArrival) elLightArrival.textContent = '8.3 minutes';
    } else {
      if (elLightArrival) elLightArrival.textContent = arrivalAge.toFixed(1) + ' years';
    }

    if (elStatusBanner) {
      if (arrivalAge <= currentAge) {
        elStatusBanner.innerHTML = `<strong>★ IN YOUR PAST LIGHT CONE:</strong> Arrived when you were <strong>age ${arrivalAge.toFixed(1)}</strong>. You can see, photograph, and experience it right now.`;
        elStatusBanner.style.borderColor = colors.emeraldColor;
        elStatusBanner.style.backgroundColor = colors.emeraldSubtle;
        elStatusBanner.style.color = colors.emeraldColor;
      } else if (arrivalAge <= lifespanMax) {
        elStatusBanner.innerHTML = `<strong>⏳ EN ROUTE (Future Experience):</strong> Light is currently traveling through space. It will enter your light cone at <strong>age ${arrivalAge.toFixed(1)}</strong> (${(arrivalAge - currentAge).toFixed(1)} years from your current age).`;
        elStatusBanner.style.borderColor = colors.timeColor;
        elStatusBanner.style.backgroundColor = colors.timeColorSubtle;
        elStatusBanner.style.color = colors.timeColor;
      } else {
        const extraYears = arrivalAge - lifespanMax;
        elStatusBanner.innerHTML = `<strong>⛔ PERMANENTLY IN YOUR ELSEWHERE:</strong> Light will take <strong>${arrivalAge.toFixed(0)} years</strong> to reach Earth. Because human lifespan is ~80 years, you will never see or experience this event. Across your entire life, it exists beyond your horizon of causality.`;
        elStatusBanner.style.borderColor = colors.dangerColor;
        elStatusBanner.style.backgroundColor = colors.dangerSubtle;
        elStatusBanner.style.color = colors.dangerColor;
      }
    }
  }

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    const colors = getThemeColors();

    ctx.clearRect(0, 0, width, height);

    const ox = 70;
    const oy = height - 55;
    const graphW = width - ox - 40;
    const graphH = oy - 40;

    drawGrid(ctx, ox, oy, width, height, 40, colors.gridLine);

    // --- Shaded Regions ---
    // Region 1: Inside Human Lifespan Light Cone (0 to 80 ly and 0 to 80 yr)
    // 45° boundary: x = y (since 1 ly = 1 yr)
    const px80 = ox + (80 / maxDistView) * graphW;
    const py80 = oy - (80 / lifespanMax) * graphH;

    ctx.fillStyle = colors.emeraldSubtle;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px80, oy);
    ctx.lineTo(ox, py80);
    ctx.closePath();
    ctx.fill();

    // Region 2: The "Elsewhere" during human lifespan (Beyond the 45° light ray)
    ctx.fillStyle = colors.dangerSubtle;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px80, oy);
    ctx.lineTo(ox + graphW, oy);
    ctx.lineTo(ox + graphW, py80);
    ctx.lineTo(ox, py80);
    ctx.closePath();
    ctx.fill();

    // 45° Light Ray Boundary: Light traveling from Event (at t=0) to Earth
    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px80, py80);
    ctx.stroke();
    ctx.setLineDash([]);

    // 45° Label
    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.photonColor;
    ctx.fillText('Photon Path (45°: 1 ly / yr)', px80 * 0.45 + ox * 0.55 + 10, py80 * 0.5 + oy * 0.5 - 10);

    // Axes
    ctx.strokeStyle = colors.axisLine;
    ctx.lineWidth = 2;

    // Horizontal Axis (Distance from Earth in Light-Years)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + graphW + 20, oy);
    ctx.stroke();

    // Arrowhead X
    ctx.fillStyle = colors.axisArrow;
    ctx.beginPath();
    ctx.moveTo(ox + graphW + 20, oy - 4);
    ctx.lineTo(ox + graphW + 27, oy);
    ctx.lineTo(ox + graphW + 20, oy + 4);
    ctx.fill();

    // Vertical Axis (Time: Human Age in Years)
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy - graphH - 20);
    ctx.stroke();

    // Arrowhead Y
    ctx.beginPath();
    ctx.moveTo(ox - 4, oy - graphH - 20);
    ctx.lineTo(ox, oy - graphH - 27);
    ctx.lineTo(ox + 4, oy - graphH - 20);
    ctx.fill();

    // Axis Labels
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.spaceColor;
    ctx.fillText('Distance from Earth (Light-Years)', ox + graphW - 190, oy + 32);

    ctx.fillStyle = colors.timeColor;
    ctx.fillText('Time / Age (Years)', ox - 20, oy - graphH - 12);

    // Distance Ticks (0, 20, 40, 60, 80, 100 ly)
    ctx.font = '500 9.5px "JetBrains Mono", monospace';
    for (let d = 20; d <= 100; d += 20) {
      const tx = ox + (d / maxDistView) * graphW;
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, oy - 3);
      ctx.lineTo(tx, oy + 3);
      ctx.stroke();

      ctx.fillStyle = colors.subtleText;
      ctx.fillText(d + ' ly', tx - 14, oy + 18);
    }

    // Age Ticks (0, 20, 40, 60, 80 yr)
    for (let a = 20; a <= 80; a += 20) {
      const ty = oy - (a / lifespanMax) * graphH;
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox - 3, ty);
      ctx.lineTo(ox + 3, ty);
      ctx.stroke();

      ctx.fillStyle = colors.subtleText;
      ctx.fillText(a + ' yr', ox - 42, ty + 3);
    }

    // --- Earth Observer's Lifeline (x = 0 from 0 to 80 years) ---
    ctx.strokeStyle = colors.timeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, py80);
    ctx.stroke();

    // Current Age Marker on Lifeline
    const currentAgeY = oy - (currentAge / lifespanMax) * graphH;
    drawGlowingDot(ctx, ox, currentAgeY, colors.timeColor, 7);

    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.timeColor;
    ctx.fillText(`YOU: Age ${currentAge.toFixed(0)}`, ox + 14, currentAgeY + 4);

    // --- Event Placement at t = 0 (Today) ---
    const clampedDist = Math.min(eventDistLy, maxDistView);
    const eventX = ox + (clampedDist / maxDistView) * graphW;
    const eventY = oy; // Happened at t = 0

    // Draw Event Explosion Symbol
    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = colors.photonColor;
    drawGlowingDot(ctx, eventX, eventY, colors.photonColor, 6);

    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.photonColor;
    ctx.fillText(eventName, Math.min(eventX - 30, width - 150), eventY + 32);

    // --- Light Propagation Path from Event (d, 0) to Earth (0, d) ---
    const arrivalTime = eventDistLy; // arrival in years
    const arrivalY = oy - (Math.min(arrivalTime, lifespanMax) / lifespanMax) * graphH;

    ctx.strokeStyle = colors.photonColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eventX, eventY);
    if (arrivalTime <= lifespanMax) {
      // Reaches Earth within diagram height
      ctx.lineTo(ox, arrivalY);
      ctx.stroke();

      // Point of arrival on Earth lifeline
      drawGlowingDot(ctx, ox, arrivalY, colors.emeraldColor, 5.5);
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.emeraldColor;
      ctx.fillText(`Light arrives at age ${arrivalTime.toFixed(1)} yr`, ox + 14, arrivalY - 8);
    } else {
      // Exits top of diagram before reaching Earth!
      const interceptX = eventX - (graphH / ((arrivalTime / lifespanMax) * graphH)) * (eventX - ox);
      ctx.lineTo(interceptX, oy - graphH);
      ctx.stroke();

      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.dangerColor;
      ctx.fillText(`Light takes ${arrivalTime.toFixed(0)} yrs (Past 80-yr lifespan!)`, eventX - 80, oy - graphH + 18);
    }

    // Top Shading Legend Bar
    ctx.fillStyle = colors.pillBg;
    ctx.strokeStyle = colors.pillBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 12, width - 28, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.emeraldColor;
    ctx.fillText('■ Accessible within 80-yr Life (d ≤ 80 ly)', 24, 28);

    ctx.fillStyle = colors.dangerColor;
    ctx.fillText('■ Lifetime Elsewhere (d > 80 ly: Never Experienced)', width - 360, 28);
  }

  function renderAll() {
    updateStatus();
    draw();
  }

  // --- Listeners ---
  if (sliderDist) {
    sliderDist.addEventListener('input', (e) => {
      eventDistLy = parseFloat(e.target.value);
      eventName = `Custom Event (${eventDistLy.toFixed(1)} ly)`;
      renderAll();
    });
  }

  if (sliderAge) {
    sliderAge.addEventListener('input', (e) => {
      currentAge = parseFloat(e.target.value);
      renderAll();
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dist = parseFloat(btn.getAttribute('data-dist'));
      const name = btn.getAttribute('data-name') || btn.textContent.trim();
      if (!isNaN(dist)) {
        eventDistLy = dist;
        eventName = name;
        if (sliderDist) sliderDist.value = Math.min(dist, 100);
        renderAll();
      }
    });
  });

  renderAll();
  window.addEventListener('resize', renderAll);
  document.addEventListener('themeChanged', renderAll);
}

// Module export list for post-02-widgets.js
export default {
  initWidgetDualSpeedSpacetime,
  initWidget3DLightConeExplorer,
  initWidgetCosmicHorizon
};
