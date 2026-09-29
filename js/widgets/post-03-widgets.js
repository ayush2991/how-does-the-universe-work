/**
 * post-03-widgets.js
 * Interactive Explorable Widgets for Post 3: The Spacetime Loaf & Length Contraction
 * 100% Static, Serverless, Zero-Dependency. Works directly over file:// and any static host.
 */

import { setupRetinaCanvas, drawGrid, drawAxes, drawGlowingDot } from '../canvas-utils.js';

// ============================================================================
// Helper: 3D Axonometric Projection
// ============================================================================
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

function getThemeColors() {
  const isLight = document.documentElement.getAttribute('data-theme') !== 'dark';
  if (isLight) {
    return {
      isLight: true,
      gridLine: 'rgba(15, 23, 42, 0.06)',
      axisLine: '#334155',
      axisLabel: '#0f172a',
      timeColor: '#0284c7',
      timeColorSubtle: 'rgba(2, 132, 199, 0.12)',
      spaceColor: '#ea580c',
      spaceColorSubtle: 'rgba(234, 88, 12, 0.12)',
      invariantColor: '#7c3aed',
      pillBg: 'rgba(255, 255, 255, 0.95)',
      pillBorder: 'rgba(15, 23, 42, 0.12)',
      pillText: '#0f172a',
      slicePast: 'rgba(2, 132, 199, 0.04)',
      sliceFuture: 'rgba(124, 58, 237, 0.03)',
      stickFigure: '#0f172a'
    };
  } else {
    return {
      isLight: false,
      gridLine: 'rgba(255, 255, 255, 0.06)',
      axisLine: '#64748b',
      axisLabel: '#f8fafc',
      timeColor: '#38bdf8',
      timeColorSubtle: 'rgba(56, 189, 248, 0.2)',
      spaceColor: '#fb923c',
      spaceColorSubtle: 'rgba(251, 146, 60, 0.2)',
      invariantColor: '#a855f7',
      pillBg: 'rgba(14, 18, 26, 0.95)',
      pillBorder: 'rgba(255, 255, 255, 0.12)',
      pillText: '#f8fafc',
      slicePast: 'rgba(56, 189, 248, 0.05)',
      sliceFuture: 'rgba(168, 85, 247, 0.04)',
      stickFigure: '#f8fafc'
    };
  }
}

function drawLabelPill(ctx, text, x, y, options = {}) {
  const c = getThemeColors();
  const font = options.font || 'bold 11px "JetBrains Mono", monospace';
  const textColor = options.textColor || c.pillText;
  const bgColor = options.bgColor || c.pillBg;
  const borderColor = options.borderColor || c.pillBorder;
  const align = options.align || 'center';
  const padX = options.paddingX !== undefined ? options.paddingX : 6;
  const padY = options.paddingY !== undefined ? options.paddingY : 3;

  ctx.save();
  ctx.font = font;
  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;
  const textH = 11;
  const pillW = textW + padX * 2;
  const pillH = textH + padY * 2;

  let pillX = x;
  if (align === 'center') pillX = x - pillW / 2;
  else if (align === 'right') pillX = x - pillW;

  const pillY = y - pillH / 2;

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const r = 4;
  ctx.moveTo(pillX + r, pillY);
  ctx.lineTo(pillX + pillW - r, pillY);
  ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
  ctx.lineTo(pillX + pillW, pillY + pillH - r);
  ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
  ctx.lineTo(pillX + r, pillY + pillH);
  ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
  ctx.lineTo(pillX, pillY + r);
  ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pillX + padX, pillY + pillH / 2);
  ctx.restore();
}

/**
 * Draw a stylized 2D stick figure in 3D projection on spatial plane (x1, x2) at height t.
 */
