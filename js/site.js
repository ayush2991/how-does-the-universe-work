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
        gridLine: 'rgba(15, 23, 42, 0.05)',
        axisLine: '#334155',        // Slate 700: sharp visible axes
        axisArrow: '#1e293b',       // Slate 800: sharp arrowheads
        axisLabel: '#0f172a',       // Slate 900: high contrast labels
        constraintArc: '#94a3b8',   // Slate 400: clearly visible speed limit arc
        timeColor: '#0284c7',       // Sky 600 (calibrated contrast)
        timeColorSubtle: 'rgba(2, 132, 199, 0.12)',
        spaceColor: '#ea580c',      // Radiant Orange 600
        spaceColorSubtle: 'rgba(234, 88, 12, 0.12)',
        invariantColor: '#7c3aed',  // Violet 600
        photonColor: '#d97706',     // Amber 600
        dangerColor: '#dc2626',     // Red 600
        subtleText: '#64748b',
        dotCenter: '#ffffff',
        pillBg: 'rgba(255, 255, 255, 0.95)',
        pillBorder: 'rgba(15, 23, 42, 0.12)',
        pillText: '#0f172a',
        muonAtmosphereTop: 'rgba(2, 132, 199, 0.06)',
        muonAtmosphereBottom: 'rgba(2, 132, 199, 0.18)'
      };
    } else {
      return {
        isLight: false,
        gridLine: 'rgba(255, 255, 255, 0.05)',
        axisLine: '#64748b',        // Brightened for clear dark-mode axes
        axisArrow: '#94a3b8',
        axisLabel: '#f8fafc',       // High-contrast white labels
        constraintArc: '#334155',   // Defined speed limit arc
        timeColor: '#38bdf8',       // Electric Cyan
        timeColorSubtle: 'rgba(56, 189, 248, 0.2)',
        spaceColor: '#fb923c',      // Radiant Coral
        spaceColorSubtle: 'rgba(251, 146, 60, 0.2)',
        invariantColor: '#a855f7',  // Luminous Violet
        photonColor: '#facc15',     // Golden Sun
        dangerColor: '#f87171',     // Soft Red
        subtleText: '#94a3b8',
        dotCenter: '#ffffff',
        pillBg: 'rgba(14, 18, 26, 0.95)',
        pillBorder: 'rgba(255, 255, 255, 0.12)',
        pillText: '#f8fafc',
        muonAtmosphereTop: 'rgba(56, 189, 248, 0.06)',
        muonAtmosphereBottom: 'rgba(56, 189, 248, 0.22)'
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

  function drawLabelPill(ctx, text, x, y, options) {
    options = options || {};
    var c = getThemeColors();
    var font = options.font || 'bold 11px "JetBrains Mono", monospace';
    var textColor = options.textColor || c.pillText;
    var bgColor = options.bgColor || c.pillBg;
    var borderColor = options.borderColor || c.pillBorder;
    var align = options.align || 'center';
    var baseline = options.baseline || 'middle';
    var padX = options.paddingX !== undefined ? options.paddingX : 6;
    var padY = options.paddingY !== undefined ? options.paddingY : 3;

    ctx.save();
    ctx.font = font;
    var textMetrics = ctx.measureText(text);
    var textW = textMetrics.width;
    var textH = 11;
    var match = font.match(/(\d+)px/);
    if (match) textH = parseInt(match[1], 10);

    var pillW = textW + padX * 2;
    var pillH = textH + padY * 2;

    var pillX = x;
    if (align === 'center') pillX = x - pillW / 2;
    else if (align === 'right') pillX = x - pillW;

    var pillY = y;
    if (baseline === 'middle') pillY = y - pillH / 2;
    else if (baseline === 'bottom') pillY = y - pillH;

    // Draw background pill
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    var r = 4;
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

    // Text inside pill
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pillX + padX, pillY + pillH / 2);
    ctx.restore();
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
    ctx.lineWidth = 2.2;

    // Horizontal Axis
    ctx.beginPath();
    ctx.moveTo(ox - 15, oy);
    ctx.lineTo(width - 25, oy);
    ctx.stroke();

    // Horizontal Arrowhead
    ctx.fillStyle = c.axisArrow;
    ctx.beginPath();
    ctx.moveTo(width - 25, oy - 5);
    ctx.lineTo(width - 15, oy);
    ctx.lineTo(width - 25, oy + 5);
    ctx.fill();

    // Vertical Axis
    ctx.beginPath();
    ctx.moveTo(ox, oy + 15);
    ctx.lineTo(ox, 25);
    ctx.stroke();

    // Vertical Arrowhead
    ctx.beginPath();
    ctx.moveTo(ox - 5, 25);
    ctx.lineTo(ox, 15);
    ctx.lineTo(ox + 5, 25);
    ctx.fill();

    // Labels with crisp pill background
    drawLabelPill(ctx, xLabel, width - 60, oy + 18, {
      font: 'bold 11px "JetBrains Mono", monospace',
      align: 'center',
      baseline: 'middle',
      paddingX: 5,
      paddingY: 2
    });
    drawLabelPill(ctx, yLabel, ox, 14, {
      font: 'bold 11px "JetBrains Mono", monospace',
      align: 'center',
      baseline: 'middle',
      paddingX: 5,
      paddingY: 2
    });
  }

  function drawConstraintArc(ctx, ox, oy, radius, color) {
    var c = getThemeColors();
    ctx.strokeStyle = color || c.constraintArc;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
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

  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar) return;
    function updateProgress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) {
        var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
        bar.style.width = pct + '%';
      }
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ==========================================================================
  // Part 2: The Spacetime Loaf & Length Contraction Widgets
  // ==========================================================================

  function drawStickFigure3D(ctx, p3, x1, x2, t, color, alpha, scaleMultiplier, widthFactor) {
    alpha = alpha !== undefined ? alpha : 1.0;
    scaleMultiplier = scaleMultiplier !== undefined ? scaleMultiplier : 1.0;
    widthFactor = widthFactor !== undefined ? widthFactor : 1.0;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.8 * scaleMultiplier;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var w = 0.28 * scaleMultiplier * widthFactor;
    var h = 0.32 * scaleMultiplier;

    var pFeet = p3(x1, x2, t);
    var pHips = p3(x1, x2 + h * 0.45, t);
    var pChest = p3(x1, x2 + h * 0.8, t);
    var pHead = p3(x1, x2 + h * 1.15, t);
    var pHandL = p3(x1 - w, x2 + h * 0.75, t);
    var pHandR = p3(x1 + w, x2 + h * 0.75, t);
    var pFootL = p3(x1 - w * 0.6, x2, t);
    var pFootR = p3(x1 + w * 0.6, x2, t);

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

    // Arms
    ctx.beginPath();
    ctx.moveTo(pHandL.x, pHandL.y);
    ctx.lineTo(pChest.x, pChest.y);
    ctx.lineTo(pHandR.x, pHandR.y);
    ctx.stroke();

    // Measuring rod held across hands
    ctx.lineWidth = 2.4 * scaleMultiplier;
    ctx.beginPath();
    ctx.moveTo(pHandL.x, pHandL.y);
    ctx.lineTo(pHandR.x, pHandR.y);
    ctx.stroke();

    // Head
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    var headRadius = Math.max(3, 4.5 * scaleMultiplier);
    ctx.arc(pHead.x, pHead.y, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // WIDGET 1: Alice at Rest in the Loaf
  function initWidgetLoafAlice(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var sliderOrbit = container.querySelector('.slider-orbit');
    var btnPlay = container.querySelector('.btn-play');
    var readoutTime = container.querySelector('.readout-alice-time');
    var valTime = container.querySelector('.val-time');

    var isPlaying = false;
    var timeVal = 3.0;
    var azimuth = -35 * Math.PI / 180;
    var elevation = 25 * Math.PI / 180;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartAzimuth = azimuth;

    function update() {
      if (readoutTime) readoutTime.innerHTML = timeVal.toFixed(2) + ' <span>s</span>';
      if (valTime) valTime.innerText = 't = ' + timeVal.toFixed(2) + ' s';
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
      var cy = height * 0.72;
      var scale = Math.min(width * 0.26, height * 0.40);

      function p3(x, y, z) {
        return project(x, y, z, cx, cy, scale);
      }

      // Ground Grid
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1;
      for (var gx = -1.2; gx <= 1.21; gx += 0.4) {
        var pStart = p3(gx, -1.2, 0);
        var pEnd = p3(gx, 1.2, 0);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }
      for (var gy = -1.2; gy <= 1.21; gy += 0.4) {
        var pS = p3(-1.2, gy, 0);
        var pE = p3(1.2, gy, 0);
        ctx.beginPath();
        ctx.moveTo(pS.x, pS.y);
        ctx.lineTo(pE.x, pE.y);
        ctx.stroke();
      }

      // Axes
      var pOrigin = p3(0, 0, 0);
      var pX1 = p3(1.35, 0, 0);
      var pX2 = p3(0, 1.35, 0);
      var pZ = p3(0, 0, 1.45);

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

      // Cosmic Light Cone (45° Surface: x₁² + x₂² = (ct)²)
      var zConeMax = 1.35;
      var numRays = 16;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.40)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);

      for (var cri = 0; cri < numRays; cri++) {
        var cAng = (cri / numRays) * Math.PI * 2;
        var rx = zConeMax * Math.cos(cAng);
        var ry = zConeMax * Math.sin(cAng);
        var pRayEnd = p3(rx, ry, zConeMax);
        ctx.beginPath();
        ctx.moveTo(pOrigin.x, pOrigin.y);
        ctx.lineTo(pRayEnd.x, pRayEnd.y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([]);
      ctx.beginPath();
      for (var cti = 0; cti <= 36; cti++) {
        var cRimAng = (cti / 36) * Math.PI * 2;
        var ptRim = p3(zConeMax * Math.cos(cRimAng), zConeMax * Math.sin(cRimAng), zConeMax);
        if (cti === 0) ctx.moveTo(ptRim.x, ptRim.y);
        else ctx.lineTo(ptRim.x, ptRim.y);
      }
      ctx.stroke();

      var pConeLabel = p3(zConeMax * 0.82, 0, zConeMax * 0.82);
      drawLabelPill(ctx, 'Light Cone (45°: v = c)', pConeLabel.x + 10, pConeLabel.y - 10, {
        textColor: '#d97706',
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      // Alice's Worldtube Rails
      var zMax = 1.35;
      ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);

      var railOffsets = [-0.28, 0, 0.28];
      for (var r = 0; r < railOffsets.length; r++) {
        var rBot = p3(railOffsets[r], 0, 0);
        var rTop = p3(railOffsets[r], 0, zMax);
        ctx.beginPath();
        ctx.moveTo(rBot.x, rBot.y);
        ctx.lineTo(rTop.x, rTop.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Ghost Snapshots
      var tSnapshots = [0.1, 0.35, 0.6, 0.85, 1.1, 1.3];
      for (var s = 0; s < tSnapshots.length; s++) {
        var ts = tSnapshots[s];
        var alpha = Math.abs((timeVal / 6.0) * 1.35 - ts) < 0.15 ? 0.9 : 0.25;
        drawStickFigure3D(ctx, p3, 0, 0, ts, c.timeColor, alpha, 1.0);
      }

      // Alice's Slice of "Now"
      var currentZ = (timeVal / 6.0) * 1.35;
      var sliceR = 1.15;
      var pC1 = p3(-sliceR, -sliceR, currentZ);
      var pC2 = p3(sliceR, -sliceR, currentZ);
      var pC3 = p3(sliceR, sliceR, currentZ);
      var pC4 = p3(-sliceR, sliceR, currentZ);

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
        for (var lri = 0; lri <= 36; lri++) {
          var lAng = (lri / 36) * Math.PI * 2;
          var ptRing = p3(currentZ * Math.cos(lAng), currentZ * Math.sin(lAng), currentZ);
          if (lri === 0) ctx.moveTo(ptRing.x, ptRing.y);
          else ctx.lineTo(ptRing.x, ptRing.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        var pRingLabel = p3(currentZ * 0.707, currentZ * 0.707, currentZ);
        drawLabelPill(ctx, 'Light Ripple (r = ct = ' + timeVal.toFixed(2) + ' ls)', pRingLabel.x + 8, pRingLabel.y + 12, {
          textColor: '#d97706',
          font: '9px "JetBrains Mono", monospace'
        });
      }

      // Active stick figure
      drawStickFigure3D(ctx, p3, 0, 0, currentZ, c.timeColor, 1.0, 1.1);

      drawLabelPill(ctx, 'Alice’s "Now" (t = ' + timeVal.toFixed(2) + ' s)', pC2.x - 20, pC2.y - 10, {
        textColor: c.timeColor
      });

      if (currentZ > 0.3) {
        var pPast = p3(0.85, -0.85, currentZ * 0.45);
        drawLabelPill(ctx, 'Alice’s Past (History)', pPast.x, pPast.y, {
          textColor: c.subtleText,
          font: '10px "JetBrains Mono", monospace'
        });
      }
      if (currentZ < 1.0) {
        var pFuture = p3(0.85, -0.85, currentZ + (1.35 - currentZ) * 0.55);
        drawLabelPill(ctx, 'Alice’s Future', pFuture.x, pFuture.y, {
          textColor: c.invariantColor,
          font: '10px "JetBrains Mono", monospace'
        });
      }
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        timeVal = (parseFloat(e.target.value) / 600) * 6.0;
        update();
      });
    }

    if (sliderOrbit) {
      sliderOrbit.addEventListener('input', function (e) {
        azimuth = (parseFloat(e.target.value) * Math.PI) / 180;
        draw();
      });
    }

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartAzimuth = azimuth;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      azimuth = dragStartAzimuth + dx * 0.008;
      if (sliderOrbit) sliderOrbit.value = ((azimuth * 180) / Math.PI).toFixed(0);
      draw();
    });

    window.addEventListener('mouseup', function () { isDragging = false; });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartAzimuth = azimuth;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - dragStartX;
      azimuth = dragStartAzimuth + dx * 0.008;
      draw();
    }, { passive: true });

    window.addEventListener('touchend', function () { isDragging = false; });

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var lastTime = performance.now();
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - lastTime) / 1000;
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

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // WIDGET 2: Bob in Motion: Angling Across the Loaf
  function initWidgetLoafBob(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderTime = container.querySelector('.slider-time');
    var sliderOrbit = container.querySelector('.slider-orbit');
    var btnPlay = container.querySelector('.btn-play');
    var readoutSpeed = container.querySelector('.readout-speed-val');
    var readoutBobSpeed = container.querySelector('.readout-bob-speed');
    var readoutAliceClock = container.querySelector('.readout-alice-clock');
    var readoutBobClock = container.querySelector('.readout-bob-clock');
    var readoutDisp = container.querySelector('.readout-bob-disp');
    var valTime = container.querySelector('.val-time');
    var chipButtons = container.querySelectorAll('.chip-speed');

    var isPlaying = false;
    var angleDeg = 60; // 0 to 90 degrees, matching Part 1
    var timeVal = 3.5;
    var azimuth = -35 * Math.PI / 180;
    var elevation = 25 * Math.PI / 180;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartAzimuth = azimuth;

    function update() {
      var rad = angleDeg * Math.PI / 180;
      var vFraction = Math.sin(rad);
      var vtFraction = Math.cos(rad);
      var aliceTime = timeVal;
      var bobTime = angleDeg === 90 ? 0.00 : timeVal * vtFraction;

      var tiltDeg = (Math.atan(vFraction) * 180) / Math.PI;

      if (readoutSpeed) {
        if (angleDeg === 90) {
          readoutSpeed.innerText = 'θ = 90° (v = 1.000 c, Tilt = 45.0° [Light Cone])';
        } else {
          readoutSpeed.innerText = 'θ = ' + angleDeg + '° (v = ' + vFraction.toFixed(3) + ' c, Tilt = ' + tiltDeg.toFixed(1) + '°)';
        }
      }
      if (readoutBobSpeed) {
        if (angleDeg === 90) {
          readoutBobSpeed.innerText = 'θ = 90° (Frozen: 0.00x)';
        } else {
          readoutBobSpeed.innerText = 'θ = ' + angleDeg + '° (' + vtFraction.toFixed(2) + 'x Rate)';
        }
      }
      if (readoutAliceClock) readoutAliceClock.innerHTML = aliceTime.toFixed(2) + ' <span>s</span>';
      if (readoutBobClock) {
        readoutBobClock.innerHTML = bobTime.toFixed(2) + ' <span>s</span>';
      }
      if (readoutDisp) {
        if (angleDeg === 90) {
          readoutDisp.innerText = 'Time is completely frozen! cos(90°) = 0. Timeless photon traveling at c.';
        } else {
          readoutDisp.innerText = 'Ticks at cos(' + angleDeg + '°) = ' + (vtFraction * 100).toFixed(1) + '% rate (' + bobTime.toFixed(2) + ' s elapsed).';
        }
      }
      if (valTime) valTime.innerText = 't = ' + timeVal.toFixed(2) + ' s';

      var readoutComponents = container.querySelector('.readout-components');
      if (readoutComponents) {
        var curEast = (vFraction * timeVal).toFixed(2);
        var curTime = timeVal.toFixed(2);
        readoutComponents.innerHTML = "Bob's Components: East (x₁) = <strong>" + curEast + " ls</strong> | North (x₂) = <strong>0.00 ls</strong> | Time (ct) = <strong>" + curTime + " s</strong>";
      }

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

      var rad = angleDeg * Math.PI / 180;
      var vFraction = Math.sin(rad);

      var cx = width * 0.44;
      var cy = height * 0.72;
      var scale = Math.min(width * 0.26, height * 0.40);
      function p3(x, y, z) { return project(x, y, z, cx, cy, scale); }

      // Ground Grid
      ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
      for (var gx = -1.2; gx <= 1.81; gx += 0.4) {
        var pS = p3(gx, -1.2, 0), pE = p3(gx, 1.2, 0);
        ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
      }
      for (var gy = -1.2; gy <= 1.21; gy += 0.4) {
        var pS2 = p3(-1.2, gy, 0), pE2 = p3(1.8, gy, 0);
        ctx.beginPath(); ctx.moveTo(pS2.x, pS2.y); ctx.lineTo(pE2.x, pE2.y); ctx.stroke();
      }

      // Axes
      var pO = p3(0, 0, 0);
      var pX1 = p3(2.0, 0, 0);
      var pX2 = p3(0, 1.45, 0);
      var pZ = p3(0, 0, 1.45);

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

      var tiltRad = Math.atan(vFraction);
      var tiltDeg = (tiltRad * 180) / Math.PI;

      // Spacetime Tilt Arc at Origin (Sweeps to Bob's Central Worldline)
      var bobColor = angleDeg === 90 ? '#facc15' : c.spaceColor;
      if (angleDeg > 0) {
        var arcR = 0.65;
        ctx.strokeStyle = bobColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        var numPts = 30;
        for (var ai = 0; ai <= numPts; ai++) {
          var aAng = (ai / numPts) * tiltRad;
          var ptArc = p3(arcR * Math.sin(aAng), 0, arcR * Math.cos(aAng));
          if (ai === 0) ctx.moveTo(ptArc.x, ptArc.y);
          else ctx.lineTo(ptArc.x, ptArc.y);
        }
        ctx.stroke();

        var midAng = tiltRad * 0.5;
        var pLabel = p3((arcR + 0.18) * Math.sin(midAng), 0, (arcR + 0.18) * Math.cos(midAng));
        drawLabelPill(ctx, 'Tilt: ' + tiltDeg.toFixed(1) + '°', pLabel.x, pLabel.y, {
          textColor: angleDeg === 90 ? '#d97706' : c.spaceColor,
          font: 'bold 11px "JetBrains Mono", monospace'
        });
      }

      // Alice's Vertical Worldtube
      ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
      var aBot = p3(0, 0, 0), aTop = p3(0, 0, 1.35);
      ctx.beginPath(); ctx.moveTo(aBot.x, aBot.y); ctx.lineTo(aTop.x, aTop.y); ctx.stroke();
      ctx.setLineDash([]);

      var aSnaps = [0.35, 0.85, 1.3];
      for (var a = 0; a < aSnaps.length; a++) {
        drawStickFigure3D(ctx, p3, 0, 0, aSnaps[a], c.timeColor, 0.25, 0.85);
      }

      // Cosmic Light Cone Boundary Wall (45°: v = c)
      var zCone = 1.35;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5, 3]);
      var pConeTop = p3(zCone, 0, zCone);
      ctx.beginPath();
      ctx.moveTo(pO.x, pO.y);
      ctx.lineTo(pConeTop.x, pConeTop.y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabelPill(ctx, 'Light Cone Wall (45°: v = c)', pConeTop.x + 20, pConeTop.y + 8, {
        textColor: '#d97706',
        font: '9px "JetBrains Mono", monospace'
      });

      // Bob's Slanted Worldtube (Outer rails dashed, Center Spine solid)
      var zMax = 1.35;

      ctx.strokeStyle = angleDeg === 90 ? 'rgba(250, 204, 21, 0.4)' : (c.isLight ? 'rgba(234, 88, 12, 0.35)' : 'rgba(251, 146, 60, 0.35)');
      ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);

      var bobRailX = [-0.24, 0.24];
      for (var b = 0; b < bobRailX.length; b++) {
        var ox = bobRailX[b];
        var bBot = p3(ox, 0, 0);
        var bTop = p3(ox + vFraction * zMax, 0, zMax);
        ctx.beginPath(); ctx.moveTo(bBot.x, bBot.y); ctx.lineTo(bTop.x, bTop.y); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Central Worldline Spine (Solid) - Unified path of Bob through spacetime!
      ctx.strokeStyle = bobColor;
      ctx.lineWidth = 2.4;
      var bCenterBot = p3(0, 0, 0);
      var bCenterTop = p3(vFraction * zMax, 0, zMax);
      ctx.beginPath();
      ctx.moveTo(bCenterBot.x, bCenterBot.y);
      ctx.lineTo(bCenterTop.x, bCenterTop.y);
      ctx.stroke();
      drawGlowingDot(ctx, bCenterTop.x, bCenterTop.y, bobColor, 5);

      for (var bs = 0; bs < aSnaps.length; bs++) {
        var ts = aSnaps[bs];
        var bx = vFraction * ts;
        var snapAliceT = (ts / 1.35) * 6.0;
        var snapBobT = angleDeg === 90 ? 0.0 : snapAliceT * Math.cos(rad);
        drawStickFigure3D(ctx, p3, bx, 0, ts, bobColor, 0.35, 0.85);

        var pSnap = p3(bx + 0.15, 0, ts);
        drawLabelPill(ctx, 'τ=' + snapBobT.toFixed(2) + 's', pSnap.x, pSnap.y, {
          textColor: bobColor,
          font: '9px "JetBrains Mono", monospace'
        });
      }

      // Current positions
      var curZ = (timeVal / 6.0) * 1.35;
      var curBobX = vFraction * curZ;

      // 6. Bob's 3-Axis Component Projections
      var pActiveBob = p3(curBobX, 0, curZ);
      var pActiveAlice = p3(0, 0, curZ);
      var pGroundBob = p3(curBobX, 0, 0);
      var pTimeBob = p3(0, 0, curZ);

      ctx.strokeStyle = c.isLight ? 'rgba(234, 88, 12, 0.45)' : 'rgba(251, 146, 60, 0.45)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pActiveBob.x, pActiveBob.y);
      ctx.lineTo(pGroundBob.x, pGroundBob.y);
      ctx.stroke();

      ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.moveTo(pActiveBob.x, pActiveBob.y);
      ctx.lineTo(pTimeBob.x, pTimeBob.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = bobColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(pO.x, pO.y);
      ctx.lineTo(pGroundBob.x, pGroundBob.y);
      ctx.stroke();

      drawGlowingDot(ctx, pGroundBob.x, pGroundBob.y, bobColor, 4.5);
      drawGlowingDot(ctx, pTimeBob.x, pTimeBob.y, c.timeColor, 4.5);

      drawLabelPill(ctx, 'x₁ = ' + (vFraction * timeVal).toFixed(2) + ' ls', pGroundBob.x + 8, pGroundBob.y + 16, {
        textColor: bobColor,
        font: 'bold 9px "JetBrains Mono", monospace'
      });
      drawLabelPill(ctx, 'ct = ' + timeVal.toFixed(2) + ' s', pTimeBob.x - 30, pTimeBob.y - 12, {
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

      var pActiveAlice = p3(0, 0, curZ);
      var pActiveBob = p3(curBobX, 0, curZ);

      drawLabelPill(ctx, 'Alice: t = ' + timeVal.toFixed(2) + 's', pActiveAlice.x - 30, pActiveAlice.y + 15, {
        textColor: c.timeColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      var activeBobTau = angleDeg === 90 ? 0.00 : timeVal * Math.cos(rad);
      drawLabelPill(ctx, angleDeg === 90 ? 'Bob: τ = 0.00s (Frozen)' : ('Bob: τ = ' + activeBobTau.toFixed(2) + 's'), pActiveBob.x + 35, pActiveBob.y + 15, {
        textColor: bobColor,
        font: 'bold 10px "JetBrains Mono", monospace'
      });

      if (angleDeg === 90) {
        drawGlowingDot(ctx, pActiveBob.x, pActiveBob.y, '#facc15', 9);
        var pNote = p3(0.7, -0.9, 1.35);
        drawLabelPill(ctx, '⚡ Photon Path (v=c): Alice measures Δt > 0, but Bob experiences τ = 0.00s everywhere (Timeless)', pNote.x, pNote.y, {
          textColor: '#d97706',
          font: 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif'
        });
      }

      drawLabelPill(ctx, 'Alice (At Rest: θ=0°)', aTop.x, aTop.y - 12, { textColor: c.timeColor });
      var bTopCenter = p3(vFraction * zMax, 0, zMax);
      var bobStatusText = angleDeg === 90 ? 'Bob (θ=90°, v=c: Time Frozen)' : ('Bob (θ=' + angleDeg + '°, v=' + vFraction.toFixed(2) + 'c)');
      drawLabelPill(ctx, bobStatusText, bTopCenter.x + 35, bTopCenter.y - 12, { textColor: bobColor });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        angleDeg = parseInt(e.target.value, 10);
        for (var i = 0; i < chipButtons.length; i++) {
          chipButtons[i].classList.remove('active');
          if (parseInt(chipButtons[i].getAttribute('data-val'), 10) === angleDeg) {
            chipButtons[i].classList.add('active');
          }
        }
        update();
      });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        timeVal = (parseFloat(e.target.value) / 600) * 6.0;
        update();
      });
    }

    if (sliderOrbit) {
      sliderOrbit.addEventListener('input', function (e) {
        azimuth = (parseFloat(e.target.value) * Math.PI) / 180;
        draw();
      });
    }

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartAzimuth = azimuth;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      azimuth = dragStartAzimuth + dx * 0.008;
      if (sliderOrbit) sliderOrbit.value = ((azimuth * 180) / Math.PI).toFixed(0);
      draw();
    });

    window.addEventListener('mouseup', function () { isDragging = false; });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartAzimuth = azimuth;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - dragStartX;
      azimuth = dragStartAzimuth + dx * 0.008;
      if (sliderOrbit) sliderOrbit.value = ((azimuth * 180) / Math.PI).toFixed(0);
      draw();
    }, { passive: true });

    window.addEventListener('touchend', function () { isDragging = false; });

    for (var i = 0; i < chipButtons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipButtons.length; j++) chipButtons[j].classList.remove('active');
          btn.classList.add('active');
          angleDeg = parseInt(btn.getAttribute('data-val'), 10);
          if (sliderSpeed) sliderSpeed.value = angleDeg;
          update();
        });
      })(chipButtons[i]);
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var lastTime = performance.now();
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - lastTime) / 1000;
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

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // WIDGET 3: Slicing the Loaf: The Angle of "Now"
  function initWidgetSimultaneitySlice(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var readoutSpeed = container.querySelector('.readout-speed-sim');
    var readoutTilt = container.querySelector('.readout-tilt-badge');
    var readoutDesync = container.querySelector('.readout-desync-val');
    var readoutDesyncText = container.querySelector('.readout-desync-text');
    var chipSpeeds = container.querySelectorAll('.chip-speed-sim');
    var chipModes = container.querySelectorAll('.chip-slice-mode');

    var vFraction = 0.60;
    var sliceMode = 'both';
    var azimuth = -35 * Math.PI / 180;
    var elevation = 25 * Math.PI / 180;

    function update() {
      var tiltDeg = (Math.atan(vFraction) * 180) / Math.PI;
      var deltaT = vFraction * 2.0;

      if (readoutSpeed) readoutSpeed.innerText = 'v = ' + vFraction.toFixed(3) + ' c';
      if (readoutTilt) readoutTilt.innerText = 'Tilted by θ = ' + tiltDeg.toFixed(1) + '°';
      if (readoutDesync) readoutDesync.innerHTML = 'Δt = ' + deltaT.toFixed(2) + ' <span>s</span>';
      if (readoutDesyncText) {
        if (vFraction === 0) {
          readoutDesyncText.innerText = 'Both observers slice horizontally. No time desynchronization.';
        } else {
          readoutDesyncText.innerText = 'Front beacon is in Alice\'s future (+' + (deltaT/2).toFixed(2) + 's); rear beacon is in Alice\'s past (-' + (deltaT/2).toFixed(2) + 's)!';
        }
      }
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
      var cy = height * 0.68;
      var scale = Math.min(width * 0.28, height * 0.42);
      function p3(x, y, z) { return project(x, y, z, cx, cy, scale); }

      ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
      for (var gx = -1.4; gx <= 1.41; gx += 0.4) {
        var pS = p3(gx, -1.2, 0), pE = p3(gx, 1.2, 0);
        ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
      }
      for (var gy = -1.2; gy <= 1.21; gy += 0.4) {
        var pS2 = p3(-1.4, gy, 0), pE2 = p3(1.4, gy, 0);
        ctx.beginPath(); ctx.moveTo(pS2.x, pS2.y); ctx.lineTo(pE2.x, pE2.y); ctx.stroke();
      }

      var pO = p3(0, 0, 0), pX1 = p3(1.6, 0, 0), pZ = p3(0, 0, 1.4);
      ctx.strokeStyle = c.axisLine; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pX1.x, pX1.y); ctx.stroke();
      ctx.strokeStyle = c.timeColor; ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(pO.x, pO.y); ctx.lineTo(pZ.x, pZ.y); ctx.stroke();

      drawLabelPill(ctx, 'East (x₁)', pX1.x + 25, pX1.y, { textColor: c.axisLabel });
      drawLabelPill(ctx, 'Time (ct)', pZ.x, pZ.y - 12, { textColor: c.timeColor });

      var bDist = 1.0;
      var zBase = 0.65;
      var bRearGround = p3(-bDist, 0, 0);
      var bFrontGround = p3(bDist, 0, 0);

      ctx.strokeStyle = c.isLight ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
      var bRearTop = p3(-bDist, 0, 1.3), bFrontTop = p3(bDist, 0, 1.3);
      ctx.beginPath(); ctx.moveTo(bRearGround.x, bRearGround.y); ctx.lineTo(bRearTop.x, bRearTop.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bFrontGround.x, bFrontGround.y); ctx.lineTo(bFrontTop.x, bFrontTop.y); ctx.stroke();
      ctx.setLineDash([]);

      if (sliceMode === 'both' || sliceMode === 'alice') {
        var sW = 1.3, sH = 0.9;
        var pa1 = p3(-sW, -sH, zBase);
        var pa2 = p3(sW, -sH, zBase);
        var pa3 = p3(sW, sH, zBase);
        var pa4 = p3(-sW, sH, zBase);

        ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)';
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(pa1.x, pa1.y); ctx.lineTo(pa2.x, pa2.y); ctx.lineTo(pa3.x, pa3.y); ctx.lineTo(pa4.x, pa4.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        var pEvRearA = p3(-bDist, 0, zBase);
        var pEvFrontA = p3(bDist, 0, zBase);
        drawGlowingDot(ctx, pEvRearA.x, pEvRearA.y, c.timeColor, 5);
        drawGlowingDot(ctx, pEvFrontA.x, pEvFrontA.y, c.timeColor, 5);
        drawLabelPill(ctx, 'Alice: "Now" (t=2.5s)', pa2.x - 20, pa2.y - 10, { textColor: c.timeColor });
      }

      if (sliceMode === 'both' || sliceMode === 'bob') {
        var sW2 = 1.3, sH2 = 0.9;
        var pb1 = p3(-sW2, -sH2, zBase - vFraction * sW2);
        var pb2 = p3(sW2, -sH2, zBase + vFraction * sW2);
        var pb3 = p3(sW2, sH2, zBase + vFraction * sW2);
        var pb4 = p3(-sW2, sH2, zBase - vFraction * sW2);

        ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.14)' : 'rgba(251, 146, 60, 0.18)';
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(pb1.x, pb1.y); ctx.lineTo(pb2.x, pb2.y); ctx.lineTo(pb3.x, pb3.y); ctx.lineTo(pb4.x, pb4.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        var zRearBob = zBase - vFraction * bDist;
        var zFrontBob = zBase + vFraction * bDist;
        var pEvRearB = p3(-bDist, 0, zRearBob);
        var pEvFrontB = p3(bDist, 0, zFrontBob);

        drawGlowingDot(ctx, pEvRearB.x, pEvRearB.y, c.spaceColor, 5.5);
        drawGlowingDot(ctx, pEvFrontB.x, pEvFrontB.y, c.spaceColor, 5.5);

        if (sliceMode === 'both' && vFraction > 0.05) {
          ctx.strokeStyle = c.invariantColor;
          ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
          var pEA_R = p3(-bDist, 0, zBase);
          var pEA_F = p3(bDist, 0, zBase);
          ctx.beginPath(); ctx.moveTo(pEA_R.x, pEA_R.y); ctx.lineTo(pEvRearB.x, pEvRearB.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pEA_F.x, pEA_F.y); ctx.lineTo(pEvFrontB.x, pEvFrontB.y); ctx.stroke();
          ctx.setLineDash([]);

          drawLabelPill(ctx, '+Δt/2 (Future)', pEvFrontB.x + 40, pEvFrontB.y, { textColor: c.spaceColor, font: '10px "JetBrains Mono"' });
          drawLabelPill(ctx, '-Δt/2 (Past)', pEvRearB.x - 40, pEvRearB.y, { textColor: c.spaceColor, font: '10px "JetBrains Mono"' });
        }

        drawLabelPill(ctx, 'Bob: "Now" (Tilted by ' + ((Math.atan(vFraction)*180)/Math.PI).toFixed(0) + '°)', pb2.x - 20, pb2.y - 10, { textColor: c.spaceColor });
      }

      drawStickFigure3D(ctx, p3, 0, 0, zBase, c.timeColor, 0.9, 0.9);
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        vFraction = parseFloat(e.target.value) / 1000;
        for (var i = 0; i < chipSpeeds.length; i++) chipSpeeds[i].classList.remove('active');
        update();
      });
    }

    for (var i = 0; i < chipSpeeds.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipSpeeds.length; j++) chipSpeeds[j].classList.remove('active');
          btn.classList.add('active');
          vFraction = parseFloat(btn.getAttribute('data-val')) / 1000;
          if (sliderSpeed) sliderSpeed.value = btn.getAttribute('data-val');
          update();
        });
      })(chipSpeeds[i]);
    }

    for (var m = 0; m < chipModes.length; m++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipModes.length; j++) chipModes[j].classList.remove('active');
          btn.classList.add('active');
          sliceMode = btn.getAttribute('data-mode');
          draw();
        });
      })(chipModes[m]);
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // WIDGET 4: The Oblique Slice & Length Contraction
  function initWidgetLengthContraction(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var btnPlay = container.querySelector('.btn-play');
    var readoutSpeed = container.querySelector('.readout-speed-contract');
    var readoutGamma = container.querySelector('.readout-gamma-badge');
    var readoutLength = container.querySelector('.readout-contracted-length');
    var readoutPercent = container.querySelector('.readout-contracted-percent');
    var chipButtons = container.querySelectorAll('.chip-preset-contract');

    var isPlaying = false;
    var vFraction = 0.866;
    var azimuth = -35 * Math.PI / 180;
    var elevation = 25 * Math.PI / 180;

    function update() {
      var gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
      var contractedL = 10.0 / gamma;
      var pct = (100 / gamma).toFixed(1);

      if (readoutSpeed) readoutSpeed.innerText = 'v = ' + vFraction.toFixed(3) + ' c';
      if (readoutGamma) readoutGamma.innerText = 'γ = ' + gamma.toFixed(2);
      if (readoutLength) readoutLength.innerHTML = contractedL.toFixed(1) + ' <span>m</span>';
      if (readoutPercent) readoutPercent.innerText = 'Narrowed to ' + pct + '% along direction of motion.';

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

      var gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
      var widthFactor = 1 / gamma;

      var isNarrow = width < 560;
      var splitX = isNarrow ? width : width * 0.58;

      // 1. 3D Loaf Pane
      var cx3D = splitX * 0.48;
      var cy3D = height * 0.72;
      var scale3D = Math.min(splitX * 0.28, height * 0.42);
      function p3(x, y, z) { return project(x, y, z, cx3D, cy3D, scale3D); }

      ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
      for (var gx = -1.2; gx <= 1.21; gx += 0.4) {
        var pS = p3(gx, -1.0, 0), pE = p3(gx, 1.0, 0);
        ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pE.x, pE.y); ctx.stroke();
      }

      var L0_3D = 0.45;
      var zBase = 0.65;
      var zMax = 1.3;

      var r1 = p3(-L0_3D, 0, 0);
      var r2 = p3(L0_3D, 0, 0);
      var r3 = p3(L0_3D + vFraction * zMax, 0, zMax);
      var r4 = p3(-L0_3D + vFraction * zMax, 0, zMax);

      ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.12)' : 'rgba(251, 146, 60, 0.15)';
      ctx.strokeStyle = c.spaceColor; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.lineTo(r3.x, r3.y); ctx.lineTo(r4.x, r4.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      var sSize = 1.1;
      var ps1 = p3(-sSize, -sSize * 0.7, zBase);
      var ps2 = p3(sSize, -sSize * 0.7, zBase);
      var ps3 = p3(sSize, sSize * 0.7, zBase);
      var ps4 = p3(-sSize, sSize * 0.7, zBase);

      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.14)';
      ctx.strokeStyle = c.timeColor; ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ps1.x, ps1.y); ctx.lineTo(ps2.x, ps2.y); ctx.lineTo(ps3.x, ps3.y); ctx.lineTo(ps4.x, ps4.y);
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);

      var bobXAtZ = vFraction * zBase;
      var cutL = L0_3D * widthFactor;
      var pCutL = p3(bobXAtZ - cutL, 0, zBase);
      var pCutR = p3(bobXAtZ + cutL, 0, zBase);

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pCutL.x, pCutL.y); ctx.lineTo(pCutR.x, pCutR.y); ctx.stroke();

      drawGlowingDot(ctx, pCutL.x, pCutL.y, '#dc2626', 4.5);
      drawGlowingDot(ctx, pCutR.x, pCutR.y, '#dc2626', 4.5);

      drawLabelPill(ctx, 'Cut: L = ' + (10 * widthFactor).toFixed(1) + 'm', (pCutL.x + pCutR.x)/2, pCutL.y - 14, {
        textColor: '#dc2626'
      });
      drawLabelPill(ctx, '3D Spacetime Loaf Slice', splitX * 0.25, 25, { textColor: c.axisLabel });

      // 2. Retinal Measurement Pane
      if (!isNarrow) {
        ctx.strokeStyle = c.isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(splitX, 15); ctx.lineTo(splitX, height - 15); ctx.stroke();

        var rx = splitX + (width - splitX) * 0.5;
        var ry = height * 0.55;

        drawLabelPill(ctx, 'Alice\'s Eye View (Measured in 2D)', rx, 25, { textColor: c.spaceColor });

        var rulerW = (width - splitX) * 0.75;
        var rulerY = ry + 60;
        var rulerLeft = rx - rulerW / 2;

        ctx.fillStyle = c.isLight ? '#f1f5f9' : '#1e293b';
        ctx.strokeStyle = c.axisLine; ctx.lineWidth = 1.5;
        ctx.fillRect(rulerLeft, rulerY, rulerW, 22);
        ctx.strokeRect(rulerLeft, rulerY, rulerW, 22);

        for (var m = 0; m <= 10; m++) {
          var tx = rulerLeft + (m / 10) * rulerW;
          ctx.beginPath();
          ctx.moveTo(tx, rulerY);
          ctx.lineTo(tx, rulerY + (m % 5 === 0 ? 12 : 6));
          ctx.stroke();

          if (m % 2 === 0) {
            ctx.fillStyle = c.subtleText || '#64748b';
            ctx.font = '9px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.fillText(m + 'm', tx, rulerY + 20);
          }
        }

        var figW = (rulerW * 0.5) * widthFactor;
        var figH = 65;

        ctx.save();
        ctx.strokeStyle = c.spaceColor;
        ctx.fillStyle = c.spaceColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(rx, ry - figH + 10, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rx, ry - figH + 20);
        ctx.lineTo(rx, ry);
        ctx.stroke();

        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(rx - figW / 2, ry - figH + 35);
        ctx.lineTo(rx + figW / 2, ry - figH + 35);
        ctx.stroke();

        drawGlowingDot(ctx, rx - figW / 2, ry - figH + 35, '#dc2626', 4);
        drawGlowingDot(ctx, rx + figW / 2, ry - figH + 35, '#dc2626', 4);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = c.spaceColor;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - figW * 0.35, ry + 45);
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + figW * 0.35, ry + 45);
        ctx.stroke();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(rx - figW / 2, ry - figH + 35);
        ctx.lineTo(rx - figW / 2, rulerY);
        ctx.moveTo(rx + figW / 2, ry - figH + 35);
        ctx.lineTo(rx + figW / 2, rulerY);
        ctx.stroke();
        ctx.setLineDash([]);

        drawLabelPill(ctx, 'Width = ' + (10 * widthFactor).toFixed(1) + ' m', rx, ry - figH - 12, {
          textColor: c.spaceColor
        });
        drawLabelPill(ctx, 'Height = 1.8 m (Unchanged)', rx, ry + 75, {
          textColor: c.timeColor, font: '10px "JetBrains Mono"'
        });
        ctx.restore();
      }
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        vFraction = parseFloat(e.target.value) / 1000;
        for (var i = 0; i < chipButtons.length; i++) chipButtons[i].classList.remove('active');
        update();
      });
    }

    for (var i = 0; i < chipButtons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipButtons.length; j++) chipButtons[j].classList.remove('active');
          btn.classList.add('active');
          vFraction = parseFloat(btn.getAttribute('data-val')) / 1000;
          if (sliderSpeed) sliderSpeed.value = btn.getAttribute('data-val');
          update();
        });
      })(chipButtons[i]);
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var dir = 1;
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

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // WIDGET 5: Mutual Relativity & Dual Frame Slicer
  function initWidgetDualFrame(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var chipFrames = container.querySelectorAll('.chip-frame-btn');
    var readoutFrameBadge = container.querySelector('.readout-frame-badge');
    var readoutFrameTitle = container.querySelector('.readout-frame-title');
    var readoutFrameSub = container.querySelector('.readout-frame-sub');
    var readoutMeasured = container.querySelector('.readout-dual-measured');
    var readoutDualNote = container.querySelector('.readout-dual-note');
    var readoutDualSpeed = container.querySelector('.readout-dual-speed');

    var activeFrame = 'alice';
    var vFraction = 0.866;

    function update() {
      var gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
      var contracted = (10.0 / gamma).toFixed(1);

      if (readoutDualSpeed) readoutDualSpeed.innerText = 'v = ' + vFraction.toFixed(3) + ' c (γ = ' + gamma.toFixed(2) + ')';
      if (readoutMeasured) readoutMeasured.innerHTML = contracted + ' <span>m</span>';

      if (activeFrame === 'alice') {
        if (readoutFrameBadge) readoutFrameBadge.innerText = 'Alice\'s Frame';
        if (readoutFrameTitle) readoutFrameTitle.innerText = 'Alice at Rest';
        if (readoutFrameSub) readoutFrameSub.innerText = 'Alice\'s worldtube is vertical; her slice of Now is horizontal.';
        if (readoutDualNote) readoutDualNote.innerText = 'Bob\'s 10.0 m rod appears shortened to ' + contracted + ' m.';
      } else {
        if (readoutFrameBadge) readoutFrameBadge.innerText = 'Bob\'s Frame';
        if (readoutFrameTitle) readoutFrameTitle.innerText = 'Bob at Rest';
        if (readoutFrameSub) readoutFrameSub.innerText = 'Bob\'s worldtube is vertical; his slice of Now is horizontal.';
        if (readoutDualNote) readoutDualNote.innerText = 'Alice\'s 10.0 m rod appears shortened to ' + contracted + ' m.';
      }

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var gamma = vFraction >= 0.999 ? 22.36 : 1 / Math.sqrt(Math.max(0.001, 1 - vFraction * vFraction));
      var widthFactor = 1 / gamma;

      var ox = width * 0.50;
      var oy = height * 0.80;
      var scale = Math.min(width * 0.38, height * 0.65);

      ctx.strokeStyle = c.gridLine; ctx.lineWidth = 1;
      for (var x = -scale; x <= scale; x += scale * 0.25) {
        ctx.beginPath(); ctx.moveTo(ox + x, 25); ctx.lineTo(ox + x, oy); ctx.stroke();
      }
      for (var y = 0; y <= scale; y += scale * 0.25) {
        ctx.beginPath(); ctx.moveTo(ox - scale, oy - y); ctx.lineTo(ox + scale, oy - y); ctx.stroke();
      }

      ctx.strokeStyle = c.axisLine; ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(ox - scale - 15, oy); ctx.lineTo(ox + scale + 15, oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, oy + 10); ctx.lineTo(ox, 25); ctx.stroke();

      drawLabelPill(ctx, 'Space (x)', ox + scale + 2, oy + 18, { textColor: c.axisLabel });
      drawLabelPill(ctx, 'Time (ct)', ox - 35, 20, { textColor: c.timeColor });

      var primaryColor = activeFrame === 'alice' ? c.timeColor : c.spaceColor;
      var primaryName = activeFrame === 'alice' ? 'Alice' : 'Bob';

      var rW = 28;
      ctx.fillStyle = activeFrame === 'alice' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(234, 88, 12, 0.14)';
      ctx.strokeStyle = primaryColor; ctx.lineWidth = 1.8;
      ctx.fillRect(ox - rW/2, oy - scale * 0.9, rW, scale * 0.9);
      ctx.strokeRect(ox - rW/2, oy - scale * 0.9, rW, scale * 0.9);

      drawLabelPill(ctx, primaryName + ' at Rest (L₀ = 10m)', ox, oy - scale * 0.95, { textColor: primaryColor });

      var secondaryColor = activeFrame === 'alice' ? c.spaceColor : c.timeColor;
      var secondaryName = activeFrame === 'alice' ? 'Bob' : 'Alice';
      var direction = activeFrame === 'alice' ? 1 : -1;

      var tiltX = direction * vFraction * (scale * 0.9);
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

      drawLabelPill(ctx, secondaryName + ' in Motion (Speed ' + vFraction.toFixed(2) + 'c)', ox + tiltX, oy - scale * 0.95, { textColor: secondaryColor });

      var sliceY = oy - scale * 0.5;
      ctx.strokeStyle = primaryColor; ctx.lineWidth = 2.0; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(ox - scale, sliceY); ctx.lineTo(ox + scale, sliceY); ctx.stroke();
      ctx.setLineDash([]);

      var cutCenterX = ox + direction * vFraction * (scale * 0.5);
      var cutW = rW * widthFactor;

      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cutCenterX - cutW/2, sliceY);
      ctx.lineTo(cutCenterX + cutW/2, sliceY);
      ctx.stroke();

      drawGlowingDot(ctx, cutCenterX - cutW/2, sliceY, '#dc2626', 4);
      drawGlowingDot(ctx, cutCenterX + cutW/2, sliceY, '#dc2626', 4);

      drawLabelPill(ctx, 'Contracted: ' + (10 * widthFactor).toFixed(1) + 'm', cutCenterX, sliceY - 14, { textColor: '#dc2626' });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        vFraction = parseFloat(e.target.value) / 1000;
        update();
      });
    }

    for (var i = 0; i < chipFrames.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipFrames.length; j++) chipFrames[j].classList.remove('active');
          btn.classList.add('active');
          activeFrame = btn.getAttribute('data-frame');
          update();
        });
      })(chipFrames[i]);
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // WIDGET 6: The Muon's Cockpit
  function initWidgetMuonContraction(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderAltitude = container.querySelector('.slider-altitude');
    var btnPlay = container.querySelector('.btn-play');
    var chipViews = container.querySelectorAll('.chip-muon-view');
    var readoutDistBadge = container.querySelector('.readout-muon-dist-badge');
    var readoutDist = container.querySelector('.readout-muon-dist');
    var readoutDistSub = container.querySelector('.readout-muon-dist-sub');
    var readoutClock = container.querySelector('.readout-muon-clock-val');
    var readoutClockSub = container.querySelector('.readout-muon-clock-sub');
    var readoutDescent = container.querySelector('.readout-descent-val');

    var activeView = 'earth';
    var descentProgress = 0.50;
    var isPlaying = false;

    function update() {
      var fullDistKm = activeView === 'earth' ? 10.0 : 0.447;
      var elapsedMuonUs = descentProgress * 1.50;

      if (activeView === 'earth') {
        if (readoutDistBadge) readoutDistBadge.innerText = 'Earth Frame';
        if (readoutDist) readoutDist.innerHTML = '10.0 <span>km</span>';
        if (readoutDistSub) readoutDistSub.innerText = 'Standard atmospheric depth measured from ground.';
        if (readoutClock) readoutClock.innerHTML = elapsedMuonUs.toFixed(2) + ' <span>µs</span>';
        if (readoutClockSub) readoutClockSub.innerText = 'Earth clock ticks 33 µs; dilated muon clock ticks only 1.50 µs!';
        if (readoutDescent) readoutDescent.innerText = 'Altitude: ' + (10.0 - descentProgress * 10.0).toFixed(1) + ' km';
      } else {
        if (readoutDistBadge) readoutDistBadge.innerText = 'Muon Cockpit';
        if (readoutDist) readoutDist.innerHTML = '447 <span>m</span>';
        if (readoutDistSub) readoutDistSub.innerText = 'Atmosphere contracted by 22.4x along direction of motion!';
        if (readoutClock) readoutClock.innerHTML = elapsedMuonUs.toFixed(2) + ' <span>µs</span>';
        if (readoutClockSub) readoutClockSub.innerText = 'Muon clock ticks at standard 1.0x speed. Easily crosses 447m!';
        if (readoutDescent) readoutDescent.innerText = 'Remaining Depth: ' + ((1 - descentProgress) * 447).toFixed(0) + ' m';
      }

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var padLeft = 40;
      var padRight = width - 40;
      var groundY = height * 0.82;
      var topY = height * 0.18;

      var atmoTopY = activeView === 'earth' ? topY : height * 0.60;
      var atmoHeight = groundY - atmoTopY;

      var atmoGrad = ctx.createLinearGradient(0, atmoTopY, 0, groundY);
      atmoGrad.addColorStop(0, c.isLight ? 'rgba(2, 132, 199, 0.05)' : 'rgba(56, 189, 248, 0.06)');
      atmoGrad.addColorStop(1, c.isLight ? 'rgba(2, 132, 199, 0.22)' : 'rgba(56, 189, 248, 0.25)');

      ctx.fillStyle = atmoGrad;
      ctx.fillRect(padLeft + 80, atmoTopY, (padRight - padLeft) - 160, atmoHeight);
      ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padLeft + 80, atmoTopY, (padRight - padLeft) - 160, atmoHeight);

      ctx.strokeStyle = c.axisLine; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(padLeft, groundY); ctx.lineTo(padRight, groundY); ctx.stroke();
      drawLabelPill(ctx, 'Earth Surface (Detectors)', width * 0.5, groundY + 16, { textColor: c.axisLabel });

      ctx.strokeStyle = c.timeColor; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(padLeft, atmoTopY); ctx.lineTo(padRight, atmoTopY); ctx.stroke();
      ctx.setLineDash([]);

      var topLabel = activeView === 'earth' ? 'Atmosphere Boundary (10.0 km)' : 'Contracted Atmosphere (447 m)';
      drawLabelPill(ctx, topLabel, width * 0.5, atmoTopY - 14, { textColor: c.timeColor });

      var muonY = atmoTopY + descentProgress * atmoHeight;
      var muonX = width * 0.5;

      ctx.strokeStyle = c.spaceColor; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(muonX, atmoTopY); ctx.lineTo(muonX, muonY); ctx.stroke();

      drawGlowingDot(ctx, muonX, muonY, c.spaceColor, 7);

      var muonLabel = activeView === 'earth' ? 'Muon (Dilated: ticks 22x slower)' : 'Muon (At rest: clock ticks 1.0x)';
      drawLabelPill(ctx, muonLabel, muonX + 75, muonY, { textColor: c.spaceColor });
    }

    if (sliderAltitude) {
      sliderAltitude.addEventListener('input', function (e) {
        descentProgress = parseFloat(e.target.value) / 1000;
        update();
      });
    }

    for (var i = 0; i < chipViews.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipViews.length; j++) chipViews[j].classList.remove('active');
          btn.classList.add('active');
          activeView = btn.getAttribute('data-view');
          update();
        });
      })(chipViews[i]);
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var lastTime = performance.now();
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - lastTime) / 1000;
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

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // ==========================================================================
  // Post 2: The Cosmic Light Cone Widgets
  // ==========================================================================

  // SIMULATION 1: Side-by-Side Bridge (Speed Space vs Coordinate Spacetime)
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

  // SIMULATION 3: Cosmic Horizon & Human Lifespan Simulator (Dual-View Cosmic Bubble)
  function initWidgetCosmicHorizon(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvasRadar = container.querySelector('.canvas-radar');
    var canvasCone = container.querySelector('.canvas-spacetime-cone');
    if (!canvasRadar || !canvasCone) return;

    var sliderAge = container.querySelector('.slider-lifespan-age');
    var elAgeNum = container.querySelector('.val-age-num');
    var elAgeDisplay = container.querySelector('.val-age-display');
    var elHorizonRadius = container.querySelector('.val-horizon-radius');
    var elTargetName = container.querySelector('.val-target-name');
    var elCausalStatus = container.querySelector('.val-causal-status');
    var presetBtns = container.querySelectorAll('.preset-star');
    var btnAutoAge = container.querySelector('.btn-auto-age');

    var currentAge = parseFloat(sliderAge ? sliderAge.value : 25) || 25;
    var selectedStar = {
      name: 'Vega',
      dist: 25.0,
      angle: -0.45 // angle in physical radar space (radians)
    };

    var stars = [
      { name: 'The Sun', label: 'Sun (8.3m)', dist: 0.000016, angle: 0 },
      { name: 'Proxima Centauri', label: 'Proxima (4.2 ly)', dist: 4.2, angle: 1.85 },
      { name: 'Sirius', label: 'Sirius (8.6 ly)', dist: 8.6, angle: 3.6 },
      { name: 'Vega', label: 'Vega (25 ly)', dist: 25.0, angle: -0.45 },
      { name: 'Betelgeuse', label: 'Betelgeuse (640 ly)', dist: 640.0, angle: -2.35 }
    ];

    var isPlaying = false;
    var animFrameId = null;
    var maxLifespan = 80;
    var maxRadarDist = 100; // coordinate radius for radar map view

    function updateTelemetry() {
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      if (sliderAge) sliderAge.value = currentAge.toFixed(1);
      if (elAgeNum) elAgeNum.textContent = currentAge.toFixed(1) + ' yrs';
      if (elAgeDisplay) elAgeDisplay.textContent = currentAge.toFixed(1) + ' yrs';
      if (elHorizonRadius) elHorizonRadius.textContent = currentAge.toFixed(1) + ' ly';
      if (elTargetName) {
        if (selectedStar.dist < 0.001) {
          elTargetName.textContent = selectedStar.name + ' (8.3m)';
        } else {
          elTargetName.textContent = selectedStar.name + ' (' + selectedStar.dist.toFixed(1) + ' ly)';
        }
      }

      if (elCausalStatus) {
        if (currentAge >= selectedStar.dist) {
          if (selectedStar.dist < 0.001) {
            elCausalStatus.textContent = 'WITNESSED (Arrived in 8.3 mins)';
          } else {
            elCausalStatus.textContent = 'IN PAST CONE (Witnessed at age ' + selectedStar.dist.toFixed(1) + ')';
          }
          elCausalStatus.style.color = emerald;
        } else if (selectedStar.dist <= maxLifespan) {
          var waitYrs = (selectedStar.dist - currentAge).toFixed(1);
          elCausalStatus.textContent = 'EN ROUTE (Arrives at age ' + selectedStar.dist.toFixed(1) + ' · in ' + waitYrs + 'y)';
          elCausalStatus.style.color = colors.timeColor;
        } else {
          elCausalStatus.textContent = 'PERMANENTLY ELSEWHERE (Takes ' + selectedStar.dist.toFixed(0) + 'y · > 80y Life)';
          elCausalStatus.style.color = danger;
        }
      }
    }

    // ── 1. Physical Stellar Radar Canvas ───────────────────────────────────
    function drawRadar() {
      var ret = setupRetinaCanvas(canvasRadar);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      ctx.clearRect(0, 0, w, h);

      var cx = w / 2;
      var cy = h / 2;
      var maxPlotR = Math.min(cx, cy) - 22;
      var scale = maxPlotR / maxRadarDist; // pixels per light-year

      // Background concentric radar rings (20, 40, 60, 80, 100 ly)
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

      // 80-Year Lifespan boundary ring (dashed red)
      var r80Px = 80 * scale;
      ctx.strokeStyle = danger;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, r80Px, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = danger;
      ctx.fillText('80-Year Life Horizon', cx - 50, cy - r80Px - 4);

      // Expanding Causal Bubble (r = currentAge * c)
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
        if (currentAge >= 12) {
          ctx.font = '600 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.timeColor;
          ctx.fillText('r = ' + currentAge.toFixed(1) + ' ly', cx + bubbleR * 0.5 - 18, cy + 12);
        }
      }

      // Draw Earth at the center
      drawGlowingDot(ctx, cx, cy, emerald, 5);
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = emerald;
      ctx.fillText('Earth (You)', cx + 8, cy + 3);

      // Draw Stars
      for (var s = 0; s < stars.length; s++) {
        var star = stars[s];
        if (star.dist < 0.001) continue; // Earth / Sun handled or virtually on center

        var isSelected = star.name === selectedStar.name;
        var hasReached = currentAge >= star.dist;

        if (star.dist <= maxRadarDist) {
          // Within radar bounds
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
            ctx.fillStyle = colors.isLight ? '#94a3b8' : '#64748b';
            ctx.beginPath();
            ctx.arc(sx, sy, isSelected ? 4.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            if (isSelected) {
              ctx.strokeStyle = colors.timeColor;
              ctx.lineWidth = 1.25;
              ctx.beginPath();
              ctx.arc(sx, sy, 8, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.font = (isSelected ? '700' : '600') + ' 8.5px "JetBrains Mono", monospace';
            ctx.fillStyle = isSelected ? colors.textPrimary : colors.subtleText;
            ctx.fillText(star.label, sx + 8, sy + 3);
          }
        } else {
          // Outside radar window (Betelgeuse at 640 ly)
          // Draw radial arrow pointing outward at radar edge
          var arrowDistPx = maxPlotR;
          var ax = cx + Math.cos(star.angle) * arrowDistPx;
          var ay = cy + Math.sin(star.angle) * arrowDistPx;

          ctx.fillStyle = danger;
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fill();

          // Outward radial tick / pointer
          var outX = cx + Math.cos(star.angle) * (arrowDistPx + 8);
          var outY = cy + Math.sin(star.angle) * (arrowDistPx + 8);
          ctx.strokeStyle = danger;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(outX, outY);
          ctx.stroke();

          ctx.font = '700 9px "JetBrains Mono", monospace';
          ctx.fillStyle = danger;
          ctx.fillText(star.label + ' ──►', ax - 70, ay - 8);
          ctx.font = '500 7.5px "JetBrains Mono", monospace';
          ctx.fillText('(Beyond 80y Horizon)', ax - 70, ay + 3);
        }
      }
    }

    // ── 2. Spacetime Coordinate Canvas (x vs ct) ───────────────────────────
    function drawSpacetimeCone() {
      var ret = setupRetinaCanvas(canvasCone);
      var ctx = ret.ctx, w = ret.width, h = ret.height;
      var colors = getThemeColors();
      var emerald = colors.isLight ? '#059669' : '#10b981';
      var danger = colors.isLight ? '#dc2626' : '#f87171';

      ctx.clearRect(0, 0, w, h);

      var padLeft = 45;
      var padRight = 35;
      var padBottom = 32;
      var padTop = 25;

      var ox = padLeft + (w - padLeft - padRight) / 2;
      var oy = h - padBottom;
      var plotW = (w - padLeft - padRight) / 2;
      var plotH = oy - padTop;

      var scaleX = plotW / maxRadarDist; // pixels per light-year
      var scaleY = plotH / maxLifespan;  // pixels per year

      drawGrid(ctx, ox, oy, w, h, 36);

      // Axes
      ctx.strokeStyle = colors.axisLine;
      ctx.lineWidth = 1.75;

      // Horizontal space axis: -100 to +100 ly
      ctx.beginPath();
      ctx.moveTo(padLeft - 10, oy);
      ctx.lineTo(w - padRight + 15, oy);
      ctx.stroke();

      // Vertical time axis: 0 to 80 yr
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

      // Axis tick marks (Space: ±40, ±80 ly)
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.subtleText;
      var spaceTicks = [-80, -40, 40, 80];
      for (var st = 0; st < spaceTicks.length; st++) {
        var tickX = ox + spaceTicks[st] * scaleX;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(tickX, oy - 3);
        ctx.lineTo(tickX, oy + 3);
        ctx.stroke();
        ctx.fillText(spaceTicks[st], tickX - 8, oy + 14);
      }

      // Time ticks: 20, 40, 60, 80 yr
      for (var tt = 20; tt <= 80; tt += 20) {
        var tickY = oy - tt * scaleY;
        ctx.strokeStyle = colors.axisLine;
        ctx.beginPath();
        ctx.moveTo(ox - 3, tickY);
        ctx.lineTo(ox + 3, tickY);
        ctx.stroke();
        ctx.fillText(tt + 'y', ox - 24, tickY + 3);
      }

      // Maximum 80-year lifespan horizontal line
      var y80 = oy - 80 * scaleY;
      ctx.strokeStyle = danger;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ox - 80 * scaleX, y80);
      ctx.lineTo(ox + 80 * scaleX, y80);
      ctx.stroke();
      ctx.setLineDash([]);

      // Past Light Cone at Current Age
      // Apex is at (ox, oy - currentAge * scaleY)
      // Left foot on t=0 is at ox - currentAge * scaleX
      // Right foot on t=0 is at ox + currentAge * scaleX
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

        ctx.font = '600 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.photonColor;
        ctx.fillText('Past Light Cone', ox + (currentAge * scaleX) * 0.4 + 4, apexY + (currentAge * scaleY) * 0.5);
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

        if (star.dist <= maxRadarDist) {
          var starX = ox + star.dist * scaleX;
          var starY = oy;

          // Event dot on t=0 axis
          drawGlowingDot(ctx, starX, starY, hasReached ? colors.photonColor : (colors.isLight ? '#94a3b8' : '#64748b'), isSelected ? 5.5 : 3.5);

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
          if (star.dist <= maxLifespan) {
            var arrivalY = oy - star.dist * scaleY;
            ctx.strokeStyle = colors.photonColor;
            ctx.lineWidth = isSelected ? 1.75 : 1;
            ctx.beginPath();
            ctx.moveTo(starX, starY);
            ctx.lineTo(ox, arrivalY);
            ctx.stroke();

            if (isSelected) {
              drawGlowingDot(ctx, ox, arrivalY, emerald, 4.5);
              ctx.font = '700 8.5px "JetBrains Mono", monospace';
              ctx.fillStyle = emerald;
              ctx.fillText('Arrival: t=' + star.dist.toFixed(1) + 'y', ox - 95, arrivalY - 4);
            }
          }

          ctx.font = (isSelected ? '700' : '500') + ' 8px "JetBrains Mono", monospace';
          ctx.fillStyle = isSelected ? colors.photonColor : colors.subtleText;
          ctx.fillText(star.name, starX - 12, oy + 24);
        } else {
          // Off-screen indicator (Betelgeuse)
          ctx.fillStyle = danger;
          ctx.beginPath();
          ctx.arc(w - padRight, oy, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '700 8px "JetBrains Mono", monospace';
          ctx.fillStyle = danger;
          ctx.fillText('Betelgeuse (640 ly ──►)', w - padRight - 110, oy - 8);
        }
      }
    }

    function renderAll() {
      updateTelemetry();
      drawRadar();
      drawSpacetimeCone();
    }

    if (sliderAge) {
      sliderAge.addEventListener('input', function (e) {
        currentAge = parseFloat(e.target.value);
        if (isPlaying) stopAnimation();
        renderAll();
      });
    }

    for (var b = 0; b < presetBtns.length; b++) {
      (function (btn) {
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
      })(presetBtns[b]);
    }

    function stopAnimation() {
      isPlaying = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (btnAutoAge) {
        btnAutoAge.innerHTML = '<span>▶</span><span>Simulate Lifespan</span>';
      }
    }

    function startAnimation() {
      isPlaying = true;
      if (btnAutoAge) {
        btnAutoAge.innerHTML = '<span>⏸</span><span>Pause</span>';
      }
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

    if (btnAutoAge) {
      btnAutoAge.addEventListener('click', function () {
        if (isPlaying) {
          stopAnimation();
        } else {
          if (currentAge >= maxLifespan) currentAge = 0;
          startAnimation();
        }
      });
    }

    registerDraw(renderAll);
    window.addEventListener('resize', renderAll);
    renderAll();
  }

  function initAllPost01() {
    initThemeManager();
    initReadingProgress();
    initWidgetCars('widget-cars');
    initWidgetStationary('widget-stationary');
    initWidgetTradeoff('widget-tradeoff');
    initWidgetTimeDilation('widget-time-dilation');
    initWidgetSpeedLimit('widget-speed-limit');
    initWidgetMuon('widget-muon');
    initWidget3DSpacetime('widget-3d-spacetime');
  }

  function initAllPost02() {
    initThemeManager();
    initReadingProgress();
    initWidgetDualSpeedSpacetime('widget-dual-bridge');
    initWidgetExpandingCircles('widget-expanding-circles');
    initWidget3DLightConeExplorer('widget-3d-light-cone');
    initWidgetCosmicHorizon('widget-cosmic-horizon');
    initWidgetSynthesisGrid('widget-synthesis-grid');
  }

  function initAllPost03() {
    initThemeManager();
    initReadingProgress();
    initWidgetLoafAlice('widget-loaf-alice');
    initWidgetLoafBob('widget-loaf-bob');
    initWidgetSimultaneitySlice('widget-simultaneity-slice');
    initWidgetLengthContraction('widget-length-contraction');
    initWidgetDualFrame('widget-dual-frame');
    initWidgetMuonContraction('widget-muon-contraction');
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
    initWidgetDualSpeedSpacetime: initWidgetDualSpeedSpacetime,
    initWidgetExpandingCircles: initWidgetExpandingCircles,
    initWidgetSynthesisGrid: initWidgetSynthesisGrid,
    initWidget3DLightConeExplorer: initWidget3DLightConeExplorer,
    initWidgetCosmicHorizon: initWidgetCosmicHorizon,
    initWidgetLoafAlice: initWidgetLoafAlice,
    initWidgetLoafBob: initWidgetLoafBob,
    initWidgetSimultaneitySlice: initWidgetSimultaneitySlice,
    initWidgetLengthContraction: initWidgetLengthContraction,
    initWidgetDualFrame: initWidgetDualFrame,
    initWidgetMuonContraction: initWidgetMuonContraction,
    initAllPost01: initAllPost01,
    initAllPost02: initAllPost02,
    initAllPost03: initAllPost03
  };

})(window);

