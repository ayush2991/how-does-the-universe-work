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

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var sliderAngle = container.querySelector('.slider-angle');
    var btnPlay = container.querySelector('.btn-play');
    var timeVal = container.querySelector('.val-time');
    var angleVal = container.querySelector('.val-angle');
    var readoutC1 = container.querySelector('.readout-c1');
    var readoutC2 = container.querySelector('.readout-c2');
    var readoutLag = container.querySelector('.readout-lag');
    var readoutVx = container.querySelector('.readout-vx');
    var readoutVy = container.querySelector('.readout-vy');

    var progress = 0.60;
    var angleDeg = 60;
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function updateReadouts() {
      var rad = angleDeg * Math.PI / 180;
      var vEast = (60 * Math.sin(rad)).toFixed(1);
      var vNorth = (60 * Math.cos(rad)).toFixed(1);
      var lagMiles = ((60 - 60 * Math.cos(rad)) * progress).toFixed(1);

      if (timeVal) timeVal.innerText = progress.toFixed(2) + ' hr';
      if (angleVal) angleVal.innerText = angleDeg + '°';
      if (readoutC1) readoutC1.innerText = '60.0 mph';
      if (readoutC2) readoutC2.innerText = vNorth + ' mph North, ' + vEast + ' mph East';
      if (readoutLag) readoutLag.innerText = lagMiles + ' mi';
      if (readoutVx) readoutVx.innerText = vEast + ' mph';
      if (readoutVy) readoutVy.innerText = vNorth + ' mph';
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.22;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.58, height * 0.68);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, c.constraintArc);
      drawAxes(ctx, ox, oy, width, height, 'East (x₁)', 'North (x₂)');

      var rad = angleDeg * Math.PI / 180;
      var c1_x = ox;
      var c1_y = oy - (progress * scale);
      var c2_x = ox + (progress * scale * Math.sin(rad));
      var c2_y = oy - (progress * scale * Math.cos(rad));
      var vEast = (60 * Math.sin(rad)).toFixed(1);
      var vNorth = (60 * Math.cos(rad)).toFixed(1);
      var lagMiles = ((60 - 60 * Math.cos(rad)) * progress).toFixed(1);

      // 1. Angle Theta Arc at Origin (from North axis clockwise to Car 2 vector)
      if (angleDeg > 2) {
        var arcR = 48;
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, arcR, -Math.PI / 2, -Math.PI / 2 + rad, false);
        ctx.stroke();

        // Arrowhead on arc pointing clockwise
        var endA = -Math.PI / 2 + rad;
        var arrowX = ox + arcR * Math.cos(endA);
        var arrowY = oy + arcR * Math.sin(endA);
        var tangentA = endA + Math.PI / 2;
        ctx.fillStyle = c.spaceColor;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 6 * Math.cos(tangentA - 0.45), arrowY - 6 * Math.sin(tangentA - 0.45));
        ctx.lineTo(arrowX - 6 * Math.cos(tangentA + 0.45), arrowY - 6 * Math.sin(tangentA + 0.45));
        ctx.closePath();
        ctx.fill();

        // Theta label badge
        var midA = -Math.PI / 2 + rad / 2;
        var badgeDist = arcR + 20;
        var badgeX = ox + badgeDist * Math.cos(midA);
        var badgeY = oy + badgeDist * Math.sin(midA);

        drawLabelPill(ctx, 'θ = ' + Math.round(angleDeg) + '°', badgeX + (rad > 0.8 ? 8 : 0), badgeY, {
          textColor: c.spaceColor,
          font: 'bold 11px "JetBrains Mono", monospace'
        });
      }

      // 2. Dashed Projections (Right Triangle Components for Car 2)
      if (progress > 0.08) {
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Horizontal line from Car 2 to Vertical North Axis
        ctx.beginPath();
        ctx.moveTo(c2_x, c2_y);
        ctx.lineTo(ox, c2_y);
        ctx.stroke();

        // Vertical line from Car 2 down to Ground East Axis
        ctx.beginPath();
        ctx.moveTo(c2_x, c2_y);
        ctx.lineTo(c2_x, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small Right Angle symbol at (ox, c2_y)
        var sqSize = 8;
        if (c2_x - ox > sqSize + 4 && oy - c2_y > sqSize + 4) {
          ctx.strokeStyle = c.axisLine;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, c2_y + sqSize);
          ctx.lineTo(ox + sqSize, c2_y + sqSize);
          ctx.lineTo(ox + sqSize, c2_y);
          ctx.stroke();
        }

        // Horizontal Eastward Component Value Label (v_East = 52.0 mph)
        if (c2_x - ox > 35) {
          drawLabelPill(ctx, 'V_East = ' + vEast + ' mph', (ox + c2_x) / 2, c2_y - 12, {
            textColor: c.spaceColor,
            font: 'bold 10px "JetBrains Mono", monospace'
          });
        }

        // Vertical Northward Component Value Label (v_North = 30.0 mph)
        if (oy - c2_y > 25) {
          drawLabelPill(ctx, 'V_North = ' + vNorth + ' mph', Math.min(width - 55, c2_x + 55), (oy + c2_y) / 2, {
            textColor: c.spaceColor,
            font: 'bold 10px "JetBrains Mono", monospace'
          });
        }
      }

      // 3. Car 1 Vector (Purely North)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(c1_x, c1_y);
      ctx.stroke();

      // Car 1 Speed Value Label along vertical vector
      if (oy - c1_y > 35) {
        drawLabelPill(ctx, '60 mph', ox - 32, (oy + c1_y) / 2, {
          textColor: c.timeColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // 4. Car 2 Vector (Diagonal)
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(c2_x, c2_y);
      ctx.stroke();

      // Car 2 Total Speed Value Label (along diagonal)
      if (progress > 0.18) {
        var diagMidX = (ox + c2_x) / 2;
        var diagMidY = (oy + c2_y) / 2;
        var nx = -Math.cos(rad);
        var ny = -Math.sin(rad);
        drawLabelPill(ctx, '60 mph', diagMidX + nx * 18, diagMidY + ny * 18, {
          textColor: c.spaceColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // 5. Northward Lag Indicator
      if (progress > 0.15 && c2_y > c1_y + 10) {
        var lagX = ox + 45;
        ctx.strokeStyle = c.dangerColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lagX, c1_y);
        ctx.lineTo(lagX, c2_y);
        ctx.stroke();
        ctx.fillStyle = c.dangerColor;
        ctx.beginPath();
        ctx.arc(lagX, c1_y, 2.5, 0, Math.PI * 2);
        ctx.arc(lagX, c2_y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        drawLabelPill(ctx, 'Northward Lag: ' + lagMiles + ' mi', lagX + 68, (c1_y + c2_y) / 2, {
          textColor: c.dangerColor,
          borderColor: c.dangerColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // 6. Glowing Dots & Vehicle Names
      drawGlowingDot(ctx, c1_x, c1_y, c.timeColor, 6);
      drawGlowingDot(ctx, c2_x, c2_y, c.spaceColor, 6);

      drawLabelPill(ctx, 'Car 1 (60 mph North)', c1_x, c1_y - 18, {
        textColor: c.timeColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
      drawLabelPill(ctx, 'Car 2 (' + angleDeg + '°)', c2_x + 48, c2_y + 4, {
        textColor: c.spaceColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
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

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var clockDisplay = container.querySelector('.clock-time');

    var animTime = 0;
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function update() {
      if (clockDisplay) clockDisplay.innerHTML = animTime.toFixed(2) + ' <span>s</span>';
    }

    function draw() {
      var c = getThemeColors();
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

      ctx.fillStyle = c.timeColor;
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();

      drawLabelPill(ctx, 'x = 0 (No spatial motion)', ox + 95, oy + 18, {
        textColor: c.axisLabel,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, currY);
      ctx.stroke();

      drawGlowingDot(ctx, ox, currY, c.timeColor, 7);

      drawLabelPill(ctx, 'Observer at Rest (v = 0)', ox - 90, currY - 6, {
        textColor: c.timeColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
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

  // Widget 3: Thought Experiment (Space vs Time Speed Trade-off)
  function initWidgetTradeoff(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var timeVal = container.querySelector('.val-time');
    var readoutVx = container.querySelector('.readout-vx');
    var readoutVt = container.querySelector('.readout-vt');

    var speedFraction = sliderSpeed ? parseFloat(sliderSpeed.value) / 1000 : 0.866;
    var progress = sliderTime ? parseFloat(sliderTime.value) / 1000 : 0.70;
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function update() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      if (readoutVx) readoutVx.innerText = (speedFraction * 100).toFixed(1) + '% of V';
      if (readoutVt) readoutVt.innerText = (vt * 100).toFixed(1) + '% of V';
      if (timeVal) timeVal.innerText = (progress * 100).toFixed(0) + '%';
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.25;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.58, height * 0.68);

      drawGrid(ctx, ox, oy, width, height, 32);
      // Constraint arc removed for clarity
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var tipX = ox + (progress * scale * speedFraction);
      var tipY = oy - (progress * scale * vt);

      if (progress > 0.05) {
        ctx.strokeStyle = c.invariantColor;
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

      ctx.strokeStyle = c.invariantColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      drawGlowingDot(ctx, tipX, tipY, c.invariantColor, 6.5);

      drawLabelPill(ctx, 'v_time = ' + (vt * 100).toFixed(0) + '%', ox - 55, tipY + 4, {
        textColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, 'v_space = ' + (speedFraction * 100).toFixed(0) + '%', tipX, oy + 22, {
        textColor: c.spaceColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    function loop(now) {
      if (!lastTimestamp) lastTimestamp = now;
      var dt = (now - lastTimestamp) / 1000;
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
      sliderSpeed.addEventListener('input', function (e) {
        speedFraction = e.target.value / 1000;
        update();
        draw();
      });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        progress = e.target.value / 1000;
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

    var speedFraction = 0.866;
    var animTime = 0;
    var isPlaying = false;
    var lastTimestamp = null;
    var animFrame = null;

    function update() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var gamma = speedFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - speedFraction * speedFraction));

      if (readoutSpeed) readoutSpeed.innerText = 'v = ' + speedFraction.toFixed(3) + ' c';
      if (readoutMath) readoutMath.innerText = vt.toFixed(3) + ' c';
      if (readoutGamma) readoutGamma.innerText = gamma.toFixed(2);

      var rocketBadge = container.querySelector('.clock-card.amber .clock-badge');
      if (rocketBadge) {
        if (speedFraction === 0) {
          rocketBadge.innerText = '1.00x Rest Rate';
        } else {
          rocketBadge.innerText = vt.toFixed(2) + 'x Dilated';
        }
      }

      var rocketLabel = container.querySelector('.clock-card.amber .clock-label');
      if (rocketLabel && rocketLabel.getAttribute('data-dynamic') !== 'false') {
        rocketLabel.innerText = speedFraction === 0 ? 'Spacecraft (At Rest)' : 'Spacecraft (v = ' + speedFraction.toFixed(3) + 'c)';
      }

      var earthSec = animTime;
      var rocketSec = animTime * vt;
      if (clockEarth) clockEarth.innerHTML = earthSec.toFixed(2) + ' <span>s</span>';
      if (clockRocket) clockRocket.innerHTML = rocketSec.toFixed(2) + ' <span>s</span>';
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var ox = width * 0.22;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.58, height * 0.68);
      var progress = animTime / 6.0;

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, c.constraintArc);
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (ct)');

      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      var e_x = ox;
      var e_y = oy - (progress * scale);
      var r_x = ox + (progress * scale * speedFraction);
      var r_y = oy - (progress * scale * vt);

      if (progress > 0.05) {
        ctx.strokeStyle = c.spaceColor;
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

      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(e_x, e_y);
      ctx.stroke();

      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(r_x, r_y);
      ctx.stroke();

      drawGlowingDot(ctx, e_x, e_y, c.timeColor, 6);
      drawGlowingDot(ctx, r_x, r_y, c.spaceColor, 6);

      drawLabelPill(ctx, 'Earth (Rest)', e_x - 10, e_y - 18, {
        textColor: c.timeColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
      });
      drawLabelPill(ctx, 'Rocket (Moving)', r_x + 55, r_y + 4, {
        textColor: c.spaceColor,
        font: 'bold 11px "Plus Jakarta Sans", sans-serif'
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
        update();
      }
      draw();
      if (isPlaying) {
        animFrame = requestAnimationFrame(loop);
      }
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        speedFraction = e.target.value / 1000;
        presetChips.forEach(function (c) { c.classList.remove('active'); });
        update();
        draw();
      });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        animTime = (e.target.value / 1000) * 6.0;
        update();
        draw();
      });
    }

    presetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        presetChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        speedFraction = parseFloat(chip.getAttribute('data-val'));
        if (sliderSpeed) sliderSpeed.value = speedFraction * 1000;
        update();
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

    update();
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

      var ox = width * 0.25;
      var oy = height * 0.82;
      var scale = Math.min(width * 0.55, height * 0.68);

      drawGrid(ctx, ox, oy, width, height, 32);
      drawConstraintArc(ctx, ox, oy, scale, c.constraintArc);
      drawAxes(ctx, ox, oy, width, height, 'Space (x)', 'Time (t)');

      // 1. Forbidden Zone (v > c)
      var forbidStartX = ox + scale;
      var forbidEndX = width - 25;
      var forbidMidX = (forbidStartX + forbidEndX) / 2;

      // Subtle red forbidden zone shading
      ctx.fillStyle = c.isLight ? 'rgba(220, 38, 38, 0.05)' : 'rgba(248, 113, 113, 0.08)';
      ctx.fillRect(forbidStartX, 25, forbidEndX - forbidStartX, oy - 25);

      ctx.strokeStyle = c.dangerColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(forbidStartX, oy);
      ctx.lineTo(forbidEndX, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Forbidden Text clearly centered in the forbidden area
      drawLabelPill(ctx, 'FORBIDDEN (v > c)', forbidMidX, oy - 14, {
        textColor: c.dangerColor,
        borderColor: c.dangerColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      drawLabelPill(ctx, 'Exceeds total motion', forbidMidX, oy + 12, {
        textColor: c.dangerColor,
        font: '600 10px sans-serif'
      });

      // Boundary Tick at v = c
      ctx.strokeStyle = c.photonColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(forbidStartX, oy - 8);
      ctx.lineTo(forbidStartX, oy + 8);
      ctx.stroke();

      drawLabelPill(ctx, 'v = c', forbidStartX, oy + 14, {
        textColor: c.photonColor,
        borderColor: c.photonColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

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

      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      drawGlowingDot(ctx, tipX, tipY, color, 7);

      if (mode === 'photon') {
        var photonLabelX = width < 450 ? Math.min(width - 85, Math.max(ox + 65, tipX - 70)) : tipX - 105;
        drawLabelPill(ctx, width < 380 ? 'Photon (v = c)' : 'Photon (Speed of Light, v = c)', photonLabelX, oy - 14, {
          textColor: c.photonColor,
          font: 'bold 11px "Plus Jakarta Sans", sans-serif'
        });
      } else if (mode === 'rocket') {
        var rocketLabelX = width < 450 ? Math.min(width - 65, tipX + 55) : tipX + 90;
        drawLabelPill(ctx, 'Fast Rocket (v = 0.866c)', rocketLabelX, tipY - 8, {
          textColor: c.spaceColor,
          font: 'bold 11px "Plus Jakarta Sans", sans-serif'
        });
      } else {
        var restLabelX = width < 450 ? Math.min(width - 65, tipX + 65) : tipX + 90;
        drawLabelPill(ctx, 'Observer at Rest (v = 0)', restLabelX, tipY, {
          textColor: c.timeColor,
          font: 'bold 11px "Plus Jakarta Sans", sans-serif'
        });
      }
    }

    function update() {
      if (mode === 'photon') {
        if (clockPhoton) clockPhoton.innerHTML = '0.000 <span>s</span>';
        if (statusNote) statusNote.innerText = 'Time is completely frozen. 100% of motion is across space.';
      } else if (mode === 'rocket') {
        if (clockPhoton) clockPhoton.innerHTML = '3.000 <span>s</span>';
        if (statusNote) statusNote.innerText = 'Time moves at 50% normal rate (v_time = 0.500 c).';
      } else {
        if (clockPhoton) clockPhoton.innerHTML = '6.000 <span>s</span>';
        if (statusNote) statusNote.innerText = 'Observer sitting motionless in space moves 100% through time.';
      }
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
        ctx.fillStyle = c.dangerColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('💥', muonX - 8, muonY + 6);
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

  // Widget 7: 3D Spacetime Vector & Spacetime Loaf Foundation (x1, x2, t)
  function initWidget3DSpacetime(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderHeading = container.querySelector('.slider-heading');
    var sliderOrbit = container.querySelector('.slider-orbit');
    var btnLoaf = container.querySelector('.btn-loaf-slice');
    var readoutVx1 = container.querySelector('.readout-vx1');
    var readoutVx2 = container.querySelector('.readout-vx2');
    var readoutVspace = container.querySelector('.readout-vspace');
    var readoutVtime = container.querySelector('.readout-vtime');
    var readoutGamma = container.querySelector('.readout-gamma');
    var speedPresetChips = container.querySelectorAll('.chip-speed');
    var headingPresetChips = container.querySelectorAll('.chip-heading');

    var vSpaceFraction = 0.80; // 0.80 c
    var headingDeg = 35;       // 35 degrees East of North
    var azimuth = -0.65;       // Camera azimuth radians (-37 deg)
    var elevation = 0.45;      // Camera elevation radians (26 deg)
    var showLoafSlice = true;  // Loaf slice visible by default

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
      elevation += dy * 0.01;
      elevation = Math.max(0.1, Math.min(1.4, elevation));
      draw();
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isDragging = false;
    });

    function update() {
      var rad = headingDeg * Math.PI / 180;
      var vx1 = vSpaceFraction * Math.cos(rad);
      var vx2 = vSpaceFraction * Math.sin(rad);
      var vt = Math.sqrt(Math.max(0, 1 - vSpaceFraction * vSpaceFraction));
      var gamma = vSpaceFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vSpaceFraction * vSpaceFraction));

      if (readoutVx1) readoutVx1.innerText = vx1.toFixed(3) + ' c';
      if (readoutVx2) readoutVx2.innerText = vx2.toFixed(3) + ' c';
      if (readoutVspace) readoutVspace.innerText = vSpaceFraction.toFixed(3) + ' c';
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
      ctx.strokeStyle = c.isLight ? 'rgba(124, 58, 237, 0.25)' : 'rgba(168, 85, 247, 0.25)';
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
      drawLabelPill(ctx, 'East (x₁)', pX1.x + 35, pX1.y + 4, {
        textColor: c.axisLabel,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, 'North (x₂)', pX2.x - 35, pX2.y + 14, {
        textColor: c.axisLabel,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, 'Time (ct)', pZ.x, pZ.y - 14, {
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

      // 4. Now-Slice Plane (Spacetime Loaf Slice)
      if (showLoafSlice && vt > 0.02) {
        var sliceSize = 1.15;
        var pCorn1 = p3(-sliceSize, -sliceSize, vt);
        var pCorn2 = p3(sliceSize, -sliceSize, vt);
        var pCorn3 = p3(sliceSize, sliceSize, vt);
        var pCorn4 = p3(-sliceSize, sliceSize, vt);

        ctx.fillStyle = c.isLight ? 'rgba(3, 105, 161, 0.08)' : 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = c.isLight ? 'rgba(3, 105, 161, 0.4)' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(pCorn1.x, pCorn1.y);
        ctx.lineTo(pCorn2.x, pCorn2.y);
        ctx.lineTo(pCorn3.x, pCorn3.y);
        ctx.lineTo(pCorn4.x, pCorn4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        drawLabelPill(ctx, 'Spacetime Loaf Slice ("Now" Plane: t = ' + vt.toFixed(2) + ' c)', pCorn2.x - 20, pCorn2.y - 10, {
          textColor: c.timeColor,
          font: 'bold 10px "JetBrains Mono", monospace'
        });
      }

      // 5. Ground Velocity Components (Shadow on Space Floor)
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
        ctx.strokeStyle = c.isLight ? 'rgba(194, 65, 12, 0.6)' : 'rgba(251, 146, 60, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pVectorTip.x, pVectorTip.y);
        ctx.lineTo(pGroundTip.x, pGroundTip.y);
        ctx.stroke();

        ctx.strokeStyle = c.isLight ? 'rgba(3, 105, 161, 0.6)' : 'rgba(56, 189, 248, 0.6)';
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

      // 6. The 3D Spacetime Vector
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

    if (btnLoaf) {
      btnLoaf.addEventListener('click', function () {
        showLoafSlice = !showLoafSlice;
        btnLoaf.innerHTML = showLoafSlice
          ? '<span>Loaf Slice: </span><strong style="color:var(--color-time)">Visible (ON)</strong>'
          : '<span>Loaf Slice: </span><strong style="color:var(--text-muted)">Hidden (OFF)</strong>';
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
    initWidgetTradeoff('widget-tradeoff');
    initWidgetTimeDilation('widget-time-dilation');
    initWidgetSpeedLimit('widget-speed-limit');
    initWidgetMuon('widget-muon');
    initWidget3DSpacetime('widget-3d-spacetime');
  }

  sim.initWidgetCars = initWidgetCars;
  sim.initWidgetStationary = initWidgetStationary;
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
