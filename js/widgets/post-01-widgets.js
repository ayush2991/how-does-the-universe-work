/**
 * post-01-widgets.js
 * Interactive Explorable Widgets for Post 1: Why Motion Through Space Affects Time
 */

import { setupRetinaCanvas, drawGrid, drawAxes, drawConstraintArc, drawGlowingDot } from '../canvas-utils.js';

// ============================================================================
// WIDGET 1: Two Cars on a 2D Grid
// ============================================================================
export function initWidgetCars(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderTime = container.querySelector('.slider-time');
  const sliderAngle = container.querySelector('.slider-angle');
  const btnPlay = container.querySelector('.btn-play');
  const timeVal = container.querySelector('.val-time');
  const angleVal = container.querySelector('.val-angle');
  const readoutVx = container.querySelector('.readout-vx');
  const readoutVy = container.querySelector('.readout-vy');

  let isPlaying = false;
  let progress = 0.6; // 0 to 1
  let angleDeg = 60; // 0 to 90 degrees
  let lastTimestamp = 0;

  function updateReadouts() {
    const rad = angleDeg * Math.PI / 180;
    const vx = 60 * Math.sin(rad);
    const vy = 60 * Math.cos(rad);
    if (timeVal) timeVal.innerText = `${(progress * 1.0).toFixed(2)} hr`;
    if (angleVal) angleVal.innerText = `${angleDeg}°`;
    if (readoutVx) readoutVx.innerText = `${vx.toFixed(1)} mph`;
    if (readoutVy) readoutVy.innerText = `${vy.toFixed(1)} mph`;
  }

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const ox = width * 0.22;
    const oy = height * 0.82;
    const scale = Math.min(width * 0.58, height * 0.68);

    drawGrid(ctx, ox, oy, width, height, 32);
    drawConstraintArc(ctx, ox, oy, scale, '#222f46');
    drawAxes(ctx, ox, oy, width, height, 'East (x₁)', 'North (x₂)');

    const rad = angleDeg * Math.PI / 180;

    // Car 1: Pure North
    const c1_x = ox;
    const c1_y = oy - (progress * scale);

    // Car 2: Angled
    const c2_x = ox + (progress * scale * Math.sin(rad));
    const c2_y = oy - (progress * scale * Math.cos(rad));

    // Car 2 Projection Lines
    if (progress > 0.05) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      // Horizontal to North axis
      ctx.beginPath();
      ctx.moveTo(c2_x, c2_y);
      ctx.lineTo(ox, c2_y);
      ctx.stroke();
      // Vertical to East axis
      ctx.beginPath();
      ctx.moveTo(c2_x, c2_y);
      ctx.lineTo(c2_x, oy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Worldline 1 (Blue Car)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(c1_x, c1_y);
    ctx.stroke();

    // Worldline 2 (Orange Car)
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(c2_x, c2_y);
    ctx.stroke();

    // Northward Lag Indicator
    if (progress > 0.15 && c2_y > c1_y + 10) {
      const lagX = ox + 45;
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lagX, c1_y);
      ctx.lineTo(lagX, c2_y);
      ctx.stroke();
      // Arrowheads
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(lagX, c1_y, 2.5, 0, Math.PI * 2);
      ctx.arc(lagX, c2_y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 10px var(--font-sans)';
      ctx.fillText('Northward Lag', lagX + 8, (c1_y + c2_y) / 2 + 3);
    }

    // Heads
    drawGlowingDot(ctx, c1_x, c1_y, '#38bdf8', 6);
    drawGlowingDot(ctx, c2_x, c2_y, '#fb923c', 6);

    ctx.font = 'bold 11px var(--font-sans)';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Car 1 (North)', c1_x - 35, c1_y - 12);
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`Car 2 (${angleDeg}°)`, c2_x + 10, c2_y + 4);
  }

  function loop(now) {
    if (!lastTimestamp) lastTimestamp = now;
    const dt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    if (isPlaying) {
      progress += dt * 0.25;
      if (progress > 1.0) progress = 0;
      if (sliderTime) sliderTime.value = progress * 1000;
      updateReadouts();
    }

    draw();
    requestAnimationFrame(loop);
  }

  if (sliderTime) {
    sliderTime.addEventListener('input', (e) => {
      progress = e.target.value / 1000;
      updateReadouts();
    });
  }

  if (sliderAngle) {
    sliderAngle.addEventListener('input', (e) => {
      angleDeg = parseInt(e.target.value);
      updateReadouts();
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
    });
  }

  updateReadouts();
  requestAnimationFrame(loop);
}