function drawStickFigure3D(ctx, p3, x1, x2, t, color, alpha = 1.0, scaleMultiplier = 1.0, widthFactor = 1.0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.8 * scaleMultiplier;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = 0.28 * scaleMultiplier * widthFactor;
  const h = 0.32 * scaleMultiplier;

  // Key joints in 3D spacetime:
  const pFeet = p3(x1, x2, t);
  const pHips = p3(x1, x2 + h * 0.45, t);
  const pChest = p3(x1, x2 + h * 0.8, t);
  const pHead = p3(x1, x2 + h * 1.15, t);
  const pHandL = p3(x1 - w, x2 + h * 0.75, t);
  const pHandR = p3(x1 + w, x2 + h * 0.75, t);
  const pFootL = p3(x1 - w * 0.6, x2, t);
  const pFootR = p3(x1 + w * 0.6, x2, t);

  // Legs
  ctx.beginPath();
  ctx.moveTo(pFootL.x, pFootL.y);
  ctx.lineTo(pHips.x, pHips.y);
  ctx.lineTo(pFootR.x, pFootR.y);
  ctx.stroke();

  // Torso
  ctx.beginPath();
  ctx.moveTo(pHips.x, pHips.y);
  ctx.lineTo(pChest.x, pChest.y);
  ctx.stroke();

  // Arms / Measuring Rod
  ctx.beginPath();
  ctx.moveTo(pHandL.x, pHandL.y);
  ctx.lineTo(pChest.x, pChest.y);
  ctx.lineTo(pHandR.x, pHandR.y);
  ctx.stroke();

  // Highlight measuring rod between hands
  ctx.lineWidth = 2.4 * scaleMultiplier;
  ctx.beginPath();
  ctx.moveTo(pHandL.x, pHandL.y);
  ctx.lineTo(pHandR.x, pHandR.y);
  ctx.stroke();

  // Head
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const headRadius = Math.max(3, 4.5 * scaleMultiplier);
  ctx.arc(pHead.x, pHead.y, headRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// WIDGET 1: Alice at Rest in the Spacetime Loaf
// ============================================================================
export function initWidgetLoafAlice(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderTime = container.querySelector('.slider-time');
  const sliderOrbit = container.querySelector('.slider-orbit');
  const btnPlay = container.querySelector('.btn-play');
  const readoutTime = container.querySelector('.readout-alice-time');
  const valTime = container.querySelector('.val-time');

  let isPlaying = false;
  let timeVal = 3.0; // 0 to 6.0 seconds
  let azimuth = -35 * Math.PI / 180;
  const elevation = 25 * Math.PI / 180;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartAzimuth = azimuth;

  function update() {
    if (readoutTime) readoutTime.innerHTML = `${timeVal.toFixed(2)} <span>s</span>`;
    if (valTime) valTime.innerText = `t = ${timeVal.toFixed(2)} s`;
    draw();
  }

  function draw() {
    const c = getThemeColors();
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.50;
    const cy = height * 0.72;
    const scale = Math.min(width * 0.26, height * 0.40);

    const p3 = (x, y, z) => project3D(x, y, z, cx, cy, scale, azimuth, elevation);

    // 1. Ground Plane Grid (x1, x2) at t = 0
    ctx.strokeStyle = c.gridLine;
    ctx.lineWidth = 1;
    const gMin = -1.2, gMax = 1.2, gStep = 0.4;
    for (let gx = gMin; gx <= gMax + 0.01; gx += gStep) {
      const pStart = p3(gx, gMin, 0);
      const pEnd = p3(gx, gMax, 0);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }
    for (let gy = gMin; gy <= gMax + 0.01; gy += gStep) {
      const pS = p3(gMin, gy, 0);
      const pE = p3(gMax, gy, 0);
      ctx.beginPath();
      ctx.moveTo(pS.x, pS.y);
      ctx.lineTo(pE.x, pE.y);
      ctx.stroke();
    }

    // 2. Coordinate Axes
    const pOrigin = p3(0, 0, 0);
    const pX1 = p3(1.35, 0, 0);
    const pX2 = p3(0, 1.35, 0);
    const pZ = p3(0, 0, 1.45);

    ctx.strokeStyle = c.axisLine;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pOrigin.x, pOrigin.y);
    ctx.lineTo(pX1.x, pX1.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pOrigin.x, pOrigin.y);
    ctx.lineTo(pX2.x, pX2.y);
    ctx.stroke();

    ctx.strokeStyle = c.timeColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(pOrigin.x, pOrigin.y);
    ctx.lineTo(pZ.x, pZ.y);
    ctx.stroke();

    drawLabelPill(ctx, 'East (x₁)', pX1.x + 30, pX1.y + 4, { textColor: c.axisLabel });
    drawLabelPill(ctx, 'North (x₂)', pX2.x - 30, pX2.y + 12, { textColor: c.axisLabel });
    drawLabelPill(ctx, 'Time (ct)', pZ.x, pZ.y - 14, { textColor: c.timeColor });

    // 3. Cosmic Light Cone (45° Surface: x₁² + x₂² = (ct)²)
    const zConeMax = 1.35;
    const numRays = 16;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.40)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);

    // Radiating Light Rays from origin forming the 45° cone boundary
    for (let i = 0; i < numRays; i++) {
      const ang = (i / numRays) * Math.PI * 2;
      const rx = zConeMax * Math.cos(ang);
      const ry = zConeMax * Math.sin(ang);
      const pRayEnd = p3(rx, ry, zConeMax);
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      ctx.lineTo(pRayEnd.x, pRayEnd.y);
      ctx.stroke();
    }

    // Circular rim at the top of the light cone
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
      const ang = (i / 36) * Math.PI * 2;
      const ptRim = p3(zConeMax * Math.cos(ang), zConeMax * Math.sin(ang), zConeMax);
      if (i === 0) ctx.moveTo(ptRim.x, ptRim.y);
      else ctx.lineTo(ptRim.x, ptRim.y);
    }
    ctx.stroke();

    // Light Cone Label
    const pConeLabel = p3(zConeMax * 0.82, 0, zConeMax * 0.82);
    drawLabelPill(ctx, 'Light Cone (45°: v = c)', pConeLabel.x + 10, pConeLabel.y - 10, {
      textColor: '#d97706',
      font: 'bold 10px "JetBrains Mono", monospace'
    });

    // 4. Worldtube Rails (Vertical lines tracing Alice's hands and feet)
    const zMax = 1.35;
    ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);

    const railOffsets = [-0.28, 0, 0.28];
    railOffsets.forEach(ox => {
      const rBot = p3(ox, 0, 0);
      const rTop = p3(ox, 0, zMax);
      ctx.beginPath();
      ctx.moveTo(rBot.x, rBot.y);
      ctx.lineTo(rTop.x, rTop.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 5. Ghost Snapshots of Alice at fixed time intervals
    const tSnapshots = [0.1, 0.35, 0.6, 0.85, 1.1, 1.3];
    tSnapshots.forEach(ts => {
      const alpha = Math.abs((timeVal / 6.0) * 1.35 - ts) < 0.15 ? 0.9 : 0.25;
      drawStickFigure3D(ctx, p3, 0, 0, ts, c.timeColor, alpha, 1.0);
    });

    // 6. Alice's Slice of "Now" (Horizontal Plane)
    const currentZ = (timeVal / 6.0) * 1.35;
    const sliceR = 1.15;
    const pC1 = p3(-sliceR, -sliceR, currentZ);
    const pC2 = p3(sliceR, -sliceR, currentZ);
    const pC3 = p3(sliceR, sliceR, currentZ);
    const pC4 = p3(-sliceR, sliceR, currentZ);

    ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.10)' : 'rgba(56, 189, 248, 0.14)';
    ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(pC1.x, pC1.y);
    ctx.lineTo(pC2.x, pC2.y);
    ctx.lineTo(pC3.x, pC3.y);
    ctx.lineTo(pC4.x, pC4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Expanding circular light wavefront on Alice's slice of Now
    if (currentZ > 0.05) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const ang = (i / 36) * Math.PI * 2;
        const ptRing = p3(currentZ * Math.cos(ang), currentZ * Math.sin(ang), currentZ);
        if (i === 0) ctx.moveTo(ptRing.x, ptRing.y);
        else ctx.lineTo(ptRing.x, ptRing.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const pRingLabel = p3(currentZ * 0.707, currentZ * 0.707, currentZ);
      drawLabelPill(ctx, `Light Ripple (r = ct = ${timeVal.toFixed(2)} ls)`, pRingLabel.x + 8, pRingLabel.y + 12, {
        textColor: '#d97706',
        font: '9px "JetBrains Mono", monospace'
      });
    }

    // Active Stick Figure on the slice
    drawStickFigure3D(ctx, p3, 0, 0, currentZ, c.timeColor, 1.0, 1.1);

    // Slice Label & Past/Future indicator
    drawLabelPill(ctx, `Alice's Present: "Now" (t = ${timeVal.toFixed(2)} s)`, pC2.x - 20, pC2.y - 10, {
      textColor: c.timeColor
    });

    if (currentZ > 0.3) {
      const pPast = p3(0.85, -0.85, currentZ * 0.45);
      drawLabelPill(ctx, 'Alice’s Past (History)', pPast.x, pPast.y, {
        textColor: c.subtleText || '#64748b',
        font: '10px "JetBrains Mono", monospace'
      });
    }
    if (currentZ < 1.0) {
      const pFuture = p3(0.85, -0.85, currentZ + (1.35 - currentZ) * 0.55);
      drawLabelPill(ctx, 'Alice’s Future', pFuture.x, pFuture.y, {
        textColor: c.invariantColor,
        font: '10px "JetBrains Mono", monospace'
      });
    }
  }

  // Event Listeners
  if (sliderTime) {
    sliderTime.addEventListener('input', e => {
      timeVal = (parseFloat(e.target.value) / 600) * 6.0;
      update();
    });
  }

  if (sliderOrbit) {
    sliderOrbit.addEventListener('input', e => {
      azimuth = (parseFloat(e.target.value) * Math.PI) / 180;
      draw();
    });
  }

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartAzimuth = azimuth;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    azimuth = dragStartAzimuth + dx * 0.008;
    if (sliderOrbit) sliderOrbit.value = ((azimuth * 180) / Math.PI).toFixed(0);
    draw();
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch orbit
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartAzimuth = azimuth;
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartX;
    azimuth = dragStartAzimuth + dx * 0.008;
    draw();
  }, { passive: true });

  window.addEventListener('touchend', () => { isDragging = false; });

  // Autoplay
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      if (isPlaying) {
        let lastTime = performance.now();
        function loop(now) {
          if (!isPlaying) return;
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          timeVal = (timeVal + dt * 1.5) % 6.0;
          if (sliderTime) sliderTime.value = (timeVal / 6.0) * 600;
          update();
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
    });
  }

  window.addEventListener('resize', draw);
  update();
}

