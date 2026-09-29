/**
 * post-02.js - Part 2 Interactive Simulations: The Cosmic Light Cone
 */

(function (window) {
  'use strict';

  var sim = window.UniverseSimulations || (window.UniverseSimulations = {});
  var getThemeColors = function () { return sim.getThemeColors(); };
  var setupRetinaCanvas = function (c) { return sim.setupRetinaCanvas(c); };
  var registerDraw = function (fn) { sim.registerDraw(fn); };
  var drawAxes = function (ctx, ox, oy, w, h, xl, yl) { sim.drawAxes(ctx, ox, oy, w, h, xl, yl); };
  var drawGrid = function (ctx, ox, oy, w, h, s) { sim.drawGrid(ctx, ox, oy, w, h, s); };
  var drawLabelPill = function (ctx, txt, x, y, opts) { sim.drawLabelPill(ctx, txt, x, y, opts); };
  var drawGlowingDot = function (ctx, x, y, c, r) { sim.drawGlowingDot(ctx, x, y, c, r); };
  var drawConstraintArc = function (ctx, ox, oy, r, c) { sim.drawConstraintArc(ctx, ox, oy, r, c); };

  function initWidgetDualSpeedSpacetime(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasSpeed = container.querySelector('.canvas-speed');
    var canvasSpacetime = container.querySelector('.canvas-spacetime');
    var sliderTheta = container.querySelector('.slider-theta');
    var btnPlay = container.querySelector('.btn-play');

    var elTheta = container.querySelector('.val-theta');
    var elVx = container.querySelector('.val-vx');
    var elVt = container.querySelector('.val-vt');
    var elPhi = container.querySelector('.val-phi');
    var elGamma = container.querySelector('.val-gamma');
    var elProperRate = container.querySelector('.val-proper-rate');

    var presetBtns = container.querySelectorAll('.preset-btn');

    var thetaDeg = parseFloat(sliderTheta ? sliderTheta.value : 0) || 0;
    var isPlaying = false;
    var playAnimId = null;
    var playDirection = 1;

    function updateReadouts() {
      var thetaRad = (thetaDeg * Math.PI) / 180;
      var vx = Math.sin(thetaRad);
      var vt = Math.cos(thetaRad);
      var phiRad = Math.atan(vx);
      var phiDeg = (phiRad * 180) / Math.PI;
      var gamma = vt > 0.001 ? 1 / vt : 999.9;
      var properRate = vt;

      if (sliderTheta) sliderTheta.value = thetaDeg.toFixed(1);
      if (elTheta) elTheta.textContent = thetaDeg.toFixed(1) + '°';
      if (elVx) elVx.textContent = vx.toFixed(3) + ' c';
      if (elVt) elVt.textContent = vt.toFixed(3) + ' c';
      if (elPhi) elPhi.textContent = phiDeg.toFixed(1) + '°';
      if (elGamma) elGamma.textContent = gamma > 100 ? '∞' : gamma.toFixed(2);
      if (elProperRate) elProperRate.textContent = (properRate * 100).toFixed(1) + '%';
    }

    function drawSpeedSpace() {
      if (!canvasSpeed) return;
      var ret = setupRetinaCanvas(canvasSpeed);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var ox = 50;
      var oy = height - 45;
      var radius = Math.min(width - 80, height - 75);

      drawGrid(ctx, ox, oy, width, height, 32);

      // Axes
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + radius + 25, oy);
      ctx.stroke();

      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(ox + radius + 25, oy - 4);
      ctx.lineTo(ox + radius + 32, oy);
      ctx.lineTo(ox + radius + 25, oy + 4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - radius - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox - 4, oy - radius - 25);
      ctx.lineTo(ox, oy - radius - 32);
      ctx.lineTo(ox + 4, oy - radius - 25);
      ctx.fill();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('v_space (Motion)', ox + radius - 60, oy + 22);

      ctx.fillStyle = colors.timeColor;
      ctx.fillText('v_time (Aging)', ox + 8, oy - radius - 12);

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      ctx.fillText('0', ox - 14, oy + 14);
      ctx.fillText('c', ox + radius - 3, oy + 16);
      ctx.fillText('c', ox - 16, oy - radius + 4);

      ctx.strokeStyle = colors.invariantColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.invariantColor;
      ctx.fillText('Total Speed = c', ox + radius * 0.55, oy - radius * 0.75);

      var thetaRad = (thetaDeg * Math.PI) / 180;
      var vx = Math.sin(thetaRad);
      var vt = Math.cos(thetaRad);

      var tipX = ox + vx * radius;
      var tipY = oy - vt * radius;

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

      if (thetaDeg > 1) {
        ctx.strokeStyle = colors.photonColor;
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        ctx.arc(ox, oy, 32, -Math.PI / 2, -Math.PI / 2 + thetaRad, false);
        ctx.stroke();

        var labelAngle = -Math.PI / 2 + thetaRad / 2;
        var lx = ox + Math.cos(labelAngle) * 44;
        var ly = oy + Math.sin(labelAngle) * 44;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.photonColor;
        ctx.fillText('θ=' + thetaDeg.toFixed(0) + '°', lx - 10, ly + 4);
      }

      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      drawGlowingDot(ctx, tipX, tipY, colors.photonColor, 6);

      ctx.fillStyle = colors.pillBg;
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(14, 14, width - 28, 28, 6);
      } else {
        ctx.rect(14, 14, width - 28, 28);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pillText;
      if (thetaDeg === 0) {
        ctx.fillText('θ = 0° : 100% Motion in Time (Sitting at Rest)', 24, 32);
      } else if (thetaDeg >= 89.9) {
        ctx.fillText('θ = 90° : 100% Motion in Space (Speed of Light, v = c)', 24, 32);
      } else {
        ctx.fillText('θ = ' + thetaDeg.toFixed(1) + '° : v_space = ' + (vx * 100).toFixed(1) + '%c, v_time = ' + (vt * 100).toFixed(1) + '%c', 24, 32);
      }
    }

    function drawSpacetime() {
      if (!canvasSpacetime) return;
      var ret = setupRetinaCanvas(canvasSpacetime);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var ox = width / 2;
      var oy = height - 45;
      var scale = Math.min((width / 2) - 40, height - 75);

      drawGrid(ctx, ox, oy, width, height, 32);

      var coneXLeft = ox - scale;
      var coneXRight = ox + scale;
      var coneYTop = oy - scale;

      // Shaded Future Causal Cone
      ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.07)' : 'rgba(56, 189, 248, 0.09)';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(coneXLeft, coneYTop);
      ctx.lineTo(coneXRight, coneYTop);
      ctx.closePath();
      ctx.fill();

      // Shaded Elsewhere
      ctx.fillStyle = colors.isLight ? 'rgba(220, 38, 38, 0.06)' : 'rgba(248, 113, 113, 0.08)';
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

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.photonColor;
      ctx.fillText('Photon (45°)', coneXRight - 65, coneYTop + 16);
      ctx.fillText('Light Cone (v = c)', coneXLeft + 8, coneYTop + 16);

      // Axes
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(25, oy);
      ctx.lineTo(width - 25, oy);
      ctx.stroke();

      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(width - 25, oy - 4);
      ctx.lineTo(width - 18, oy);
      ctx.lineTo(width - 25, oy + 4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - scale - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox - 4, oy - scale - 25);
      ctx.lineTo(ox, oy - scale - 32);
      ctx.lineTo(ox + 4, oy - scale - 25);
      ctx.fill();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('+x (Space)', width - 85, oy + 18);
      ctx.fillText('-x', 25, oy + 18);

      ctx.fillStyle = colors.timeColor;
      ctx.fillText('ct (Time)', ox + 8, oy - scale - 12);

      // Alice: Stationary Worldline
      ctx.strokeStyle = colors.timeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, coneYTop);
      ctx.stroke();

      var numTicks = 5;
      for (var i = 1; i <= numTicks; i++) {
        var ty = oy - (scale / numTicks) * i;
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
      var thetaRad = (thetaDeg * Math.PI) / 180;
      var vx = Math.sin(thetaRad);
      var phiRad = Math.atan(vx);
      var phiDeg = (phiRad * 180) / Math.PI;

      var bobTopX = ox + vx * scale;
      var bobTopY = oy - scale;

      ctx.strokeStyle = colors.spaceColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(bobTopX, bobTopY);
      ctx.stroke();

      var vt = Math.cos(thetaRad);
      if (vt > 0.05) {
        var gamma = 1 / vt;
        for (var j = 1; j <= numTicks; j++) {
          var ctCoord = (scale / numTicks) * j * gamma;
          if (ctCoord <= scale) {
            var bx = ox + vx * ctCoord;
            var by = oy - ctCoord;

            var perpAngle = phiRad + Math.PI / 2;
            var tickLen = 4;
            ctx.strokeStyle = colors.spaceColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx - Math.cos(perpAngle) * tickLen, by + Math.sin(perpAngle) * tickLen);
            ctx.lineTo(bx + Math.cos(perpAngle) * tickLen, by - Math.sin(perpAngle) * tickLen);
            ctx.stroke();

            ctx.font = '600 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.spaceColor;
            ctx.fillText(j + 's', bx + 6, by + 3);
          }
        }
      }

      if (phiDeg > 1) {
        ctx.strokeStyle = colors.spaceColor;
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        ctx.arc(ox, oy, 40, -Math.PI / 2, -Math.PI / 2 + phiRad, false);
        ctx.stroke();

        var labelAngle = -Math.PI / 2 + phiRad / 2;
        var lx = ox + Math.cos(labelAngle) * 52;
        var ly = oy + Math.sin(labelAngle) * 52;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.spaceColor;
        ctx.fillText('φ=' + phiDeg.toFixed(1) + '°', lx - 12, ly);
      }

      drawGlowingDot(ctx, bobTopX, bobTopY, colors.spaceColor, 6);

      ctx.fillStyle = colors.pillBg;
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(14, 14, width - 28, 28, 6);
      } else {
        ctx.rect(14, 14, width - 28, 28);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pillText;
      if (thetaDeg === 0) {
        ctx.fillText('Bob Worldline: φ = 0° (Vertical, Standing Beside Alice)', 24, 32);
      } else if (thetaDeg >= 89.9) {
        ctx.fillText('Bob Worldline: φ = 45.0° (Lying on Light Cone! τ = 0.00s Frozen)', 24, 32);
      } else {
        ctx.fillText('Bob Worldline: φ = ' + phiDeg.toFixed(1) + '° · Proper time ticks run at ' + (vt * 100).toFixed(0) + '% rate', 24, 32);
      }
    }

    function renderAll() {
      updateReadouts();
      drawSpeedSpace();
      drawSpacetime();
    }

    if (sliderTheta) {
      sliderTheta.addEventListener('input', function (e) {
        thetaDeg = parseFloat(e.target.value);
        if (isPlaying) stopPlay();
        renderAll();
      });
    }

    for (var p = 0; p < presetBtns.length; p++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var val = parseFloat(btn.getAttribute('data-theta'));
          if (!isNaN(val)) {
            thetaDeg = val;
            if (isPlaying) stopPlay();
            renderAll();
          }
        });
      })(presetBtns[p]);
    }

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
      var lastTime = performance.now();

      function step(now) {
        if (!isPlaying) return;
        var dt = (now - lastTime) / 1000;
        lastTime = now;

        thetaDeg += playDirection * dt * 18;
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
      btnPlay.addEventListener('click', function () {
        if (isPlaying) stopPlay();
        else startPlay();
      });
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // SIMULATION 1b: Expanding Circles — 2×2 grid of light ripple snapshots at t=0,1,2,3
  function initWidgetExpandingCircles(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var panels = container.querySelectorAll('canvas.circle-panel');
    if (!panels || panels.length === 0) return;

    // Maximum time value drives the coordinate scale so all four panels share the same grid
    var MAX_T = 3;

    function drawPanel(canvas, t) {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      // Padding around the axes
      var pad = Math.max(28, Math.min(38, w * 0.11));
      var plotW = w - pad * 2;
      var plotH = h - pad * 2;
      var ox = pad + plotW / 2;   // origin x
      var oy = pad + plotH / 2;   // origin y
      // Scale: the full plot width spans [-MAX_T … +MAX_T]
      var scale = Math.min(plotW, plotH) / 2 / MAX_T;

      // ── Background subtle grid ──────────────────────────────────────────────
      ctx.strokeStyle = colors.gridLine;
      ctx.lineWidth = 0.5;
      for (var g = -MAX_T; g <= MAX_T; g++) {
        var gx = ox + g * scale;
        ctx.beginPath();
        ctx.moveTo(gx, pad);
        ctx.lineTo(gx, h - pad);
        ctx.stroke();
        var gy = oy + g * scale;
        ctx.beginPath();
        ctx.moveTo(pad, gy);
        ctx.lineTo(w - pad, gy);
        ctx.stroke();
      }

      // ── Axes ────────────────────────────────────────────────────────────────
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.5;
      // x-axis
      ctx.beginPath();
      ctx.moveTo(pad, oy);
      ctx.lineTo(w - pad + 6, oy);
      ctx.stroke();
      // y-axis
      ctx.beginPath();
      ctx.moveTo(ox, pad);
      ctx.lineTo(ox, h - pad + 6);
      ctx.stroke();

      // Arrowheads
      ctx.fillStyle = colors.axisArrow;
      ctx.beginPath();
      ctx.moveTo(w - pad + 6, oy - 3);
      ctx.lineTo(w - pad + 11, oy);
      ctx.lineTo(w - pad + 6, oy + 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ox - 3, pad);
      ctx.lineTo(ox, pad - 5);
      ctx.lineTo(ox + 3, pad);
      ctx.fill();

      // Axis labels
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('x', w - pad + 13, oy + 3);
      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('y', ox + 5, pad - 7);

      // ── Light circle (or origin dot for t=0) ────────────────────────────────
      var radius = t * scale;

      if (t === 0) {
        // Just a glowing origin dot — the flash "here and now"
        drawGlowingDot(ctx, ox, oy, colors.photonColor, 5);
      } else {
        // Filled disc with low alpha showing the interior (inside the light shell)
        ctx.fillStyle = colors.isLight
          ? 'rgba(250, 204, 21, 0.10)'
          : 'rgba(250, 204, 21, 0.13)';
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fill();

        // The circle itself (the wavefront)
        ctx.strokeStyle = colors.photonColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = colors.photonColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Radius arrow from origin to right edge of circle
        ctx.strokeStyle = colors.isLight ? 'rgba(148,163,184,0.8)' : 'rgba(100,116,139,0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + radius, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // 'r = ct' label along the radius arrow
        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.photonColor;
        var labelX = Math.min(w - pad - 4, ox + radius / 2 - 12);
        ctx.fillText('r=' + t + 'c', labelX, oy - 5);

        // Origin dot
        drawGlowingDot(ctx, ox, oy, colors.invariantColor, 3);
      }

      // ── Panel time label (top-left pill) ────────────────────────────────────
      var pillW = 46, pillH = 20, pillX = 8, pillY = 8;
      ctx.fillStyle = colors.pillBg;
      ctx.strokeStyle = colors.pillBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, 5);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pillText;
      ctx.fillText('t = ' + t, pillX + 7, pillY + 13);
    }

    function renderAll() {
      for (var i = 0; i < panels.length; i++) {
        var t = parseInt(panels[i].getAttribute('data-t'), 10);
        drawPanel(panels[i], t);
      }
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // SIMULATION 1c: The Mathematical Synthesis Grid — 2×2 archetypes connecting Velocity Space & Spacetime
  function initWidgetSynthesisGrid(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var panels = container.querySelectorAll('.synthesis-canvas-wrap canvas');
    if (!panels || panels.length === 0) return;

    // Archetype definitions for the 4 panels
    var archetypes = {
      '0': {
        thetaDeg: 0,
        thetaRad: 0,
        vx: 0,
        vt: 1,
        phiDeg: 0,
        properRate: 1.0,
        title: 'Stationary Observer (At Rest)',
        desc: 'All speed directed through time'
      },
      '30': {
        thetaDeg: 30,
        thetaRad: (30 * Math.PI) / 180,
        vx: 0.5,
        vt: Math.cos((30 * Math.PI) / 180), // 0.866
        phiDeg: (Math.atan(0.5) * 180) / Math.PI, // 26.57°
        properRate: Math.cos((30 * Math.PI) / 180),
        title: 'Cruising Sub-light (v = 0.50c)',
        desc: 'Balanced space and time motion'
      },
      '60': {
        thetaDeg: 60,
        thetaRad: (60 * Math.PI) / 180,
        vx: Math.sin((60 * Math.PI) / 180), // 0.866
        vt: 0.5,
        phiDeg: (Math.atan(Math.sin((60 * Math.PI) / 180)) * 180) / Math.PI, // 40.89°
        properRate: 0.5,
        title: 'Ultra-Relativistic (v = 0.866c)',
        desc: 'Heavily tilted, clock runs at ½ rate'
      },
      '90': {
        thetaDeg: 90,
        thetaRad: (90 * Math.PI) / 180,
        vx: 1.0,
        vt: 0,
        phiDeg: 45.0,
        properRate: 0.0,
        title: 'The Photon Bound (v = c)',
        desc: 'Pure spatial speed, clock stands still'
      }
    };

    function drawPanel(canvas, key) {
      var data = archetypes[key];
      if (!data) return;

      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var c = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      // We split the canvas horizontally: Left = Velocity Space (mini circle), Right = Coordinate Spacetime
      var dividerX = Math.round(w * 0.44);

      // Subtle divider line
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dividerX, 8);
      ctx.lineTo(dividerX, h - 8);
      ctx.stroke();

      // ==========================================
      // 1. LEFT SIDE: VELOCITY CIRCLE (PART 1)
      // ==========================================
      var leftW = dividerX;
      var lPad = Math.max(16, Math.min(24, leftW * 0.12));
      var lOx = lPad + (leftW - lPad * 2) * 0.35;
      var lOy = h - lPad - 16;
      var lRadius = Math.min((leftW - lPad * 2) * 0.85, (h - lPad * 2 - 28));

      // Velocity axes
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.25;
      // vx axis (horizontal)
      ctx.beginPath();
      ctx.moveTo(lOx - 4, lOy);
      ctx.lineTo(lOx + lRadius + 14, lOy);
      ctx.stroke();
      // vt axis (vertical)
      ctx.beginPath();
      ctx.moveTo(lOx, lOy + 4);
      ctx.lineTo(lOx, lOy - lRadius - 14);
      ctx.stroke();

      // Axis labels
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('v_x', lOx + lRadius + 4, lOy + 11);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('v_t', lOx - 16, lOy - lRadius - 4);

      // The circular constraint arc (|V| = c)
      ctx.strokeStyle = c.isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([2.5, 2.5]);
      ctx.beginPath();
      ctx.arc(lOx, lOy, lRadius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed vector tip
      var tipX = lOx + Math.sin(data.thetaRad) * lRadius;
      var tipY = lOy - Math.cos(data.thetaRad) * lRadius;

      // Projection lines
      ctx.strokeStyle = c.isLight ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX, lOy);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(lOx, tipY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Theta arc
      if (data.thetaDeg > 0) {
        ctx.strokeStyle = c.photonColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(lOx, lOy, Math.min(22, lRadius * 0.4), -Math.PI / 2, -Math.PI / 2 + data.thetaRad, false);
        ctx.stroke();
      }

      // 4-Velocity Vector
      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 2.25;
      ctx.beginPath();
      ctx.moveTo(lOx, lOy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      drawGlowingDot(ctx, tipX, tipY, c.photonColor, 3.5);

      // Mini Header Left
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.fillText('SPEED SPACE: θ = ' + data.thetaDeg + '°', lPad - 6, 16);

      // Readouts Left
      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('v_x=' + data.vx.toFixed(2) + 'c', lOx + 8, lOy + 11);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('v_t=' + data.vt.toFixed(2) + 'c', lPad - 6, lOy - lRadius + 10);

      // ==========================================
      // 2. RIGHT SIDE: COORDINATE SPACETIME (PART 2)
      // ==========================================
      var rightW = w - dividerX;
      var rPad = Math.max(16, Math.min(24, rightW * 0.12));
      var rOx = dividerX + rPad + (rightW - rPad * 2) * 0.28;
      var rOy = h - rPad - 16;
      var rScale = Math.min((rightW - rPad * 2) * 0.72, (h - rPad * 2 - 28));

      // 45° Light cone reference line
      var coneX = rOx + rScale;
      var coneY = rOy - rScale;

      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.05)' : 'rgba(56, 189, 248, 0.06)';
      ctx.beginPath();
      ctx.moveTo(rOx, rOy);
      ctx.lineTo(coneX, coneY);
      ctx.lineTo(rOx, coneY);
      ctx.closePath();
      ctx.fill();

      // 45° photon line
      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(rOx, rOy);
      ctx.lineTo(coneX, coneY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spacetime axes
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.25;
      // x axis
      ctx.beginPath();
      ctx.moveTo(rOx - 4, rOy);
      ctx.lineTo(rOx + rScale + 14, rOy);
      ctx.stroke();
      // ct axis
      ctx.beginPath();
      ctx.moveTo(rOx, rOy + 4);
      ctx.lineTo(rOx, rOy - rScale - 14);
      ctx.stroke();

      // Axis labels
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('x', rOx + rScale + 4, rOy + 11);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('ct', rOx - 14, rOy - rScale - 4);

      // Worldline
      var wlTopX = rOx + data.vx * rScale;
      var wlTopY = rOy - rScale;

      ctx.strokeStyle = data.thetaDeg === 90 ? c.photonColor : c.spaceColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rOx, rOy);
      ctx.lineTo(wlTopX, wlTopY);
      ctx.stroke();
      drawGlowingDot(ctx, wlTopX, wlTopY, data.thetaDeg === 90 ? c.photonColor : c.spaceColor, 3.5);

      // Proper time ticks along worldline
      if (data.thetaDeg < 90) {
        var numTicks = 3;
        for (var t = 1; t <= numTicks; t++) {
          var frac = t / numTicks;
          // In coordinate time ct, each tick appears at dt = dtau / cos(theta)
          // For visual clarity, ticks are spaced by proper time dtau
          var tickFrac = frac / (data.properRate > 0 ? 1 : 1);
          if (tickFrac <= 1.0) {
            var tx = rOx + (wlTopX - rOx) * frac;
            var ty = rOy + (wlTopY - rOy) * frac;
            
            // Draw cross tick mark perpendicular to worldline
            var perpAngle = Math.atan2(wlTopY - rOy, wlTopX - rOx) + Math.PI / 2;
            var tickLen = 3.5;
            ctx.strokeStyle = c.timeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx - Math.cos(perpAngle) * tickLen, ty - Math.sin(perpAngle) * tickLen);
            ctx.lineTo(tx + Math.cos(perpAngle) * tickLen, ty + Math.sin(perpAngle) * tickLen);
            ctx.stroke();
          }
        }
      }

      // Mini Header Right
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = c.subtleText;
      ctx.fillText('SPACETIME: φ = ' + data.phiDeg.toFixed(1) + '°', dividerX + 12, 16);

      // Readouts Right
      ctx.font = '600 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = c.spaceColor;
      ctx.fillText('tan φ = ' + data.vx.toFixed(2), dividerX + 12, 28);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('dτ = ' + (data.properRate * 100).toFixed(0) + '% dt', dividerX + 12, 40);
    }

    function renderAll() {
      for (var i = 0; i < panels.length; i++) {
        var p = panels[i];
        var key = p.getAttribute('data-preset');
        drawPanel(p, key);
      }
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // SIMULATION 2: 3D Light Cone Explorer
  function initWidget3DLightConeExplorer(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    if (!canvas) return;

    var sliderTime = container.querySelector('.slider-time');
    var sliderAzimuth = container.querySelector('.slider-azimuth');
    var sliderElevation = container.querySelector('.slider-elevation');
    var btnReset = container.querySelector('.btn-reset-view');

    var elRegionBadge = container.querySelector('.badge-region');
    var elSliceTime = container.querySelector('.val-slice-time');
    var elWaveRadius = container.querySelector('.val-wave-radius');

    var azimuth = 0.65;
    var elevation = parseFloat(sliderElevation ? sliderElevation.value : 0.05) || 0.05;
    var sliceT = parseFloat(sliderTime ? sliderTime.value : 0.4) || 0.4;

    var isDragging = false;
    var lastMouseX = 0;
    var lastMouseY = 0;

    function project3DLocal(x, y, z, cx, cy, scale, az, el) {
      var cosAz = Math.cos(az);
      var sinAz = Math.sin(az);
      var xRot = x * cosAz - y * sinAz;
      var yRot = x * sinAz + y * cosAz;

      var cosEl = Math.cos(el);
      var sinEl = Math.sin(el);
      var yFinal = yRot * cosEl - z * sinEl;
      var zFinal = yRot * sinEl + z * cosEl;

      return {
        x: cx + xRot * scale,
        y: cy - zFinal * scale,
        depth: yFinal
      };
    }

    function draw() {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      var cx = width / 2;
      var cy = height / 2;
      var scale = Math.min(width, height) * 0.38;

      var gridStep = 0.25;
      ctx.strokeStyle = colors.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = -1; x <= 1.01; x += gridStep) {
        var p1 = project3DLocal(x, -1, 0, cx, cy, scale, azimuth, elevation);
        var p2 = project3DLocal(x, 1, 0, cx, cy, scale, azimuth, elevation);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      for (var y = -1; y <= 1.01; y += gridStep) {
        var p1y = project3DLocal(-1, y, 0, cx, cy, scale, azimuth, elevation);
        var p2y = project3DLocal(1, y, 0, cx, cy, scale, azimuth, elevation);
        ctx.moveTo(p1y.x, p1y.y);
        ctx.lineTo(p2y.x, p2y.y);
      }
      ctx.stroke();

      var origin = project3DLocal(0, 0, 0, cx, cy, scale, azimuth, elevation);
      var axisX = project3DLocal(1.15, 0, 0, cx, cy, scale, azimuth, elevation);
      var axisY = project3DLocal(0, 1.15, 0, cx, cy, scale, azimuth, elevation);
      var axisZPos = project3DLocal(0, 0, 1.25, cx, cy, scale, azimuth, elevation);
      var axisZNeg = project3DLocal(0, 0, -1.25, cx, cy, scale, azimuth, elevation);

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

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.timeColor;
      ctx.fillText('+ct (Future)', axisZPos.x + 8, axisZPos.y + 4);
      ctx.fillStyle = colors.subtleText;
      ctx.fillText('-ct (Past)', axisZNeg.x + 8, axisZNeg.y + 4);

      ctx.fillStyle = colors.spaceColor;
      ctx.fillText('x (Space 1)', axisX.x + 6, axisX.y + 4);
      ctx.fillText('y (Space 2)', axisY.x + 6, axisY.y + 4);

      var coneLevels = [-1.0, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1.0];
      var numCirclePts = 36;

      for (var k = 0; k < coneLevels.length; k++) {
        var level = coneLevels[k];
        var radius = Math.abs(level);
        ctx.strokeStyle = colors.isLight ? 'rgba(217, 119, 6, 0.25)' : 'rgba(250, 204, 21, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (var i = 0; i <= numCirclePts; i++) {
          var angle = (i / numCirclePts) * Math.PI * 2;
          var px = Math.cos(angle) * radius;
          var py = Math.sin(angle) * radius;
          var pt = project3DLocal(px, py, level, cx, cy, scale, azimuth, elevation);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      var numGenerators = 8;
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 1.5;
      for (var g = 0; g < numGenerators; g++) {
        var gAngle = (g / numGenerators) * Math.PI * 2;
        var cosA = Math.cos(gAngle);
        var sinA = Math.sin(gAngle);

        var pBottom = project3DLocal(cosA, sinA, -1.0, cx, cy, scale, azimuth, elevation);
        var pTop = project3DLocal(cosA, sinA, 1.0, cx, cy, scale, azimuth, elevation);

        ctx.beginPath();
        ctx.moveTo(pBottom.x, pBottom.y);
        ctx.lineTo(origin.x, origin.y);
        ctx.lineTo(pTop.x, pTop.y);
        ctx.stroke();
      }

      var planeRadius = 1.15;
      var slicePlanePts = [
        project3DLocal(-planeRadius, -planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
        project3DLocal(planeRadius, -planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
        project3DLocal(planeRadius, planeRadius, sliceT, cx, cy, scale, azimuth, elevation),
        project3DLocal(-planeRadius, planeRadius, sliceT, cx, cy, scale, azimuth, elevation)
      ];

      ctx.fillStyle = sliceT >= 0
        ? (colors.isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)')
        : (colors.isLight ? 'rgba(100, 116, 139, 0.06)' : 'rgba(148, 163, 184, 0.05)');
      ctx.beginPath();
      ctx.moveTo(slicePlanePts[0].x, slicePlanePts[0].y);
      for (var p = 1; p < 4; p++) ctx.lineTo(slicePlanePts[p].x, slicePlanePts[p].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = colors.timeColor;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      var waveR = Math.abs(sliceT);
      ctx.strokeStyle = colors.photonColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var w = 0; w <= numCirclePts; w++) {
        var wAngle = (w / numCirclePts) * Math.PI * 2;
        var wpx = Math.cos(wAngle) * waveR;
        var wpy = Math.sin(wAngle) * waveR;
        var wpt = project3DLocal(wpx, wpy, sliceT, cx, cy, scale, azimuth, elevation);
        if (w === 0) ctx.moveTo(wpt.x, wpt.y);
        else ctx.lineTo(wpt.x, wpt.y);
      }
      ctx.stroke();

      var sliceCenter = project3DLocal(0, 0, sliceT, cx, cy, scale, azimuth, elevation);
      drawGlowingDot(ctx, sliceCenter.x, sliceCenter.y, colors.timeColor, 4.5);

      var emerald = colors.isLight ? '#059669' : '#10b981';
      drawGlowingDot(ctx, origin.x, origin.y, emerald, 6);

      ctx.font = '700 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = emerald;
      ctx.fillText('YOU: HERE & NOW (t=0)', origin.x + 12, origin.y + 4);

      if (elSliceTime) elSliceTime.textContent = (sliceT >= 0 ? '+' : '') + sliceT.toFixed(2) + ' c·t';
      if (elWaveRadius) elWaveRadius.textContent = waveR.toFixed(2) + ' light-dist';

      if (elRegionBadge) {
        if (Math.abs(sliceT) < 0.05) {
          elRegionBadge.textContent = 'THE PRESENT: HERE & NOW';
          elRegionBadge.style.color = emerald;
        } else if (sliceT > 0) {
          elRegionBadge.textContent = 'CAUSAL FUTURE (Expanding Light Ripple: r = ct)';
          elRegionBadge.style.color = colors.timeColor;
        } else {
          elRegionBadge.textContent = 'CAUSAL PAST (Converging Light: r = c|t|)';
          elRegionBadge.style.color = colors.photonColor;
        }
      }
    }

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastMouseX;
      var dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      azimuth += dx * 0.01;
      elevation = Math.max(-0.6, Math.min(1.2, elevation + dy * 0.01));

      if (sliderAzimuth) sliderAzimuth.value = azimuth.toFixed(2);
      if (sliderElevation) sliderElevation.value = elevation.toFixed(2);
      draw();
    });

    window.addEventListener('mouseup', function () {
      isDragging = false;
    });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - lastMouseX;
      var dy = e.touches[0].clientY - lastMouseY;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;

      azimuth += dx * 0.01;
      elevation = Math.max(-0.6, Math.min(1.2, elevation + dy * 0.01));
      draw();
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isDragging = false;
    });

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        sliceT = parseFloat(e.target.value);
        draw();
      });
    }

    if (sliderAzimuth) {
      sliderAzimuth.addEventListener('input', function (e) {
        azimuth = parseFloat(e.target.value);
        draw();
      });
    }

    if (sliderElevation) {
      sliderElevation.addEventListener('input', function (e) {
        elevation = parseFloat(e.target.value);
        draw();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        azimuth = 0.65;
        elevation = 0.05;
        sliceT = 0.4;
        if (sliderTime) sliderTime.value = 0.4;
        if (sliderAzimuth) sliderAzimuth.value = 0.65;
        if (sliderElevation) sliderElevation.value = 0.05;
        draw();
      });
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    draw();
  }

  // SIMULATION 3: Cosmic Horizon & Human Lifespan Simulator (Split 03A Space & 03B Spacetime)
  function initWidgetCosmicHorizon(containerId) {
    // Find all relevant containers (split 03A and 03B, or fallback single container)
    var containerA = document.getElementById('widget-cosmic-horizon-space');
    var containerB = document.getElementById('widget-cosmic-horizon-spacetime');
    var fallbackContainer = containerId ? document.getElementById(containerId) : document.getElementById('widget-cosmic-horizon');

    var containers = [];
    if (containerA) containers.push(containerA);
    if (containerB) containers.push(containerB);
    if (fallbackContainer && containers.indexOf(fallbackContainer) === -1) containers.push(fallbackContainer);
    if (containers.length === 0) return;

    var canvasRadarList = [];
    var canvasConeList = [];
    var slidersAge = [];
    var elsAgeNum = [];
    var elsAgeDisplay = [];
    var elsHorizonRadius = [];
    var elsTargetName = [];
    var elsCausalStatus = [];
    var allPresetBtns = [];
    var btnsAutoAge = [];

    containers.forEach(function (c) {
      var cr = c.querySelector('.canvas-radar');
      if (cr) canvasRadarList.push(cr);
      var cc = c.querySelector('.canvas-spacetime-cone');
      if (cc) canvasConeList.push(cc);

      var sa = c.querySelector('.slider-lifespan-age');
      if (sa) slidersAge.push(sa);
      var an = c.querySelector('.val-age-num');
      if (an) elsAgeNum.push(an);
      var ad = c.querySelector('.val-age-display');
      if (ad) elsAgeDisplay.push(ad);
      var hr = c.querySelector('.val-horizon-radius');
      if (hr) elsHorizonRadius.push(hr);
      var tn = c.querySelector('.val-target-name');
      if (tn) elsTargetName.push(tn);
      var cs = c.querySelector('.val-causal-status');
      if (cs) elsCausalStatus.push(cs);
      var pb = c.querySelectorAll('.preset-star');
      if (pb && pb.length) pb.forEach(function (btn) { allPresetBtns.push(btn); });
      var ba = c.querySelector('.btn-auto-age');
      if (ba) btnsAutoAge.push(ba);
    });

    var currentAge = 25;
    if (slidersAge.length > 0) {
      currentAge = parseFloat(slidersAge[0].value) || 25;
    }

    var selectedStar = {
      name: 'Vega',
      label: 'Vega (25 ly)',
      dist: 25.0,
      angle: -0.45 // angle in physical radar space (radians)
    };

    var stars = [
      { name: 'The Sun', label: 'Sun (8.3m)', dist: 0.000016, angle: 0 },
      { name: 'Proxima Centauri', label: 'Proxima (4.2 ly)', dist: 4.2, angle: 1.85 },
      { name: 'Sirius', label: 'Sirius (8.6 ly)', dist: 8.6, angle: 3.6 },
      { name: 'Vega', label: 'Vega (25 ly)', dist: 25.0, angle: -0.45 },
      { name: 'Regulus', label: 'Regulus (79 ly)', dist: 79.0, angle: 0.95 },
      { name: 'Alkaid', label: 'Alkaid (104 ly)', dist: 104.0, angle: -2.35 }
    ];

    var isPlaying = false;
    var animFrameId = null;
    var maxLifespan = 80;
    var maxRadarDist = 106; // Zoomed-in coordinate radius: Alkaid (104 ly) sits comfortably at the perimeter
    var maxTimePlot = 115;  // vertical time axis scale in years

    function updateTelemetry() {
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      slidersAge.forEach(function (sl) { sl.value = currentAge.toFixed(1); });
      elsAgeNum.forEach(function (el) { el.textContent = currentAge.toFixed(1) + ' yrs'; });
      elsAgeDisplay.forEach(function (el) { el.textContent = currentAge.toFixed(1) + ' yrs'; });
      elsHorizonRadius.forEach(function (el) { el.textContent = currentAge.toFixed(1) + ' ly'; });

      var starText = selectedStar.dist < 0.001
        ? selectedStar.name + ' (8.3m)'
        : selectedStar.name + ' (' + selectedStar.dist.toFixed(1) + ' ly)';
      elsTargetName.forEach(function (el) { el.textContent = starText; });

      var statusText = '';
      var statusColor = colors.timeColor;
      if (currentAge >= selectedStar.dist) {
        statusText = selectedStar.dist < 0.001
          ? 'WITNESSED (Arrived in 8.3 mins)'
          : 'IN PAST CONE (Arrived at age ' + selectedStar.dist.toFixed(1) + ')';
        statusColor = emerald;
      } else if (selectedStar.dist <= maxLifespan) {
        var waitYrs = (selectedStar.dist - currentAge).toFixed(1);
        statusText = 'EN ROUTE (Arrives at age ' + selectedStar.dist.toFixed(1) + ' · in ' + waitYrs + 'y)';
        statusColor = colors.timeColor;
      } else {
        statusText = 'PERMANENTLY ELSEWHERE (Takes ' + selectedStar.dist.toFixed(0) + 'y · > 80y Life)';
        statusColor = danger;
      }

      elsCausalStatus.forEach(function (el) {
        el.textContent = statusText;
        el.style.color = statusColor;
      });

      // Update preset chips active state across all containers
      allPresetBtns.forEach(function (btn) {
        var pName = btn.getAttribute('data-name');
        if (pName === selectedStar.name) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // ── 1. Physical Stellar Radar Canvas (Simulation 03A) ─────────────────────
    function drawRadar() {
      if (canvasRadarList.length === 0) return;
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      canvasRadarList.forEach(function (cRadar) {
        var ret = setupRetinaCanvas(cRadar);
        var ctx = ret.ctx, w = ret.width, h = ret.height;
        ctx.clearRect(0, 0, w, h);

        var cx = w / 2;
        var cy = h / 2;
        // Zoomed in with tight margin (14px) so inner stars have generous separation
        var maxPlotR = Math.min(cx, cy) - 14;
        var scale = maxPlotR / maxRadarDist; // pixels per light-year

        // Concentric subtle radar rings (20, 40, 60, 80, 100 ly)
        ctx.strokeStyle = colors.gridLine;
        ctx.lineWidth = 0.75;
        var rings = [20, 40, 60, 80, 100];
        for (var r = 0; r < rings.length; r++) {
          var radiusPx = rings[r] * scale;
          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = '500 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.subtleText;
          ctx.fillText(rings[r] + ' ly', cx + 4, cy - radiusPx + 10);
        }

        // Expanding Earth Causal Bubble / Reach (r = currentAge * c)
        var bubbleR = currentAge * scale;
        if (bubbleR > 0) {
          ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.16)';
          ctx.beginPath();
          ctx.arc(cx, cy, bubbleR, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = colors.timeColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = colors.timeColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(cx, cy, bubbleR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Radius label
          if (bubbleR > 20) {
            ctx.font = '600 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.timeColor;
            ctx.fillText('r = ' + currentAge.toFixed(1) + ' ly', cx + bubbleR * 0.5 - 18, cy + 12);
          }
        }

        // Draw Selected Star's expanding wavefront from star towards Earth
        if (selectedStar.dist >= 1.0) {
          var starX = cx + Math.cos(selectedStar.angle) * selectedStar.dist * scale;
          var starY = cy + Math.sin(selectedStar.angle) * selectedStar.dist * scale;

          var starWaveR = currentAge * scale;
          ctx.strokeStyle = colors.isLight ? 'rgba(234, 88, 12, 0.65)' : 'rgba(251, 146, 60, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(starX, starY, starWaveR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Earth at the center
        var isEarthReceiving = Math.abs(currentAge - selectedStar.dist) < 1.2;
        if (isEarthReceiving && selectedStar.dist >= 1.0) {
          // Flash arrival pulse on Earth
          ctx.fillStyle = colors.photonColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        drawGlowingDot(ctx, cx, cy, emerald, 5);
        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = emerald;
        ctx.fillText('Earth (You)', cx + 8, cy + 3);

        // Draw Stars
        for (var s = 0; s < stars.length; s++) {
          var star = stars[s];
          if (star.dist < 0.001) continue; // Sun on center

          var isSelected = star.name === selectedStar.name;
          var hasReached = currentAge >= star.dist;

          var sx = cx + Math.cos(star.angle) * star.dist * scale;
          var sy = cy + Math.sin(star.angle) * star.dist * scale;

          if (hasReached) {
            // Reached / Witnessed: glowing golden flare
            drawGlowingDot(ctx, sx, sy, colors.photonColor, isSelected ? 6.5 : 4.5);
            if (isSelected) {
              ctx.strokeStyle = colors.photonColor;
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]);
              ctx.beginPath();
              ctx.arc(sx, sy, 11, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
            }
            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.photonColor;
            ctx.fillText(star.label, sx + 8, sy - 2);
            ctx.font = '500 8px "JetBrains Mono", monospace';
            ctx.fillStyle = emerald;
            ctx.fillText('✓ Reached at ' + star.dist.toFixed(1) + 'y', sx + 8, sy + 8);
          } else {
            // Not yet reached: dimmed / waiting
            ctx.fillStyle = star.dist > maxLifespan ? danger : (colors.isLight ? '#94a3b8' : '#64748b');
            ctx.beginPath();
            ctx.arc(sx, sy, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            if (isSelected) {
              ctx.strokeStyle = star.dist > maxLifespan ? danger : colors.timeColor;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(sx, sy, 9, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.font = (isSelected ? '700' : '600') + ' 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = isSelected ? (star.dist > maxLifespan ? danger : colors.textPrimary) : colors.subtleText;
            ctx.fillText(star.label, sx + 8, sy + 3);

            if (star.dist > maxLifespan) {
              ctx.font = '500 7.5px "JetBrains Mono", monospace';
              ctx.fillStyle = danger;
              ctx.fillText('Elsewhere (Takes ' + star.dist.toFixed(0) + 'y)', sx + 8, sy + 13);
            }
          }
        }
      });
    }

    // ── 2. Spacetime Coordinate Canvas (Simulation 03B, x vs ct) ────────────
    function drawSpacetimeCone() {
      if (canvasConeList.length === 0) return;
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      canvasConeList.forEach(function (cCone) {
        var ret = setupRetinaCanvas(cCone);
        var ctx = ret.ctx, w = ret.width, h = ret.height;
        ctx.clearRect(0, 0, w, h);

        var padLeft = 45;
        var padRight = 35;
        var padBottom = 32;
        var padTop = 25;

        var ox = padLeft + (w - padLeft - padRight) / 2;
        var oy = h - padBottom;
        var plotW = (w - padLeft - padRight) / 2;
        var plotH = oy - padTop;

        var scaleX = plotW / maxTimePlot; // pixels per light-year
        var scaleY = plotH / maxTimePlot;  // pixels per year

        drawGrid(ctx, ox, oy, w, h, 36);

        // Axes
        ctx.strokeStyle = colors.axisLine;
        ctx.lineWidth = 1.75;

        // Horizontal space axis
        ctx.beginPath();
        ctx.moveTo(padLeft - 10, oy);
        ctx.lineTo(w - padRight + 15, oy);
        ctx.stroke();

        // Vertical time axis
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox, padTop - 12);
        ctx.stroke();

        // Arrowheads
        ctx.fillStyle = colors.axisArrow;
        ctx.beginPath();
        ctx.moveTo(w - padRight + 15, oy - 3);
        ctx.lineTo(w - padRight + 21, oy);
        ctx.lineTo(w - padRight + 15, oy + 3);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(ox - 3, padTop - 12);
        ctx.lineTo(ox, padTop - 18);
        ctx.lineTo(ox + 3, padTop - 12);
        ctx.fill();

        // Axis labels
        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.spaceColor;
        ctx.fillText('+x (ly)', w - padRight - 15, oy + 18);
        ctx.fillText('-x', padLeft - 8, oy + 18);
        ctx.fillStyle = colors.timeColor;
        ctx.fillText('ct (Years)', ox + 8, padTop - 8);

        // Axis tick marks (Space: ±40, ±80, ±100 ly)
        ctx.font = '500 8px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.subtleText;
        var spaceTicks = [-100, -80, -40, 40, 80, 100];
        for (var st = 0; st < spaceTicks.length; st++) {
          var tickX = ox + spaceTicks[st] * scaleX;
          ctx.strokeStyle = colors.axisLine;
          ctx.beginPath();
          ctx.moveTo(tickX, oy - 3);
          ctx.lineTo(tickX, oy + 3);
          ctx.stroke();
          ctx.fillText(spaceTicks[st], tickX - (Math.abs(spaceTicks[st]) >= 100 ? 12 : 8), oy + 14);
        }

        // Time ticks: 20, 40, 60, 80, 100 yr
        var timeTicks = [20, 40, 60, 80, 100];
        for (var tt = 0; tt < timeTicks.length; tt++) {
          var valT = timeTicks[tt];
          var tickY = oy - valT * scaleY;
          ctx.strokeStyle = colors.axisLine;
          ctx.beginPath();
          ctx.moveTo(ox - 3, tickY);
          ctx.lineTo(ox + 3, tickY);
          ctx.stroke();
          ctx.fillText(valT + 'y', ox - (valT >= 100 ? 30 : 24), tickY + 3);
        }

        // Maximum 80-year lifespan horizontal line
        var y80 = oy - 80 * scaleY;
        ctx.strokeStyle = danger;
        ctx.lineWidth = 1.25;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ox - 85 * scaleX, y80);
        ctx.lineTo(ox + 85 * scaleX, y80);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = danger;
        ctx.fillText('80-Yr Life Boundary', ox + 35 * scaleX, y80 - 4);

        // Past Light Cone at Current Age
        var apexY = oy - currentAge * scaleY;
        var coneLeftX = ox - currentAge * scaleX;
        var coneRightX = ox + currentAge * scaleX;

        if (currentAge > 0) {
          // Shaded Past Light Cone interior
          ctx.fillStyle = colors.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.14)';
          ctx.beginPath();
          ctx.moveTo(ox, apexY);
          ctx.lineTo(coneLeftX, oy);
          ctx.lineTo(coneRightX, oy);
          ctx.closePath();
          ctx.fill();

          // Light cone boundaries (45° photon paths)
          ctx.strokeStyle = colors.photonColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox, apexY);
          ctx.lineTo(coneLeftX, oy);
          ctx.moveTo(ox, apexY);
          ctx.lineTo(coneRightX, oy);
          ctx.stroke();

          if (currentAge >= 15) {
            ctx.font = '600 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.photonColor;
            ctx.fillText('Past Light Cone', ox + (currentAge * scaleX) * 0.4 + 4, apexY + (currentAge * scaleY) * 0.5);
          }
        }

        // Observer's Worldline (at x = 0, climbs from t = 0 to t = currentAge)
        ctx.strokeStyle = colors.timeColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox, apexY);
        ctx.stroke();

        // Glowing dot for observer's current moment
        drawGlowingDot(ctx, ox, apexY, colors.timeColor, 6);
        ctx.font = '700 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.timeColor;
        ctx.fillText('You: Age ' + currentAge.toFixed(1), ox + 10, apexY + 3);

        // Star events at t = 0 (emitted on day you were born)
        for (var s = 0; s < stars.length; s++) {
          var star = stars[s];
          if (star.dist < 0.001) continue;

          var isSelected = star.name === selectedStar.name;
          var hasReached = currentAge >= star.dist;

          var starX = ox + star.dist * scaleX;
          var starY = oy;

          // Event dot on t=0 axis
          drawGlowingDot(ctx, starX, starY, hasReached ? colors.photonColor : (star.dist > maxLifespan ? danger : (colors.isLight ? '#94a3b8' : '#64748b')), isSelected ? 6 : 3.5);

          // Worldline of star (vertical line at x = star.dist)
          ctx.strokeStyle = colors.isLight ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.35)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(starX, oy);
          ctx.lineTo(starX, padTop);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ray of light racing to Earth (reaches observer's worldline at t = star.dist)
          var arrivalY = oy - star.dist * scaleY;
          ctx.strokeStyle = star.dist > maxLifespan ? danger : colors.photonColor;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(starX, starY);
          ctx.lineTo(ox, arrivalY);
          ctx.stroke();

          if (isSelected) {
            drawGlowingDot(ctx, ox, arrivalY, star.dist > maxLifespan ? danger : emerald, 5);
            ctx.font = '700 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = star.dist > maxLifespan ? danger : emerald;
            ctx.fillText('Arrival: t=' + star.dist.toFixed(0) + 'y' + (star.dist > maxLifespan ? ' (After Death)' : ''), ox - (star.dist > maxLifespan ? 140 : 95), arrivalY - 4);
          }

          ctx.font = (isSelected ? '700' : '500') + ' 8px "JetBrains Mono", monospace';
          ctx.fillStyle = isSelected ? (star.dist > maxLifespan ? danger : colors.photonColor) : colors.subtleText;
          ctx.fillText(star.name, starX - 12, oy + 24);
        }
      });
    }

    function renderAll() {
      updateTelemetry();
      drawRadar();
      drawSpacetimeCone();
    }

    slidersAge.forEach(function (slider) {
      slider.addEventListener('input', function (e) {
        currentAge = parseFloat(e.target.value);
        if (isPlaying) stopAnimation();
        renderAll();
      });
    });

    allPresetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dist = parseFloat(btn.getAttribute('data-dist'));
        var name = btn.getAttribute('data-name');
        for (var i = 0; i < stars.length; i++) {
          if (stars[i].name === name || Math.abs(stars[i].dist - dist) < 0.01) {
            selectedStar = stars[i];
            break;
          }
        }
        if (isPlaying) stopAnimation();
        renderAll();
      });
    });

    function stopAnimation() {
      isPlaying = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      btnsAutoAge.forEach(function (btn) {
        btn.innerHTML = '<span>▶</span><span>Simulate Lifespan</span>';
      });
    }

    function startAnimation() {
      isPlaying = true;
      btnsAutoAge.forEach(function (btn) {
        btn.innerHTML = '<span>⏸</span><span>Pause</span>';
      });
      var lastTime = performance.now();

      function step(now) {
        if (!isPlaying) return;
        var dt = (now - lastTime) / 1000;
        lastTime = now;

        currentAge += dt * 10; // 10 years per second
        if (currentAge >= maxLifespan) {
          currentAge = maxLifespan;
          renderAll();
          stopAnimation();
          return;
        }

        renderAll();
        animFrameId = requestAnimationFrame(step);
      }

      animFrameId = requestAnimationFrame(step);
    }

    btnsAutoAge.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (isPlaying) {
          stopAnimation();
        } else {
          if (currentAge >= maxLifespan) currentAge = 0;
          startAnimation();
        }
      });
    });

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }



  function initAllPost02() {
    initWidgetDualSpeedSpacetime('widget-dual-bridge');
    initWidgetExpandingCircles('widget-expanding-circles');
    initWidget3DLightConeExplorer('widget-3d-light-cone');
    initWidgetCosmicHorizon('widget-cosmic-horizon');
    initWidgetSynthesisGrid('widget-synthesis-grid');
  }

  sim.initWidgetDualSpeedSpacetime = initWidgetDualSpeedSpacetime;
  sim.initWidgetExpandingCircles = initWidgetExpandingCircles;
  sim.initWidget3DLightConeExplorer = initWidget3DLightConeExplorer;
  sim.initWidgetCosmicHorizon = initWidgetCosmicHorizon;
  sim.initWidgetSynthesisGrid = initWidgetSynthesisGrid;
  sim.initAllPost02 = initAllPost02;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPost02);
  } else {
    initAllPost02();
  }
})(window);
