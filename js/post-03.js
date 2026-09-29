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


  function initAllPost03() {
    initWidgetLoafAlice('widget-loaf-alice');
    initWidgetLoafBob('widget-loaf-bob');
    initWidgetSimultaneitySlice('widget-simultaneity-slice');
    initWidgetLengthContraction('widget-length-contraction');
    initWidgetDualFrame('widget-dual-frame');
    initWidgetMuonContraction('widget-muon-contraction');
  }

  sim.drawStickFigure3D = drawStickFigure3D;
  sim.initWidgetLoafAlice = initWidgetLoafAlice;
  sim.initWidgetLoafBob = initWidgetLoafBob;
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