// ============================================================================
// WIDGET 2: Bob in Motion: Angling Across the Loaf
// ============================================================================
export function initWidgetLoafBob(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderSpeed = container.querySelector('.slider-speed');
  const sliderTime = container.querySelector('.slider-time');
  const sliderOrbit = container.querySelector('.slider-orbit');
  const btnPlay = container.querySelector('.btn-play');
  const readoutSpeed = container.querySelector('.readout-speed-val');
  const readoutBobSpeed = container.querySelector('.readout-bob-speed');
  const readoutAliceClock = container.querySelector('.readout-alice-clock');
  const readoutBobClock = container.querySelector('.readout-bob-clock');
  const readoutDisp = container.querySelector('.readout-bob-disp');
  const valTime = container.querySelector('.val-time');
  const chipButtons = container.querySelectorAll('.chip-speed');

  let isPlaying = false;
  let angleDeg = 60; // 0 to 90 degrees, matching Part 1
  let timeVal = 3.5; // 0 to 6.0s
  let azimuth = -35 * Math.PI / 180;
  const elevation = 25 * Math.PI / 180;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartAzimuth = azimuth;

  function update() {
    const rad = angleDeg * Math.PI / 180;
    const vFraction = Math.sin(rad);
    const vtFraction = Math.cos(rad);
    const aliceTime = timeVal;
    const bobTime = angleDeg === 90 ? 0.00 : timeVal * vtFraction;

    const tiltDeg = (Math.atan(vFraction) * 180) / Math.PI;

    if (readoutSpeed) {
      if (angleDeg === 90) {
        readoutSpeed.innerText = `θ = 90° (v = 1.000 c, Tilt = 45.0° [Light Cone])`;
      } else {
        readoutSpeed.innerText = `θ = ${angleDeg}° (v = ${vFraction.toFixed(3)} c, Tilt = ${tiltDeg.toFixed(1)}°)`;
      }
    }
    if (readoutBobSpeed) {
      if (angleDeg === 90) {
        readoutBobSpeed.innerText = `θ = 90° (Frozen: 0.00x)`;
      } else {
        readoutBobSpeed.innerText = `θ = ${angleDeg}° (${vtFraction.toFixed(2)}x Rate)`;
      }
    }
    if (readoutAliceClock) readoutAliceClock.innerHTML = `${aliceTime.toFixed(2)} <span>s</span>`;
    if (readoutBobClock) {
      readoutBobClock.innerHTML = `${bobTime.toFixed(2)} <span>s</span>`;
    }
    if (readoutDisp) {
      if (angleDeg === 90) {
        readoutDisp.innerText = `Time is completely frozen! cos(90°) = 0. Timeless photon traveling at c.`;
      } else {
        readoutDisp.innerText = `Ticks at cos(${angleDeg}°) = ${(vtFraction * 100).toFixed(1)}% rate (${bobTime.toFixed(2)} s elapsed).`;
      }
    }
    if (valTime) valTime.innerText = `t = ${timeVal.toFixed(2)} s`;

    const readoutComponents = container.querySelector('.readout-components');
    if (readoutComponents) {
      const curEast = (vFraction * timeVal).toFixed(2);
      const curTime = timeVal.toFixed(2);
      readoutComponents.innerHTML = `Bob's Components: East (x₁) = <strong>${curEast} ls</strong> | North (x₂) = <strong>0.00 ls</strong> | Time (ct) = <strong>${curTime} s</strong>`;
    }

    draw();
  }

  function draw() {
    const c = getThemeColors();
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const rad = angleDeg * Math.PI / 180;
    const vFraction = Math.sin(rad);

    const cx = width * 0.44;
    const cy = height * 0.72;
    const scale = Math.min(width * 0.26, height * 0.40);
    const p3 = (x, y, z) => project3D(x, y, z, cx, cy, scale, azimuth, elevation);

    // 1. Ground Grid
    ctx.strokeStyle = c.gridLine;
    ctx.lineWidth = 1;
    for (let gx = -1.2; gx <= 1.81; gx += 0.4) {
      const pS = p3(gx, -1.2, 0), pE = p3(gx, 1.2, 0);
      ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
    }
    for (let gy = -1.2; gy <= 1.21; gy += 0.4) {
      const pS = p3(-1.2, gy, 0), pE = p3(1.8, gy, 0);
      ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
    }

    // 2. Axes
    const pO = p3(0, 0, 0);
    const pX1 = p3(2.0, 0, 0);
    const pX2 = p3(0, 1.45, 0);
    const pZ = p3(0, 0, 1.45);

    // East (x1)
    ctx.strokeStyle = c.axisLine; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pX1.x, pX1.y); ctx.stroke();
    drawLabelPill(ctx, 'East (x₁)', pX1.x + 25, pX1.y, { textColor: c.axisLabel });

    // North (x2)
    ctx.strokeStyle = c.axisLine; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pX2.x, pX2.y); ctx.stroke();
    drawLabelPill(ctx, 'North (x₂)', pX2.x - 12, pX2.y + 16, { textColor: c.axisLabel });

    // Time (ct)
    ctx.strokeStyle = c.timeColor; ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pZ.x, pZ.y); ctx.stroke();
    drawLabelPill(ctx, 'Time (ct)', pZ.x, pZ.y - 12, { textColor: c.timeColor });

    const tiltRad = Math.atan(vFraction);
    const tiltDeg = (tiltRad * 180) / Math.PI;

    // 3. Spacetime Tilt Arc at Origin (Sweeps to Bob's Central Worldline)
    const bobColor = angleDeg === 90 ? '#facc15' : c.spaceColor;
    if (angleDeg > 0) {
      const arcR = 0.65;
      ctx.strokeStyle = bobColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      const numPts = 30;
      for (let ai = 0; ai <= numPts; ai++) {
        const aAng = (ai / numPts) * tiltRad;
        const ptArc = p3(arcR * Math.sin(aAng), 0, arcR * Math.cos(aAng));
        if (ai === 0) ctx.moveTo(ptArc.x, ptArc.y);
        else ctx.lineTo(ptArc.x, ptArc.y);
      }
      ctx.stroke();

      // Label Tilt in 3D
      const midAng = tiltRad * 0.5;
      const pLabel = p3((arcR + 0.18) * Math.sin(midAng), 0, (arcR + 0.18) * Math.cos(midAng));
      drawLabelPill(ctx, `Tilt: ${tiltDeg.toFixed(1)}°`, pLabel.x, pLabel.y, {
        textColor: angleDeg === 90 ? '#d97706' : c.spaceColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    // 4. Alice: Vertical Worldtube (Cyan)
    ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
    const aBot = p3(0, 0, 0), aTop = p3(0, 0, 1.35);
    ctx.beginPath(); ctx.moveTo(aBot.x, aBot.y); ctx.lineTo(aTop.x, aTop.y); ctx.stroke();
    ctx.setLineDash([]);
    // Alice snapshots with time badges
    [0.35, 0.85, 1.3].forEach(ts => {
      drawStickFigure3D(ctx, p3, 0, 0, ts, c.timeColor, 0.25, 0.85);
    });

    // Cosmic Light Cone Boundary Wall (45°: v = c)
    const zCone = 1.35;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([5, 3]);
    const pConeTop = p3(zCone, 0, zCone);
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pConeTop.x, pConeTop.y);
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabelPill(ctx, 'Light Cone Wall (45°: v = c)', pConeTop.x + 20, pConeTop.y + 8, {
      textColor: '#d97706',
      font: '9px "JetBrains Mono", monospace'
    });

    // 5. Bob: Slanted Worldtube (Outer rails dashed, Center Spine solid)
    const zMax = 1.35;

    // Outer boundary rails (dashed)
    ctx.strokeStyle = angleDeg === 90 ? 'rgba(250, 204, 21, 0.4)' : (c.isLight ? 'rgba(234, 88, 12, 0.35)' : 'rgba(251, 146, 60, 0.35)');
    ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
    [-0.24, 0.24].forEach(ox => {
      const bBot = p3(ox, 0, 0);
      const bTop = p3(ox + vFraction * zMax, 0, zMax);
      ctx.beginPath(); ctx.moveTo(bBot.x, bBot.y); ctx.lineTo(bTop.x, bTop.y); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Central Worldline Spine (Solid) - Unified path of Bob through spacetime!
    ctx.strokeStyle = bobColor;
    ctx.lineWidth = 2.4;
    const bCenterBot = p3(0, 0, 0);
    const bCenterTop = p3(vFraction * zMax, 0, zMax);
    ctx.beginPath();
    ctx.moveTo(bCenterBot.x, bCenterBot.y);
    ctx.lineTo(bCenterTop.x, bCenterTop.y);
    ctx.stroke();
    drawGlowingDot(ctx, bCenterTop.x, bCenterTop.y, bobColor, 5);

    // Bob ghost snapshots climbing diagonally through Alice's coordinates
    [0.35, 0.85, 1.3].forEach(ts => {
      const bx = vFraction * ts;
      const snapAliceT = (ts / 1.35) * 6.0;
      const snapBobT = angleDeg === 90 ? 0.0 : snapAliceT * Math.cos(rad);
      drawStickFigure3D(ctx, p3, bx, 0, ts, bobColor, 0.35, 0.85);
      
      // Clock badge on ghost snapshot
      const pSnap = p3(bx + 0.15, 0, ts);
      drawLabelPill(ctx, `τ=${snapBobT.toFixed(2)}s`, pSnap.x, pSnap.y, {
        textColor: bobColor,
        font: '9px "JetBrains Mono", monospace'
      });
    });

    // Current positions at scrubbed time
    const curZ = (timeVal / 6.0) * 1.35;
    const curBobX = vFraction * curZ;

    // 6. Bob's 3-Axis Component Projections
    const pActiveBob = p3(curBobX, 0, curZ);
    const pActiveAlice = p3(0, 0, curZ);
    const pGroundBob = p3(curBobX, 0, 0);
    const pTimeBob = p3(0, 0, curZ);

    // Vertical Drop Line to Ground (East axis)
    ctx.strokeStyle = c.isLight ? 'rgba(234, 88, 12, 0.45)' : 'rgba(251, 146, 60, 0.45)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pActiveBob.x, pActiveBob.y);
    ctx.lineTo(pGroundBob.x, pGroundBob.y);
    ctx.stroke();

    // Horizontal Projection to Time Axis
    ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(56, 189, 248, 0.45)';
    ctx.beginPath();
    ctx.moveTo(pActiveBob.x, pActiveBob.y);
    ctx.lineTo(pTimeBob.x, pTimeBob.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlighted East Component Segment along Ground
    ctx.strokeStyle = bobColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pGroundBob.x, pGroundBob.y);
    ctx.stroke();

    // Component Pins & Badges on Axes
    drawGlowingDot(ctx, pGroundBob.x, pGroundBob.y, bobColor, 4.5);
    drawGlowingDot(ctx, pTimeBob.x, pTimeBob.y, c.timeColor, 4.5);

    drawLabelPill(ctx, `x₁ = ${(vFraction * timeVal).toFixed(2)} ls`, pGroundBob.x + 8, pGroundBob.y + 16, {
      textColor: bobColor,
      font: 'bold 9px "JetBrains Mono", monospace'
    });
    drawLabelPill(ctx, `ct = ${timeVal.toFixed(2)} s`, pTimeBob.x - 30, pTimeBob.y - 12, {
      textColor: c.timeColor,
      font: 'bold 9px "JetBrains Mono", monospace'
    });
    drawLabelPill(ctx, 'x₂ = 0.00 ls', pO.x - 22, pO.y + 14, {
      textColor: c.subtleText || '#64748b',
      font: '9px "JetBrains Mono", monospace'
    });

    // Active figures at current scrubbed time
    drawStickFigure3D(ctx, p3, 0, 0, curZ, c.timeColor, 1.0, 1.0);
    drawStickFigure3D(ctx, p3, curBobX, 0, curZ, bobColor, 1.0, 1.0);

    // Explicit Clock Badges on the Active Figures
    drawLabelPill(ctx, `Alice: t = ${timeVal.toFixed(2)}s`, pActiveAlice.x - 30, pActiveAlice.y + 15, {
      textColor: c.timeColor,
      font: 'bold 10px "JetBrains Mono", monospace'
    });

    const activeBobTau = angleDeg === 90 ? 0.00 : timeVal * Math.cos(rad);
    drawLabelPill(ctx, angleDeg === 90 ? `Bob: τ = 0.00s (Frozen)` : `Bob: τ = ${activeBobTau.toFixed(2)}s`, pActiveBob.x + 35, pActiveBob.y + 15, {
      textColor: bobColor,
      font: 'bold 10px "JetBrains Mono", monospace'
    });

    if (angleDeg === 90) {
      drawGlowingDot(ctx, pActiveBob.x, pActiveBob.y, '#facc15', 9);
      // Explanatory note in viewport for θ = 90°
      const pNote = p3(0.7, -0.9, 1.35);
      drawLabelPill(ctx, '⚡ Photon Path (v=c): Alice measures Δt > 0, but Bob experiences τ = 0.00s everywhere (Timeless)', pNote.x, pNote.y, {
        textColor: '#d97706',
        font: 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif'
      });
    }

    // Labels
    drawLabelPill(ctx, 'Alice (At Rest: θ=0°)', aTop.x, aTop.y - 12, { textColor: c.timeColor });
    const bTopCenter = p3(vFraction * zMax, 0, zMax);
    const bobStatusText = angleDeg === 90 ? `Bob (θ=90°, v=c: Time Frozen)` : `Bob (θ=${angleDeg}°, v=${vFraction.toFixed(2)}c)`;
    drawLabelPill(ctx, bobStatusText, bTopCenter.x + 35, bTopCenter.y - 12, { textColor: bobColor });
  }

  // Controls
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', e => {
      angleDeg = parseInt(e.target.value, 10);
      chipButtons.forEach(b => b.classList.remove('active'));
      chipButtons.forEach(b => {
        if (parseInt(b.dataset.val, 10) === angleDeg) b.classList.add('active');
      });
      update();
    });
  }

  if (sliderTime) {
    sliderTime.addEventListener('input', e => {
      timeVal = (parseFloat(e.target.value) / 600) * 6.0;
      update();
    });
  }

  if (sliderOrbit) {
    sliderOrbit.addEventListener('input', e => {
      azimuth = (parseFloat(e.target.value) * Math.PI) / 180;
      draw();
    });
  }

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartAzimuth = azimuth;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    azimuth = dragStartAzimuth + dx * 0.008;
    if (sliderOrbit) sliderOrbit.value = ((azimuth * 180) / Math.PI).toFixed(0);
    draw();
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartAzimuth = azimuth;
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartX;
    azimuth = dragStartAzimuth + dx * 0.008;
    if (sliderOrbit) sliderOrbit.value = ((azimuth * 180) / Math.PI).toFixed(0);
    draw();
  }, { passive: true });

  window.addEventListener('touchend', () => { isDragging = false; });

  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chipButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      angleDeg = parseInt(btn.dataset.val, 10);
      if (sliderSpeed) sliderSpeed.value = angleDeg;
      update();
    });
  });

  // Autoplay
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      if (isPlaying) {
        let lastTime = performance.now();
        function loop(now) {
          if (!isPlaying) return;
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          timeVal = (timeVal + dt * 1.5) % 6.0;
          if (sliderTime) sliderTime.value = (timeVal / 6.0) * 600;
          update();
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
    });
  }

  window.addEventListener('resize', draw);
  update();
}

