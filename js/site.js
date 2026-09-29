/**
 * site.js - Universal Client-Side Physics Simulation Suite
 * 100% Static, Serverless, Zero-Dependency. Works over file:// and any static host.
 * Supports Dynamic Light / Dark Theme switching with live Canvas re-rendering.
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 1. Theme Color Provider & Canvas Utilities
  // ==========================================================================
  function getThemeColors() {
    var isLight = document.documentElement.getAttribute('data-theme') !== 'dark';
    if (isLight) {
      return {
        isLight: true,
        gridLine: '#e2e8f0',
        axisLine: '#94a3b8',
        axisArrow: '#64748b',
        axisLabel: '#475569',
        constraintArc: '#cbd5e1',
        timeColor: '#0284c7',       // Sky 600
        timeColorSubtle: 'rgba(2, 132, 199, 0.15)',
        spaceColor: '#ea580c',      // Radiant Orange 600
        spaceColorSubtle: 'rgba(234, 88, 12, 0.15)',
        invariantColor: '#7c3aed',  // Violet 600
        photonColor: '#ca8a04',     // Amber 600
        dangerColor: '#dc2626',     // Red 600
        subtleText: '#64748b',
        dotCenter: '#ffffff',
        muonAtmosphereTop: 'rgba(2, 132, 199, 0.05)',
        muonAtmosphereBottom: 'rgba(2, 132, 199, 0.18)'
      };
    } else {
      return {
        isLight: false,
        gridLine: '#121b2d',
        axisLine: '#475569',
        axisArrow: '#64748b',
        axisLabel: '#94a3b8',
        constraintArc: '#27344d',
        timeColor: '#38bdf8',       // Electric Cyan
        timeColorSubtle: 'rgba(56, 189, 248, 0.25)',
        spaceColor: '#fb923c',      // Radiant Coral
        spaceColorSubtle: 'rgba(251, 146, 60, 0.25)',
        invariantColor: '#a855f7',  // Luminous Violet
        photonColor: '#facc15',     // Golden Sun
        dangerColor: '#f87171',     // Soft Red
        subtleText: '#8899b5',
        dotCenter: '#ffffff',
        muonAtmosphereTop: 'rgba(56, 189, 248, 0.05)',
        muonAtmosphereBottom: 'rgba(56, 189, 248, 0.2)'
      };
    }
  }

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
    var c = getThemeColors();
    ctx.strokeStyle = c.gridLine;
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
    var c = getThemeColors();
    ctx.strokeStyle = c.axisLine;
    ctx.lineWidth = 2;

    // Horizontal Axis
    ctx.beginPath();
    ctx.moveTo(ox - 15, oy);
    ctx.lineTo(width - 25, oy);
    ctx.stroke();

    // Horizontal Arrowhead
    ctx.fillStyle = c.axisArrow;
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
    ctx.fillStyle = c.axisLabel;
    ctx.fillText(xLabel, width - 85, oy + 18);
    ctx.fillText(yLabel, ox - 35, 18);
  }

  function drawConstraintArc(ctx, ox, oy, radius, color) {
    var c = getThemeColors();
    ctx.strokeStyle = color || c.constraintArc;
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

  // Active redraw registry for theme switches & resize
  var registeredDraws = [];
  function registerDraw(fn) {
    registeredDraws.push(fn);
  }

  function redrawAll() {
    for (var i = 0; i < registeredDraws.length; i++) {
      try {
        registeredDraws[i]();
      } catch (e) {
        console.error(e);
      }
    }
  }

  // ==========================================================================
  // 2. Theme Manager (Light by default, persists to localStorage)
  // ==========================================================================
  function initThemeManager() {
    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('universe_theme', theme);
      } catch (e) {}

      var btns = document.querySelectorAll('.theme-toggle-btn');
      for (var i = 0; i < btns.length; i++) {
        var label = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        btns[i].setAttribute('title', label);
        btns[i].setAttribute('aria-label', label);
      }
      redrawAll();
    }

    // Default to 'light' if not explicitly stored
    var saved = null;
    try {
      saved = localStorage.getItem('universe_theme');
    } catch (e) {}
    var theme = saved ? saved : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    var btns = document.querySelectorAll('.theme-toggle-btn');
    for (var j = 0; j < btns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var current = document.documentElement.getAttribute('data-theme') || 'light';
          var next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next);
        });
      })(btns[j]);
      var label = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btns[j].setAttribute('title', label);
      btns[j].setAttribute('aria-label', label);
    }
  }

  // ==========================================================================
  // 3. Widget Implementations
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
        var badgeDist = arcR + 18;
        var badgeX = ox + badgeDist * Math.cos(midA);
        var badgeY = oy + badgeDist * Math.sin(midA);

        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.spaceColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('θ = ' + Math.round(angleDeg) + '°', badgeX + (rad > 0.8 ? 8 : 0), badgeY);
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
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillStyle = c.spaceColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('V_East = ' + vEast + ' mph', (ox + c2_x) / 2, c2_y - 4);
        }

        // Vertical Northward Component Value Label (v_North = 30.0 mph)
        if (oy - c2_y > 25) {
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillStyle = c.spaceColor;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('V_North = ' + vNorth + ' mph', c2_x + 8, (oy + c2_y) / 2);
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
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = c.timeColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('60 mph', ox - 10, (oy + c1_y) / 2);
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
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = c.spaceColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('60 mph', diagMidX + nx * 14, diagMidY + ny * 14);
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

        ctx.font = '600 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Northward Lag (' + lagMiles + ' mi)', lagX + 8, (c1_y + c2_y) / 2);
      }

      // 6. Glowing Dots & Vehicle Names
      drawGlowingDot(ctx, c1_x, c1_y, c.timeColor, 6);
      drawGlowingDot(ctx, c2_x, c2_y, c.spaceColor, 6);

      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = c.timeColor;
      ctx.fillText('Car 1 (60 mph North)', c1_x - 45, c1_y - 12);
      ctx.fillStyle = c.spaceColor;
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
      ctx.font = '600 11px monospace';
      ctx.fillText('x = 0 (No spatial movement)', ox + 10, oy + 18);

      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, currY);
      ctx.stroke();

      drawGlowingDot(ctx, ox, currY, c.timeColor, 7);

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = c.timeColor;
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
    var readoutVx = container.querySelector('.readout-vx');
    var readoutVt = container.querySelector('.readout-vt');

    var speedFraction = 0.60;
    var progress = 0.85;

    function update() {
      var vt = Math.sqrt(Math.max(0, 1 - speedFraction * speedFraction));
      if (readoutVx) readoutVx.innerText = (speedFraction * 100).toFixed(1) + '% of V';
      if (readoutVt) readoutVt.innerText = (vt * 100).toFixed(1) + '% of V';
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
      drawConstraintArc(ctx, ox, oy, scale, c.invariantColor);
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

      ctx.font = '600 11px monospace';
      ctx.fillStyle = c.timeColor;
      ctx.fillText('v_time = ' + (vt * 100).toFixed(0) + '%', ox - 95, tipY + 4);
      ctx.fillStyle = c.spaceColor;
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

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = c.timeColor;
      ctx.fillText('Earth (Rest)', e_x - 30, e_y - 12);
      ctx.fillStyle = c.spaceColor;
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

      ctx.strokeStyle = c.dangerColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox + scale, oy);
      ctx.lineTo(width - 25, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 10px monospace';
      ctx.fillStyle = c.dangerColor;
      ctx.fillText('FORBIDDEN (v > c)', ox + scale + 15, oy - 10);

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

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = color;
      var label = mode === 'photon' ? 'Photon (Light Speed)' : (mode === 'rest' ? 'Observer at Rest' : 'Fast Rocket');
      ctx.fillText(label, tipX - 20, tipY - 14);
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

      var padLeft = 90;
      var padRight = 30;
      var topY = 40;
      var bottomY = height - 50;
      var trackH = bottomY - topY;

      var grad = ctx.createLinearGradient(0, topY, 0, bottomY);
      grad.addColorStop(0, c.muonAtmosphereTop);
      grad.addColorStop(1, c.muonAtmosphereBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(padLeft, topY, width - padLeft - padRight, trackH);

      ctx.font = '600 11px monospace';
      ctx.fillStyle = c.axisLabel;
      ctx.fillText('10 km (Creation)', 10, topY + 4);
      ctx.fillText('0 km (Sea Level)', 10, bottomY + 4);

      var decayY = topY + (0.66 / 10.0) * trackH;
      ctx.strokeStyle = c.dangerColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, decayY);
      ctx.lineTo(width - padRight, decayY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.dangerColor;
      ctx.fillText('Classical Limit (660m)', width - 170, decayY - 6);

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
        ctx.font = '600 11px sans-serif';
        ctx.fillText('Decayed into electron + neutrinos', muonX + 15, muonY + 4);
      } else {
        drawGlowingDot(ctx, muonX, muonY, c.timeColor, 6);
        ctx.fillStyle = c.timeColor;
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
      ctx.font = '600 11px monospace';
      ctx.fillStyle = c.axisLabel;
      ctx.fillText('East (x₁)', pX1.x + 8, pX1.y + 4);
      ctx.fillText('North (x₂)', pX2.x - 12, pX2.y + 16);
      ctx.fillStyle = c.timeColor;
      ctx.fillText('Time (ct)', pZ.x - 28, pZ.y - 10);

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

        ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(56, 189, 248, 0.4)';
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

        ctx.font = '600 10px monospace';
        ctx.fillStyle = c.timeColor;
        ctx.fillText('Spacetime Loaf Slice ("Now" Plane at t = ' + vt.toFixed(2) + ' c)', pCorn2.x - 30, pCorn2.y - 8);
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

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = c.spaceColor;
        ctx.fillText('v_space = ' + vSpaceFraction.toFixed(2) + 'c', (pOrigin.x + pGroundTip.x) / 2 + 8, (pOrigin.y + pGroundTip.y) / 2 + 12);
      }

      // Vertical projection from tip down to floor
      if (vSpaceFraction > 0.05 && vt > 0.05) {
        ctx.strokeStyle = c.isLight ? 'rgba(234, 88, 12, 0.6)' : 'rgba(251, 146, 60, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pVectorTip.x, pVectorTip.y);
        ctx.lineTo(pGroundTip.x, pGroundTip.y);
        ctx.stroke();

        ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.6)' : 'rgba(56, 189, 248, 0.6)';
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

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = c.invariantColor;
      ctx.fillText('Spacetime Velocity (|V| = c)', pVectorTip.x + 12, pVectorTip.y - 8);

      ctx.font = '600 10px monospace';
      ctx.fillStyle = c.timeColor;
      ctx.fillText('v_time = ' + vt.toFixed(3) + 'c', pVectorTip.x + 12, pVectorTip.y + 6);
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
    initThemeManager();
    initWidgetCars('widget-cars');
    initWidgetStationary('widget-stationary');
    initWidgetTradeoff('widget-tradeoff');
    initWidgetTimeDilation('widget-time-dilation');
    initWidgetSpeedLimit('widget-speed-limit');
    initWidgetMuon('widget-muon');
    initWidget3DSpacetime('widget-3d-spacetime');
  }

  // Export to global scope
  window.UniverseSimulations = {
    setupRetinaCanvas: setupRetinaCanvas,
    drawGrid: drawGrid,
    drawAxes: drawAxes,
    drawConstraintArc: drawConstraintArc,
    drawGlowingDot: drawGlowingDot,
    getThemeColors: getThemeColors,
    initThemeManager: initThemeManager,
    redrawAll: redrawAll,
    initWidgetCars: initWidgetCars,
    initWidgetStationary: initWidgetStationary,
    initWidgetTradeoff: initWidgetTradeoff,
    initWidgetTimeDilation: initWidgetTimeDilation,
    initWidgetSpeedLimit: initWidgetSpeedLimit,
    initWidgetMuon: initWidgetMuon,
    initWidget3DSpacetime: initWidget3DSpacetime,
    initAllPost01: initAllPost01
  };

})(window);