// ============================================================================
// WIDGET 2: Motion Purely Through Time (At Rest)
// ============================================================================
export function initWidgetStationary(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderTime = container.querySelector('.slider-time');
  const btnPlay = container.querySelector('.btn-play');
  const clockDisplay = container.querySelector('.clock-val');

  let isPlaying = false;
  let animTime = 3.5; // 0 to 6 seconds
  let lastTimestamp = 0;

  function update() {
    if (clockDisplay) clockDisplay.innerHTML = `${animTime.toFixed(2)} <span>s</span>`;
  }

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const ox = width * 0.35;
    const oy = height * 0.82;
    const scale = Math.min(width * 0.5, height * 0.68);
    const progress = animTime / 6.0;

    drawGrid(ctx, ox, oy, width, height, 32);
    drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

    const currY = oy - (progress * scale);

    // Static marker on space axis (x = 0)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '600 11px var(--font-mono)';
    ctx.fillText('x = 0 (No spatial movement)', ox + 10, oy + 18);

    // Worldline straight up
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, currY);
    ctx.stroke();

    drawGlowingDot(ctx, ox, currY, '#38bdf8', 7);

    // Observer Badge
    ctx.font = 'bold 11px var(--font-sans)';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Observer at Rest', ox - 110, currY - 5);
  }

  function loop(now) {
    if (!lastTimestamp) lastTimestamp = now;
    const dt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    if (isPlaying) {
      animTime += dt * 1.5;
      if (animTime > 6.0) animTime = 0;
      if (sliderTime) sliderTime.value = (animTime / 6.0) * 1000;
      update();
    }

    draw();
    requestAnimationFrame(loop);
  }

  if (sliderTime) {
    sliderTime.addEventListener('input', (e) => {
      animTime = (e.target.value / 1000) * 6.0;
      update();
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
    });
  }

  update();
  requestAnimationFrame(loop);
}


// ============================================================================
// WIDGET 3: The Thought Experiment (Space vs. Time Trade-Off)
// ============================================================================
export function initWidgetTradeoff(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderSpeed = container.querySelector('.slider-speed');
  const sliderTime = container.querySelector('.slider-time');
  const btnPlay = container.querySelector('.btn-play');
  const timeVal = container.querySelector('.val-time');
  const readoutVx = container.querySelector('.readout-vx');
  const readoutVt = container.querySelector('.readout-vt');

  let speedFraction = sliderSpeed ? parseFloat(sliderSpeed.value) / 1000 : 0.866;
  let progress = sliderTime ? parseFloat(sliderTime.value) / 1000 : 0.70;
  let isPlaying = false;
  let lastTimestamp = null;
  let animFrame = null;

  function update() {
    const vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
    if (readoutVx) readoutVx.innerText = `${(speedFraction * 100).toFixed(1)}% of V`;
    if (readoutVt) readoutVt.innerText = `${(vt * 100).toFixed(1)}% of V`;
    if (timeVal) timeVal.innerText = `${(progress * 100).toFixed(0)}%`;
  }

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const ox = width * 0.25;
    const oy = height * 0.82;
    const scale = Math.min(width * 0.58, height * 0.68);

    drawGrid(ctx, ox, oy, width, height, 32);
    // Constraint arc removed for clarity
    drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

    const vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
    const tipX = ox + (progress * scale * speedFraction);
    const tipY = oy - (progress * scale * vt);

    // Projections
    if (progress > 0.05) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(ox, tipY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX, oy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Motion Vector
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    drawGlowingDot(ctx, tipX, tipY, '#a855f7', 6.5);

    // Component Indicators
    ctx.font = '600 11px var(--font-mono)';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`v_time = ${(vt * 100).toFixed(0)}%`, ox - 95, tipY + 4);
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`v_space = ${(speedFraction * 100).toFixed(0)}%`, tipX - 30, oy + 18);
  }

  function loop(now) {
    if (!lastTimestamp) lastTimestamp = now;
    const dt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    if (isPlaying) {
      progress += dt * 0.25;
      if (progress > 1.0) progress = 0;
      if (sliderTime) sliderTime.value = progress * 1000;
      update();
    }
    draw();
    if (isPlaying) {
      animFrame = requestAnimationFrame(loop);
    }
  }

  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', (e) => {
      speedFraction = e.target.value / 1000;
      update();
      draw();
    });
  }

  if (sliderTime) {
    sliderTime.addEventListener('input', (e) => {
      progress = e.target.value / 1000;
      update();
      draw();
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      if (isPlaying) {
        lastTimestamp = null;
        animFrame = requestAnimationFrame(loop);
      } else if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    });
  }

  update();
  draw();
  window.addEventListener('resize', draw);
}


