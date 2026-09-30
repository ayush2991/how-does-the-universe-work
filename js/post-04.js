/**
 * post-04.js - Part 1 Interactive Simulations: An Intuitive Guide To Entropy
 * Focuses on Surprise, Expected Value, and Maximum Chaos across Coins & Dice.
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

  // Helper: log2 calculation
  function log2(val) {
    if (val <= 0) return 0;
    return Math.log2 ? Math.log2(val) : Math.log(val) / Math.LN2;
  }

  // ==========================================================================
  // WIDGET 1: THE PREDICTABILITY SPECTRUM (CERTAIN COIN VS UNCERTAIN COIN)
  // ==========================================================================
  function initWidgetCertaintyCoin(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderP = container.querySelector('.slider-prob');
    var valProb = container.querySelector('.val-prob');
    var btnToss = container.querySelector('.btn-toss');
    var btnAuto = container.querySelector('.btn-auto-toss');
    var chips = container.querySelectorAll('.chip-prob');
    var readoutLast = container.querySelector('.readout-last-outcome');
    var readoutSurprise = container.querySelector('.readout-last-surprise');
    var readoutTossCount = container.querySelector('.readout-toss-count');

    var pHeads = 1.0; // Starts at guaranteed Heads (original article starting point)
    var tossHistory = []; // { outcome: 'H'|'T', p: number, surprise: number }
    var maxHistory = 24;
    var isAutoPlaying = false;
    var autoTimer = null;
    var coinSpinAngle = 0;
    var isSpinning = false;
    var spinAnimId = null;

    function calcSurprise(pVal) {
      if (pVal <= 0.0001) return 8.0; // capped for visualization
      if (pVal >= 0.9999) return 0.0;
      return -log2(pVal);
    }

    function doToss() {
      var rand = Math.random();
      var outcome = rand < pHeads ? 'H' : 'T';
      var prob = outcome === 'H' ? pHeads : (1 - pHeads);
      var surprise = calcSurprise(prob);

      tossHistory.unshift({
        outcome: outcome,
        prob: prob,
        surprise: surprise,
        timestamp: Date.now()
      });

      if (tossHistory.length > maxHistory) {
        tossHistory.pop();
      }

      if (readoutLast) {
        readoutLast.innerHTML = outcome === 'H' ?
          '<span style="color:var(--color-time); font-weight:700;">Heads (H)</span>' :
          '<span style="color:var(--color-space); font-weight:700;">Tails (T)</span>';
      }
      if (readoutSurprise) {
        readoutSurprise.innerText = surprise.toFixed(2) + ' bits';
      }
      if (readoutTossCount) {
        readoutTossCount.innerText = tossHistory.length + ' tosses shown';
      }

      // Quick coin spin animation
      isSpinning = true;
      var startTime = performance.now();
      function animateCoin(now) {
        var elapsed = (now - startTime) / 280;
        if (elapsed < 1) {
          coinSpinAngle = elapsed * Math.PI * 4;
          draw();
          spinAnimId = requestAnimationFrame(animateCoin);
        } else {
          coinSpinAngle = 0;
          isSpinning = false;
          draw();
        }
      }
      cancelAnimationFrame(spinAnimId);
      spinAnimId = requestAnimationFrame(animateCoin);

      draw();
    }

    function updateP(newP) {
      pHeads = Math.max(0, Math.min(1, newP));
      if (sliderP) sliderP.value = Math.round(pHeads * 100);
      if (valProb) valProb.innerText = (pHeads * 100).toFixed(0) + '% (' + pHeads.toFixed(2) + ')';

      chips.forEach(function (btn) {
        var targetVal = parseFloat(btn.getAttribute('data-p'));
        if (Math.abs(targetVal - pHeads) < 0.02) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      // Section 1: Left area - Interactive Coin Display & Meter
      var coinCenterX = Math.min(width * 0.28, 120);
      var coinCenterY = height * 0.44;
      var coinRadius = Math.min(44, height * 0.25);

      // Draw Coin with 3D elliptical compression if spinning
      ctx.save();
      ctx.translate(coinCenterX, coinCenterY);
      var scaleX = Math.cos(coinSpinAngle);
      ctx.scale(scaleX, 1);

      var isHeadsSide = Math.abs(scaleX) > 0.05 ? ((Math.cos(coinSpinAngle) >= 0) ? (tossHistory.length > 0 ? tossHistory[0].outcome === 'H' : true) : (tossHistory.length > 0 ? tossHistory[0].outcome === 'T' : false)) : true;
      var coinColor = isHeadsSide ? c.timeColor : c.spaceColor;

      // Outer coin rim
      ctx.fillStyle = coinColor;
      ctx.beginPath();
      ctx.arc(0, 0, coinRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner coin face
      ctx.fillStyle = c.isLight ? '#ffffff' : '#131720';
      ctx.beginPath();
      ctx.arc(0, 0, coinRadius - 4, 0, Math.PI * 2);
      ctx.fill();

      // Coin text
      ctx.fillStyle = coinColor;
      ctx.font = 'bold ' + Math.round(coinRadius * 0.8) + 'px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isHeadsSide ? 'H' : 'T', 0, 1);
      ctx.restore();

      // Label under coin
      drawLabelPill(ctx, (pHeads === 1.0 ? 'Certain H (p=1.0)' : (pHeads === 0.0 ? 'Certain T (p=0.0)' : 'p(H) = ' + pHeads.toFixed(2))), coinCenterX, height * 0.84, {
        textColor: c.axisLabel,
        bgColor: c.pillBg,
        borderColor: c.pillBorder,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      // Section 2: Right area - Toss history stream with surprise bar indicators
      var historyStartX = coinCenterX + coinRadius + 28;
      var historyWidth = width - historyStartX - 16;
      var laneY = Math.round(height * 0.38);

      ctx.save();
      // Axis track for stream
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(historyStartX, laneY);
      ctx.lineTo(width - 16, laneY);
      ctx.stroke();

      // Header for history stream
      ctx.fillStyle = c.subtleText;
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('CONSECUTIVE TOSSES & SURPRISE S(X)', historyStartX, 22);

      // Render each toss in history
      var spacing = Math.max(26, Math.min(38, historyWidth / (tossHistory.length || 1)));
      for (var i = 0; i < tossHistory.length; i++) {
        var item = tossHistory[i];
        var itemX = historyStartX + i * spacing + 14;
        if (itemX > width - 14) break;

        var isH = item.outcome === 'H';
        var itemColor = isH ? c.timeColor : c.spaceColor;

        // Draw outcome badge circle
        ctx.fillStyle = itemColor;
        ctx.beginPath();
        ctx.arc(itemX, laneY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.outcome, itemX, laneY);

        // Surprise spike bar below
        var maxSpikeH = height - (laneY + 16) - 24;
        var barH = Math.min(maxSpikeH, item.surprise * 12);
        if (barH > 1) {
          ctx.fillStyle = item.surprise > 2.5 ? c.dangerColor : (isH ? c.timeColor : c.spaceColor);
          ctx.fillRect(itemX - 3, laneY + 16, 6, barH);
        }

        // Surprise value text
        ctx.fillStyle = c.subtleText;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(item.surprise.toFixed(1), itemX, laneY + 16 + barH + 11);
      }

      if (tossHistory.length === 0) {
        ctx.fillStyle = c.subtleText;
        ctx.font = 'italic 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Click "Flip Coin" or "Auto Flip" to generate tosses...', historyStartX, laneY + 5);
      }
      ctx.restore();
    }

    if (sliderP) {
      sliderP.addEventListener('input', function () {
        updateP(parseInt(sliderP.value, 10) / 100);
      });
    }

    chips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pVal = parseFloat(btn.getAttribute('data-p'));
        updateP(pVal);
      });
    });

    if (btnToss) {
      btnToss.addEventListener('click', function () {
        doToss();
      });
    }

    if (btnAuto) {
      btnAuto.addEventListener('click', function () {
        isAutoPlaying = !isAutoPlaying;
        if (isAutoPlaying) {
          btnAuto.classList.add('active');
          btnAuto.innerHTML = '<span>⏸</span><span>Pause</span>';
          autoTimer = setInterval(doToss, 350);
        } else {
          btnAuto.classList.remove('active');
          btnAuto.innerHTML = '<span>▶</span><span>Auto Flip</span>';
          clearInterval(autoTimer);
        }
      });
    }

    // Initial setup with a pre-populated history of certain heads to match the article opener
    for (var k = 0; k < 6; k++) {
      tossHistory.push({ outcome: 'H', prob: 1.0, surprise: 0.0, timestamp: Date.now() });
    }
    updateP(1.0);
    registerDraw(draw);
    window.addEventListener('resize', draw);
  }

  // ==========================================================================
  // WIDGET 2: QUANTIFYING SURPRISE — THE S(p) = log(1/p) CURVE
  // ==========================================================================
  function initWidgetSurpriseCurve(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderP = container.querySelector('.slider-prob');
    var valProb = container.querySelector('.val-prob');
    var readoutSh = container.querySelector('.readout-surprise-heads');
    var readoutSt = container.querySelector('.readout-surprise-tails');
    var chips = container.querySelectorAll('.chip-prob');

    var pCurrent = 0.80; // Default sample probability

    function updateP(newP) {
      pCurrent = Math.max(0.01, Math.min(0.99, newP));
      if (sliderP) sliderP.value = Math.round(pCurrent * 100);
      if (valProb) valProb.innerText = pCurrent.toFixed(2);

      var sh = -log2(pCurrent);
      var st = -log2(1 - pCurrent);

      if (readoutSh) readoutSh.innerText = sh.toFixed(2) + ' bits';
      if (readoutSt) readoutSt.innerText = st.toFixed(2) + ' bits';

      chips.forEach(function (btn) {
        var targetVal = parseFloat(btn.getAttribute('data-p'));
        if (Math.abs(targetVal - pCurrent) < 0.03) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var padLeft = 56;
      var padRight = 36;
      var padTop = 32;
      var padBottom = 48;

      var ox = padLeft;
      var oy = height - padBottom;
      var plotW = width - padLeft - padRight;
      var plotH = height - padTop - padBottom;

      // Coordinate scaling
      // X axis: Probability p from 0 to 1
      // Y axis: Surprise S(p) = -log2(p) from 0 to 5 bits (capped visually at 5)
      var maxBits = 5.0;

      function mapX(p) { return ox + p * plotW; }
      function mapY(s) { return oy - (s / maxBits) * plotH; }

      // Grid & Axes
      drawGrid(ctx, ox, oy, width, height, 40);

      // Horizontal dashed guide at S = 0, 1, 2, 3, 4 bits
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1;
      ctx.fillStyle = c.subtleText;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (var b = 0; b <= maxBits; b += 1) {
        var yPos = mapY(b);
        ctx.beginPath();
        ctx.moveTo(ox, yPos);
        ctx.lineTo(ox + plotW, yPos);
        ctx.stroke();
        ctx.fillText(b.toFixed(1) + ' bits', ox - 8, yPos);
      }

      // X ticks
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      var xTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
      for (var t = 0; t < xTicks.length; t++) {
        var xVal = xTicks[t];
        var xPos = mapX(xVal);
        ctx.fillText(xVal.toFixed(1), xPos, oy + 8);
      }

      drawAxes(ctx, ox, oy, width, height, 'Probability p', 'Surprise S(p) = log₂(1/p)');

      // Plot Theoretical Surprise Curve S(p) = -log2(p)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      var first = true;
      for (var px = 0.02; px <= 1.0001; px += 0.01) {
        var sVal = -log2(px);
        var clampedS = Math.min(maxBits + 0.5, sVal);
        var sx = mapX(px);
        var sy = mapY(clampedS);
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();

      // Highlighting current Heads point
      var sh = -log2(pCurrent);
      var ptHx = mapX(pCurrent);
      var ptHy = mapY(Math.min(maxBits, sh));

      // Dashed drop lines for Heads
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ptHx, oy);
      ctx.lineTo(ptHx, ptHy);
      ctx.lineTo(ox, ptHy);
      ctx.stroke();
      ctx.setLineDash([]);

      drawGlowingDot(ctx, ptHx, ptHy, c.timeColor, 5.5);

      // Pill label for Heads surprise - clamped within bounds
      var headLabelX = ptHx > width - 130 ? ptHx - 70 : Math.max(ox + 65, ptHx + 12);
      var headLabelY = Math.max(padTop + 14, Math.min(oy - 20, ptHy - 12));
      drawLabelPill(ctx, 'Heads: S(H) = ' + sh.toFixed(2) + ' bits', headLabelX, headLabelY, {
        textColor: c.timeColor,
        bgColor: c.pillBg,
        borderColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      // Highlighting current Tails point (1 - pCurrent)
      var q = 1 - pCurrent;
      var st = -log2(q);
      var ptTx = mapX(q);
      var ptTy = mapY(Math.min(maxBits, st));

      // Dashed drop lines for Tails
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = c.spaceColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ptTx, oy);
      ctx.lineTo(ptTx, ptTy);
      ctx.lineTo(ox, ptTy);
      ctx.stroke();
      ctx.setLineDash([]);

      drawGlowingDot(ctx, ptTx, ptTy, c.spaceColor, 5.5);

      // Pill label for Tails surprise - clamped within bounds
      var tailLabelX = ptTx > width - 130 ? ptTx - 70 : Math.max(ox + 65, ptTx + 12);
      var tailLabelY = Math.max(padTop + 14, Math.min(oy - 20, Math.abs(ptHx - ptTx) < 40 ? ptHy + 22 : ptTy + 12));
      drawLabelPill(ctx, 'Tails: S(T) = ' + st.toFixed(2) + ' bits', tailLabelX, tailLabelY, {
        textColor: c.spaceColor,
        bgColor: c.pillBg,
        borderColor: c.spaceColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    if (sliderP) {
      sliderP.addEventListener('input', function () {
        updateP(parseInt(sliderP.value, 10) / 100);
      });
    }

    chips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pVal = parseFloat(btn.getAttribute('data-p'));
        updateP(pVal);
      });
    });

    updateP(0.80);
    registerDraw(draw);
    window.addEventListener('resize', draw);
  }

  // ==========================================================================
  // WIDGET 3: EXPECTED SURPRISE & THE ENTROPY ARC (MAXIMUM CHAOS AT p = 0.5)
  // ==========================================================================
  function initWidgetExpectedEntropy(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var sliderP = container.querySelector('.slider-prob');
    var valProb = container.querySelector('.val-prob');
    var readoutEntropy = container.querySelector('.readout-entropy');
    var readoutStatus = container.querySelector('.readout-status');
    var btnPlay = container.querySelector('.btn-play');
    var chips = container.querySelectorAll('.chip-prob');

    var pVal = 0.50; // Starts at peak chaos p = 0.50
    var isPlaying = false;
    var animDir = 1;
    var animSpeed = 0.004;

    function calcBinaryEntropy(p) {
      if (p <= 0.00001 || p >= 0.99999) return 0;
      var q = 1 - p;
      return -(p * log2(p) + q * log2(q));
    }

    function updateP(newP) {
      pVal = Math.max(0, Math.min(1, newP));
      if (sliderP) sliderP.value = Math.round(pVal * 100);
      if (valProb) valProb.innerText = pVal.toFixed(2);

      var H = calcBinaryEntropy(pVal);
      if (readoutEntropy) readoutEntropy.innerText = H.toFixed(3) + ' bits';

      if (readoutStatus) {
        if (Math.abs(pVal - 0.5) < 0.04) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-time);">Maximum Uncertainty (Fair Odds)</strong>';
        } else if (pVal <= 0.05 || pVal >= 0.95) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-emerald);">Low Uncertainty (Predictable)</strong>';
        } else {
          readoutStatus.innerHTML = '<strong style="color:var(--text-secondary);">Moderate Uncertainty</strong>';
        }
      }

      chips.forEach(function (btn) {
        var targetVal = parseFloat(btn.getAttribute('data-p'));
        if (Math.abs(targetVal - pVal) < 0.03) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      draw();
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var padLeft = 56;
      var padRight = 36;
      var padTop = 36;
      var padBottom = 48;

      var ox = padLeft;
      var oy = height - padBottom;
      var plotW = width - padLeft - padRight;
      var plotH = height - padTop - padBottom;

      // X maps p in [0, 1]
      // Y maps H in [0, 1.2] bits
      var maxH = 1.2;

      function mapX(p) { return ox + p * plotW; }
      function mapY(h) { return oy - (h / maxH) * plotH; }

      drawGrid(ctx, ox, oy, width, height, 40);

      // Y-axis guide lines for 0.0, 0.5, 1.0 bits
      ctx.strokeStyle = c.gridLine;
      ctx.fillStyle = c.subtleText;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      var hTicks = [0.0, 0.25, 0.5, 0.75, 1.0];
      for (var i = 0; i < hTicks.length; i++) {
        var hVal = hTicks[i];
        var yCoord = mapY(hVal);
        ctx.beginPath();
        ctx.moveTo(ox, yCoord);
        ctx.lineTo(ox + plotW, yCoord);
        ctx.stroke();
        ctx.fillText(hVal.toFixed(2) + ' bits', ox - 8, yCoord);
      }

      // Peak Highlight line at H = 1.0 bit
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, mapY(1.0));
      ctx.lineTo(ox + plotW, mapY(1.0));
      ctx.stroke();
      ctx.restore();

      // X-ticks for p
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      var pTicks = [0.0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0];
      for (var j = 0; j < pTicks.length; j++) {
        var pCoord = pTicks[j];
        var xCoord = mapX(pCoord);
        ctx.fillText(pCoord.toFixed(1) + (pCoord === 0.5 ? ' (Fair)' : ''), xCoord, oy + 8);
      }

      drawAxes(ctx, ox, oy, width, height, 'Probability of Heads (p)', 'Entropy H(X) = E[S(X)]');

      // Fill area under entropy curve
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mapX(0), oy);
      for (var step = 0; step <= 100; step++) {
        var px = step / 100;
        var hx = calcBinaryEntropy(px);
        ctx.lineTo(mapX(px), mapY(hx));
      }
      ctx.lineTo(mapX(1), oy);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, mapY(1.0), 0, oy);
      grad.addColorStop(0, c.isLight ? 'rgba(9, 105, 218, 0.18)' : 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Draw the inverted Entropy curve
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (var s = 0; s <= 100; s++) {
        var currP = s / 100;
        var currH = calcBinaryEntropy(currP);
        if (s === 0) ctx.moveTo(mapX(currP), mapY(currH));
        else ctx.lineTo(mapX(currP), mapY(currH));
      }
      ctx.stroke();

      // Highlight the current chosen p position
      var currentH = calcBinaryEntropy(pVal);
      var curX = mapX(pVal);
      var curY = mapY(currentH);

      // Dashed vertical guide to x-axis
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(curX, oy);
      ctx.lineTo(curX, curY);
      ctx.stroke();
      ctx.restore();

      // Glowing Tracer on curve
      drawGlowingDot(ctx, curX, curY, pVal === 0.5 ? c.dangerColor : c.invariantColor, 6);

      // Label Pill over tracer
      var labelText = 'p = ' + pVal.toFixed(2) + ' → H = ' + currentH.toFixed(2) + ' bits';
      var pillX = Math.min(width - 80, Math.max(ox + 80, curX));
      var pillY = curY - 18;
      drawLabelPill(ctx, labelText, pillX, pillY, {
        textColor: pVal === 0.5 ? c.dangerColor : c.axisLabel,
        bgColor: c.pillBg,
        borderColor: pVal === 0.5 ? c.dangerColor : c.pillBorder,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    if (sliderP) {
      sliderP.addEventListener('input', function () {
        updateP(parseInt(sliderP.value, 10) / 100);
      });
    }

    chips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pTarget = parseFloat(btn.getAttribute('data-p'));
        updateP(pTarget);
      });
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        isPlaying = !isPlaying;
        if (isPlaying) {
          btnPlay.innerHTML = '<span>⏸</span><span>Pause</span>';
          btnPlay.classList.add('active');
          var lastTime = performance.now();
          function tick(now) {
            if (!isPlaying) return;
            var dt = (now - lastTime) / 1000;
            lastTime = now;
            var nextP = pVal + animDir * animSpeed * (dt * 60);
            if (nextP >= 1.0) {
              nextP = 1.0;
              animDir = -1;
            } else if (nextP <= 0.0) {
              nextP = 0.0;
              animDir = 1;
            }
            updateP(nextP);
            requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        } else {
          btnPlay.innerHTML = '<span>▶</span><span>Auto Sweep</span>';
          btnPlay.classList.remove('active');
        }
      });
    }

    updateP(0.50);
    registerDraw(draw);
    window.addEventListener('resize', draw);
  }

  // ==========================================================================
  // WIDGET 4: HOUSEHOLD ENTROPY (THE LOST BOOK / OMELETTE PAN ACROSS 4 ROOMS)
  // ==========================================================================
  function initWidgetHouseholdChaos(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var btnItemToggles = container.querySelectorAll('.btn-item-toggle');
    var btnRoomPresets = container.querySelectorAll('.btn-room-preset');
    var readoutHBits = container.querySelector('.readout-household-entropy');
    var readoutHNats = container.querySelector('.readout-household-nats');
    var readoutStatus = container.querySelector('.readout-household-status');
    var sliderList = container.querySelector('.sliders-outcome-list');

    var currentItem = 'book'; // 'book' or 'pan'

    var locations = [
      { id: 'bookshelf', name: 'Bookshelf', icon: '📚', color: '#0969da', p: 0.25 },
      { id: 'sofa',      name: 'Under Sofa',icon: '🛋️', color: '#d95d18', p: 0.25 },
      { id: 'kitchen',   name: 'Kitchen',   icon: '🍳', color: '#0f766e', p: 0.25 },
      { id: 'bathroom',  name: 'Bathroom',  icon: '🚿', color: '#6e40c9', p: 0.25 }
    ];

    function calcTotalEntropyBits() {
      var total = 0;
      for (var i = 0; i < locations.length; i++) {
        var p = locations[i].p;
        if (p > 0.00001) total += -p * log2(p);
      }
      return total;
    }

    function calcTotalEntropyNats() {
      var total = 0;
      for (var i = 0; i < locations.length; i++) {
        var p = locations[i].p;
        if (p > 0.00001) total += -p * Math.log(p);
      }
      return total;
    }

    function normalize(changedIndex, newVal) {
      newVal = Math.max(0.001, Math.min(0.999, newVal));
      locations[changedIndex].p = newVal;

      var otherSum = 0;
      for (var i = 0; i < locations.length; i++) {
        if (i !== changedIndex) otherSum += locations[i].p;
      }

      var remaining = 1.0 - newVal;
      if (otherSum <= 0.0001) {
        var share = remaining / (locations.length - 1);
        for (var j = 0; j < locations.length; j++) {
          if (j !== changedIndex) locations[j].p = share;
        }
      } else {
        var scale = remaining / otherSum;
        for (var k = 0; k < locations.length; k++) {
          if (k !== changedIndex) locations[k].p *= scale;
        }
      }
      renderSliders();
      draw();
    }

    function setProbabilities(pArr) {
      for (var i = 0; i < locations.length; i++) {
        locations[i].p = pArr[i];
      }
      renderSliders();
      draw();
    }

    function renderSliders() {
      if (!sliderList) return;
      sliderList.innerHTML = '';

      var hBits = calcTotalEntropyBits();
      var hNats = calcTotalEntropyNats();

      if (readoutHBits) readoutHBits.innerText = hBits.toFixed(3) + ' bits';
      if (readoutHNats) readoutHNats.innerText = hNats.toFixed(3) + ' nats';

      if (readoutStatus) {
        if (Math.abs(hBits - 2.0) < 0.02) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-time);">Maximum Uncertainty (Uniform distribution)</strong>';
        } else if (hBits < 0.05) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-emerald);">Zero Uncertainty (Certain location)</strong>';
        } else if (hBits < 0.6) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-time);">Low Uncertainty (Orderly)</strong>';
        } else {
          readoutStatus.innerHTML = '<strong style="color:var(--text-secondary);">Moderate Uncertainty</strong>';
        }
      }

      for (var i = 0; i < locations.length; i++) {
        (function (idx) {
          var loc = locations[idx];
          var p = loc.p;
          var s = p > 0 ? -log2(p) : 0;

          var row = document.createElement('div');
          row.className = 'household-room-row';

          var label = document.createElement('span');
          label.className = 'household-room-label';
          label.innerHTML = '<span>' + loc.icon + '</span><span>' + loc.name + '</span>';

          var slider = document.createElement('input');
          slider.type = 'range';
          slider.className = 'range-slider household-room-slider';
          slider.min = '1';
          slider.max = '99';
          slider.value = Math.round(p * 100);

          var valBadge = document.createElement('span');
          valBadge.className = 'household-room-val';
          valBadge.innerText = (p * 100).toFixed(1) + '%';

          slider.addEventListener('input', function () {
            normalize(idx, parseInt(slider.value, 10) / 100);
          });

          row.appendChild(label);
          row.appendChild(slider);
          row.appendChild(valBadge);
          sliderList.appendChild(row);
        })(i);
      }
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var padLeft = 48;
      var padRight = 24;
      var padTop = 32;
      var padBottom = 48;

      var ox = padLeft;
      var oy = height - padBottom;
      var plotW = width - padLeft - padRight;
      var plotH = height - padTop - padBottom;

      drawGrid(ctx, ox, oy, width, height, 36);
      drawAxes(ctx, ox, oy, width, height, 'Household Location Bays', 'Probability of Finding ' + (currentItem === 'book' ? 'Book' : 'Pan'));

      var numBays = locations.length;
      var slotW = plotW / numBays;
      var barW = Math.min(68, slotW * 0.65);

      for (var i = 0; i < numBays; i++) {
        var loc = locations[i];
        var p = loc.p;
        var s = p > 0 ? -log2(p) : 0;
        var contribution = p * s;

        var barCenterX = ox + i * slotW + slotW / 2;
        var barLeftX = barCenterX - barW / 2;
        var barHeight = p * plotH;
        var barY = oy - barHeight;

        // Draw Room Pillar Background track
        ctx.fillStyle = c.isLight ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(barLeftX - 4, padTop, barW + 8, plotH);

        // Draw Probability Bar
        ctx.fillStyle = loc.color;
        ctx.fillRect(barLeftX, barY, barW, barHeight);

        // Draw Object Icon floating on top of bar
        var iconY = Math.max(padTop + 14, barY - 12);
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentItem === 'book' ? '📖' : '🍳', barCenterX, iconY);

        // Percentage label above icon
        ctx.fillStyle = c.axisLabel;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textBaseline = 'bottom';
        ctx.fillText((p * 100).toFixed(0) + '%', barCenterX, iconY - 12);

        // Location icon & label below axis
        ctx.textBaseline = 'top';
        ctx.font = '12px sans-serif';
        ctx.fillText(loc.icon, barCenterX, oy + 6);
        ctx.fillStyle = c.subtleText;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(loc.name, barCenterX, oy + 22);

        // Surprise callout inside bar if tall enough
        if (barHeight > 38) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textBaseline = 'middle';
          ctx.fillText('S=' + s.toFixed(1) + 'b', barCenterX, barY + 14);
          ctx.fillText('pS=' + contribution.toFixed(2), barCenterX, barY + 26);
        }
      }

      // Banner Pill at top
      var hBits = calcTotalEntropyBits();
      var hNats = calcTotalEntropyNats();
      var isPeak = Math.abs(hBits - 2.0) < 0.02;

      var bannerText = 'H = ' + hBits.toFixed(2) + ' bits (' + hNats.toFixed(2) + ' nats)' + (isPeak ? ' · Uniform maximum' : (hBits < 0.05 ? ' · Certain' : ''));
      drawLabelPill(ctx, bannerText, width / 2, 16, {
        textColor: isPeak ? c.timeColor : (hBits < 0.05 ? c.emeraldColor || '#0f766e' : c.axisLabel),
        bgColor: c.pillBg,
        borderColor: isPeak ? c.timeColor : c.pillBorder,
        font: 'bold 11px "JetBrains Mono", monospace'
      });
    }

    btnItemToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btnItemToggles.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentItem = btn.getAttribute('data-item');
        draw();
      });
    });

    btnRoomPresets.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btnRoomPresets.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var preset = btn.getAttribute('data-preset');
        if (preset === 'chaotic') {
          setProbabilities([0.25, 0.25, 0.25, 0.25]);
        } else if (preset === 'orderly') {
          setProbabilities([0.94, 0.02, 0.02, 0.02]);
        } else if (preset === 'sofa') {
          setProbabilities([0.0001, 0.9997, 0.0001, 0.0001]);
        }
      });
    });

    setProbabilities([0.25, 0.25, 0.25, 0.25]);
    registerDraw(draw);
    window.addEventListener('resize', draw);
  }

  // ==========================================================================
  // INITIALIZE ALL POST-04 WIDGETS
  // ==========================================================================
  function initAllPost04() {
    initWidgetCertaintyCoin('widget-certainty-coin');
    initWidgetSurpriseCurve('widget-surprise-curve');
    initWidgetExpectedEntropy('widget-expected-entropy');
    initWidgetHouseholdChaos('widget-household-chaos');
  }

  sim.initAllPost04 = initAllPost04;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPost04);
  } else {
    initAllPost04();
  }

})(window);