// ============================================================================
// WIDGET 3: Slicing the Loaf: The Angle of "Now"
// ============================================================================
export function initWidgetSimultaneitySlice(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderSpeed = container.querySelector('.slider-speed');
  const readoutSpeed = container.querySelector('.readout-speed-sim');
  const readoutTilt = container.querySelector('.readout-tilt-badge');
  const readoutDesync = container.querySelector('.readout-desync-val');
  const readoutDesyncText = container.querySelector('.readout-desync-text');
  const chipSpeeds = container.querySelectorAll('.chip-speed-sim');
  const chipModes = container.querySelectorAll('.chip-slice-mode');

  let vFraction = 0.60;
  let sliceMode = 'both'; // 'both', 'alice', 'bob'
  let azimuth = -35 * Math.PI / 180;
  const elevation = 25 * Math.PI / 180;

  function update() {
    const tiltDeg = (Math.atan(vFraction) * 180) / Math.PI;
    const deltaT = vFraction * 2.0; // distance Δx between beacons = 2.0

    if (readoutSpeed) readoutSpeed.innerText = `v = ${vFraction.toFixed(3)} c`;
    if (readoutTilt) readoutTilt.innerText = `Tilted by θ = ${tiltDeg.toFixed(1)}°`;
    if (readoutDesync) readoutDesync.innerHTML = `Δt = ${deltaT.toFixed(2)} <span>s</span>`;
    if (readoutDesyncText) {
      if (vFraction === 0) {
        readoutDesyncText.innerText = 'Both observers slice horizontally. No time desynchronization.';
      } else {
        readoutDesyncText.innerText = `Front beacon is in Alice's future (+${(deltaT/2).toFixed(2)}s); rear beacon is in Alice's past (-${(deltaT/2).toFixed(2)}s)!`;
      }
    }
    draw();
  }

  function draw() {
    const c = getThemeColors();
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.50;
    const cy = height * 0.68;
    const scale = Math.min(width * 0.28, height * 0.42);
    const p3 = (x, y, z) => project3D(x, y, z, cx, cy, scale, azimuth, elevation);

    // 1. Grid & Axes
    ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
    for (let gx = -1.4; gx <= 1.41; gx += 0.4) {
      const pS = p3(gx, -1.2, 0), pE = p3(gx, 1.2, 0);
      ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
    }
    for (let gy = -1.2; gy <= 1.21; gy += 0.4) {
      const pS = p3(-1.4, gy, 0), pE = p3(1.4, gy, 0);
      ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
    }

    const pO = p3(0, 0, 0), pX1 = p3(1.6, 0, 0), pZ = p3(0, 0, 1.4);
    ctx.strokeStyle = c.axisLine; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pX1.x, pX1.y); ctx.stroke();
    ctx.strokeStyle = c.timeColor; ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pZ.x, pZ.y); ctx.stroke();

    drawLabelPill(ctx, 'East (x₁)', pX1.x + 25, pX1.y, { textColor: c.axisLabel });
    drawLabelPill(ctx, 'Time (ct)', pZ.x, pZ.y - 12, { textColor: c.timeColor });

    // 2. Beacons (Front at +1.0, Rear at -1.0)
    const bDist = 1.0;
    const zBase = 0.65; // Alice's slice height
    const bRearGround = p3(-bDist, 0, 0);
    const bFrontGround = p3(bDist, 0, 0);

    // Vertical worldlines of beacons
    ctx.strokeStyle = c.isLight ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
    const bRearTop = p3(-bDist, 0, 1.3), bFrontTop = p3(bDist, 0, 1.3);
    ctx.beginPath(); ctx.moveTo(bRearGround.x, bRearGround.y); ctx.lineTo(bRearTop.x, bRearTop.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bFrontGround.x, bFrontGround.y); ctx.lineTo(bFrontTop.x, bFrontTop.y); ctx.stroke();
    ctx.setLineDash([]);

    // 3. Alice's Horizontal Slice (Cyan)
    if (sliceMode === 'both' || sliceMode === 'alice') {
      const sW = 1.3, sH = 0.9;
      const pa1 = p3(-sW, -sH, zBase);
      const pa2 = p3(sW, -sH, zBase);
      const pa3 = p3(sW, sH, zBase);
      const pa4 = p3(-sW, sH, zBase);

      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pa1.x, pa1.y); ctx.lineTo(pa2.x, pa2.y); ctx.lineTo(pa3.x, pa3.y); ctx.lineTo(pa4.x, pa4.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Alice's Beacon Events
      const pEvRearA = p3(-bDist, 0, zBase);
      const pEvFrontA = p3(bDist, 0, zBase);
      drawGlowingDot(ctx, pEvRearA.x, pEvRearA.y, c.timeColor, 5);
      drawGlowingDot(ctx, pEvFrontA.x, pEvFrontA.y, c.timeColor, 5);
      drawLabelPill(ctx, "Alice: 'Now' (t=2.5s)", pa2.x - 20, pa2.y - 10, { textColor: c.timeColor });
    }

    // 4. Bob's Tilted Slice (Amber)
    if (sliceMode === 'both' || sliceMode === 'bob') {
      const sW = 1.3, sH = 0.9;
      // Equation of Bob's slice: z(x) = zBase + vFraction * x
      const pb1 = p3(-sW, -sH, zBase - vFraction * sW);
      const pb2 = p3(sW, -sH, zBase + vFraction * sW);
      const pb3 = p3(sW, sH, zBase + vFraction * sW);
      const pb4 = p3(-sW, sH, zBase - vFraction * sW);

      ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.14)' : 'rgba(251, 146, 60, 0.18)';
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(pb1.x, pb1.y); ctx.lineTo(pb2.x, pb2.y); ctx.lineTo(pb3.x, pb3.y); ctx.lineTo(pb4.x, pb4.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Bob's Beacon Events
      const zRearBob = zBase - vFraction * bDist;
      const zFrontBob = zBase + vFraction * bDist;
      const pEvRearB = p3(-bDist, 0, zRearBob);
      const pEvFrontB = p3(bDist, 0, zFrontBob);

      drawGlowingDot(ctx, pEvRearB.x, pEvRearB.y, c.spaceColor, 5.5);
      drawGlowingDot(ctx, pEvFrontB.x, pEvFrontB.y, c.spaceColor, 5.5);

      // Desynchronization connector lines between Alice & Bob events
      if (sliceMode === 'both' && vFraction > 0.05) {
        ctx.strokeStyle = c.invariantColor;
        ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
        const pEvRearA = p3(-bDist, 0, zBase);
        const pEvFrontA = p3(bDist, 0, zBase);
        ctx.beginPath(); ctx.moveTo(pEvRearA.x, pEvRearA.y); ctx.lineTo(pEvRearB.x, pEvRearB.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pEvFrontA.x, pEvFrontA.y); ctx.lineTo(pEvFrontB.x, pEvFrontB.y); ctx.stroke();
        ctx.setLineDash([]);

        drawLabelPill(ctx, `+Δt/2 (Future)`, pEvFrontB.x + 40, pEvFrontB.y, { textColor: c.spaceColor, font: '10px "JetBrains Mono"' });
        drawLabelPill(ctx, `-Δt/2 (Past)`, pEvRearB.x - 40, pEvRearB.y, { textColor: c.spaceColor, font: '10px "JetBrains Mono"' });
      }

      drawLabelPill(ctx, `Bob: "Now" (Tilted by ${((Math.atan(vFraction)*180)/Math.PI).toFixed(0)}°)`, pb2.x - 20, pb2.y - 10, { textColor: c.spaceColor });
    }

    // Observer center avatars at origin
    drawStickFigure3D(ctx, p3, 0, 0, zBase, c.timeColor, 0.9, 0.9);
  }

  // Controls
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', e => {
      vFraction = parseFloat(e.target.value) / 1000;
      chipSpeeds.forEach(b => b.classList.remove('active'));
      update();
    });
  }

  chipSpeeds.forEach(btn => {
    btn.addEventListener('click', () => {
      chipSpeeds.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      vFraction = parseFloat(btn.dataset.val) / 1000;
      if (sliderSpeed) sliderSpeed.value = btn.dataset.val;
      update();
    });
  });

  chipModes.forEach(btn => {
    btn.addEventListener('click', () => {
      chipModes.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sliceMode = btn.dataset.mode;
      draw();
    });
  });

  window.addEventListener('resize', draw);
  update();
}