// ============================================================================
// WIDGET 4: Time Dilation & Live Twin Clocks
// ============================================================================
export function initWidgetTimeDilation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderSpeed = container.querySelector('.slider-speed');
  const sliderTime = container.querySelector('.slider-time');
  const btnPlay = container.querySelector('.btn-play');
  const clockEarth = container.querySelector('.clock-earth');
  const clockRocket = container.querySelector('.clock-rocket');
  const readoutSpeed = container.querySelector('.readout-speed');
  const readoutMath = container.querySelector('.readout-math');
  const readoutGamma = container.querySelector('.readout-gamma');
  const presetChips = container.querySelectorAll('.chip-preset');

  let isPlaying = false;
  let animTime = 0.0; // 0 to 6.0 sec
  let speedFraction = 0.866; // v/c
  let lastTimestamp = 0;

  function update() {
    const vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
    const gamma = vt > 0 ? (1 / vt) : Infinity;

    if (readoutSpeed) readoutSpeed.innerText = `v = ${speedFraction.toFixed(3)} c`;
    if (readoutMath) readoutMath.innerText = `${vt.toFixed(3)} c`;
    if (readoutGamma) readoutGamma.innerText = gamma === Infinity ? '∞' : gamma.toFixed(2);

    const earthSec = animTime;
    const rocketSec = animTime * vt;
    if (clockEarth) clockEarth.innerHTML = `${earthSec.toFixed(2)} <span>s</span>`;
    if (clockRocket) clockRocket.innerHTML = `${rocketSec.toFixed(2)} <span>s</span>`;
  }

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const ox = width * 0.22;
    const oy = height * 0.82;
    const scale = Math.min(width * 0.58, height * 0.68);
    const progress = animTime / 6.0;

    drawGrid(ctx, ox, oy, width, height, 32);
    drawConstraintArc(ctx, ox, oy, scale, '#27344d');
    drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (ct)');

    const vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));

    // Earth Observer (Rest)
    const e_x = ox;
    const e_y = oy - (progress * scale);

    // Rocket Observer (Moving)
    const r_x = ox + (progress * scale * speedFraction);
    const r_y = oy - (progress * scale * vt);

    // Projections
    if (progress > 0.05) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(r_x, r_y);
      ctx.lineTo(ox, r_y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r_x, r_y);
      ctx.lineTo(r_x, oy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Worldline Earth
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(e_x, e_y);
    ctx.stroke();

    // Worldline Rocket
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(r_x, r_y);
    ctx.stroke();

    drawGlowingDot(ctx, e_x, e_y, '#38bdf8', 6);
    drawGlowingDot(ctx, r_x, r_y, '#fb923c', 6);

    ctx.font = 'bold 11px var(--font-sans)';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Earth (Rest)', e_x - 30, e_y - 12);
    ctx.fillStyle = '#fb923c';
    ctx.fillText('Rocket', r_x + 10, r_y + 4);
  }

  function loop(now) {
    if (!lastTimestamp) lastTimestamp = now;
    const dt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    if (isPlaying) {
      animTime += dt * 1.5;
      if (animTime > 6.0) animTime = 0;
      if (sliderTime) sliderTime.value = (animTime / 6.0) * 1000;
      update();
    }

    draw();
    requestAnimationFrame(loop);
  }

  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', (e) => {
      speedFraction = e.target.value / 1000;
      presetChips.forEach(c => c.classList.remove('active'));
      update();
    });
  }

  if (sliderTime) {
    sliderTime.addEventListener('input', (e) => {
      animTime = (e.target.value / 1000) * 6.0;
      update();
    });
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = parseFloat(chip.dataset.val);
      speedFraction = val;
      if (sliderSpeed) sliderSpeed.value = val * 1000;
      update();
    });
  });

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
    });
  }

  update();
  requestAnimationFrame(loop);
}


