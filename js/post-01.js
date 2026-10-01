/**
 * post-01.js - Part 1 Interactive Simulations: Why Motion Through Space Affects Time
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

  function initWidgetCars(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasMap = container.querySelector('.canvas-map');
    var canvasVel = container.querySelector('.canvas-vel');
    var sliderTime = container.querySelector('.slider-time');
    var sliderAngle = container.querySelector('.slider-angle');
    var btnPlay = container.querySelector('.btn-play');
    var valAngleLabel = container.querySelector('.val-angle-label');
    var valTimeLabel = container.querySelector('.val-time-label');

    var progress = 0.60;
    var angleDeg = 60;
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function updateReadouts() {
      if (valTimeLabel) valTimeLabel.innerText = progress.toFixed(2) + ' hr';
      if (valAngleLabel) valAngleLabel.innerText = Math.round(angleDeg) + '°';
    }

    function drawMap() {
      if (!canvasMap) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvasMap);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = 48;
      var oy = height - 42;
      var maxDistMiles = 60;
      var scale = Math.min(width - 75, height - 70);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'East x₁ (mi)', 'North x₂ (mi)');

      // Axis Tick marks for 20, 40, 60 miles
      ctx.fillStyle = c.axisText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      [20, 40, 60].forEach(function (m) {
        var px = ox + (m / maxDistMiles) * scale;
        var py = oy - (m / maxDistMiles) * scale;

        // East tick
        ctx.beginPath();
        ctx.moveTo(px, oy - 3);
        ctx.lineTo(px, oy + 3);
        ctx.stroke();
        ctx.fillText(m + '', px, oy + 6);

        // North tick
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(m + '', ox - 6, py);
        ctx.textAlign = 'center';
      });

      var rad = (angleDeg * Math.PI) / 180;
      var c1_dist = progress * maxDistMiles;
      var c1_x = ox;
      var c1_y = oy - (c1_dist / maxDistMiles) * scale;

      var c2_x1 = c1_dist * Math.sin(rad);
      var c2_x2 = c1_dist * Math.cos(rad);
      var c2_x = ox + (c2_x1 / maxDistMiles) * scale;
      var c2_y = oy - (c2_x2 / maxDistMiles) * scale;

      // Full projected track guidelines (dashed)
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);

      // Blue track guideline
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - scale);
      ctx.stroke();

      // Orange track guideline
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + scale * Math.sin(rad), oy - scale * Math.cos(rad));
      ctx.stroke();
      ctx.setLineDash([]);

      // Orange coordinate dashed drop lines (to East and North axes)
      if (progress > 0.05 && angleDeg > 2 && angleDeg < 88) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.2;
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

        // Right angle symbol at (ox, c2_y)
        var sq = 7;
        if (c2_x - ox > sq + 3 && oy - c2_y > sq + 3) {
          ctx.strokeStyle = c.axisLine;
          ctx.beginPath();
          ctx.moveTo(ox, c2_y + sq);
          ctx.lineTo(ox + sq, c2_y + sq);
          ctx.lineTo(ox + sq, c2_y);
          ctx.stroke();
        }
      }

      // Traveled Path Lines
      // Blue Path
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(c1_x, c1_y);
      ctx.stroke();

      // Orange Path
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(c2_x, c2_y);
      ctx.stroke();

      // Origin dot
      drawGlowingDot(ctx, ox, oy, c.axisLine, 4);

      // Car nodes
      drawGlowingDot(ctx, c1_x, c1_y, c.timeColor, 6);
      drawGlowingDot(ctx, c2_x, c2_y, c.spaceColor, 6);

      // Position badges
      var pillYOffset = 18;
      drawLabelPill(ctx, 'Blue: ' + c1_dist.toFixed(1) + ' mi N', c1_x + (c2_x - c1_x < 50 && c1_x > ox ? -50 : 0), c1_y - pillYOffset, {
        textColor: c.timeColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });

      var orangeLabelX = c2_x + (angleDeg > 70 ? -10 : 35);
      var orangeLabelY = c2_y + (angleDeg > 70 ? -18 : 4);
      drawLabelPill(ctx, 'Orange: (' + c2_x1.toFixed(1) + ', ' + c2_x2.toFixed(1) + ') mi', orangeLabelX, orangeLabelY, {
        textColor: c.spaceColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
    }

    function drawVel() {
      if (!canvasVel) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvasVel);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = 48;
      var oy = height - 42;
      var radius = Math.min(width - 75, height - 70);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'V_East (mph)', 'V_North (mph)');

      // Axis speed marks at 30, 60 mph
      ctx.fillStyle = c.axisText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      [30, 60].forEach(function (v) {
        var px = ox + (v / 60) * radius;
        var py = oy - (v / 60) * radius;

        ctx.beginPath();
        ctx.moveTo(px, oy - 3);
        ctx.lineTo(px, oy + 3);
        ctx.stroke();
        ctx.fillText(v + '', px, oy + 6);

        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(v + '', ox - 6, py);
        ctx.textAlign = 'center';
      });

      // Invariant 60 mph Speed Circle Constraint Arc
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed Arc Constraint Pill Badge
      var arcMidA = -Math.PI / 4;
      var arcPillX = ox + radius * Math.cos(arcMidA);
      var arcPillY = oy + radius * Math.sin(arcMidA);
      drawLabelPill(ctx, '|V| = 60 mph circle', arcPillX + 22, arcPillY - 10, {
        textColor: c.invariantColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      var rad = (angleDeg * Math.PI) / 180;
      var vEast = 60 * Math.sin(rad);
      var vNorth = 60 * Math.cos(rad);
      var tipX = ox + radius * Math.sin(rad);
      var tipY = oy - radius * Math.cos(rad);

      // Angle Theta Arc at Origin
      if (angleDeg > 2) {
        var arcR = Math.min(46, radius * 0.35);
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, arcR, -Math.PI / 2, -Math.PI / 2 + rad, false);
        ctx.stroke();

        // Arrowhead on arc
        var endA = -Math.PI / 2 + rad;
        var arrowX = ox + arcR * Math.cos(endA);
        var arrowY = oy + arcR * Math.sin(endA);
        var tangentA = endA + Math.PI / 2;
        ctx.fillStyle = c.spaceColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 5 * Math.cos(tangentA - 0.45), arrowY - 5 * Math.sin(tangentA - 0.45));
        ctx.lineTo(arrowX - 5 * Math.cos(tangentA + 0.45), arrowY - 5 * Math.sin(tangentA + 0.45));
        ctx.closePath();
        ctx.fill();

        // Theta label
        var midA = -Math.PI / 2 + rad / 2;
        var badgeDist = arcR + 18;
        var badgeX = ox + badgeDist * Math.cos(midA);
        var badgeY = oy + badgeDist * Math.sin(midA);
        drawLabelPill(ctx, 'θ = ' + Math.round(angleDeg) + '°', badgeX + (rad > 0.8 ? 6 : 0), badgeY, {
          textColor: c.spaceColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // Right-Triangle Decomposition Dashed Lines for Orange Car
      if (angleDeg > 2 && angleDeg < 88) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Horizontal line from tip to vertical North axis
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(ox, tipY);
        ctx.stroke();

        // Vertical line from tip down to East axis
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small square for right angle
        var sq = 8;
        if (tipX - ox > sq + 4 && oy - tipY > sq + 4) {
          ctx.strokeStyle = c.axisLine;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, tipY + sq);
          ctx.lineTo(ox + sq, tipY + sq);
          ctx.lineTo(ox + sq, tipY);
          ctx.stroke();
        }

        // Component label: V_East
        if (tipX - ox > 35) {
          drawLabelPill(ctx, 'V_East = ' + vEast.toFixed(1) + ' mph', (ox + tipX) / 2, tipY - 12, {
            textColor: c.spaceColor,
            font: 'bold 10px "JetBrains Mono", monospace'
          });
        }

        // Component label: V_North
        if (oy - tipY > 25) {
          drawLabelPill(ctx, 'V_North = ' + vNorth.toFixed(1) + ' mph', Math.min(width - 55, tipX + 55), (oy + tipY) / 2, {
            textColor: c.spaceColor,
            font: 'bold 10px "JetBrains Mono", monospace'
          });
        }
      }

      // Blue Car Velocity Vector (North: 0, 60 mph)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - radius);
      ctx.stroke();

      // Arrowhead for Blue Vector
      ctx.fillStyle = c.timeColor;
      ctx.beginPath();
      ctx.moveTo(ox, oy - radius - 5);
      ctx.lineTo(ox - 5, oy - radius + 4);
      ctx.lineTo(ox + 5, oy - radius + 4);
      ctx.closePath();
      ctx.fill();

      // Label for Blue Vector
      var bluePillX = angleDeg < 5 ? ox - 50 : ox - 35;
      drawLabelPill(ctx, 'V_Blue (60 mph)', bluePillX, oy - radius - 16, {
        textColor: c.timeColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
      drawGlowingDot(ctx, ox, oy - radius, c.timeColor, 5);

      // Orange Car Velocity Vector (Tilted: vEast, vNorth)
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Arrowhead for Orange Vector
      var arrowAng = Math.atan2(tipY - oy, tipX - ox);
      ctx.fillStyle = c.spaceColor;
      ctx.beginPath();
      ctx.moveTo(tipX + 5 * Math.cos(arrowAng), tipY + 5 * Math.sin(arrowAng));
      ctx.lineTo(tipX - 6 * Math.cos(arrowAng - 0.5), tipY - 6 * Math.sin(arrowAng - 0.5));
      ctx.lineTo(tipX - 6 * Math.cos(arrowAng + 0.5), tipY - 6 * Math.sin(arrowAng + 0.5));
      ctx.closePath();
      ctx.fill();

      // Label for Orange Vector
      var orangePillX = angleDeg < 5 ? ox + 55 : tipX + (angleDeg > 70 ? -15 : 30);
      var orangePillY = angleDeg < 5 ? oy - radius - 16 : tipY + (angleDeg > 70 ? -18 : 6);
      drawLabelPill(ctx, 'V_Orange (' + Math.round(angleDeg) + '°)', orangePillX, orangePillY, {
        textColor: c.spaceColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
      drawGlowingDot(ctx, tipX, tipY, c.spaceColor, 5);
    }

    function draw() {
      drawMap();
      drawVel();
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
      if (isPlaying) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    var anglePresetChips = container.querySelectorAll('.chip-angle');

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        progress = e.target.value / 1000;
        updateReadouts();
        draw();
      });
    }

    if (sliderAngle) {
      sliderAngle.addEventListener('input', function (e) {
        angleDeg = parseFloat(e.target.value);
        anglePresetChips.forEach(function (ch) { ch.classList.remove('active'); });
        updateReadouts();
        draw();
      });
    }

    anglePresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        anglePresetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        angleDeg = parseFloat(chip.getAttribute('data-angle'));
        if (sliderAngle) sliderAngle.value = angleDeg;
        updateReadouts();
        draw();
      });
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
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

    updateReadouts();
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }

  // Widget 2: Motion Purely Through Time (At Rest)
  function initWidgetStationary(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasMap = container.querySelector('.canvas-map');
    var canvasVel = container.querySelector('.canvas-vel');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var clockDisplay = container.querySelector('.clock-time');
    var valTimeLabel = container.querySelector('.val-time-label');

    var animTime = 3.5;
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function update() {
      if (clockDisplay) clockDisplay.innerHTML = animTime.toFixed(2) + ' <span>s</span>';
      if (valTimeLabel) valTimeLabel.innerText = animTime.toFixed(2) + ' s';
    }

    function drawMap() {
      if (!canvasMap) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvasMap);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = 48;
      var oy = height - 42;
      var maxTime = 6.0;
      var maxDistMeters = 30;
      var scaleY = height - 70;
      var scaleX = width - 75;

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'Space Position x (m)', 'Elapsed Time t (s)');

      // Axis Ticks
      ctx.fillStyle = c.axisText || c.subtleText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';

      // Space ticks at 10, 20, 30 m
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      [10, 20, 30].forEach(function (m) {
        var px = ox + (m / maxDistMeters) * scaleX;
        if (px <= width - 20) {
          ctx.beginPath();
          ctx.moveTo(px, oy - 3);
          ctx.lineTo(px, oy + 3);
          ctx.stroke();
          ctx.fillText(m + '', px, oy + 6);
        }
      });

      // Time ticks at 2, 4, 6 s
      [2, 4, 6].forEach(function (t) {
        var py = oy - (t / maxTime) * scaleY;
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(t + ' s', ox - 6, py);
        ctx.textAlign = 'center';
      });

      // Projected vertical timeline guide (dashed)
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      var currentY = oy - (animTime / maxTime) * scaleY;

      // Traveled Worldline Path (pure vertical through time at x=0)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, currentY);
      ctx.stroke();

      // Origin dot
      drawGlowingDot(ctx, ox, oy, c.axisLine, 4);

      // Current Observer position dot
      drawGlowingDot(ctx, ox, currentY, c.timeColor, 6);

      // Status pill at current position
      drawLabelPill(ctx, 'Observer: x = 0 m, t = ' + animTime.toFixed(2) + ' s', ox + 72, currentY - 14, {
        textColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      // Spatial annotation at base
      drawLabelPill(ctx, 'Stationary in space (x = 0)', ox + 80, oy + 22, {
        textColor: c.axisLabel,
        font: 'bold 10px "JetBrains Mono", monospace'
      });
    }

    function drawVel() {
      if (!canvasVel) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvasVel);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = 48;
      var oy = height - 42;
      var radius = Math.min(width - 75, height - 70);
      var progress = animTime / 6.0;

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'Space Speed (v_space)', 'Time Speed (v_time)');

      // Axis speed marks at 50% V and 100% V
      ctx.fillStyle = c.axisText || c.subtleText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      [{ v: 0.5, label: '50% V' }, { v: 1.0, label: '100% V' }].forEach(function (tick) {
        var px = ox + tick.v * radius;
        var py = oy - tick.v * radius;

        // Space speed tick
        ctx.beginPath();
        ctx.moveTo(px, oy - 3);
        ctx.lineTo(px, oy + 3);
        ctx.stroke();
        ctx.fillText(tick.label, px, oy + 6);

        // Time speed tick
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(tick.label, ox - 6, py);
        ctx.textAlign = 'center';
      });

      // Constant Total Speed Arc Constraint (dashed)
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Origin dot
      drawGlowingDot(ctx, ox, oy, c.axisLine, 4);

      var tipY = oy - radius;

      // Rest state indicator along space axis
      drawLabelPill(ctx, 'v_space = 0 (At rest)', ox + radius * 0.48, oy + 22, {
        textColor: c.axisLabel,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      // Speed vector has constant length V pointing 100% into time
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, tipY);
      ctx.stroke();

      // Arrowhead for Observer Time Vector
      ctx.fillStyle = c.timeColor;
      ctx.beginPath();
      ctx.moveTo(ox, tipY - 5);
      ctx.lineTo(ox - 5, tipY + 4);
      ctx.lineTo(ox + 5, tipY + 4);
      ctx.closePath();
      ctx.fill();

      // Label for Observer Vector & glowing tip
      drawLabelPill(ctx, 'V_Observer (100% of V)', ox - 35, tipY - 16, {
        textColor: c.timeColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
      drawGlowingDot(ctx, ox, tipY, c.timeColor, 5.5);
    }

    function draw() {
      drawMap();
      drawVel();
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
      if (isPlaying) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        animTime = (e.target.value / 1000) * 6.0;
        update();
        draw();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
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
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }

  // Snapshot Grid: 2x2 snapshots of moving observer at t=0, 1, 2, 3
  function initWidgetMovingSnapshots(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var panels = container.querySelectorAll('canvas.motion-panel');
    if (!panels || panels.length === 0) return;

    var MAX_T = 3.0;
    var MAX_DIST = 30.0;
    var SPEED = 8.0; // 8 meters per second

    function drawPanel(canvas, t) {
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var colors = getThemeColors();

      ctx.clearRect(0, 0, w, h);

      var ox = 38;
      var oy = h - 34;
      var scaleX = w - 54;
      var scaleY = h - 54;

      drawGrid(ctx, ox, oy, w, h, 24);
      drawAxes(ctx, ox, oy, w, h, 'Space x (m)', 'Time t (s)');

      // Axis ticks
      ctx.fillStyle = colors.axisText || colors.subtleText;
      ctx.strokeStyle = colors.axisLine;
      ctx.font = '9.5px "JetBrains Mono", monospace';

      // Space ticks at 10, 20, 30 m
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      [10, 20, 30].forEach(function (m) {
        var px = ox + (m / MAX_DIST) * scaleX;
        if (px <= w - 16) {
          ctx.beginPath();
          ctx.moveTo(px, oy - 3);
          ctx.lineTo(px, oy + 3);
          ctx.stroke();
          ctx.fillText(m + '', px, oy + 5);
        }
      });

      // Time ticks at 1, 2, 3 s
      [1, 2, 3].forEach(function (timeSec) {
        var py = oy - (timeSec / 3.5) * scaleY;
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeSec + 's', ox - 5, py);
        ctx.textAlign = 'center';
      });

      // Full projected worldline guideline (dashed)
      var maxProjX = ox + ((3.0 * SPEED) / MAX_DIST) * scaleX;
      var maxProjY = oy - (3.0 / 3.5) * scaleY;
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(maxProjX, maxProjY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current position for snapshot t
      var currentDist = t * SPEED;
      var curX = ox + (currentDist / MAX_DIST) * scaleX;
      var curY = oy - (t / 3.5) * scaleY;

      // Solid trajectory line traced up to t
      if (t > 0) {
        ctx.strokeStyle = colors.spaceColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Dashed coordinate drop lines
        ctx.strokeStyle = colors.spaceColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        // Horizontal drop to time axis
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(ox, curY);
        ctx.stroke();

        // Vertical drop to space axis
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Right angle marker
        var sq = 6;
        if (curX - ox > sq + 2 && oy - curY > sq + 2) {
          ctx.strokeStyle = colors.axisLine;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, curY + sq);
          ctx.lineTo(ox + sq, curY + sq);
          ctx.lineTo(ox + sq, curY);
          ctx.stroke();
        }
      }

      // Origin dot
      drawGlowingDot(ctx, ox, oy, colors.axisLine, 3.5);

      // Current Observer position glowing dot
      drawGlowingDot(ctx, curX, curY, colors.spaceColor, 5.5);

      // Top-Left Snapshot Header Pill Badge
      var pillW = 60, pillH = 20, pillX = 8, pillY = 8;
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
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('t = ' + t + ' s', pillX + pillW / 2, pillY + pillH / 2);

      // In-canvas position coordinate callout
      var labelX = curX + (curX > w - 80 ? -48 : 42);
      var labelY = curY + (t === 0 ? -14 : (curY < 40 ? 14 : -12));
      var labelText = t === 0 ? 'Start (0 m, 0 s)' : '(' + currentDist.toFixed(1) + ' m, ' + t + ' s)';

      drawLabelPill(ctx, labelText, labelX, labelY, {
        textColor: colors.spaceColor,
        font: 'bold 9.5px "JetBrains Mono", monospace'
      });
    }

    function renderAll() {
      for (var i = 0; i < panels.length; i++) {
        var tVal = parseFloat(panels[i].getAttribute('data-t'));
        if (!isNaN(tVal)) {
          drawPanel(panels[i], tVal);
        }
      }
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  // Widget 3: Thought Experiment (Space vs Time Speed Trade-off — Dual View)
  function initWidgetTradeoff(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasMap = container.querySelector('.canvas-map');
    var canvasVel = container.querySelector('.canvas-vel');
    var sliderTime = container.querySelector('.slider-time');
    var sliderSpeed = container.querySelector('.slider-speed');
    var valTimeLabel = container.querySelector('.val-time-label');
    var readoutVx = container.querySelector('.readout-vx');
    var tradeoffPresetChips = container.querySelectorAll('.chip-preset-tradeoff');
    var btnPlay = container.querySelector('.btn-play');

    var animTime = 3.5; // 0 to 6.0 s
    var speedFraction = 0.866; // 0 to 1.0
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function updateReadouts() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      if (valTimeLabel) valTimeLabel.innerText = animTime.toFixed(2) + ' s';
      if (readoutVx) readoutVx.innerText = (speedFraction * 100).toFixed(1) + '% of V';
    }

    function drawMap() {
      if (!canvasMap) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvasMap);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = 48;
      var oy = height - 42;
      var maxTime = 6.0;
      var maxDistMeters = 30;
      var scaleY = height - 70;
      var scaleX = width - 75;

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'Space Position x (m)', 'Elapsed Time t (s)');

      // Axis Ticks
      ctx.fillStyle = c.axisText || c.subtleText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';

      // Space ticks at 10, 20, 30 m
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      [10, 20, 30].forEach(function (m) {
        var px = ox + (m / maxDistMeters) * scaleX;
        if (px <= width - 20) {
          ctx.beginPath();
          ctx.moveTo(px, oy - 3);
          ctx.lineTo(px, oy + 3);
          ctx.stroke();
          ctx.fillText(m + '', px, oy + 6);
        }
      });

      // Time ticks at 2, 4, 6 s
      [2, 4, 6].forEach(function (t) {
        var py = oy - (t / maxTime) * scaleY;
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(t + ' s', ox - 6, py);
        ctx.textAlign = 'center';
      });

      // Max distance reached at maxTime (6s)
      var totalDistAt6s = speedFraction * maxDistMeters;
      var endWorldlineX = ox + (totalDistAt6s / maxDistMeters) * scaleX;
      var endWorldlineY = oy - scaleY;

      // Full projected worldline guideline (dashed)
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(endWorldlineX, endWorldlineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current position at animTime
      var currentDist = (animTime / maxTime) * totalDistAt6s;
      var currentX = ox + (currentDist / maxDistMeters) * scaleX;
      var currentY = oy - (animTime / maxTime) * scaleY;

      // Traveled Worldline Path
      var pathColor = speedFraction > 0.01 ? c.spaceColor : c.timeColor;
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // Right-angle drop lines from current position to axes
      if (speedFraction > 0.02 && animTime > 0.1) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        // Horizontal drop to time axis
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(ox, currentY);
        ctx.stroke();

        // Vertical drop to space axis
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(currentX, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Right angle marker
        var sq = 7;
        if (currentX - ox > sq + 3 && oy - currentY > sq + 3) {
          ctx.strokeStyle = c.axisLine;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, currentY + sq);
          ctx.lineTo(ox + sq, currentY + sq);
          ctx.lineTo(ox + sq, currentY);
          ctx.stroke();
        }
      }

      // Origin dot
      drawGlowingDot(ctx, ox, oy, c.axisLine, 4);

      // Current Observer position dot
      drawGlowingDot(ctx, currentX, currentY, pathColor, 6);

      // Status pill at current position
      var pillLabel = speedFraction > 0.01
        ? 'Observer: (' + currentDist.toFixed(1) + ' m, ' + animTime.toFixed(2) + ' s)'
        : 'Observer: x = 0 m, t = ' + animTime.toFixed(2) + ' s';

      var pillX = currentX + (currentX > width - 110 ? -70 : 65);
      var pillY = currentY - 14;
      drawLabelPill(ctx, pillLabel, pillX, pillY, {
        textColor: pathColor,
        font: 'bold 10.5px "JetBrains Mono", monospace'
      });
    }

    function drawVel() {
      if (!canvasVel) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvasVel);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = 48;
      var oy = height - 42;
      var radius = Math.min(width - 75, height - 70);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'Space Speed (v_space)', 'Time Speed (v_time)');

      // Axis speed marks at 50% V and 100% V
      ctx.fillStyle = c.axisText || c.subtleText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      [{ v: 0.5, label: '50% V' }, { v: 1.0, label: '100% V' }].forEach(function (tick) {
        var px = ox + tick.v * radius;
        var py = oy - tick.v * radius;

        // Space speed tick
        ctx.beginPath();
        ctx.moveTo(px, oy - 3);
        ctx.lineTo(px, oy + 3);
        ctx.stroke();
        ctx.fillText(tick.label, px, oy + 6);

        // Time speed tick
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(tick.label, ox - 6, py);
        ctx.textAlign = 'center';
      });

      // Constant Total Speed Arc Constraint (dashed)
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var tipX = ox + speedFraction * radius;
      var tipY = oy - vt * radius;
      var thetaRad = Math.asin(Math.min(1, Math.max(0, speedFraction)));
      var thetaDeg = (thetaRad * 180) / Math.PI;

      // Angle Theta Arc at Origin
      if (thetaDeg > 2) {
        var arcR = Math.min(46, radius * 0.35);
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, arcR, -Math.PI / 2, -Math.PI / 2 + thetaRad, false);
        ctx.stroke();

        // Arrowhead on arc
        var endA = -Math.PI / 2 + thetaRad;
        var arrowX = ox + arcR * Math.cos(endA);
        var arrowY = oy + arcR * Math.sin(endA);
        var tangentA = endA + Math.PI / 2;
        ctx.fillStyle = c.spaceColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 5 * Math.cos(tangentA - 0.45), arrowY - 5 * Math.sin(tangentA - 0.45));
        ctx.lineTo(arrowX - 5 * Math.cos(tangentA + 0.45), arrowY - 5 * Math.sin(tangentA + 0.45));
        ctx.closePath();
        ctx.fill();

        // Theta label
        var midA = -Math.PI / 2 + thetaRad / 2;
        var badgeDist = arcR + 18;
        var badgeX = ox + badgeDist * Math.cos(midA);
        var badgeY = oy + badgeDist * Math.sin(midA);
        drawLabelPill(ctx, 'θ = ' + Math.round(thetaDeg) + '°', badgeX + (thetaRad > 0.8 ? 6 : 0), badgeY, {
          textColor: c.spaceColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // Right-Triangle Decomposition Dashed Lines
      if (speedFraction > 0.02 && speedFraction < 0.98) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Horizontal line from tip to vertical Time axis
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(ox, tipY);
        ctx.stroke();

        // Vertical line from tip down to Space axis
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small square for right angle
        var sq = 8;
        if (tipX - ox > sq + 4 && oy - tipY > sq + 4) {
          ctx.strokeStyle = c.axisLine;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, tipY + sq);
          ctx.lineTo(ox + sq, tipY + sq);
          ctx.lineTo(ox + sq, tipY);
          ctx.stroke();
        }

        // Component label: v_space
        if (tipX - ox > 35) {
          drawLabelPill(ctx, 'v_space = ' + (speedFraction * 100).toFixed(0) + '% of V', (ox + tipX) / 2, tipY - 12, {
            textColor: c.spaceColor,
            font: 'bold 10px "JetBrains Mono", monospace'
          });
        }

        // Component label: v_time
        if (oy - tipY > 25) {
          drawLabelPill(ctx, 'v_time = ' + (vt * 100).toFixed(0) + '% of V', Math.min(width - 55, tipX + 55), (oy + tipY) / 2, {
            textColor: c.timeColor,
            font: 'bold 10px "JetBrains Mono", monospace'
          });
        }
      }

      // Invariant total speed vector
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Arrowhead for Invariant Vector
      var arrowAng = Math.atan2(tipY - oy, tipX - ox);
      ctx.fillStyle = c.invariantColor;
      ctx.beginPath();
      ctx.moveTo(tipX + 5 * Math.cos(arrowAng), tipY + 5 * Math.sin(arrowAng));
      ctx.lineTo(tipX - 6 * Math.cos(arrowAng - 0.5), tipY - 6 * Math.sin(arrowAng - 0.5));
      ctx.lineTo(tipX - 6 * Math.cos(arrowAng + 0.5), tipY - 6 * Math.sin(arrowAng + 0.5));
      ctx.closePath();
      ctx.fill();

      // Label for Vector
      var vectorPillX = tipX + (speedFraction > 0.7 ? -15 : 30);
      var vectorPillY = tipY + (speedFraction > 0.7 ? -18 : 6);
      drawLabelPill(ctx, 'Total Speed Vector V', vectorPillX, vectorPillY, {
        textColor: c.invariantColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
      drawGlowingDot(ctx, tipX, tipY, c.invariantColor, 5.5);
    }

    function draw() {
      drawMap();
      drawVel();
    }

    function loop(now) {
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        animTime += dt * 1.5;
        if (animTime > 6.0) animTime = 0;
        if (sliderTime) sliderTime.value = (animTime / 6.0) * 1000;
        updateReadouts();
      }
      draw();
      if (isPlaying) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        animTime = (e.target.value / 1000) * 6.0;
        updateReadouts();
        draw();
      });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        speedFraction = e.target.value / 1000;
        tradeoffPresetChips.forEach(function (c) { c.classList.remove('active'); });
        updateReadouts();
        draw();
      });
    }

    tradeoffPresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        tradeoffPresetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        speedFraction = parseFloat(chip.getAttribute('data-val'));
        if (sliderSpeed) sliderSpeed.value = speedFraction * 1000;
        updateReadouts();
        draw();
      });
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
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

    updateReadouts();
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }

  // Widget 4: Time Dilation & Live Twin Clocks (Velocity Space & Direct Component Decomposition)
  function initWidgetTimeDilation(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var valTimeLabel = container.querySelector('.val-time-label');
    var readoutSpeed = container.querySelector('.readout-speed');
    var clockEarth = container.querySelector('.clock-earth');
    var clockRocket = container.querySelector('.clock-rocket');
    var clockRocketRate = container.querySelector('.clock-rocket-rate');
    var clockRocketSub = container.querySelector('.clock-rocket-sub');
    var presetChips = container.querySelectorAll('.chip-preset');

    var speedFraction = 0.866;
    var animTime = 6.0; // 0 to 6.0 s
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function updateReadouts() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));

      if (readoutSpeed) readoutSpeed.innerText = 'v = ' + speedFraction.toFixed(3) + ' c';
      if (valTimeLabel) valTimeLabel.innerText = animTime.toFixed(2) + ' s';
      if (clockEarth) clockEarth.innerHTML = animTime.toFixed(2) + ' <span>s</span>';
      if (clockRocket) clockRocket.innerHTML = (animTime * vt).toFixed(2) + ' <span>s</span>';
      if (clockRocketRate) clockRocketRate.innerText = (vt * 100).toFixed(1) + '% Rate';
      if (clockRocketSub) {
        clockRocketSub.innerText = speedFraction === 0
          ? 'At rest, traveler clock ticks in perfect sync with Earth.'
          : 'At ' + speedFraction.toFixed(3) + 'c, traveler ages at ' + (vt * 100).toFixed(1) + '% of Earth rate.';
      }
    }

    function draw() {
      if (!canvas) return;
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = Math.max(52, width * 0.14);
      var oy = height - 44;
      var radius = Math.min(width - ox - 65, height - 70);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawAxes(ctx, ox, oy, width, height, 'Space Speed (v_space)', 'Time Speed (v_time)');

      // Axis speed marks at 0.5 c and 1.0 c
      ctx.fillStyle = c.axisText || c.subtleText;
      ctx.strokeStyle = c.axisLine;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      [{ v: 0.5, label: '0.5 c' }, { v: 1.0, label: '1.0 c' }].forEach(function (tick) {
        var px = ox + tick.v * radius;
        var py = oy - tick.v * radius;

        // Space speed tick
        ctx.beginPath();
        ctx.moveTo(px, oy - 3);
        ctx.lineTo(px, oy + 3);
        ctx.stroke();
        ctx.fillText(tick.label, px, oy + 6);

        // Time speed tick
        ctx.beginPath();
        ctx.moveTo(ox - 3, py);
        ctx.lineTo(ox + 3, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(tick.label, ox - 6, py);
        ctx.textAlign = 'center';
      });

      // Invariant Speed Limit Arc Constraint (dashed)
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed Arc Constraint Pill Badge
      var arcMidA = -Math.PI / 4;
      var arcPillX = ox + radius * Math.cos(arcMidA);
      var arcPillY = oy + radius * Math.sin(arcMidA);
      drawLabelPill(ctx, '|V| = 1.00 c (Speed Limit)', Math.min(width - 85, arcPillX + 35), arcPillY - 8, {
        textColor: c.invariantColor,
        font: 'bold 9.5px "JetBrains Mono", monospace'
      });

      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var eTipX = ox;
      var eTipY = oy - radius;
      var rTipX = ox + radius * speedFraction;
      var rTipY = oy - radius * vt;

      var thetaRad = Math.asin(Math.min(1, Math.max(0, speedFraction)));
      var thetaDeg = (thetaRad * 180) / Math.PI;

      // Angle Theta Arc at Origin
      if (thetaDeg > 3) {
        var arcR = Math.min(46, radius * 0.35);
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ox, oy, arcR, -Math.PI / 2, -Math.PI / 2 + thetaRad, false);
        ctx.stroke();

        var endA = -Math.PI / 2 + thetaRad;
        var arrowX = ox + arcR * Math.cos(endA);
        var arrowY = oy + arcR * Math.sin(endA);
        var tangentA = endA + Math.PI / 2;
        ctx.fillStyle = c.spaceColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 4 * Math.cos(tangentA - 0.45), arrowY - 4 * Math.sin(tangentA - 0.45));
        ctx.lineTo(arrowX - 4 * Math.cos(tangentA + 0.45), arrowY - 4 * Math.sin(tangentA + 0.45));
        ctx.closePath();
        ctx.fill();

        var midA = -Math.PI / 2 + thetaRad / 2;
        var badgeDist = arcR + 16;
        var badgeX = ox + badgeDist * Math.cos(midA);
        var badgeY = oy + badgeDist * Math.sin(midA);
        drawLabelPill(ctx, 'θ = ' + Math.round(thetaDeg) + '°', badgeX + (thetaRad > 0.8 ? 6 : 0), badgeY, {
          textColor: c.spaceColor,
          font: 'bold 9.5px "JetBrains Mono", monospace'
        });
      }

      // Rocket Right-Triangle Decomposition Dashed Lines & In-Canvas Pills
      if (speedFraction > 0.02 && speedFraction < 0.995) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);

        // Horizontal line from tip to vertical Time axis
        ctx.beginPath();
        ctx.moveTo(rTipX, rTipY);
        ctx.lineTo(ox, rTipY);
        ctx.stroke();

        // Vertical line from tip down to Space axis
        ctx.beginPath();
        ctx.moveTo(rTipX, rTipY);
        ctx.lineTo(rTipX, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small square for right angle
        var sq = 7;
        if (rTipX - ox > sq + 3 && oy - rTipY > sq + 3) {
          ctx.strokeStyle = c.axisLine;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, rTipY + sq);
          ctx.lineTo(ox + sq, rTipY + sq);
          ctx.lineTo(ox + sq, rTipY);
          ctx.stroke();
        }

        // Component label: v_space
        if (rTipX - ox > 35) {
          var vxText = 'v_space = ' + (speedFraction * 100).toFixed(0) + '% c';
          drawLabelPill(ctx, vxText, (ox + rTipX) / 2, Math.min(oy - 12, rTipY - 12), {
            textColor: c.spaceColor,
            font: 'bold 9.5px "JetBrains Mono", monospace'
          });
        }

        // Component label: v_time
        if (oy - rTipY > 25) {
          var vtText = 'v_time = ' + (vt * 100).toFixed(0) + '% c';
          var vtPillX = Math.min(width - 65, rTipX + 56);
          drawLabelPill(ctx, vtText, vtPillX, (oy + rTipY) / 2, {
            textColor: c.timeColor,
            font: 'bold 9.5px "JetBrains Mono", monospace'
          });
        }
      }

      // Earth Velocity Vector (constant length c straight up)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(eTipX, eTipY);
      ctx.stroke();

      // Earth Arrowhead
      ctx.fillStyle = c.timeColor;
      ctx.beginPath();
      ctx.moveTo(eTipX, eTipY - 6);
      ctx.lineTo(eTipX - 5, eTipY + 4);
      ctx.lineTo(eTipX + 5, eTipY + 4);
      ctx.closePath();
      ctx.fill();

      // Rocket Velocity Vector (constant length c tilted)
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(rTipX, rTipY);
      ctx.stroke();

      // Rocket Arrowhead
      var arrowAng = Math.atan2(rTipY - oy, rTipX - ox);
      ctx.fillStyle = c.spaceColor;
      ctx.beginPath();
      ctx.moveTo(rTipX + 5 * Math.cos(arrowAng), rTipY + 5 * Math.sin(arrowAng));
      ctx.lineTo(rTipX - 6 * Math.cos(arrowAng - 0.5), rTipY - 6 * Math.sin(arrowAng - 0.5));
      ctx.lineTo(rTipX - 6 * Math.cos(arrowAng + 0.5), rTipY - 6 * Math.sin(arrowAng + 0.5));
      ctx.closePath();
      ctx.fill();

      // Vector Tip Dots
      drawGlowingDot(ctx, eTipX, eTipY, c.timeColor, 5.5);
      drawGlowingDot(ctx, rTipX, rTipY, c.spaceColor, 5.5);

      // Twin Clock Rate Badges
      var earthPillText = 'Earth Clock: 100% Rate (v = 0)';
      var rocketRatePercent = (vt * 100).toFixed(1);
      var rocketPillText = 'Traveler Clock: ' + rocketRatePercent + '% Rate';

      // Earth label pill at top
      drawLabelPill(ctx, earthPillText, eTipX + 80, Math.max(16, eTipY - 14), {
        textColor: c.timeColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      // Rocket label pill
      var rocketPillX = rTipX + (speedFraction > 0.72 ? -28 : 65);
      var rocketPillY = rTipY + (speedFraction > 0.72 ? -20 : 8);
      drawLabelPill(ctx, rocketPillText, Math.min(width - 80, Math.max(ox + 80, rocketPillX)), Math.max(22, rocketPillY), {
        textColor: c.spaceColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });
    }

    function loop(now) {
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        animTime += dt * 1.5;
        if (animTime > 6.0) animTime = 0;
        if (sliderTime) sliderTime.value = (animTime / 6.0) * 1000;
        updateReadouts();
      }
      draw();
      if (isPlaying) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        animTime = (e.target.value / 1000) * 6.0;
        updateReadouts();
        draw();
      });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        speedFraction = e.target.value / 1000;
        presetChips.forEach(function (c) { c.classList.remove('active'); });
        updateReadouts();
        draw();
      });
    }

    presetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        presetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        speedFraction = parseFloat(chip.getAttribute('data-val'));
        if (sliderSpeed) sliderSpeed.value = speedFraction * 1000;
        updateReadouts();
        draw();
      });
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
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

    updateReadouts();
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }

  // Widget 5: Cosmic Speed Boundary & The Timeless Photon
  function initWidgetSpeedLimit(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var buttons = container.querySelectorAll('.mode-btn');
    var clockPhoton = container.querySelector('.clock-photon');
    var statusNote = container.querySelector('.status-note');

    var mode = 'photon';

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = Math.max(48, width * 0.16);
      var oy = height - 44;
      var scale = Math.min(width * 0.52, height - 70);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, c.constraintArc);
      drawAxes(ctx, ox, oy, width, height, 'Space Speed (v_space)', 'Time Speed (v_time)');

      // 1. Forbidden Zone (v > c)
      var forbidStartX = ox + scale;
      var forbidEndX = width - 25;
      var forbidMidX = (forbidStartX + forbidEndX) / 2;

      // Subtle red forbidden zone shading
      ctx.fillStyle = c.isLight ? 'rgba(220, 38, 38, 0.05)' : 'rgba(248, 113, 113, 0.08)';
      ctx.fillRect(forbidStartX, 25, forbidEndX - forbidStartX, oy - 25);

      ctx.strokeStyle = c.dangerColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(forbidStartX, oy);
      ctx.lineTo(forbidEndX, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Forbidden Text clearly positioned in the upper portion of the forbidden zone
      drawLabelPill(ctx, 'FORBIDDEN (v > c)', forbidMidX, 52, {
        textColor: c.dangerColor,
        borderColor: c.dangerColor,
        font: 'bold 10.5px "JetBrains Mono", monospace'
      });

      drawLabelPill(ctx, 'Exceeds cosmic speed limit', forbidMidX, 78, {
        textColor: c.dangerColor,
        font: '600 9.5px sans-serif'
      });

      // Boundary Tick at v = c
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(forbidStartX, oy - 4);
      ctx.lineTo(forbidStartX, oy + 4);
      ctx.stroke();

      ctx.fillStyle = c.axisText || c.subtleText;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('1.0 c', forbidStartX, oy + 6);

      // 2. Active Mode Vector
      var v_space = 1.0;
      var v_time = 0.0;
      var color = c.photonColor;

      if (mode === 'rest') {
        v_space = 0.0;
        v_time = 1.0;
        color = c.timeColor;
      } else if (mode === 'rocket') {
        v_space = 0.866;
        v_time = 0.5;
        color = c.spaceColor;
      } else {
        v_space = 1.0;
        v_time = 0.0;
        color = c.photonColor;
      }

      var tipX = ox + scale * v_space;
      var tipY = oy - scale * v_time;

      // Rocket Right-Triangle Decomposition in rocket mode
      if (mode === 'rocket') {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(ox, tipY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX, oy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Arrowhead for active vector
      var arrowAng = Math.atan2(tipY - oy, tipX - ox);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(tipX + 5 * Math.cos(arrowAng), tipY + 5 * Math.sin(arrowAng));
      ctx.lineTo(tipX - 6 * Math.cos(arrowAng - 0.5), tipY - 6 * Math.sin(arrowAng - 0.5));
      ctx.lineTo(tipX - 6 * Math.cos(arrowAng + 0.5), tipY - 6 * Math.sin(arrowAng + 0.5));
      ctx.closePath();
      ctx.fill();

      drawGlowingDot(ctx, tipX, tipY, color, 6);

      if (mode === 'photon') {
        var photonLabelText = width < 420 ? 'Photon (v = c)' : 'Photon (v_space = c, v_time = 0)';
        var photonPillX = Math.min(width - 90, Math.max(ox + 80, forbidStartX - 70));
        drawLabelPill(ctx, photonLabelText, photonPillX, oy - 22, {
          textColor: c.photonColor,
          font: 'bold 10.5px "Plus Jakarta Sans", sans-serif'
        });
      } else if (mode === 'rocket') {
        var rocketLabelX = Math.min(width - 85, Math.max(ox + 80, tipX + (width < 450 ? -20 : 65)));
        var rocketLabelY = Math.max(24, tipY + (width < 450 ? -18 : 6));
        drawLabelPill(ctx, 'Fast Rocket (v_space = 0.866c)', rocketLabelX, rocketLabelY, {
          textColor: c.spaceColor,
          font: 'bold 10.5px "Plus Jakarta Sans", sans-serif'
        });
      } else {
        var restLabelX = ox + 75;
        drawLabelPill(ctx, 'Observer at Rest (v_space = 0)', restLabelX, Math.max(22, tipY), {
          textColor: c.timeColor,
          font: 'bold 10.5px "Plus Jakarta Sans", sans-serif'
        });
      }
    }

    var cardParticle = container.querySelector('.card-particle');
    var particleCardLabel = container.querySelector('.particle-card-label');

    function update() {
      var c = getThemeColors();
      var activeColor = c.photonColor;
      if (mode === 'photon') {
        activeColor = c.photonColor;
        if (clockPhoton) clockPhoton.innerHTML = '0.000 <span>s</span>';
        if (statusNote) statusNote.innerText = 'Time is completely frozen. 100% of motion is across space.';
      } else if (mode === 'rocket') {
        activeColor = c.spaceColor;
        if (clockPhoton) clockPhoton.innerHTML = '3.000 <span>s</span>';
        if (statusNote) statusNote.innerText = 'Time moves at 50% normal rate (v_time = 0.500 c).';
      } else {
        activeColor = c.timeColor;
        if (clockPhoton) clockPhoton.innerHTML = '6.000 <span>s</span>';
        if (statusNote) statusNote.innerText = 'Observer sitting motionless in space moves 100% through time.';
      }

      if (cardParticle) cardParticle.style.borderLeftColor = activeColor;
      if (particleCardLabel) particleCardLabel.style.color = activeColor;
      if (clockPhoton) clockPhoton.style.color = activeColor;
      draw();
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        mode = btn.getAttribute('data-mode');
        update();
      });
    });

    update();
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }

  // Widget 6: Atmospheric Muon Simulator
  function initWidgetMuon(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderAlt = container.querySelector('.slider-altitude');
    var btnMode = container.querySelector('.btn-view-toggle');
    var readoutClock = container.querySelector('.readout-muon-clock');
    var readoutStatus = container.querySelector('.readout-muon-status');

    var altitudeKm = 10.0;
    var isRelativistic = true;

    function update() {
      var distKm = 10.0 - altitudeKm;
      var earthMicrosec = (distKm / 300000) * 1e6 * 1.001;
      var muonMicrosec = isRelativistic ? (earthMicrosec / 22.36) : earthMicrosec;

      if (readoutClock) readoutClock.innerText = muonMicrosec.toFixed(2) + ' µs (Internal Clock)';

      if (!isRelativistic && distKm >= 0.66) {
        if (readoutStatus) readoutStatus.innerHTML = '<span style="color:var(--color-danger)">Muon Decayed! Survived only 0.66 km (660 meters).</span>';
      } else if (altitudeKm <= 0.1) {
        if (readoutStatus) readoutStatus.innerHTML = '<span style="color:var(--color-emerald)">Survived to Surface Detectors! (Relativistic)</span>';
      } else {
        if (readoutStatus) readoutStatus.innerHTML = 'Descending through atmosphere...';
      }

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var isNarrow = width < 420;
      var padLeft = isNarrow ? 56 : 90;
      var padRight = isNarrow ? 18 : 30;
      var topY = 35;
      var bottomY = height - 42;
      var trackH = bottomY - topY;

      var grad = ctx.createLinearGradient(0, topY, 0, bottomY);
      grad.addColorStop(0, c.muonAtmosphereTop);
      grad.addColorStop(1, c.muonAtmosphereBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(padLeft, topY, width - padLeft - padRight, trackH);

      drawLabelPill(ctx, isNarrow ? '10 km' : '10 km (Creation)', isNarrow ? 28 : 52, topY, {
        textColor: c.axisLabel,
        font: 'bold 9px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, isNarrow ? '0 km' : '0 km (Sea Level)', isNarrow ? 28 : 52, bottomY, {
        textColor: c.axisLabel,
        font: 'bold 9px "JetBrains Mono", monospace'
      });

      var decayY = topY + (0.66 / 10.0) * trackH;
      ctx.strokeStyle = c.dangerColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, decayY);
      ctx.lineTo(width - padRight, decayY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, isNarrow ? 'Limit (660m)' : 'Classical Limit (660m)', width - (isNarrow ? 55 : 90), decayY, {
        textColor: c.dangerColor,
        borderColor: c.dangerColor,
        font: isNarrow ? 'bold 9px "JetBrains Mono", monospace' : 'bold 10px "JetBrains Mono", monospace'
      });

      var dist = 10.0 - altitudeKm;
      var muonY = topY + (dist / 10.0) * trackH;
      var muonX = padLeft + (width - padLeft - padRight) / 2;

      var isDead = (!isRelativistic && dist >= 0.66);

      ctx.strokeStyle = isDead ? c.axisLine : c.timeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(muonX, topY);
      ctx.lineTo(muonX, muonY);
      ctx.stroke();

      if (isDead) {
        // Crisp vector decay burst
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.5;
        for (var bi = 0; bi < 8; bi++) {
          var bAng = (bi / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(muonX + 4 * Math.cos(bAng), muonY + 4 * Math.sin(bAng));
          ctx.lineTo(muonX + 11 * Math.cos(bAng), muonY + 11 * Math.sin(bAng));
          ctx.stroke();
        }
        drawGlowingDot(ctx, muonX, muonY, c.dangerColor, 4);
        var deadLabelX = isNarrow ? muonX : muonX + 115;
        var deadLabelY = isNarrow ? muonY - 18 : muonY;
        drawLabelPill(ctx, isNarrow ? 'Decayed (e⁻ + ν)' : 'Decayed into electron + neutrinos', deadLabelX, deadLabelY, {
          textColor: c.dangerColor,
          borderColor: c.dangerColor,
          font: isNarrow ? 'bold 9px sans-serif' : 'bold 11px sans-serif'
        });
      } else {
        drawGlowingDot(ctx, muonX, muonY, c.timeColor, 6);
        var muonLabelX = isNarrow ? muonX : muonX + 80;
        var muonLabelY = isNarrow ? muonY - 16 : muonY;
        drawLabelPill(ctx, 'Muon (Alt: ' + altitudeKm.toFixed(1) + ' km)', muonLabelX, muonLabelY, {
          textColor: c.timeColor,
          font: isNarrow ? 'bold 9px "JetBrains Mono", monospace' : 'bold 11px "JetBrains Mono", monospace'
        });
      }
    }

    if (sliderAlt) {
      sliderAlt.addEventListener('input', function (e) {
        altitudeKm = parseFloat(e.target.value);
        update();
      });
    }

    if (btnMode) {
      btnMode.addEventListener('click', function () {
        isRelativistic = !isRelativistic;
        btnMode.innerHTML = isRelativistic
          ? '<span>Mode: </span><strong style="color:var(--color-time)">Einsteinian (Time Dilation ON)</strong>'
          : '<span>Mode: </span><strong style="color:var(--color-danger)">Newtonian (Classical / No Dilation)</strong>';
        update();
      });
    }

    update();
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }

  // Widget 7: 3D Spherical Velocity Dome (v_x1, v_x2, v_time)
  function initWidget3DSpacetime(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderHeading = container.querySelector('.slider-heading');
    var sliderOrbit = container.querySelector('.slider-orbit');
    var readoutVspace = container.querySelector('.readout-vspace');
    var valHeadingLabel = container.querySelector('.val-heading-label');
    var readoutVtime = container.querySelector('.readout-vtime');
    var readoutGamma = container.querySelector('.readout-gamma');
    var speedPresetChips = container.querySelectorAll('.chip-speed');
    var headingPresetChips = container.querySelectorAll('.chip-heading');

    var vSpaceFraction = 0.80; // 0.80 c
    var headingDeg = 35;       // 35 degrees East of North
    var azimuth = -0.65;       // Camera azimuth radians (-37 deg)
    var elevation = 0.45;      // Camera elevation radians (26 deg)

    // Mouse drag orbit controls on canvas
    var isDragging = false;
    var lastMouseX = 0;
    var lastMouseY = 0;

    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastMouseX;
      var dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      azimuth += dx * 0.01;
      elevation += dy * 0.01;
      elevation = Math.max(0.1, Math.min(1.4, elevation));

      if (sliderOrbit) {
        var deg = Math.round((azimuth * 180 / Math.PI) % 360);
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        sliderOrbit.value = deg;
      }
      draw();
    });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    // Touch orbit controls (non-passive to prevent page scrolling while dragging 3D model)
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        canvas.style.cursor = 'grabbing';
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      if (e.cancelable) e.preventDefault();
      var dx = e.touches[0].clientX - lastMouseX;
      var dy = e.touches[0].clientY - lastMouseY;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;

      azimuth += dx * 0.01;
      elevation += dy * 0.01;
      elevation = Math.max(0.1, Math.min(1.4, elevation));

      if (sliderOrbit) {
        var deg = Math.round((azimuth * 180 / Math.PI) % 360);
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        sliderOrbit.value = deg;
      }
      draw();
    }, { passive: false });

    window.addEventListener('touchend', function () {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    function update() {
      var rad = headingDeg * Math.PI / 180;
      var vx1 = vSpaceFraction * Math.cos(rad);
      var vx2 = vSpaceFraction * Math.sin(rad);
      var vt = Math.sqrt(Math.max(0, 1 - vSpaceFraction * vSpaceFraction));
      var gamma = vSpaceFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vSpaceFraction * vSpaceFraction));

      if (readoutVspace) readoutVspace.innerText = vSpaceFraction.toFixed(3) + ' c';
      if (valHeadingLabel) {
        var dirStr = headingDeg === 0 ? 'East (0°)' : headingDeg === 90 ? 'North (90°)' : headingDeg === 180 ? 'West (180°)' : Math.round(headingDeg) + '°';
        valHeadingLabel.innerText = dirStr;
      }
      if (readoutVtime) readoutVtime.innerText = vt.toFixed(3) + ' c';
      if (readoutGamma) readoutGamma.innerText = gamma.toFixed(2);

      draw();
    }

    function project(x, y, z, cx, cy, scale) {
      var cosAz = Math.cos(azimuth);
      var sinAz = Math.sin(azimuth);
      var xRot = x * cosAz - y * sinAz;
      var yRot = x * sinAz + y * cosAz;

      var cosEl = Math.cos(elevation);
      var sinEl = Math.sin(elevation);
      var yFinal = yRot * cosEl - z * sinEl;
      var zFinal = yRot * sinEl + z * cosEl;

      return {
        x: cx + xRot * scale,
        y: cy - zFinal * scale,
        depth: yFinal
      };
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var cx = width * 0.50;
      var cy = height * 0.70;
      var scale = Math.min(width * 0.28, height * 0.42);

      function p3(x, y, z) {
        return project(x, y, z, cx, cy, scale);
      }

      // 1. Ground Plane Grid (x1, x2)
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1;
      var gMin = -1.2, gMax = 1.2, gStep = 0.4;
      for (var gx = gMin; gx <= gMax + 0.01; gx += gStep) {
        var pStart = p3(gx, gMin, 0);
        var pEnd = p3(gx, gMax, 0);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }
      for (var gy = gMin; gy <= gMax + 0.01; gy += gStep) {
        var pS = p3(gMin, gy, 0);
        var pE = p3(gMax, gy, 0);
        ctx.beginPath();
        ctx.moveTo(pS.x, pS.y);
        ctx.lineTo(pE.x, pE.y);
        ctx.stroke();
      }

      // Ground Speed Ceiling Circle (v_space = c)
      ctx.strokeStyle = c.constraintArc;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      var segs = 48;
      for (var si = 0; si <= segs; si++) {
        var a = (si / segs) * Math.PI * 2;
        var pRing = p3(Math.cos(a), Math.sin(a), 0);
        if (si === 0) ctx.moveTo(pRing.x, pRing.y);
        else ctx.lineTo(pRing.x, pRing.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. 3D Spherical Constraint Dome Wireframe (radius c)
      var latLevels = [0.35, 0.70, 0.92];
      ctx.strokeStyle = c.isLight ? 'rgba(124, 58, 237, 0.22)' : 'rgba(168, 85, 247, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (var li = 0; li < latLevels.length; li++) {
        var zLev = latLevels[li];
        var rLev = Math.sqrt(Math.max(0, 1 - zLev * zLev));
        ctx.beginPath();
        for (var s = 0; s <= 36; s++) {
          var ang = (s / 36) * Math.PI * 2;
          var ptLat = p3(rLev * Math.cos(ang), rLev * Math.sin(ang), zLev);
          if (s === 0) ctx.moveTo(ptLat.x, ptLat.y);
          else ctx.lineTo(ptLat.x, ptLat.y);
        }
        ctx.stroke();
      }

      var lonAngles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];
      for (var mi = 0; mi < lonAngles.length; mi++) {
        var mAng = lonAngles[mi];
        ctx.beginPath();
        for (var step = 0; step <= 20; step++) {
          var phi = (step / 20) * (Math.PI / 2);
          var mR = Math.cos(phi);
          var mZ = Math.sin(phi);
          var ptLon = p3(mR * Math.cos(mAng), mR * Math.sin(mAng), mZ);
          if (step === 0) ctx.moveTo(ptLon.x, ptLon.y);
          else ctx.lineTo(ptLon.x, ptLon.y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 3. Ground Coordinate Axes
      var pOrigin = p3(0, 0, 0);
      var pX1 = p3(1.35, 0, 0);
      var pX2 = p3(0, 1.35, 0);
      var pZ = p3(0, 0, 1.40);

      // East Axis
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      ctx.lineTo(pX1.x, pX1.y);
      ctx.stroke();

      // North Axis
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      ctx.lineTo(pX2.x, pX2.y);
      ctx.stroke();

      // Time Axis (Vertical)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      ctx.lineTo(pZ.x, pZ.y);
      ctx.stroke();

      // Axis Labels
      drawLabelPill(ctx, 'East Speed (v_x1)', pX1.x + 45, pX1.y + 4, {
        textColor: c.axisLabel,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, 'North Speed (v_x2)', pX2.x - 45, pX2.y + 14, {
        textColor: c.axisLabel,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, 'Time Speed (v_time)', pZ.x, pZ.y - 14, {
        textColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      // Velocity Components
      var rad = headingDeg * Math.PI / 180;
      var vx1 = vSpaceFraction * Math.cos(rad);
      var vx2 = vSpaceFraction * Math.sin(rad);
      var vt = Math.sqrt(Math.max(0, 1 - vSpaceFraction * vSpaceFraction));

      var pGroundTip = p3(vx1, vx2, 0);
      var pVectorTip = p3(vx1, vx2, vt);
      var pTimeAxisPt = p3(0, 0, vt);
      var pX1Pt = p3(vx1, 0, 0);
      var pX2Pt = p3(0, vx2, 0);

      // 4. Ground Velocity Components (Shadow on Space Floor)
      if (vSpaceFraction > 0.05) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pGroundTip.x, pGroundTip.y);
        ctx.lineTo(pX1Pt.x, pX1Pt.y);
        ctx.moveTo(pGroundTip.x, pGroundTip.y);
        ctx.lineTo(pX2Pt.x, pX2Pt.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pOrigin.x, pOrigin.y);
        ctx.lineTo(pGroundTip.x, pGroundTip.y);
        ctx.stroke();

        drawGlowingDot(ctx, pGroundTip.x, pGroundTip.y, c.spaceColor, 5);

        drawLabelPill(ctx, 'v_space = ' + vSpaceFraction.toFixed(2) + 'c', (pOrigin.x + pGroundTip.x) / 2 + 10, (pOrigin.y + pGroundTip.y) / 2 + 14, {
          textColor: c.spaceColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // Vertical projection from tip down to floor
      if (vSpaceFraction > 0.05 && vt > 0.05) {
        ctx.strokeStyle = c.spaceColorSubtle || (c.isLight ? 'rgba(194, 65, 12, 0.4)' : 'rgba(251, 146, 60, 0.4)');
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pVectorTip.x, pVectorTip.y);
        ctx.lineTo(pGroundTip.x, pGroundTip.y);
        ctx.stroke();

        ctx.strokeStyle = c.timeColorSubtle || (c.isLight ? 'rgba(3, 105, 161, 0.4)' : 'rgba(56, 189, 248, 0.4)');
        ctx.beginPath();
        ctx.moveTo(pVectorTip.x, pVectorTip.y);
        ctx.lineTo(pTimeAxisPt.x, pTimeAxisPt.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Vertical time vector on time axis
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      ctx.lineTo(pTimeAxisPt.x, pTimeAxisPt.y);
      ctx.stroke();
      drawGlowingDot(ctx, pTimeAxisPt.x, pTimeAxisPt.y, c.timeColor, 5);

      // 5. The 3D Spacetime Vector
      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      ctx.lineTo(pVectorTip.x, pVectorTip.y);
      ctx.stroke();

      drawGlowingDot(ctx, pVectorTip.x, pVectorTip.y, c.invariantColor, 7);

      drawLabelPill(ctx, 'Spacetime Velocity (|V| = c)', pVectorTip.x + 90, pVectorTip.y - 10, {
        textColor: c.invariantColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });

      drawLabelPill(ctx, 'v_time = ' + vt.toFixed(3) + 'c', pVectorTip.x + 65, pVectorTip.y + 12, {
        textColor: c.timeColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        vSpaceFraction = e.target.value / 1000;
        speedPresetChips.forEach(function (ch) { ch.classList.remove('active'); });
        update();
      });
    }

    if (sliderHeading) {
      sliderHeading.addEventListener('input', function (e) {
        headingDeg = parseFloat(e.target.value);
        headingPresetChips.forEach(function (ch) { ch.classList.remove('active'); });
        update();
      });
    }

    if (sliderOrbit) {
      sliderOrbit.addEventListener('input', function (e) {
        var deg = parseFloat(e.target.value);
        azimuth = deg * Math.PI / 180;
        draw();
      });
    }

    speedPresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        speedPresetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        vSpaceFraction = parseFloat(chip.getAttribute('data-speed'));
        if (sliderSpeed) sliderSpeed.value = vSpaceFraction * 1000;
        update();
      });
    });

    headingPresetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        headingPresetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        headingDeg = parseFloat(chip.getAttribute('data-heading'));
        if (sliderHeading) sliderHeading.value = headingDeg;
        update();
      });
    });

    update();
    registerDraw(draw);
    draw();
    window.addEventListener('resize', draw);
  }


  function initAllPost01() {
    initWidgetCars('widget-cars');
    initWidgetStationary('widget-stationary');
    initWidgetMovingSnapshots('widget-moving-snapshots');
    initWidgetTradeoff('widget-tradeoff');
    initWidgetTimeDilation('widget-time-dilation');
    initWidgetSpeedLimit('widget-speed-limit');
    initWidgetMuon('widget-muon');
    initWidget3DSpacetime('widget-3d-spacetime');
  }

  sim.initWidgetCars = initWidgetCars;
  sim.initWidgetStationary = initWidgetStationary;
  sim.initWidgetMovingSnapshots = initWidgetMovingSnapshots;
  sim.initWidgetTradeoff = initWidgetTradeoff;
  sim.initWidgetTimeDilation = initWidgetTimeDilation;
  sim.initWidgetSpeedLimit = initWidgetSpeedLimit;
  sim.initWidgetMuon = initWidgetMuon;
  sim.initWidget3DSpacetime = initWidget3DSpacetime;
  sim.initAllPost01 = initAllPost01;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPost01);
  } else {
    initAllPost01();
  }
})(window);