// ============================================================================
// WIDGET 4: The Oblique Slice & Length Contraction (Split View)
// ============================================================================
export function initWidgetLengthContraction(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderSpeed = container.querySelector('.slider-speed');
  const btnPlay = container.querySelector('.btn-play');
  const readoutSpeed = container.querySelector('.readout-speed-contract');
  const readoutGamma = container.querySelector('.readout-gamma-badge');
  const readoutLength = container.querySelector('.readout-contracted-length');
  const readoutPercent = container.querySelector('.readout-contracted-percent');
  const chipButtons = container.querySelectorAll('.chip-preset-contract');

  let isPlaying = false;
  let vFraction = 0.866;
  const azimuth = -35 * Math.PI / 180;
  const elevation = 25 * Math.PI / 180;

  function update() {
    const gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
    const contractedL = 10.0 / gamma;
    const pct = (100 / gamma).toFixed(1);

    if (readoutSpeed) readoutSpeed.innerText = `v = ${vFraction.toFixed(3)} c`;
    if (readoutGamma) readoutGamma.innerText = `γ = ${gamma.toFixed(2)}`;
    if (readoutLength) readoutLength.innerHTML = `${contractedL.toFixed(1)} <span>m</span>`;
    if (readoutPercent) readoutPercent.innerText = `Narrowed to ${pct}% along direction of motion.`;

    draw();
  }

  function draw() {
    const c = getThemeColors();
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
    const widthFactor = 1 / gamma;

    // Responsive Split Screen Layout
    // Left: 3D Spacetime Loaf (58% width), Right: Alice's 2D Measurement Retinal View (42% width)
    const isNarrow = width < 560;
    const splitX = isNarrow ? width : width * 0.58;

    // ==========================================
    // Pane 1: 3D Spacetime Loaf
    // ==========================================
    const cx3D = splitX * 0.48;
    const cy3D = height * 0.72;
    const scale3D = Math.min(splitX * 0.28, height * 0.42);
    const p3 = (x, y, z) => project3D(x, y, z, cx3D, cy3D, scale3D, azimuth, elevation);

    // 3D Grid
    ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
    for (let gx = -1.2; gx <= 1.21; gx += 0.4) {
      const pS = p3(gx, -1.0, 0), pE = p3(gx, 1.0, 0);
      ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
    }

    // Bob's Tilted Ribbon (Worldsheet of rest length L0 = 0.5 in canvas units)
    const L0_3D = 0.45;
    const zBase = 0.65;
    const zMax = 1.3;

    // Bob's ribbon corners from z=0 to z=zMax
    const r1 = p3(-L0_3D, 0, 0);
    const r2 = p3(L0_3D, 0, 0);
    const r3 = p3(L0_3D + vFraction * zMax, 0, zMax);
    const r4 = p3(-L0_3D + vFraction * zMax, 0, zMax);

    ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.12)' : 'rgba(251, 146, 60, 0.15)';
    ctx.strokeStyle = c.spaceColor; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(r3.x, r3.y); ctx.lineTo(r4.x, r4.y);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Alice's Horizontal Slice of Now cutting the ribbon
    const sSize = 1.1;
    const ps1 = p3(-sSize, -sSize * 0.7, zBase);
    const ps2 = p3(sSize, -sSize * 0.7, zBase);
    const ps3 = p3(sSize, sSize * 0.7, zBase);
    const ps4 = p3(-sSize, sSize * 0.7, zBase);

    ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.14)';
    ctx.strokeStyle = c.timeColor; ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ps1.x, ps1.y); ctx.lineTo(ps2.x, ps2.y); ctx.lineTo(ps3.x, ps3.y); ctx.lineTo(ps4.x, ps4.y);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);

    // Highlight the intersection cross-section (Alice's measured length of Bob)
    const bobXAtZ = vFraction * zBase;
    const cutL = L0_3D * widthFactor;
    const pCutL = p3(bobXAtZ - cutL, 0, zBase);
    const pCutR = p3(bobXAtZ + cutL, 0, zBase);

    ctx.strokeStyle = '#dc2626'; // Vivid red / highlight
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(pCutL.x, pCutL.y); ctx.lineTo(pCutR.x, pCutR.y); ctx.stroke();

    drawGlowingDot(ctx, pCutL.x, pCutL.y, '#dc2626', 4.5);
    drawGlowingDot(ctx, pCutR.x, pCutR.y, '#dc2626', 4.5);

    drawLabelPill(ctx, `Cut: L = ${(10 * widthFactor).toFixed(1)}m`, (pCutL.x + pCutR.x)/2, pCutL.y - 14, {
      textColor: '#dc2626'
    });
    drawLabelPill(ctx, '3D Spacetime Loaf Slice', splitX * 0.25, 25, { textColor: c.axisLabel });

    // ==========================================
    // Pane 2: Alice's Retinal View (2D Measurement)
    // ==========================================
    if (!isNarrow) {
      // Divider line
      ctx.strokeStyle = c.isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(splitX, 15); ctx.lineTo(splitX, height - 15); ctx.stroke();

      const rx = splitX + (width - splitX) * 0.5;
      const ry = height * 0.55;

      drawLabelPill(ctx, "Alice's Eye View (Measured in 2D)", rx, 25, { textColor: c.spaceColor });

      // Calibrated Metric Ruler
      const rulerW = (width - splitX) * 0.75;
      const rulerY = ry + 60;
      const rulerLeft = rx - rulerW / 2;
      const rulerRight = rx + rulerW / 2;

      ctx.fillStyle = c.isLight ? '#f1f5f9' : '#1e293b';
      ctx.strokeStyle = c.axisLine; ctx.lineWidth = 1.5;
      ctx.fillRect(rulerLeft, rulerY, rulerW, 22);
      ctx.strokeRect(rulerLeft, rulerY, rulerW, 22);

      // Tick marks 0 to 10 meters
      for (let m = 0; m <= 10; m++) {
        const tx = rulerLeft + (m / 10) * rulerW;
        ctx.beginPath();
        ctx.moveTo(tx, rulerY);
        ctx.lineTo(tx, rulerY + (m % 5 === 0 ? 12 : 6));
        ctx.stroke();

        if (m % 2 === 0) {
          ctx.fillStyle = c.subtleText || '#64748b';
          ctx.font = '9px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillText(`${m}m`, tx, rulerY + 20);
        }
      }

      // Draw Bob's Stick Figure directly facing the observer
      // Narrowed horizontally by widthFactor
      const figW = (rulerW * 0.5) * widthFactor; // At v=0, spans 10m (full width)
      const figH = 65; // Height unchanged!

      ctx.save();
      ctx.strokeStyle = c.spaceColor;
      ctx.fillStyle = c.spaceColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(rx, ry - figH + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(rx, ry - figH + 20);
      ctx.lineTo(rx, ry);
      ctx.stroke();

      // Arms holding the measuring rod
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(rx - figW / 2, ry - figH + 35);
      ctx.lineTo(rx + figW / 2, ry - figH + 35);
      ctx.stroke();

      // Hands
      drawGlowingDot(ctx, rx - figW / 2, ry - figH + 35, '#dc2626', 4);
      drawGlowingDot(ctx, rx + figW / 2, ry - figH + 35, '#dc2626', 4);

      // Legs
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = c.spaceColor;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - figW * 0.35, ry + 45);
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + figW * 0.35, ry + 45);
      ctx.stroke();

      // Projection calipers from rod to ruler
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(rx - figW / 2, ry - figH + 35);
      ctx.lineTo(rx - figW / 2, rulerY);
      ctx.moveTo(rx + figW / 2, ry - figH + 35);
      ctx.lineTo(rx + figW / 2, rulerY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, `Width = ${(10 * widthFactor).toFixed(1)} m`, rx, ry - figH - 12, {
        textColor: c.spaceColor
      });
      drawLabelPill(ctx, `Height = 1.8 m (Unchanged)`, rx, ry + 75, {
        textColor: c.timeColor, font: '10px "JetBrains Mono"'
      });
      ctx.restore();
    }
  }

  // Controls
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', e => {
      vFraction = parseFloat(e.target.value) / 1000;
      chipButtons.forEach(b => b.classList.remove('active'));
      update();
    });
  }

  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chipButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      vFraction = parseFloat(btn.dataset.val) / 1000;
      if (sliderSpeed) sliderSpeed.value = btn.dataset.val;
      update();
    });
  });

  // Autoplay
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      if (isPlaying) {
        let dir = 1;
        function loop() {
          if (!isPlaying) return;
          vFraction += dir * 0.005;
          if (vFraction >= 0.96) { vFraction = 0.96; dir = -1; }
          if (vFraction <= 0.02) { vFraction = 0.02; dir = 1; }
          if (sliderSpeed) sliderSpeed.value = vFraction * 1000;
          update();
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
    });
  }

  window.addEventListener('resize', draw);
  update();
}