// ============================================================================
// WIDGET 5: The Cosmic Speed Limit & Timeless Photon
// ============================================================================
export function initWidgetSpeedLimit(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const buttons = container.querySelectorAll('.mode-btn');
  const clockPhoton = container.querySelector('.clock-photon');
  const statusNote = container.querySelector('.status-note');

  let mode = 'photon'; // 'rest', 'rocket', 'photon'

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const ox = width * 0.25;
    const oy = height * 0.82;
    const scale = Math.min(width * 0.55, height * 0.68);

    drawGrid(ctx, ox, oy, width, height, 32);
    drawConstraintArc(ctx, ox, oy, scale, '#334155');
    drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

    // Forbidden beyond-c zone
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ox + scale, oy);
    ctx.lineTo(width - 25, oy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '600 10px var(--font-mono)';
    ctx.fillStyle = '#f87171';
    ctx.fillText('FORBIDDEN (v > c)', ox + scale + 15, oy - 10);

    let v_space = 1.0;
    let v_time = 0.0;
    let color = '#facc15';

    if (mode === 'rest') {
      v_space = 0.0;
      v_time = 1.0;
      color = '#38bdf8';
    } else if (mode === 'rocket') {
      v_space = 0.866;
      v_time = 0.5;
      color = '#fb923c';
    } else {
      v_space = 1.0;
      v_time = 0.0;
      color = '#facc15';
    }

    const tipX = ox + scale * v_space;
    const tipY = oy - scale * v_time;

    // Vector
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    drawGlowingDot(ctx, tipX, tipY, color, 7);

    ctx.font = 'bold 12px var(--font-sans)';
    ctx.fillStyle = color;
    ctx.fillText(mode === 'photon' ? 'Photon (Light Speed)' : (mode === 'rest' ? 'Observer at Rest' : 'Fast Rocket'), tipX - 20, tipY - 14);
  }

  function update() {
    if (mode === 'photon') {
      if (clockPhoton) clockPhoton.innerHTML = '0.000 <span>s</span>';
      if (statusNote) statusNote.innerText = 'Time is completely frozen. 100% of motion is across space.';
    } else if (mode === 'rocket') {
      if (clockPhoton) clockPhoton.innerHTML = '3.000 <span>s</span>';
      if (statusNote) statusNote.innerText = 'Clock runs at half rate (0.50x). Motion is shared between space and time.';
    } else {
      if (clockPhoton) clockPhoton.innerHTML = '6.000 <span>s</span>';
      if (statusNote) statusNote.innerText = 'Clock runs at maximum rate (1.00x). 100% of motion is through time.';
    }
    draw();
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      update();
    });
  });

  update();
  window.addEventListener('resize', draw);
}


