/**
 * site.js - Universal Client-Side Physics Simulation Suite
 * 100% Static, Serverless, Zero-Dependency. Works over file:// and any static host.
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 1. High-DPI Canvas & Drawing Primitives
  // ==========================================================================
  function setupRetinaCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, width: rect.width, height: rect.height, dpr: dpr };
  }

  function drawGrid(ctx, ox, oy, width, height, step) {
    step = step || 32;
    ctx.strokeStyle = '#121b2d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = ox + step; x < width - 15; x += step) {
      ctx.moveTo(x, 15);
      ctx.lineTo(x, oy);
    }
    for (var y = oy - step; y > 15; y -= step) {
      ctx.moveTo(ox, y);
      ctx.lineTo(width - 15, y);
    }
    ctx.stroke();
  }

  function drawAxes(ctx, ox, oy, width, height, xLabel, yLabel) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // Horizontal Axis
    ctx.beginPath();
    ctx.moveTo(ox - 15, oy);
    ctx.lineTo(width - 25, oy);
    ctx.stroke();

    // Horizontal Arrowhead
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(width - 25, oy - 4);
    ctx.lineTo(width - 17, oy);
    ctx.lineTo(width - 25, oy + 4);
    ctx.fill();

    // Vertical Axis
    ctx.beginPath();
    ctx.moveTo(ox, oy + 15);
    ctx.lineTo(ox, 25);
    ctx.stroke();

    // Vertical Arrowhead
    ctx.beginPath();
    ctx.moveTo(ox - 4, 25);
    ctx.lineTo(ox, 17);
    ctx.lineTo(ox + 4, 25);
    ctx.fill();

    // Labels
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(xLabel, width - 85, oy + 18);
    ctx.fillText(yLabel, ox - 35, 18);
  }

  function drawConstraintArc(ctx, ox, oy, radius, color) {
    color = color || '#27344d';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawGlowingDot(ctx, x, y, color, radius) {
    radius = radius || 6;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================================================
  // 2. Widget Implementations
  // ==========================================================================

  // Widget 1: Two Cars on a 2D Grid
  function initWidgetCars(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var sliderAngle = container.querySelector('.slider-angle');
    var btnPlay = container.querySelector('.btn-play');
    var timeVal = container.querySelector('.val-time');
    var angleVal = container.querySelector('.val-angle');
    var readoutVx = container.querySelector('.readout-vx');
    var readoutVy = container.querySelector('.readout-vy');

    var isPlaying = false;
    var progress = 0.6;
    var angleDeg = 60;
    var lastTimestamp = 0;

    function updateReadouts() {
      var rad = angleDeg * Math.PI / 180;
      var vx = 60 * Math.sin(rad);
      var vy = 60 * Math.cos(rad);
      if (timeVal) timeVal.innerText = (progress * 1.0).toFixed(2) + ' hr';
      if (angleVal) angleVal.innerText = angleDeg + '°';
      if (readoutVx) readoutVx.innerText = vx.toFixed(1) + ' mph';
      if (readoutVy) readoutVy.innerText = vy.toFixed(1) + ' mph';
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.22;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.58, height * 0.68);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, '#222f46');
      drawAxes(ctx, ox, oy, width, height, 'East (x₁)', 'North (x₂)');

      var rad = angleDeg * Math.PI / 180;
      var c1_x = ox;
      var c1_y = oy - (progress * scale);
      var c2_x = ox + (progress * scale * Math.sin(rad));
      var c2_y = oy - (progress * scale * Math.cos(rad));

      if (progress > 0.05) {
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(c2_x, c2_y);
        ctx.lineTo(ox, c2_y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c2_x, c2_y);
        ctx.lineTo(c2_x, oy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(c1_x, c1_y);
      ctx.stroke();

      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(c2_x, c2_y);
      ctx.stroke();

      if (progress > 0.15 && c2_y > c1_y + 10) {
        var lagX = ox + 45;
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lagX, c1_y);
        ctx.lineTo(lagX, c2_y);
        ctx.stroke();
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(lagX, c1_y, 2.5, 0, Math.PI * 2);
        ctx.arc(lagX, c2_y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '600 10px sans-serif';
        ctx.fillText('Northward Lag', lagX + 8, (c1_y + c2_y) / 2 + 3);
      }

      drawGlowingDot(ctx, c1_x, c1_y, '#38bdf8', 6);
      drawGlowingDot(ctx, c2_x, c2_y, '#fb923c', 6);

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Car 1 (North)', c1_x - 35, c1_y - 12);
      ctx.fillStyle = '#fb923c';
      ctx.fillText('Car 2 (' + angleDeg + '°)', c2_x + 10, c2_y + 4);
    }

    function loop(now) {
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
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
      sliderTime.addEventListener('input', function (e) {
        progress = e.target.value / 1000;
        updateReadouts();
      });
    }

    if (sliderAngle) {
      sliderAngle.addEventListener('input', function (e) {
        angleDeg = parseInt(e.target.value);
        updateReadouts();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      });
    }

    updateReadouts();
    requestAnimationFrame(loop);
  }

  // Widget 2: Motion Purely Through Time (At Rest)
  function initWidgetStationary(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var clockDisplay = container.querySelector('.clock-val');

    var isPlaying = false;
    var animTime = 3.5;
    var lastTimestamp = 0;

    function update() {
      if (clockDisplay) clockDisplay.innerHTML = animTime.toFixed(2) + ' <span>s</span>';
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.35;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.5, height * 0.68);
      var progress = animTime / 6.0;

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

      var currY = oy - (progress * scale);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '600 11px monospace';
      ctx.fillText('x = 0 (No spatial movement)', ox + 10, oy + 18);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, currY);
      ctx.stroke();

      drawGlowingDot(ctx, ox, currY, '#38bdf8', 7);

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Observer at Rest', ox - 110, currY - 5);
    }

    function loop(now) {
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
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
      sliderTime.addEventListener('input', function (e) {
        animTime = (e.target.value / 1000) * 6.0;
        update();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      });
    }

    update();
    requestAnimationFrame(loop);
  }

  // Widget 3: The Thought Experiment (Trade-off)
  function initWidgetTradeoff(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderTime = container.querySelector('.slider-time');
    var readoutVx = container.querySelector('.readout-vx');
    var readoutVt = container.querySelector('.readout-vt');

    var progress = 0.7;
    var speedFraction = 0.866;

    function update() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      if (readoutVx) readoutVx.innerText = (speedFraction * 100).toFixed(1) + '% of V';
      if (readoutVt) readoutVt.innerText = (vt * 100).toFixed(1) + '% of V';
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.25;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.58, height * 0.68);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, '#a855f7');
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var tipX = ox + (progress * scale * speedFraction);
      var tipY = oy - (progress * scale * vt);

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

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      drawGlowingDot(ctx, tipX, tipY, '#a855f7', 6.5);

      ctx.font = '600 11px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('v_time = ' + (vt * 100).toFixed(0) + '%', ox - 95, tipY + 4);
      ctx.fillStyle = '#fb923c';
      ctx.fillText('v_space = ' + (speedFraction * 100).toFixed(0) + '%', tipX - 30, oy + 18);
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        speedFraction = e.target.value / 1000;
        update();
        draw();
      });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        progress = e.target.value / 1000;
        draw();
      });
    }

    update();
    draw();
    window.addEventListener('resize', draw);
  }

  // Widget 4: Time Dilation & Live Twin Clocks
  function initWidgetTimeDilation(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var clockEarth = container.querySelector('.clock-earth');
    var clockRocket = container.querySelector('.clock-rocket');
    var readoutSpeed = container.querySelector('.readout-speed');
    var readoutMath = container.querySelector('.readout-math');
    var readoutGamma = container.querySelector('.readout-gamma');
    var presetChips = container.querySelectorAll('.chip-preset');

    var isPlaying = false;
    var animTime = 0.0;
    var speedFraction = 0.866;
    var lastTimestamp = 0;

    function update() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var gamma = vt > 0 ? (1 / vt) : Infinity;

      if (readoutSpeed) readoutSpeed.innerText = 'v = ' + speedFraction.toFixed(3) + ' c';
      if (readoutMath) readoutMath.innerText = vt.toFixed(3) + ' c';
      if (readoutGamma) readoutGamma.innerText = gamma === Infinity ? '∞' : gamma.toFixed(2);

      var earthSec = animTime;
      var rocketSec = animTime * vt;
      if (clockEarth) clockEarth.innerHTML = earthSec.toFixed(2) + ' <span>s</span>';
      if (clockRocket) clockRocket.innerHTML = rocketSec.toFixed(2) + ' <span>s</span>';
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.22;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.58, height * 0.68);
      var progress = animTime / 6.0;

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, '#27344d');
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (ct)');

      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var e_x = ox;
      var e_y = oy - (progress * scale);
      var r_x = ox + (progress * scale * speedFraction);
      var r_y = oy - (progress * scale * vt);

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

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(e_x, e_y);
      ctx.stroke();

      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(r_x, r_y);
      ctx.stroke();

      drawGlowingDot(ctx, e_x, e_y, '#38bdf8', 6);
      drawGlowingDot(ctx, r_x, r_y, '#fb923c', 6);

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Earth (Rest)', e_x - 30, e_y - 12);
      ctx.fillStyle = '#fb923c';
      ctx.fillText('Rocket', r_x + 10, r_y + 4);
    }

    function loop(now) {
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
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
      sliderSpeed.addEventListener('input', function (e) {
        speedFraction = e.target.value / 1000;
        presetChips.forEach(function (c) { c.classList.remove('active'); });
        update();
      });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        animTime = (e.target.value / 1000) * 6.0;
        update();
      });
    }

    presetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        presetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var val = parseFloat(chip.dataset.val);
        speedFraction = val;
        if (sliderSpeed) sliderSpeed.value = val * 1000;
        update();
      });
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
      });
    }

    update();
    requestAnimationFrame(loop);
  }

  // Widget 5: Cosmic Speed Limit & Photon
  function initWidgetSpeedLimit(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var buttons = container.querySelectorAll('.mode-btn');
    var clockPhoton = container.querySelector('.clock-photon');
    var statusNote = container.querySelector('.status-note');

    var mode = 'photon';

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.25;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.55, height * 0.68);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, '#334155');
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox + scale, oy);
      ctx.lineTo(width - 25, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 10px monospace';
      ctx.fillStyle = '#f87171';
      ctx.fillText('FORBIDDEN (v > c)', ox + scale + 15, oy - 10);

      var v_space = 1.0;
      var v_time = 0.0;
      var color = '#facc15';

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

      var tipX = ox + scale * v_space;
      var tipY = oy - scale * v_time;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      drawGlowingDot(ctx, tipX, tipY, color, 7);

      ctx.font = 'bold 12px sans-serif';
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

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        mode = btn.dataset.mode;
        update();
      });
    });

    update();
    window.addEventListener('resize', draw);
  }

  // Widget 6: Atmospheric Muon Simulator
  function initWidgetMuon(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderAlt = container.querySelector('.slider-altitude');
    var btnToggle = container.querySelector('.btn-view-toggle');
    var readoutStatus = container.querySelector('.readout-muon-status');
    var readoutClock = container.querySelector('.readout-muon-clock');

    var isRelativistic = true;
    var altitudeKm = 10.0;

    function update() {
      var distTraveledKm = 10.0 - altitudeKm;

      if (!isRelativistic) {
        if (distTraveledKm >= 0.66) {
          if (readoutStatus) readoutStatus.innerHTML = '<span style="color:#f87171; font-weight:bold;">Decayed mid-air at 9.34 km!</span>';
          if (readoutClock) readoutClock.innerText = '2.20 µs (Lifetime expired)';
        } else {
          if (readoutStatus) readoutStatus.innerText = 'Descending...';
          if (readoutClock) readoutClock.innerText = (distTraveledKm / 0.66 * 2.2).toFixed(2) + ' µs';
        }
      } else {
        if (altitudeKm <= 0.05) {
          if (readoutStatus) readoutStatus.innerHTML = '<span style="color:#10b981; font-weight:bold;">Safely Reached Sea Level Detectors!</span>';
        } else {
          if (readoutStatus) readoutStatus.innerText = 'Descending safely through atmosphere...';
        }
        var properTimeMicrosec = (distTraveledKm / 14.7) * 2.2;
        if (readoutClock) readoutClock.innerText = properTimeMicrosec.toFixed(2) + ' µs (Internal Clock)';
      }

      draw();
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var padLeft = 90;
      var padRight = 30;
      var topY = 40;
      var bottomY = height - 50;
      var trackH = bottomY - topY;

      var grad = ctx.createLinearGradient(0, topY, 0, bottomY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(padLeft, topY, width - padLeft - padRight, trackH);

      ctx.font = '600 11px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('10 km (Creation)', 10, topY + 4);
      ctx.fillText('0 km (Sea Level)', 10, bottomY + 4);

      var decayY = topY + (0.66 / 10.0) * trackH;
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

      var dist = 10.0 - altitudeKm;
      var muonY = topY + (dist / 10.0) * trackH;
      var muonX = padLeft + (width - padLeft - padRight) / 2;

      var isDead = (!isRelativistic && dist >= 0.66);

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
        ctx.font = '600 11px sans-serif';
        ctx.fillText('Decayed into electron + neutrinos', muonX + 15, muonY + 4);
      } else {
        drawGlowingDot(ctx, muonX, muonY, '#38bdf8', 6);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Muon (Alt: ' + altitudeKm.toFixed(1) + ' km)', muonX + 12, muonY + 4);
      }
    }

    if (sliderAlt) {
      sliderAlt.addEventListener('input', function (e) {
        altitudeKm = parseFloat(e.target.value);
        update();
      });
    }

    if (btnToggle) {
      btnToggle.addEventListener('click', function () {
        isRelativistic = !isRelativistic;
        btnToggle.innerHTML = isRelativistic
          ? '<span>Mode: </span><strong style="color:#38bdf8;">Einsteinian (Time Dilation ON)</strong>'
          : '<span>Mode: </span><strong style="color:#fb923c;">Newtonian (No Time Dilation)</strong>';
        update();
      });
    }

    update();
    window.addEventListener('resize', draw);
  }

  function initAllPost01() {
    initWidgetCars('widget-cars');
    initWidgetStationary('widget-stationary');
    initWidgetTradeoff('widget-tradeoff');
    initWidgetTimeDilation('widget-time-dilation');
    initWidgetSpeedLimit('widget-speed-limit');
    initWidgetMuon('widget-muon');
  }

  // Export to global scope
  window.UniverseSimulations = {
    setupRetinaCanvas: setupRetinaCanvas,
    drawGrid: drawGrid,
    drawAxes: drawAxes,
    drawConstraintArc: drawConstraintArc,
    drawGlowingDot: drawGlowingDot,
    initWidgetCars: initWidgetCars,
    initWidgetStationary: initWidgetStationary,
    initWidgetTradeoff: initWidgetTradeoff,
    initWidgetTimeDilation: initWidgetTimeDilation,
    initWidgetSpeedLimit: initWidgetSpeedLimit,
    initWidgetMuon: initWidgetMuon,
    initAllPost01: initAllPost01
  };

})(window);