// ============================================================================
// WIDGET 5: Mutual Relativity & Dual Frame Slicer
// ============================================================================
export function initWidgetDualFrame(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderSpeed = container.querySelector('.slider-speed');
  const chipFrames = container.querySelectorAll('.chip-frame-btn');
  const readoutFrameBadge = container.querySelector('.readout-frame-badge');
  const readoutFrameTitle = container.querySelector('.readout-frame-title');
  const readoutFrameSub = container.querySelector('.readout-frame-sub');
  const readoutMeasured = container.querySelector('.readout-dual-measured');
  const readoutDualNote = container.querySelector('.readout-dual-note');
  const readoutDualSpeed = container.querySelector('.readout-dual-speed');

  let activeFrame = 'alice'; // 'alice' or 'bob'
  let vFraction = 0.866;

  function update() {
    const gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
    const contracted = (10.0 / gamma).toFixed(1);

    if (readoutDualSpeed) readoutDualSpeed.innerText = `v = ${vFraction.toFixed(3)} c (γ = ${gamma.toFixed(2)})`;
    if (readoutMeasured) readoutMeasured.innerHTML = `${contracted} <span>m</span>`;

    if (activeFrame === 'alice') {
      if (readoutFrameBadge) readoutFrameBadge.innerText = "Alice's Frame";
      if (readoutFrameTitle) readoutFrameTitle.innerText = "Alice at Rest";
      if (readoutFrameSub) readoutFrameSub.innerText = "Alice's worldtube is vertical; her slice of Now is horizontal.";
      if (readoutDualNote) readoutDualNote.innerText = `Bob's 10.0 m rod appears shortened to ${contracted} m.`;
    } else {
      if (readoutFrameBadge) readoutFrameBadge.innerText = "Bob's Frame";
      if (readoutFrameTitle) readoutFrameTitle.innerText = "Bob at Rest";
      if (readoutFrameSub) readoutFrameSub.innerText = "Bob's worldtube is vertical; his slice of Now is horizontal.";
      if (readoutDualNote) readoutDualNote.innerText = `Alice's 10.0 m rod appears shortened to ${contracted} m.`;
    }

    draw();
  }

  function draw() {
    const c = getThemeColors();
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
    const widthFactor = 1 / gamma;

    const ox = width * 0.50;
    const oy = height * 0.80;
    const scale = Math.min(width * 0.38, height * 0.65);

    // Grid & Axes
    ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
    for (let x = -scale; x <= scale; x += scale * 0.25) {
      ctx.beginPath(); ctx.moveTo(ox + x, 25); ctx.lineTo(ox + x, oy); ctx.stroke();
    }
    for (let y = 0; y <= scale; y += scale * 0.25) {
      ctx.beginPath(); ctx.moveTo(ox - scale, oy - y); ctx.lineTo(ox + scale, oy - y); ctx.stroke();
    }

    ctx.strokeStyle = c.axisLine; ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.moveTo(ox - scale - 15, oy); ctx.lineTo(ox + scale + 15, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy + 10); ctx.lineTo(ox, 25); ctx.stroke();

    drawLabelPill(ctx, 'Space (x)', ox + scale + 2, oy + 18, { textColor: c.axisLabel });
    drawLabelPill(ctx, 'Time (ct)', ox - 35, 20, { textColor: c.timeColor });

    // Primary Observer (At Rest at center)
    const primaryColor = activeFrame === 'alice' ? c.timeColor : c.spaceColor;
    const primaryName = activeFrame === 'alice' ? 'Alice' : 'Bob';

    // Stationary Worldsheet (Vertical Ribbon)
    const rW = 28;
    ctx.fillStyle = activeFrame === 'alice' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(234, 88, 12, 0.14)';
    ctx.strokeStyle = primaryColor; ctx.lineWidth = 1.8;
    ctx.fillRect(ox - rW/2, oy - scale * 0.9, rW, scale * 0.9);
    ctx.strokeRect(ox - rW/2, oy - scale * 0.9, rW, scale * 0.9);

    drawLabelPill(ctx, `${primaryName} at Rest (L₀ = 10m)`, ox, oy - scale * 0.95, { textColor: primaryColor });

    // Secondary Moving Observer (Tilted Ribbon)
    const secondaryColor = activeFrame === 'alice' ? c.spaceColor : c.timeColor;
    const secondaryName = activeFrame === 'alice' ? 'Bob' : 'Alice';
    const direction = activeFrame === 'alice' ? 1 : -1; // Moving right for Bob, left for Alice

    const tiltX = direction * vFraction * (scale * 0.9);
    ctx.fillStyle = activeFrame === 'alice' ? 'rgba(234, 88, 12, 0.14)' : 'rgba(2, 132, 199, 0.12)';
    ctx.strokeStyle = secondaryColor; ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(ox - rW/2, oy);
    ctx.lineTo(ox + rW/2, oy);
    ctx.lineTo(ox + tiltX + rW/2, oy - scale * 0.9);
    ctx.lineTo(ox + tiltX - rW/2, oy - scale * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    drawLabelPill(ctx, `${secondaryName} in Motion (Speed ${vFraction.toFixed(2)}c)`, ox + tiltX, oy - scale * 0.95, { textColor: secondaryColor });

    // Horizontal Slice of "Now" taken by Primary Observer
    const sliceY = oy - scale * 0.5;
    ctx.strokeStyle = primaryColor; ctx.lineWidth = 2.0; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(ox - scale, sliceY); ctx.lineTo(ox + scale, sliceY); ctx.stroke();
    ctx.setLineDash([]);

    // Highlight the contracted cross section
    const cutCenterX = ox + direction * vFraction * (scale * 0.5);
    const cutW = rW * widthFactor;

    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cutCenterX - cutW/2, sliceY);
    ctx.lineTo(cutCenterX + cutW/2, sliceY);
    ctx.stroke();

    drawGlowingDot(ctx, cutCenterX - cutW/2, sliceY, '#dc2626', 4);
    drawGlowingDot(ctx, cutCenterX + cutW/2, sliceY, '#dc2626', 4);

    drawLabelPill(ctx, `Contracted: ${(10 * widthFactor).toFixed(1)}m`, cutCenterX, sliceY - 14, { textColor: '#dc2626' });
  }

  // Controls
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', e => {
      vFraction = parseFloat(e.target.value) / 1000;
      update();
    });
  }

  chipFrames.forEach(btn => {
    btn.addEventListener('click', () => {
      chipFrames.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFrame = btn.dataset.frame;
      update();
    });
  });

  window.addEventListener('resize', draw);
  update();
}

