/**
 * post-03.js - Part 3 Interactive Simulations: The Spacetime Loaf & Length Contraction
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

  // Helper: 2D Stick Figure
  function drawStickFigure2D(ctx, x, y, color, scale) {
    scale = scale || 1.0;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.6 * scale;
    ctx.lineCap = 'round';

    var headR = 4 * scale;
    var bodyH = 14 * scale;
    var legW = 6 * scale;
    var legH = 12 * scale;
    var armW = 8 * scale;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - bodyH - headR, headR, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.moveTo(x, y - bodyH);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x - legW, y + legH);
    ctx.lineTo(x, y);
    ctx.lineTo(x + legW, y + legH);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(x - armW, y - bodyH * 0.4);
    ctx.lineTo(x, y - bodyH * 0.7);
    ctx.lineTo(x + armW, y - bodyH * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  // Helper: 3D Stick Figure
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

    // Reference measuring bar
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

  // Universal 3D Camera Controller for Spacetime Loaf Visualizations
  function setup3DCameraController(container, canvas, initialAz, initialEl, onUpdate) {
    var defAz = initialAz !== undefined ? initialAz : -35 * Math.PI / 180;
    var defEl = initialEl !== undefined ? initialEl : 25 * Math.PI / 180;

    var cam = {
      azimuth: defAz,
      elevation: defEl,
      defaultAz: defAz,
      defaultEl: defEl
    };

    var sliderAz = container.querySelector('.slider-azimuth');
    var sliderEl = container.querySelector('.slider-elevation');
    var sliderOrbitLegacy = container.querySelector('.slider-orbit');
    var btnReset = container.querySelector('.btn-reset-view');
    var chipPresets = container.querySelectorAll('.chip-cam-preset');

    function syncControls() {
      if (sliderAz) sliderAz.value = cam.azimuth.toFixed(2);
      if (sliderEl) sliderEl.value = cam.elevation.toFixed(2);
      if (sliderOrbitLegacy) sliderOrbitLegacy.value = ((cam.azimuth * 180) / Math.PI).toFixed(0);
    }

    function setAngles(az, el) {
      cam.azimuth = az;
      cam.elevation = Math.max(-0.35, Math.min(1.30, el));
      while (cam.azimuth > Math.PI) cam.azimuth -= Math.PI * 2;
      while (cam.azimuth < -Math.PI) cam.azimuth += Math.PI * 2;
      syncControls();
      if (onUpdate) onUpdate();
    }

    if (sliderAz) {
      sliderAz.addEventListener('input', function (e) {
        cam.azimuth = parseFloat(e.target.value);
        if (onUpdate) onUpdate();
      });
    }

    if (sliderEl) {
      sliderEl.addEventListener('input', function (e) {
        cam.elevation = parseFloat(e.target.value);
        if (onUpdate) onUpdate();
      });
    }

    if (sliderOrbitLegacy) {
      sliderOrbitLegacy.addEventListener('input', function (e) {
        cam.azimuth = (parseFloat(e.target.value) * Math.PI) / 180;
        if (onUpdate) onUpdate();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        setAngles(cam.defaultAz, cam.defaultEl);
        for (var i = 0; i < chipPresets.length; i++) {
          chipPresets[i].classList.remove('active');
          if (chipPresets[i].getAttribute('data-preset') === 'default' || i === 0) {
            chipPresets[i].classList.add('active');
          }
        }
      });
    }

    for (var p = 0; p < chipPresets.length; p++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipPresets.length; j++) chipPresets[j].classList.remove('active');
          btn.classList.add('active');
          var az = parseFloat(btn.getAttribute('data-az'));
          var el = parseFloat(btn.getAttribute('data-el'));
          setAngles(az, el);
        });
      })(chipPresets[p]);
    }

    // Direct 2D canvas mouse & touch drag
    var isDragging = false;
    var lastX = 0, lastY = 0;

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      setAngles(cam.azimuth + dx * 0.008, cam.elevation + dy * 0.008);
    });

    window.addEventListener('mouseup', function () { isDragging = false; });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - lastX;
      var dy = e.touches[0].clientY - lastY;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      setAngles(cam.azimuth + dx * 0.008, cam.elevation + dy * 0.008);
    }, { passive: true });

    window.addEventListener('touchend', function () { isDragging = false; });

    syncControls();
    return cam;
  }

  // WIDGET 1: Alice at Rest in the Loaf
  function initWidgetLoafAlice(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var readoutTime = container.querySelector('.readout-alice-time');
    var valTime = container.querySelector('.val-time');

    var isPlaying = false;
    var timeVal = 3.0;

    var cam = setup3DCameraController(container, canvas, -35 * Math.PI / 180, 25 * Math.PI / 180, function () {
      draw();
    });

    function update() {
      if (readoutTime) readoutTime.innerHTML = timeVal.toFixed(2) + ' <span>s</span>';
      if (valTime) valTime.innerText = 't = ' + timeVal.toFixed(2) + ' s';
      draw();
    }

    function project(x, y, z, cx, cy, scale) {
      var cosAz = Math.cos(cam.azimuth);
      var sinAz = Math.sin(cam.azimuth);
      var xRot = x * cosAz - y * sinAz;
      var yRot = x * sinAz + y * cosAz;

      var cosEl = Math.cos(cam.elevation);
      var sinEl = Math.sin(cam.elevation);
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
      ctx.setLineDash([]);

      // Alice's Vertical Worldtube (r = 0.28, stays at x₁ = 0, x₂ = 0)
      var zNorm = (timeVal / 6.0) * 1.35;
      var tubeRadius = 0.15;
      var numTubeSides = 12;

      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.5;

      // Draw bottom-to-top column
      for (var ti = 0; ti < numTubeSides; ti++) {
        var a1 = (ti / numTubeSides) * Math.PI * 2;
        var a2 = ((ti + 1) / numTubeSides) * Math.PI * 2;
        var b1 = p3(tubeRadius * Math.cos(a1), tubeRadius * Math.sin(a1), 0);
        var b2 = p3(tubeRadius * Math.cos(a2), tubeRadius * Math.sin(a2), 0);
        var t1 = p3(tubeRadius * Math.cos(a1), tubeRadius * Math.sin(a1), zNorm);
        var t2 = p3(tubeRadius * Math.cos(a2), tubeRadius * Math.sin(a2), zNorm);

        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Alice's Horizontal Plane of "Now" (t = const slice)
      var sliceW = 1.15;
      var pSlice1 = p3(-sliceW, -sliceW, zNorm);
      var pSlice2 = p3(sliceW, -sliceW, zNorm);
      var pSlice3 = p3(sliceW, sliceW, zNorm);
      var pSlice4 = p3(-sliceW, sliceW, zNorm);

      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.14)' : 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(pSlice1.x, pSlice1.y);
      ctx.lineTo(pSlice2.x, pSlice2.y);
      ctx.lineTo(pSlice3.x, pSlice3.y);
      ctx.lineTo(pSlice4.x, pSlice4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Expanding Light Ring on Alice's Slice
      var lightRingRadius = zNorm;
      if (lightRingRadius > 0.02) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        var numRingPts = 36;
        for (var ri = 0; ri <= numRingPts; ri++) {
          var rAng = (ri / numRingPts) * Math.PI * 2;
          var rp = p3(lightRingRadius * Math.cos(rAng), lightRingRadius * Math.sin(rAng), zNorm);
          if (ri === 0) ctx.moveTo(rp.x, rp.y);
          else ctx.lineTo(rp.x, rp.y);
        }
        ctx.closePath();
        ctx.stroke();

        var pRingLabel = p3(lightRingRadius * 0.707, lightRingRadius * 0.707, zNorm);
        drawLabelPill(ctx, 'Light Wavefront (r = ct)', pRingLabel.x + 35, pRingLabel.y, { textColor: '#d97706', font: '10px "JetBrains Mono"' });
      }

      // Alice standing on her slice
      drawStickFigure3D(ctx, p3, 0, 0, zNorm, c.timeColor, 1.0, 1.0);
      drawLabelPill(ctx, 'Alice at Rest (x₁=0, x₂=0)', cx, pSlice1.y - 12, { textColor: c.timeColor });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        timeVal = (parseFloat(e.target.value) / 600) * 6.0;
        update();
      });
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

  // WIDGET 2: Bob in Motion: Angling Across the Loaf
  function initWidgetLoafBob(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderSpeed = container.querySelector('.slider-speed');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var readoutSpeed = container.querySelector('.readout-speed-val');
    var readoutBobSpeed = container.querySelector('.readout-bob-speed');
    var readoutAliceClock = container.querySelector('.readout-alice-clock');
    var readoutBobClock = container.querySelector('.readout-bob-clock');
    var readoutDisp = container.querySelector('.readout-bob-disp');
    var valTime = container.querySelector('.val-time');
    var chipButtons = container.querySelectorAll('.chip-speed');

    var isPlaying = false;
    var angleDeg = 60;
    var timeVal = 3.5;

    var cam = setup3DCameraController(container, canvas, -35 * Math.PI / 180, 25 * Math.PI / 180, function () {
      draw();
    });

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

      draw();
    }

    function project(x, y, z, cx, cy, scale) {
      var cosAz = Math.cos(cam.azimuth);
      var sinAz = Math.sin(cam.azimuth);
      var xRot = x * cosAz - y * sinAz;
      var yRot = x * sinAz + y * cosAz;

      var cosEl = Math.cos(cam.elevation);
      var sinEl = Math.sin(cam.elevation);
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

      var rad = angleDeg * Math.PI / 180;
      var vFraction = Math.sin(rad);
      var zNorm = (timeVal / 6.0) * 1.35;

      // Alice's Vertical Worldtube (Cyan)
      var tubeR = 0.12;
      var numSides = 10;
      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.10)' : 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.2;

      for (var si = 0; si < numSides; si++) {
        var a1 = (si / numSides) * Math.PI * 2;
        var a2 = ((si + 1) / numSides) * Math.PI * 2;
        var b1 = p3(tubeR * Math.cos(a1), tubeR * Math.sin(a1), 0);
        var b2 = p3(tubeR * Math.cos(a2), tubeR * Math.sin(a2), 0);
        var t1 = p3(tubeR * Math.cos(a1), tubeR * Math.sin(a1), zNorm);
        var t2 = p3(tubeR * Math.cos(a2), tubeR * Math.sin(a2), zNorm);
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t1.x, t1.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }

      // Bob's Tilted Worldtube (Amber)
      var bobShiftX = vFraction * zNorm;
      ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.14)' : 'rgba(251, 146, 60, 0.16)';
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 1.6;

      for (var bi = 0; bi < numSides; bi++) {
        var ba1 = (bi / numSides) * Math.PI * 2;
        var ba2 = ((bi + 1) / numSides) * Math.PI * 2;
        var bb1 = p3(tubeR * Math.cos(ba1), tubeR * Math.sin(ba1), 0);
        var bb2 = p3(tubeR * Math.cos(ba2), tubeR * Math.sin(ba2), 0);
        var bt1 = p3(bobShiftX + tubeR * Math.cos(ba1), tubeR * Math.sin(ba1), zNorm);
        var bt2 = p3(bobShiftX + tubeR * Math.cos(ba2), tubeR * Math.sin(ba2), zNorm);
        ctx.beginPath();
        ctx.moveTo(bb1.x, bb1.y); ctx.lineTo(bb2.x, bb2.y); ctx.lineTo(bt2.x, bt2.y); ctx.lineTo(bt1.x, bt1.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }

      // Draw Bob's tilted central spine
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(pOrigin.x, pOrigin.y);
      var pBobTop = p3(bobShiftX, 0, zNorm);
      ctx.lineTo(pBobTop.x, pBobTop.y);
      ctx.stroke();

      // Alice & Bob figures at current time
      drawStickFigure3D(ctx, p3, 0, 0, zNorm, c.timeColor, 0.9, 0.85);
      drawStickFigure3D(ctx, p3, bobShiftX, 0, zNorm, c.spaceColor, 1.0, 0.85);

      drawLabelPill(ctx, 'Alice (Rest)', p3(0, 0, zNorm).x - 30, p3(0, 0, zNorm).y - 20, { textColor: c.timeColor });
      drawLabelPill(ctx, 'Bob (Moving)', pBobTop.x + 35, pBobTop.y - 20, { textColor: c.spaceColor });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        angleDeg = parseInt(e.target.value, 10);
        for (var i = 0; i < chipButtons.length; i++) chipButtons[i].classList.remove('active');
        update();
      });
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        timeVal = (parseFloat(e.target.value) / 600) * 6.0;
        update();
      });
    }

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

  // WIDGET 3: Bob's Rest Frame: Simultaneous Beacons Inside the Coach
  function initWidgetBeaconsBob(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var btnPlay = container.querySelector('.btn-play');
    var readoutTime = container.querySelector('.readout-bob-time');
    var readoutRear = container.querySelector('.readout-rear-arrival');
    var readoutFront = container.querySelector('.readout-front-arrival');
    var readoutDesync = container.querySelector('.readout-beacon-desync');

    var timeVal = 0.0;
    var isPlaying = false;
    var hitTime = 1.00;

    function update() {
      if (readoutTime) readoutTime.innerText = 't = ' + timeVal.toFixed(2) + ' s';
      if (readoutRear) {
        if (timeVal >= hitTime) {
          readoutRear.innerHTML = '1.00 <span>s</span>';
        } else {
          readoutRear.innerHTML = (timeVal).toFixed(2) + ' <span>s</span> (in flight)';
        }
      }
      if (readoutFront) {
        if (timeVal >= hitTime) {
          readoutFront.innerHTML = '1.00 <span>s</span>';
        } else {
          readoutFront.innerHTML = (timeVal).toFixed(2) + ' <span>s</span> (in flight)';
        }
      }
      if (readoutDesync) {
        if (timeVal >= hitTime) {
          readoutDesync.innerHTML = 'Arrival Desynchronization: <strong>Δt = 0.00 s (Exact Simultaneity!)</strong>';
        } else {
          readoutDesync.innerHTML = 'Photons in flight at speed c toward both beacons...';
        }
      }
      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var cx = width * 0.50;
      var cy = height * 0.48;

      // Track rails
      var railY = cy + 52;
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, railY);
      ctx.lineTo(width - 30, railY);
      ctx.stroke();

      for (var rx = 40; rx < width - 30; rx += 24) {
        ctx.beginPath();
        ctx.moveTo(rx, railY);
        ctx.lineTo(rx, railY + 6);
        ctx.stroke();
      }

      // Coach dimensions
      var coachW = Math.min(width * 0.80, 480);
      var coachH = 78;
      var coachX = cx - coachW / 2;
      var coachY = cy - 38;
      var halfW = coachW / 2;

      // Coach body
      ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.08)' : 'rgba(251, 146, 60, 0.10)';
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(coachX, coachY, coachW, coachH, 10) : ctx.rect(coachX, coachY, coachW, coachH);
      ctx.fill();
      ctx.stroke();

      // Wheels
      ctx.fillStyle = c.axisLine;
      var wheelR = 8;
      var wY = coachY + coachH + wheelR - 2;
      [coachX + 35, coachX + 65, coachX + coachW - 65, coachX + coachW - 35].forEach(function (wx) {
        ctx.beginPath(); ctx.arc(wx, wY, wheelR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(wx, wY, wheelR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = c.isLight ? '#fff' : '#000'; ctx.fill();
        ctx.fillStyle = c.axisLine;
      });

      // Windows
      var numWindows = 5;
      var winW = 32, winH = 22;
      var winGap = (coachW - 60 - numWindows * winW) / (numWindows - 1);
      ctx.fillStyle = c.isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = c.isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2;
      for (var wi = 0; wi < numWindows; wi++) {
        var wx = coachX + 30 + wi * (winW + winGap);
        var wy = coachY + 16;
        ctx.fillRect(wx, wy, winW, winH);
        ctx.strokeRect(wx, wy, winW, winH);
      }

      // Bob in the center holding trigger
      drawStickFigure2D(ctx, cx, coachY + 54, c.spaceColor, 1.0);
      drawLabelPill(ctx, 'Bob (x = 0, at rest)', cx, coachY - 14, { textColor: c.spaceColor });

      // Beacons on walls
      var rearX = coachX + 8;
      var frontX = coachX + coachW - 8;
      var beaconY = coachY + coachH * 0.5;
      var isHit = timeVal >= hitTime;

      // Rear Beacon
      ctx.fillStyle = isHit ? '#facc15' : 'rgba(100, 116, 139, 0.35)';
      ctx.strokeStyle = isHit ? '#eab308' : c.axisLine;
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(rearX, beaconY, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      drawLabelPill(ctx, 'Rear Beacon (−d)', rearX + 10, coachY + coachH + 26, { textColor: isHit ? '#eab308' : c.axisLabel });

      // Front Beacon
      ctx.fillStyle = isHit ? '#facc15' : 'rgba(100, 116, 139, 0.35)';
      ctx.strokeStyle = isHit ? '#eab308' : c.axisLine;
      ctx.beginPath(); ctx.arc(frontX, beaconY, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      drawLabelPill(ctx, 'Front Beacon (+d)', frontX - 10, coachY + coachH + 26, { textColor: isHit ? '#eab308' : c.axisLabel });

      // Photons propagation
      var progress = Math.min(1.0, timeVal / hitTime);
      var pLeftX = cx - progress * (halfW - 8);
      var pRightX = cx + progress * (halfW - 8);

      // Light beam trails
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.40)';
      ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx, beaconY); ctx.lineTo(pLeftX, beaconY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, beaconY); ctx.lineTo(pRightX, beaconY); ctx.stroke();
      ctx.setLineDash([]);

      // Photons
      drawGlowingDot(ctx, pLeftX, beaconY, '#facc15', 5.5);
      drawGlowingDot(ctx, pRightX, beaconY, '#facc15', 5.5);

      if (progress > 0.08 && progress < 0.95) {
        drawLabelPill(ctx, '← c', (cx + pLeftX) / 2, beaconY - 14, { textColor: '#eab308', font: '10px "JetBrains Mono"' });
        drawLabelPill(ctx, 'c →', (cx + pRightX) / 2, beaconY - 14, { textColor: '#eab308', font: '10px "JetBrains Mono"' });
      }

      // Flash halos upon simultaneous hit
      if (isHit) {
        var haloR = 18 + Math.sin(timeVal * 12) * 3;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(rearX, beaconY, haloR, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(frontX, beaconY, haloR, 0, Math.PI * 2); ctx.stroke();

        drawLabelPill(ctx, 'SIMULTANEOUS! t = 1.00s', cx, beaconY, { textColor: c.timeColor, font: 'bold 11px "JetBrains Mono"' });
      }
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        timeVal = (parseFloat(e.target.value) / 1000) * 1.5;
        update();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var last = performance.now();
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - last) / 1000;
            last = now;
            timeVal = (timeVal + dt * 0.75) % 1.50;
            if (sliderTime) sliderTime.value = (timeVal / 1.50) * 1000;
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

  // WIDGET 4: Alice's Platform Frame: Desynchronized Beacons on the Move
  function initWidgetBeaconsAlice(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderTime = container.querySelector('.slider-time');
    var sliderSpeed = container.querySelector('.slider-speed');
    var btnPlay = container.querySelector('.btn-play');
    var chipSpeeds = container.querySelectorAll('.chip-speed-alice');
    var readoutSpeed = container.querySelector('.readout-alice-speed');
    var readoutRear = container.querySelector('.readout-alice-rear-hit');
    var readoutFront = container.querySelector('.readout-alice-front-hit');
    var readoutDesync = container.querySelector('.readout-alice-desync');

    var vFraction = 0.866; // default 60 deg, matching Part 1
    var timeVal = 0.0;
    var isPlaying = false;
    var maxTime = 3.5;

    function getHitTimes() {
      // In Alice's frame: coach contracted by gamma.
      // Light moves at c from origin.
      // Rear beacon starts at -d' and moves right at v. t_rear = d' / (c + v)
      // Front beacon starts at +d' and moves right at v. t_front = d' / (c - v)
      var gamma = 1 / Math.sqrt(Math.max(0.01, 1 - vFraction * vFraction));
      var dPrime = 1.0 / gamma;
      var tRear = dPrime / (1.0 + vFraction);
      var tFront = vFraction >= 0.999 ? 999 : dPrime / Math.max(0.001, 1.0 - vFraction);
      return { tRear: tRear, tFront: tFront, gamma: gamma, dPrime: dPrime };
    }

    function update() {
      var hits = getHitTimes();
      var deltaT = hits.tFront - hits.tRear;

      if (readoutSpeed) readoutSpeed.innerText = 'v = ' + vFraction.toFixed(3) + ' c';
      if (readoutRear) {
        if (timeVal >= hits.tRear) {
          readoutRear.innerHTML = hits.tRear.toFixed(2) + ' <span>s</span> <strong style="color:var(--color-time); font-size:0.72rem;">(HIT 1: EARLY)</strong>';
        } else {
          readoutRear.innerHTML = timeVal.toFixed(2) + ' <span>s</span> (' + (hits.tRear - timeVal).toFixed(2) + 's away)';
        }
      }
      if (readoutFront) {
        if (timeVal >= hits.tFront) {
          readoutFront.innerHTML = hits.tFront.toFixed(2) + ' <span>s</span> <strong style="color:var(--color-space); font-size:0.72rem;">(HIT 2: LATE)</strong>';
        } else {
          readoutFront.innerHTML = timeVal.toFixed(2) + ' <span>s</span> (chasing...)';
        }
      }
      if (readoutDesync) {
        if (vFraction === 0) {
          readoutDesync.innerHTML = 'Stationary Coach: <strong>Simultaneous Arrival (Δt = 0.00 s)</strong>';
        } else if (timeVal >= hits.tFront) {
          readoutDesync.innerHTML = 'Desynchronization: Rear hit first; Front hit <strong>Δt = ' + deltaT.toFixed(2) + ' s later!</strong>';
        } else if (timeVal >= hits.tRear) {
          readoutRear.innerHTML += ' <span style="color:#eab308;">★ FLASHED!</span>';
          readoutDesync.innerHTML = 'Rear Beacon already struck! Front beacon still retreating ahead of light...';
        } else {
          readoutDesync.innerHTML = 'Light traveling at invariant speed c relative to track...';
        }
      }

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var cx = width * 0.38;
      var cy = height * 0.46;
      var hits = getHitTimes();

      // Platform / Track
      var railY = cy + 54;
      ctx.strokeStyle = c.gridLine; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, railY); ctx.lineTo(width - 20, railY); ctx.stroke();

      for (var rx = 25; rx < width - 20; rx += 22) {
        ctx.beginPath(); ctx.moveTo(rx, railY); ctx.lineTo(rx, railY + 6); ctx.stroke();
      }

      // Alice stationary on platform at track origin (x = 0)
      drawStickFigure2D(ctx, cx, railY + 28, c.timeColor, 0.95);
      drawLabelPill(ctx, 'Alice (Platform Origin x=0)', cx, railY + 42, { textColor: c.timeColor });

      // Emission Point Marker pinned on the track at (cx, railY)
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(cx, railY - 10); ctx.lineTo(cx, railY + 12); ctx.stroke();
      ctx.setLineDash([]);
      drawLabelPill(ctx, 'Flash Origin', cx, railY - 14, { textColor: '#eab308', font: '9px "JetBrains Mono"' });

      // Coach properties
      var baseCoachW = Math.min(width * 0.40, 260);
      var coachW = baseCoachW / hits.gamma;
      var coachH = 68;
      var scale = baseCoachW * 0.50; // 1 second of light travels half-coach rest width

      // Coach position at timeVal
      var coachCenter = cx + (vFraction * timeVal * scale);
      var coachX = coachCenter - coachW / 2;
      var coachY = cy - 35;
      var rearX = coachCenter - coachW / 2;
      var frontX = coachCenter + coachW / 2;
      var beaconY = coachY + coachH * 0.5;

      // Draw Moving Coach
      ctx.fillStyle = c.isLight ? 'rgba(234, 88, 12, 0.08)' : 'rgba(251, 146, 60, 0.10)';
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(coachX, coachY, coachW, coachH, 8) : ctx.rect(coachX, coachY, coachW, coachH);
      ctx.fill(); ctx.stroke();

      // Wheels
      ctx.fillStyle = c.axisLine;
      var wheelR = 7;
      var wY = coachY + coachH + wheelR - 2;
      [coachX + 20, coachX + coachW - 20].forEach(function (wx) {
        ctx.beginPath(); ctx.arc(wx, wY, wheelR, 0, Math.PI * 2); ctx.fill();
      });

      // Bob inside moving coach
      drawStickFigure2D(ctx, coachCenter, coachY + 46, c.spaceColor, 0.85);

      // Beacons state
      var rearHit = timeVal >= hits.tRear;
      var frontHit = timeVal >= hits.tFront;

      ctx.fillStyle = rearHit ? '#facc15' : 'rgba(100, 116, 139, 0.35)';
      ctx.strokeStyle = rearHit ? '#eab308' : c.axisLine;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rearX, beaconY, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      ctx.fillStyle = frontHit ? '#facc15' : 'rgba(100, 116, 139, 0.35)';
      ctx.strokeStyle = frontHit ? '#eab308' : c.axisLine;
      ctx.beginPath(); ctx.arc(frontX, beaconY, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // Photons expanding from platform origin cx
      var pDist = timeVal * scale;
      var pLeftX = Math.max(20, cx - pDist);
      var pRightX = cx + pDist;

      // Draw light rays from origin
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.40)';
      ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx, beaconY); ctx.lineTo(pLeftX, beaconY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, beaconY); ctx.lineTo(pRightX, beaconY); ctx.stroke();
      ctx.setLineDash([]);

      // Photons dots
      drawGlowingDot(ctx, pLeftX, beaconY, '#facc15', 5);
      drawGlowingDot(ctx, pRightX, beaconY, '#facc15', 5);

      // Event Markers
      if (rearHit) {
        var xEvent1 = cx - hits.tRear * scale;
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(xEvent1, beaconY, 14, 0, Math.PI * 2); ctx.stroke();
        drawLabelPill(ctx, 'Event 1: Rear Hit (t = ' + hits.tRear.toFixed(2) + 's)', xEvent1 - 10, coachY - 14, { textColor: '#eab308', font: '10px "JetBrains Mono"' });
      }

      if (frontHit) {
        var xEvent2 = cx + hits.tFront * scale;
        ctx.strokeStyle = c.spaceColor; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(xEvent2, beaconY, 14, 0, Math.PI * 2); ctx.stroke();
        drawLabelPill(ctx, 'Event 2: Front Hit (t = ' + hits.tFront.toFixed(2) + 's)', xEvent2 + 10, coachY - 14, { textColor: c.spaceColor, font: '10px "JetBrains Mono"' });
      }

      // Coach label & direction
      if (vFraction > 0) {
        drawLabelPill(ctx, 'Bob\'s Coach → (v = ' + vFraction.toFixed(2) + 'c)', coachCenter, coachY + coachH + 24, { textColor: c.spaceColor });
      }
    }

    if (sliderTime) {
      sliderTime.addEventListener('input', function (e) {
        timeVal = (parseFloat(e.target.value) / 1000) * maxTime;
        update();
      });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        vFraction = parseFloat(e.target.value) / 1000;
        for (var i = 0; i < chipSpeeds.length; i++) chipSpeeds[i].classList.remove('active');
        update();
      });
    }

    for (var s = 0; s < chipSpeeds.length; s++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipSpeeds.length; j++) chipSpeeds[j].classList.remove('active');
          btn.classList.add('active');
          vFraction = parseFloat(btn.getAttribute('data-val')) / 1000;
          if (sliderSpeed) sliderSpeed.value = btn.getAttribute('data-val');
          update();
        });
      })(chipSpeeds[s]);
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var last = performance.now();
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - last) / 1000;
            last = now;
            timeVal = (timeVal + dt * 0.8) % maxTime;
            if (sliderTime) sliderTime.value = (timeVal / maxTime) * 1000;
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

  // WIDGET 5: Slicing the Loaf: The Angle of "Now"
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

    var vFraction = 0.866; // Default to theta = 60 deg, matching Part 1
    var sliceMode = 'both';

    var cam = setup3DCameraController(container, canvas, -35 * Math.PI / 180, 25 * Math.PI / 180, function () {
      draw();
    });

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
          readoutDesyncText.innerText = 'Front beacon is in Alice\'s future (+' + (deltaT / 2).toFixed(2) + 's); rear beacon is in Alice\'s past (-' + (deltaT / 2).toFixed(2) + 's)!';
        }
      }
      draw();
    }

    function project(x, y, z, cx, cy, scale) {
      var cosAz = Math.cos(cam.azimuth);
      var sinAz = Math.sin(cam.azimuth);
      var xRot = x * cosAz - y * sinAz;
      var yRot = x * sinAz + y * cosAz;

      var cosEl = Math.cos(cam.elevation);
      var sinEl = Math.sin(cam.elevation);
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

        drawLabelPill(ctx, 'Bob: "Now" (Tilted by ' + ((Math.atan(vFraction) * 180) / Math.PI).toFixed(0) + '°)', pb2.x - 20, pb2.y - 10, { textColor: c.spaceColor });
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

  // Helper: Draw stylized 2D train coach with windows, wheels, and beacons
  function drawCoach2D(ctx, cx, cy, coachW, coachH, color, isLight) {
    ctx.save();
    var x = cx - coachW / 2;
    var y = cy - coachH / 2;
    var r = Math.min(4, coachW * 0.15);

    // Body fill & stroke
    var isAmber = color.indexOf('234') !== -1 || color.indexOf('251') !== -1 || color === '#ea580c';
    ctx.fillStyle = isLight
      ? (isAmber ? 'rgba(234, 88, 12, 0.18)' : 'rgba(2, 132, 199, 0.16)')
      : (isAmber ? 'rgba(251, 146, 60, 0.24)' : 'rgba(56, 189, 248, 0.22)');
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + coachW - r, y);
    ctx.quadraticCurveTo(x + coachW, y, x + coachW, y + r);
    ctx.lineTo(x + coachW, y + coachH - r);
    ctx.quadraticCurveTo(x + coachW, y + coachH, x + coachW - r, y + coachH);
    ctx.lineTo(x + r, y + coachH);
    ctx.quadraticCurveTo(x, y + coachH, x, y + coachH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows
    var numWindows = Math.max(1, Math.min(4, Math.floor(coachW / 18)));
    var winGap = 3;
    var totalGaps = (numWindows + 1) * winGap;
    var winW = Math.max(3, (coachW - totalGaps) / numWindows);
    var winH = coachH * 0.38;
    var winY = y + coachH * 0.20;

    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.90)' : 'rgba(255, 255, 255, 0.20)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    for (var i = 0; i < numWindows; i++) {
      var wx = x + winGap + i * (winW + winGap);
      if (wx + winW <= x + coachW - 2) {
        ctx.fillRect(wx, winY, winW, winH);
        ctx.strokeRect(wx, winY, winW, winH);
      }
    }

    // Wheels (bogies)
    var wheelR = Math.max(2, coachH * 0.16);
    var wheelY = y + coachH + wheelR;
    var wPos = coachW > 25 ? [x + coachW * 0.24, x + coachW * 0.76] : [cx];
    ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.0;
    for (var w = 0; w < wPos.length; w++) {
      ctx.beginPath();
      ctx.arc(wPos[w], wheelY, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Front & Rear Beacon lights
    drawGlowingDot(ctx, x, y + 2, color, 3.0);
    drawGlowingDot(ctx, x + coachW, y + 2, color, 3.0);

    ctx.restore();
  }

  // WIDGET 6: The Oblique Slice & Length Contraction
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
    var readoutFormula = container.querySelector('.readout-contraction-formula');
    var chipButtons = container.querySelectorAll('.chip-preset-contract');

    var isPlaying = false;
    var angleDeg = 60; // θ in degrees

    function update() {
      var rad = angleDeg * Math.PI / 180;
      var v = Math.sin(rad);
      var cosVal = Math.cos(rad);
      var gamma = cosVal <= 0.001 ? 22.36 : 1 / cosVal;
      var contractedL = 10.0 * cosVal;
      var pct = cosVal * 100;

      if (readoutSpeed) {
        readoutSpeed.innerText = 'θ = ' + angleDeg.toFixed(0) + '° (v = ' + v.toFixed(3) + ' c)';
      }
      if (readoutGamma) {
        readoutGamma.innerText = 'γ = ' + gamma.toFixed(2) + ' (θ = ' + angleDeg.toFixed(0) + '°)';
      }
      if (readoutLength) {
        readoutLength.innerHTML = contractedL.toFixed(1) + ' <span>m</span>';
      }
      if (readoutPercent) {
        readoutPercent.innerText = 'Projected length: 10.0 m × cos(' + angleDeg.toFixed(0) + '°) = ' + contractedL.toFixed(1) + ' m (' + pct.toFixed(1) + '%).';
      }
      if (readoutFormula) {
        readoutFormula.innerHTML = 'Geometric Projection: <strong>L = L₀ · cos θ = 10.0 m × cos(' + angleDeg.toFixed(0) + '°) = ' + contractedL.toFixed(1) + ' m (L₀ / γ)</strong>';
      }

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var rad = angleDeg * Math.PI / 180;
      var cosVal = Math.cos(rad);
      var sinVal = Math.sin(rad);
      var v = sinVal;
      var isNarrow = width < 620;

      if (!isNarrow) {
        // Desktop / Tablet Landscape Layout: Side-by-Side Coordinated Views
        var splitX = width * 0.52;

        // Divider
        ctx.strokeStyle = c.borderSubtle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(splitX, 15);
        ctx.lineTo(splitX, height - 15);
        ctx.stroke();

        // ==========================================
        // PANE 1 (LEFT): Spacetime Projection Geometry
        // ==========================================
        drawLabelPill(ctx, 'Spacetime Slicing & Projection Geometry', splitX * 0.50, 22, {
          textColor: c.axisLabel,
          font: 'bold 11px system-ui'
        });

        var ox = splitX * 0.15;
        var oy = height * 0.72;
        var axisXLen = splitX * 0.78;
        var axisYLen = height * 0.56;

        // Axes
        ctx.strokeStyle = c.axisLine;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ox - 10, oy);
        ctx.lineTo(ox + axisXLen, oy);
        ctx.stroke();

        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ox, oy + 10);
        ctx.lineTo(ox, oy - axisYLen);
        ctx.stroke();

        drawLabelPill(ctx, 'Alice Space (x₁)', ox + axisXLen - 20, oy + 18, {
          textColor: c.axisLabel,
          font: '10px "JetBrains Mono"'
        });
        drawLabelPill(ctx, 'Time (ct)', ox + 30, oy - axisYLen + 10, {
          textColor: c.timeColor,
          font: '10px "JetBrains Mono"'
        });

        // 10m Coach in Spacetime
        var L0_px = Math.min(axisXLen * 0.68, axisYLen * 0.90);
        var xRear = ox + 30;
        var yRear = oy - 42;
        var xFront = xRear + L0_px * cosVal;
        var yFront = yRear - L0_px * sinVal;

        // Bob's Tilted Line of Simultaneity
        ctx.strokeStyle = c.isLight ? 'rgba(234, 88, 12, 0.28)' : 'rgba(251, 146, 60, 0.30)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xRear - 25 * cosVal, yRear + 25 * sinVal);
        ctx.lineTo(xFront + 35 * cosVal, yFront - 35 * sinVal);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bob's Coach along tilted line
        ctx.save();
        ctx.translate(xRear, yRear);
        ctx.rotate(-rad);
        drawCoach2D(ctx, L0_px / 2, -11, L0_px, 18, c.spaceColor, c.isLight);
        drawLabelPill(ctx, 'Bob\'s Coach: L₀ = 10.0 m (Invariant)', L0_px / 2, -26, {
          textColor: c.spaceColor,
          font: 'bold 9.5px "JetBrains Mono"'
        });
        ctx.restore();

        // Glowing dots at ends
        drawGlowingDot(ctx, xRear, yRear, c.spaceColor, 4.5);
        drawGlowingDot(ctx, xFront, yFront, c.spaceColor, 4.5);

        // Dashed Projection Rays dropping down to Alice's space axis
        ctx.strokeStyle = c.invariantColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(xRear, yRear);
        ctx.lineTo(xRear, oy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xFront, yFront);
        ctx.lineTo(xFront, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Angle Arc θ at xRear, yRear
        if (angleDeg > 4) {
          var arcR = Math.min(32, L0_px * 0.25);
          ctx.strokeStyle = c.spaceColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(xRear, yRear, arcR, 0, -rad, true);
          ctx.stroke();

          var midA = -rad / 2;
          ctx.fillStyle = c.spaceColor;
          ctx.font = 'bold 9.5px "JetBrains Mono"';
          ctx.fillText('θ=' + angleDeg.toFixed(0) + '°', xRear + (arcR + 12) * Math.cos(midA), yRear + (arcR + 12) * Math.sin(midA) + 3);

          // Horizontal reference ray for angle
          ctx.strokeStyle = c.isLight ? 'rgba(100, 116, 139, 0.35)' : 'rgba(148, 163, 184, 0.35)';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(xRear, yRear);
          ctx.lineTo(xRear + arcR + 25, yRear);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Alice's Measured Segment on Space Axis (The Projection)
        var projW = xFront - xRear;
        drawCoach2D(ctx, (xRear + xFront) / 2, oy - 1, projW, 16, c.timeColor, c.isLight);
        drawGlowingDot(ctx, xRear, oy, c.timeColor, 4.5);
        drawGlowingDot(ctx, xFront, oy, c.timeColor, 4.5);

        // Dimension badge for Alice's measurement
        var aliceMeasLabel = 'L = 10.0m × cos(' + angleDeg.toFixed(0) + '°) = ' + (10.0 * cosVal).toFixed(1) + ' m';
        drawLabelPill(ctx, aliceMeasLabel, (xRear + xFront) / 2, oy + 26, {
          textColor: c.timeColor,
          font: 'bold 10px "JetBrains Mono"'
        });

        // ==========================================
        // PANE 2 (RIGHT): Physical Real-World Tracks
        // ==========================================
        var rightW = width - splitX;
        var cxRight = splitX + rightW * 0.50;

        drawLabelPill(ctx, 'Physical Train Track View', cxRight, 22, {
          textColor: c.axisLabel,
          font: 'bold 11px system-ui'
        });

        var trackL0_px = Math.min(rightW * 0.65, 175);
        var track1Y = height * 0.38;
        var track2Y = height * 0.74;

        // 1. Bob's Track (Top)
        drawLabelPill(ctx, 'Bob\'s Rest Frame: L₀ = 10.0 m (Invariant)', cxRight, track1Y - 30, {
          textColor: c.spaceColor,
          font: 'bold 10px system-ui'
        });

        // Rails
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cxRight - trackL0_px * 0.65, track1Y + 13);
        ctx.lineTo(cxRight + trackL0_px * 0.65, track1Y + 13);
        ctx.stroke();

        // Bob's 10m Coach
        drawCoach2D(ctx, cxRight, track1Y, trackL0_px, 22, c.spaceColor, c.isLight);

        // Onboard ruler
        ctx.strokeStyle = c.spaceColor;
        ctx.lineWidth = 1.5;
        var rY1 = track1Y + 22;
        ctx.beginPath();
        ctx.moveTo(cxRight - trackL0_px / 2, rY1);
        ctx.lineTo(cxRight + trackL0_px / 2, rY1);
        ctx.stroke();
        for (var t = 0; t <= 5; t++) {
          var tx1 = cxRight - trackL0_px / 2 + (t / 5) * trackL0_px;
          var th1 = t === 0 || t === 5 ? 6 : 3;
          ctx.beginPath();
          ctx.moveTo(tx1, rY1);
          ctx.lineTo(tx1, rY1 + th1);
          ctx.stroke();
        }
        ctx.fillStyle = c.spaceColor;
        ctx.font = '9px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('10.0 m (100%)', cxRight, rY1 + 14);

        // 2. Alice's Platform Track (Bottom)
        drawLabelPill(ctx, 'Alice\'s Platform: L = ' + (10.0 * cosVal).toFixed(1) + ' m (Contracted)', cxRight, track2Y - 30, {
          textColor: c.timeColor,
          font: 'bold 10px system-ui'
        });

        // Rails
        ctx.strokeStyle = c.borderMedium;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cxRight - trackL0_px * 0.65, track2Y + 13);
        ctx.lineTo(cxRight + trackL0_px * 0.65, track2Y + 13);
        ctx.stroke();

        // Contracted Coach
        var contractedW = trackL0_px * cosVal;
        drawCoach2D(ctx, cxRight, track2Y, contractedW, 22, c.timeColor, c.isLight);

        // Motion Arrow
        if (angleDeg > 2) {
          ctx.strokeStyle = c.spaceColor;
          ctx.fillStyle = c.spaceColor;
          ctx.lineWidth = 1.5;
          var arrowX = cxRight + contractedW / 2 + 10;
          ctx.beginPath();
          ctx.moveTo(arrowX, track2Y);
          ctx.lineTo(arrowX + 22, track2Y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(arrowX + 22, track2Y);
          ctx.lineTo(arrowX + 17, track2Y - 3.5);
          ctx.lineTo(arrowX + 17, track2Y + 3.5);
          ctx.closePath();
          ctx.fill();
        }

        // Platform ruler
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 1.5;
        var rY2 = track2Y + 22;
        ctx.beginPath();
        ctx.moveTo(cxRight - trackL0_px / 2, rY2);
        ctx.lineTo(cxRight + trackL0_px / 2, rY2);
        ctx.stroke();
        for (var t2 = 0; t2 <= 5; t2++) {
          var tx2 = cxRight - trackL0_px / 2 + (t2 / 5) * trackL0_px;
          var th2 = t2 === 0 || t2 === 5 ? 6 : 3;
          ctx.beginPath();
          ctx.moveTo(tx2, rY2);
          ctx.lineTo(tx2, rY2 + th2);
          ctx.stroke();
        }
        // Active simultaneous bracket
        ctx.strokeStyle = c.timeColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cxRight - contractedW / 2, rY2 - 2);
        ctx.lineTo(cxRight + contractedW / 2, rY2 - 2);
        ctx.stroke();
        ctx.fillStyle = c.timeColor;
        ctx.font = 'bold 9px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText((10.0 * cosVal).toFixed(1) + ' m (' + (cosVal * 100).toFixed(0) + '%)', cxRight, rY2 + 14);

      } else {
        // Mobile Layout: Stacked Views
        drawLabelPill(ctx, 'Spacetime Projection: L = 10m × cos(θ)', width * 0.50, 18, {
          textColor: c.axisLabel,
          font: 'bold 10px system-ui'
        });

        var oxM = 35;
        var oyM = height * 0.52;
        var L0_M = Math.min(width * 0.58, 150);

        // Ground axis
        ctx.strokeStyle = c.axisLine;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(oxM - 10, oyM);
        ctx.lineTo(width - 20, oyM);
        ctx.stroke();

        var xR_M = oxM + 15;
        var yR_M = oyM - 35;
        var xF_M = xR_M + L0_M * cosVal;
        var yF_M = yR_M - L0_M * sinVal;

        // Bob's Tilted Coach
        ctx.save();
        ctx.translate(xR_M, yR_M);
        ctx.rotate(-rad);
        drawCoach2D(ctx, L0_M / 2, -9, L0_M, 16, c.spaceColor, c.isLight);
        ctx.restore();

        // Dropped projection rays
        ctx.strokeStyle = c.invariantColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(xR_M, yR_M);
        ctx.lineTo(xR_M, oyM);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xF_M, yF_M);
        ctx.lineTo(xF_M, oyM);
        ctx.stroke();
        ctx.setLineDash([]);

        // Alice's Measured Coach on axis
        var projWM = xF_M - xR_M;
        drawCoach2D(ctx, (xR_M + xF_M) / 2, oyM - 1, projWM, 14, c.timeColor, c.isLight);

        // Lower Track: Comparison
        var trackYM = height * 0.82;
        drawLabelPill(ctx, 'Bob: 10.0m (Amber) vs Alice: ' + (10.0 * cosVal).toFixed(1) + 'm (Cyan)', width * 0.50, trackYM - 24, {
          textColor: c.axisLabel,
          font: '9.5px "JetBrains Mono"'
        });

        // Top track Bob 10m
        drawCoach2D(ctx, width * 0.30, trackYM, Math.min(width * 0.36, 110), 16, c.spaceColor, c.isLight);
        // Bottom track Alice contracted
        drawCoach2D(ctx, width * 0.72, trackYM, Math.min(width * 0.36, 110) * cosVal, 16, c.timeColor, c.isLight);
      }
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        angleDeg = parseFloat(e.target.value);
        for (var i = 0; i < chipButtons.length; i++) chipButtons[i].classList.remove('active');
        update();
      });
    }

    for (var i = 0; i < chipButtons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipButtons.length; j++) chipButtons[j].classList.remove('active');
          btn.classList.add('active');
          angleDeg = parseFloat(btn.getAttribute('data-deg'));
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
          var last = performance.now();
          var goingUp = true;
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - last) / 1000;
            last = now;
            if (goingUp) {
              angleDeg += dt * 25;
              if (angleDeg >= 80) goingUp = false;
            } else {
              angleDeg -= dt * 25;
              if (angleDeg <= 0) goingUp = true;
            }
            if (sliderSpeed) sliderSpeed.value = Math.round(angleDeg);
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

  // WIDGET 7: Mutual Relativity & Dual Frame Slicer
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
        if (readoutDualNote) readoutDualNote.innerText = 'Bob\'s 10.0 m coach appears shortened to ' + contracted + ' m.';
      } else {
        if (readoutFrameBadge) readoutFrameBadge.innerText = 'Bob\'s Frame';
        if (readoutFrameTitle) readoutFrameTitle.innerText = 'Bob at Rest';
        if (readoutFrameSub) readoutFrameSub.innerText = 'Bob\'s worldtube is vertical; his slice of Now is horizontal.';
        if (readoutDualNote) readoutDualNote.innerText = 'Alice\'s 10.0 m coach appears shortened to ' + contracted + ' m.';
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
      ctx.fillRect(ox - rW / 2, oy - scale * 0.9, rW, scale * 0.9);
      ctx.strokeRect(ox - rW / 2, oy - scale * 0.9, rW, scale * 0.9);

      drawLabelPill(ctx, primaryName + ' at Rest (L₀ = 10m)', ox, oy - scale * 0.95, { textColor: primaryColor });

      var secondaryColor = activeFrame === 'alice' ? c.spaceColor : c.timeColor;
      var secondaryName = activeFrame === 'alice' ? 'Bob' : 'Alice';
      var dirSign = activeFrame === 'alice' ? 1 : -1;

      var dxTop = dirSign * vFraction * (scale * 0.85);
      ctx.fillStyle = activeFrame === 'alice' ? 'rgba(234, 88, 12, 0.14)' : 'rgba(2, 132, 199, 0.12)';
      ctx.strokeStyle = secondaryColor; ctx.lineWidth = 2.0;

      ctx.beginPath();
      ctx.moveTo(ox - rW / 2, oy);
      ctx.lineTo(ox + rW / 2, oy);
      ctx.lineTo(ox + dxTop + rW / 2, oy - scale * 0.85);
      ctx.lineTo(ox + dxTop - rW / 2, oy - scale * 0.85);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      var measY = oy - scale * 0.45;
      ctx.strokeStyle = c.invariantColor; ctx.lineWidth = 1.8; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(ox - scale * 0.8, measY); ctx.lineTo(ox + scale * 0.8, measY); ctx.stroke();
      ctx.setLineDash([]);

      drawLabelPill(ctx, 'Observer\'s Slice of "Now"', ox + scale * 0.6, measY - 12, { textColor: primaryColor, font: '10px "JetBrains Mono"' });

      var measCenter = ox + dirSign * vFraction * (scale * 0.45);
      var contractedW = rW * widthFactor;
      ctx.strokeStyle = secondaryColor; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(measCenter - contractedW / 2, measY);
      ctx.lineTo(measCenter + contractedW / 2, measY);
      ctx.stroke();

      drawGlowingDot(ctx, measCenter - contractedW / 2, measY, secondaryColor, 4.5);
      drawGlowingDot(ctx, measCenter + contractedW / 2, measY, secondaryColor, 4.5);

      drawLabelPill(ctx, secondaryName + ' Measured = ' + (10 / gamma).toFixed(1) + 'm', measCenter, measY + 18, { textColor: secondaryColor });
    }

    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', function (e) {
        vFraction = parseFloat(e.target.value) / 1000;
        update();
      });
    }

    for (var f = 0; f < chipFrames.length; f++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipFrames.length; j++) chipFrames[j].classList.remove('active');
          btn.classList.add('active');
          activeFrame = btn.getAttribute('data-frame');
          update();
        });
      })(chipFrames[f]);
    }

    registerDraw(draw);
    window.addEventListener('resize', draw);
    update();
  }

  // WIDGET 8: The Muon's Cockpit
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

      drawGlowingDot(ctx, muonX, muonY, c.spaceColor, 8);

      var muonLabel = activeView === 'earth'
        ? 'Muon (Clock Ticking 22.4x Slower)'
        : 'Muon (Atmosphere Rushing Upward at 0.999c)';
      drawLabelPill(ctx, muonLabel, muonX, muonY - 18, { textColor: c.spaceColor });
    }

    if (sliderAltitude) {
      sliderAltitude.addEventListener('input', function (e) {
        descentProgress = parseFloat(e.target.value) / 1000;
        update();
      });
    }

    for (var v = 0; v < chipViews.length; v++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var j = 0; j < chipViews.length; j++) chipViews[j].classList.remove('active');
          btn.classList.add('active');
          activeView = btn.getAttribute('data-view');
          update();
        });
      })(chipViews[v]);
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<span>⏸</span><span>Pause</span>' : '<span>▶</span><span>Auto Play</span>';
        if (isPlaying) {
          var last = performance.now();
          function loop(now) {
            if (!isPlaying) return;
            var dt = (now - last) / 1000;
            last = now;
            descentProgress = (descentProgress + dt * 0.35) % 1.0;
            if (sliderAltitude) sliderAltitude.value = Math.round(descentProgress * 1000);
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

  function initAllPost03() {
    initWidgetLoafAlice('widget-loaf-alice');
    initWidgetLoafBob('widget-loaf-bob');
    initWidgetBeaconsBob('widget-beacons-bob');
    initWidgetBeaconsAlice('widget-beacons-alice');
    initWidgetSimultaneitySlice('widget-simultaneity-slice');
    initWidgetLengthContraction('widget-length-contraction');
    initWidgetDualFrame('widget-dual-frame');
    initWidgetMuonContraction('widget-muon-contraction');
  }

  sim.drawStickFigure2D = drawStickFigure2D;
  sim.drawStickFigure3D = drawStickFigure3D;
  sim.setup3DCameraController = setup3DCameraController;
  sim.initWidgetLoafAlice = initWidgetLoafAlice;
  sim.initWidgetLoafBob = initWidgetLoafBob;
  sim.initWidgetBeaconsBob = initWidgetBeaconsBob;
  sim.initWidgetBeaconsAlice = initWidgetBeaconsAlice;
  sim.initWidgetSimultaneitySlice = initWidgetSimultaneitySlice;
  sim.initWidgetLengthContraction = initWidgetLengthContraction;
  sim.initWidgetDualFrame = initWidgetDualFrame;
  sim.initWidgetMuonContraction = initWidgetMuonContraction;
  sim.initAllPost03 = initAllPost03;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPost03);
  } else {
    initAllPost03();
  }
})(window);