// ============================================================================
// WIDGET 6: Atmospheric Muon Lifetime Simulator
// ============================================================================
export function initWidgetMuon(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('canvas');
  const sliderAlt = container.querySelector('.slider-altitude');
  const btnToggle = container.querySelector('.btn-view-toggle');
  const readoutStatus = container.querySelector('.readout-muon-status');
  const readoutClock = container.querySelector('.readout-muon-clock');

  let isRelativistic = true;
  let altitudeKm = 10.0; // 10km down to 0km

  function update() {
    const distTraveledKm = 10.0 - altitudeKm;
    // Speed = 0.999c = 299,700 km/s.
    // Classical decay distance = 0.66 km.
    // Relativistic dilation factor = 1 / sqrt(1 - 0.999^2) ≈ 22.37.
    // Relativistic decay distance = 0.66 * 22.37 ≈ 14.7 km.

    if (!isRelativistic) {
      if (distTraveledKm >= 0.66) {
        if (readoutStatus) readoutStatus.innerHTML = '<span class="text-rose-400 font-bold">Decayed mid-air at 9.34 km!</span>';
        if (readoutClock) readoutClock.innerText = '2.20 µs (Lifetime expired)';
      } else {
        if (readoutStatus) readoutStatus.innerText = 'Descending...';
        if (readoutClock) readoutClock.innerText = `${(distTraveledKm / 0.66 * 2.2).toFixed(2)} µs`;
      }
    } else {
      if (altitudeKm <= 0.05) {
        if (readoutStatus) readoutStatus.innerHTML = '<span class="text-emerald-400 font-bold">Safely Reached Sea Level Detectors!</span>';
      } else {
        if (readoutStatus) readoutStatus.innerText = 'Descending safely through atmosphere...';
      }
      // Relativistic clock ticks 22x slower from our view
      const properTimeMicrosec = (distTraveledKm / 14.7) * 2.2;
      if (readoutClock) readoutClock.innerText = `${properTimeMicrosec.toFixed(2)} µs (Internal Clock)`;
    }

    draw();
  }

  function draw() {
    const { ctx, width, height } = setupRetinaCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 90;
    const padRight = 30;
    const topY = 40;
    const bottomY = height - 50;
    const trackH = bottomY - topY;

    // Atmosphere gradient band
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(padLeft, topY, width - padLeft - padRight, trackH);

    // Altitude lines
    ctx.font = '600 11px var(--font-mono)';
    ctx.fillStyle = '#64748b';
    ctx.fillText('10 km (Creation)', 10, topY + 4);
    ctx.fillText('0 km (Sea Level)', 10, bottomY + 4);

    // Classical decay threshold mark (9.34 km)
    const decayY = topY + (0.66 / 10.0) * trackH;
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, decayY);
    ctx.lineTo(width - padRight, decayY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f87171';
    ctx.fillText('Classical Limit (660m)', width - 170, decayY - 6);

    // Muon Current Position
    const dist = 10.0 - altitudeKm;
    const muonY = topY + (dist / 10.0) * trackH;
    const muonX = padLeft + (width - padLeft - padRight) / 2;

    const isDead = (!isRelativistic && dist >= 0.66);

    // Trail
    ctx.strokeStyle = isDead ? '#64748b' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(muonX, topY);
    ctx.lineTo(muonX, muonY);
    ctx.stroke();

    if (isDead) {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('💥', muonX - 8, muonY + 6);
      ctx.font = '600 11px var(--font-sans)';
      ctx.fillText('Decayed into electron + neutrinos', muonX + 15, muonY + 4);
    } else {
      drawGlowingDot(ctx, muonX, muonY, '#38bdf8', 6);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px var(--font-mono)';
      ctx.fillText(`Muon (Alt: ${altitudeKm.toFixed(1)} km)`, muonX + 12, muonY + 4);
    }
  }

  if (sliderAlt) {
    sliderAlt.addEventListener('input', (e) => {
      altitudeKm = parseFloat(e.target.value);
      update();
    });
  }

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      isRelativistic = !isRelativistic;
      btnToggle.innerHTML = isRelativistic
        ? '<span>Mode: </span><strong class="text-sky-400">Einsteinian (Time Dilation ON)</strong>'
        : '<span>Mode: </span><strong class="text-amber-400">Newtonian (No Time Dilation)</strong>';
      update();
    });
  }

  update();
  window.addEventListener('resize', draw);
}