// ============================================================================
// WIDGET 6: The Muon's Cockpit: Two Sides of the Same Coin
// ============================================================================
export function initWidgetMuonContraction(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderAltitude = container.querySelector('.slider-altitude');
  const btnPlay = container.querySelector('.btn-play');
  const chipViews = container.querySelectorAll('.chip-muon-view');
  const readoutDistBadge = container.querySelector('.readout-muon-dist-badge');
  const readoutDist = container.querySelector('.readout-muon-dist');
  const readoutDistSub = container.querySelector('.readout-muon-dist-sub');
  const readoutClock = container.querySelector('.readout-muon-clock-val');
  const readoutClockSub = container.querySelector('.readout-muon-clock-sub');
  const readoutDescent = container.querySelector('.readout-descent-val');

  let activeView = 'earth'; // 'earth' or 'muon'
  let descentProgress = 0.50; // 0 (start at 10km) to 1.0 (sea level ground)
  let isPlaying = false;

  function update() {
    const gamma = 22.36; // for v = 0.999c
    const fullDistKm = activeView === 'earth' ? 10.0 : 0.447;
    const currentDist = (1 - descentProgress) * fullDistKm;
    const elapsedMuonUs = descentProgress * 1.50; // Total 1.50 us to ground in muon's frame

    if (activeView === 'earth') {
      if (readoutDistBadge) readoutDistBadge.innerText = 'Earth Frame';
      if (readoutDist) readoutDist.innerHTML = `10.0 <span>km</span>`;
      if (readoutDistSub) readoutDistSub.innerText = 'Standard atmospheric depth measured from ground.';
      if (readoutClock) readoutClock.innerHTML = `${elapsedMuonUs.toFixed(2)} <span>µs</span>`;
      if (readoutClockSub) readoutClockSub.innerText = 'Earth clock ticks 33 µs; dilated muon clock ticks only 1.50 µs!';
      if (readoutDescent) readoutDescent.innerText = `Altitude: ${(10.0 - descentProgress * 10.0).toFixed(1)} km`;
    } else {
      if (readoutDistBadge) readoutDistBadge.innerText = 'Muon Cockpit';
      if (readoutDist) readoutDist.innerHTML = `447 <span>m</span>`;
      if (readoutDistSub) readoutDistSub.innerText = 'Atmosphere contracted by 22.4x along direction of motion!';
      if (readoutClock) readoutClock.innerHTML = `${elapsedMuonUs.toFixed(2)} <span>µs</span>`;
      if (readoutClockSub) readoutClockSub.innerText = 'Muon clock ticks at standard 1.0x speed. Easily crosses 447m!';
      if (readoutDescent) readoutDescent.innerText = `Remaining Depth: ${((1 - descentProgress) * 447).toFixed(0)} m`;
    }

    draw();
  }

  function draw() {
    const c = getThemeColors();
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 40;
    const padRight = width - 40;
    const groundY = height * 0.82;
    const topY = height * 0.18;

    // Background Atmosphere Column
    const atmoTopY = activeView === 'earth' ? topY : height * 0.60;
    const atmoHeight = groundY - atmoTopY;

    // Atmosphere Gradient
    const atmoGrad = ctx.createLinearGradient(0, atmoTopY, 0, groundY);
    atmoGrad.addColorStop(0, c.isLight ? 'rgba(2, 132, 199, 0.05)' : 'rgba(56, 189, 248, 0.06)');
    atmoGrad.addColorStop(1, c.isLight ? 'rgba(2, 132, 199, 0.22)' : 'rgba(56, 189, 248, 0.25)');

    ctx.fillStyle = atmoGrad;
    ctx.fillRect(padLeft + 80, atmoTopY, (padRight - padLeft) - 160, atmoHeight);
    ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padLeft + 80, atmoTopY, (padRight - padLeft) - 160, atmoHeight);

    // Ground Line
    ctx.strokeStyle = c.axisLine; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(padLeft, groundY); ctx.lineTo(padRight, groundY); ctx.stroke();
    drawLabelPill(ctx, 'Earth Surface (Detectors)', width * 0.5, groundY + 16, { textColor: c.axisLabel });

    // Atmosphere Top Line
    ctx.strokeStyle = c.timeColor; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(padLeft, atmoTopY); ctx.lineTo(padRight, atmoTopY); ctx.stroke();
    ctx.setLineDash([]);

    const topLabel = activeView === 'earth' ? 'Atmosphere Boundary (10.0 km)' : 'Contracted Atmosphere (447 m)';
    drawLabelPill(ctx, topLabel, width * 0.5, atmoTopY - 14, { textColor: c.timeColor });

    // Muon Position
    const muonY = atmoTopY + descentProgress * atmoHeight;
    const muonX = width * 0.5;

    // Muon particle with energy trail
    ctx.strokeStyle = c.spaceColor; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(muonX, atmoTopY); ctx.lineTo(muonX, muonY); ctx.stroke();

    drawGlowingDot(ctx, muonX, muonY, c.spaceColor, 7);

    // Muon Info Pill
    const muonLabel = activeView === 'earth' ? 'Muon (Dilated: ticks 22x slower)' : 'Muon (At rest: clock ticks 1.0x)';
    drawLabelPill(ctx, muonLabel, muonX + 75, muonY, { textColor: c.spaceColor });
  }

  // Controls
  if (sliderAltitude) {
    sliderAltitude.addEventListener('input', e => {
      descentProgress = parseFloat(e.target.value) / 1000;
      update();
    });
  }

  chipViews.forEach(btn => {
    btn.addEventListener('click', () => {
      chipViews.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeView = btn.dataset.view;
      update();
    });
  });

  // Autoplay
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      if (isPlaying) {
        let lastTime = performance.now();
        function loop(now) {
          if (!isPlaying) return;
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          descentProgress = (descentProgress + dt * 0.25) % 1.0;
          if (sliderAltitude) sliderAltitude.value = descentProgress * 1000;
          update();
          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
    });
  }

  window.addEventListener('resize', draw);
  update();
}
