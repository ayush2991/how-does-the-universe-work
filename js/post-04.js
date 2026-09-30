/**
 * post-04.js - Part 1 Interactive Simulations: An Intuitive Guide To Entropy
 * Focuses on Surprise, Expected Value, and Maximum Chaos formulated in Nats (ln).
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

  // Natural logarithm helper for nats
  function natLog(val) {
    if (val <= 0.000001) return 0;
    return Math.log(val);
  }

  // ==========================================================================
  // WIDGET 1: CERTAINTY BASELINE & SURPRISE (COIN TOSS)
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

    var pHeads = 1.0; // Starts at guaranteed Heads
    var tossHistory = []; // { outcome: 'H'|'T', prob: number, surprise: number }
    var maxHistory = 24;
    var isAutoPlaying = false;
    var autoTimer = null;
    var coinSpinAngle = 0;
    var isSpinning = false;
    var spinAnimId = null;

    function calcSurprise(pVal) {
      if (pVal <= 0.0001) return 5.5; // capped for visualization
      if (pVal >= 0.9999) return 0.0;
      return -Math.log(pVal);
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
        readoutSurprise.innerText = surprise.toFixed(3) + ' nats';
      }
      if (readoutTossCount) {
        readoutTossCount.innerText = tossHistory.length + ' tosses shown';
      }

      // Coin spin animation
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
      drawLabelPill(ctx, (pHeads === 1.0 ? 'Certain H (p=1.0)' : (pHeads === 0.0 ? 'Certain T (p=0.0)' : 'Pr(H) = ' + pHeads.toFixed(2))), coinCenterX, height * 0.84, {
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
      ctx.fillText('CONSECUTIVE TOSSES & SURPRISE S(X) [nats]', historyStartX, 22);

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
        var barH = Math.min(maxSpikeH, item.surprise * 18);
        if (barH > 1) {
          ctx.fillStyle = item.surprise > 1.8 ? c.dangerColor : (isH ? c.timeColor : c.spaceColor);
          ctx.fillRect(itemX - 3, laneY + 16, 6, barH);
        }

        // Surprise value text in nats
        ctx.fillStyle = c.subtleText;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(item.surprise.toFixed(2), itemX, laneY + 16 + barH + 11);
      }

      if (tossHistory.length === 0) {
        ctx.fillStyle = c.subtleText;
        ctx.font = 'italic 12px "Newsreader", serif';
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

    // Initial setup with pre-populated history of certain heads
    for (var k = 0; k < 6; k++) {
      tossHistory.push({ outcome: 'H', prob: 1.0, surprise: 0.0, timestamp: Date.now() });
    }
    updateP(1.0);
    registerDraw(draw);
    window.addEventListener('resize', draw);
  }

  // ==========================================================================
  // WIDGET 2: QUANTIFYING SURPRISE — THE S(p) = ln(1/p) CURVE IN NATS
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

      var sh = -Math.log(pCurrent);
      var st = -Math.log(1 - pCurrent);

      if (readoutSh) readoutSh.innerText = sh.toFixed(3) + ' nats';
      if (readoutSt) readoutSt.innerText = st.toFixed(3) + ' nats';

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

      // Coordinate scaling in Nats
      // X axis: Probability p from 0 to 1
      // Y axis: Surprise S(p) = -ln(p) from 0 to 3.5 nats
      var maxNats = 3.5;

      function mapX(p) { return ox + p * plotW; }
      function mapY(s) { return oy - (s / maxNats) * plotH; }

      // Grid & Axes
      drawGrid(ctx, ox, oy, width, height, 40);

      // Horizontal dashed guides at S = 0, 1, 2, 3 nats
      ctx.strokeStyle = c.gridLine;
      ctx.lineWidth = 1;
      ctx.fillStyle = c.subtleText;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (var b = 0; b <= 3.0; b += 1.0) {
        var yPos = mapY(b);
        ctx.beginPath();
        ctx.moveTo(ox, yPos);
        ctx.lineTo(ox + plotW, yPos);
        ctx.stroke();
        ctx.fillText(b.toFixed(1) + ' nats', ox - 8, yPos);
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

      drawAxes(ctx, ox, oy, width, height, 'Probability p', 'Surprise S(p) = ln(1/p) [nats]');

      // Plot Theoretical Surprise Curve S(p) = -ln(p)
      ctx.strokeStyle = c.timeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      var first = true;
      for (var px = 0.03; px <= 1.0001; px += 0.01) {
        var sVal = -Math.log(px);
        var clampedS = Math.min(maxNats + 0.5, sVal);
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
      var sh = -Math.log(pCurrent);
      var ptHx = mapX(pCurrent);
      var ptHy = mapY(Math.min(maxNats, sh));

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

      // Pill label for Heads surprise
      var headLabelX = ptHx > width - 140 ? ptHx - 80 : Math.max(ox + 75, ptHx + 12);
      var headLabelY = Math.max(padTop + 14, Math.min(oy - 20, ptHy - 12));
      drawLabelPill(ctx, 'Heads: S(H) = ' + sh.toFixed(2) + ' nats', headLabelX, headLabelY, {
        textColor: c.timeColor,
        bgColor: c.pillBg,
        borderColor: c.timeColor,
        font: 'bold 11px "JetBrains Mono", monospace'
      });

      // Highlighting current Tails point
      var q = 1 - pCurrent;
      var st = -Math.log(q);
      var ptTx = mapX(q);
      var ptTy = mapY(Math.min(maxNats, st));

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

      // Pill label for Tails surprise
      var tailLabelX = ptTx > width - 140 ? ptTx - 80 : Math.max(ox + 75, ptTx + 12);
      var tailLabelY = Math.max(padTop + 14, Math.min(oy - 20, Math.abs(ptHx - ptTx) < 40 ? ptHy + 22 : ptTy + 12));
      drawLabelPill(ctx, 'Tails: S(T) = ' + st.toFixed(2) + ' nats', tailLabelX, tailLabelY, {
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
  // WIDGET 3: EXPECTED SURPRISE & BINARY ENTROPY ARC IN NATS
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
      return -(p * Math.log(p) + q * Math.log(q));
    }

    function updateP(newP) {
      pVal = Math.max(0, Math.min(1, newP));
      if (sliderP) sliderP.value = Math.round(pVal * 100);
      if (valProb) valProb.innerText = pVal.toFixed(2);

      var H = calcBinaryEntropy(pVal);
      if (readoutEntropy) readoutEntropy.innerText = H.toFixed(3) + ' nats';

      if (readoutStatus) {
        if (Math.abs(pVal - 0.5) < 0.04) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-time);">Maximum Uncertainty (Fair Odds: ln 2 ≈ 0.693 nats)</strong>';
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
      // Y maps H in [0, 0.85] nats (peak is ln 2 ≈ 0.693)
      var maxH = 0.85;

      function mapX(p) { return ox + p * plotW; }
      function mapY(h) { return oy - (h / maxH) * plotH; }

      drawGrid(ctx, ox, oy, width, height, 40);

      // Y-axis guide lines for 0.0, 0.2, 0.4, 0.6, 0.693 nats
      ctx.strokeStyle = c.gridLine;
      ctx.fillStyle = c.subtleText;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      var hTicks = [0.0, 0.2, 0.4, 0.6];
      for (var i = 0; i < hTicks.length; i++) {
        var hVal = hTicks[i];
        var yCoord = mapY(hVal);
        ctx.beginPath();
        ctx.moveTo(ox, yCoord);
        ctx.lineTo(ox + plotW, yCoord);
        ctx.stroke();
        ctx.fillText(hVal.toFixed(1) + ' nats', ox - 8, yCoord);
      }

      // Peak Highlight line at H = ln(2) ≈ 0.693 nats
      var peakVal = Math.log(2);
      ctx.save();
      ctx.strokeStyle = 'rgba(9, 105, 218, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, mapY(peakVal));
      ctx.lineTo(ox + plotW, mapY(peakVal));
      ctx.stroke();
      ctx.fillStyle = c.timeColor;
      ctx.fillText('ln(2) ≈ 0.693 nats', ox + plotW - 4, mapY(peakVal) - 8);
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

      drawAxes(ctx, ox, oy, width, height, 'Probability of Heads (p)', 'Entropy H(p) = E[S(X)] [nats]');

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
      var grad = ctx.createLinearGradient(0, mapY(peakVal), 0, oy);
      grad.addColorStop(0, c.isLight ? 'rgba(9, 105, 218, 0.18)' : 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Draw the Entropy curve
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

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = c.axisLine;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(curX, oy);
      ctx.lineTo(curX, curY);
      ctx.stroke();
      ctx.restore();

      drawGlowingDot(ctx, curX, curY, pVal === 0.5 ? c.dangerColor : c.invariantColor, 6);

      var labelText = 'p = ' + pVal.toFixed(2) + ' → H = ' + currentH.toFixed(3) + ' nats';
      var pillX = Math.min(width - 90, Math.max(ox + 90, curX));
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
  // WIDGET 4: MULTI-STATE SYSTEM & HOUSEHOLD LOCATIONS IN NATS
  // ==========================================================================
  function initWidgetHouseholdChaos(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = container.querySelector('canvas');
    var btnItemToggles = container.querySelectorAll('.btn-item-toggle');
    var btnRoomPresets = container.querySelectorAll('.btn-room-preset');
    var readoutH = container.querySelector('.readout-household-entropy');
    var readoutMaxH = container.querySelector('.readout-max-household-entropy');
    var readoutStatus = container.querySelector('.readout-household-status');
    var readoutDecomp = container.querySelector('.readout-decomposition-formula');
    var sliderList = container.querySelector('.household-sliders-list');

    var currentItem = 'book'; // 'book' or 'pan'

    var locations = [
      { id: 'bookshelf', name: 'Bookshelf',  code: 'S1', color: '#0969da', p: 0.25 },
      { id: 'sofa',      name: 'Under Sofa', code: 'S2', color: '#d95d18', p: 0.25 },
      { id: 'kitchen',   name: 'Kitchen',    code: 'S3', color: '#0f766e', p: 0.25 },
      { id: 'bathroom',  name: 'Bathroom',   code: 'S4', color: '#6e40c9', p: 0.25 }
    ];

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
      var hNats = calcTotalEntropyNats();
      var maxNats = Math.log(4); // ln(4) ≈ 1.386 nats

      if (readoutH) readoutH.innerText = hNats.toFixed(3) + ' nats';
      if (readoutMaxH) readoutMaxH.innerText = maxNats.toFixed(3) + ' nats';

      if (readoutStatus) {
        if (Math.abs(hNats - maxNats) < 0.02) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-time);">Uniform distribution maximizes entropy across the house (ln 4 ≈ 1.386 nats)</strong>';
        } else if (hNats < 0.05) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-emerald);">Zero Uncertainty (Certain location: H ≈ 0 nats)</strong>';
        } else if (hNats < 0.45) {
          readoutStatus.innerHTML = '<strong style="color:var(--color-time);">Low Uncertainty (Orderly environment)</strong>';
        } else {
          readoutStatus.innerHTML = '<strong style="color:var(--text-secondary);">Moderate Uncertainty (Dispersed search)</strong>';
        }
      }

      // Render Dynamic Component Breakdown Summation
      if (readoutDecomp) {
        var terms = [];
        var termSums = [];
        for (var t = 0; t < locations.length; t++) {
          var locItem = locations[t];
          var pVal = locItem.p;
          var sVal = pVal > 0.00001 ? -Math.log(pVal) : 0;
          var contrib = pVal * sVal;
          termSums.push(contrib);

          terms.push(
            '<span style="color:' + locItem.color + '; font-weight:600;" title="' + locItem.name + ' (' + locItem.code + '): p=' + pVal.toFixed(2) + ', S=' + sVal.toFixed(2) + ' nats">' +
            '(' + pVal.toFixed(2) + '×' + sVal.toFixed(2) + ')' +
            '</span>'
          );
        }

        var sumParts = termSums.map(function (v, idx) {
          return '<span style="color:' + locations[idx].color + '; font-weight:600;">' + v.toFixed(3) + '</span>';
        });

        readoutDecomp.innerHTML =
          '<div><em>H</em>(<em>X</em>) = ' + terms.join(' + ') + '</div>' +
          '<div style="margin-top: 0.25rem;">= ' + sumParts.join(' + ') + ' = <strong style="color:var(--color-time);">' + hNats.toFixed(3) + ' nats</strong></div>';
      }

      if (!sliderList) return;
      sliderList.innerHTML = '';

      for (var i = 0; i < locations.length; i++) {
        (function (idx) {
          var loc = locations[idx];
          var p = loc.p;
          var s = p > 0.00001 ? -Math.log(p) : 0;
          var contribution = p * s;

          var row = document.createElement('div');
          row.className = 'household-room-row';
          row.style.display = 'flex';
          row.style.alignItems = 'center';
          row.style.gap = '0.75rem';
          row.style.margin = '0.45rem 0';

          var label = document.createElement('span');
          label.className = 'household-room-label';
          label.style.minWidth = '120px';
          label.style.fontSize = '0.85rem';
          label.style.display = 'flex';
          label.style.alignItems = 'center';
          label.style.gap = '0.4rem';
          label.innerHTML = '<span style="display:inline-block; width:18px; font-weight:700; color:' + loc.color + ';">' + loc.code + '</span>' +
                            '<span style="color:var(--text-primary); font-weight:550;">' + loc.name + '</span>';

          var slider = document.createElement('input');
          slider.type = 'range';
          slider.className = 'range-slider household-room-slider';
          slider.min = '1';
          slider.max = '99';
          slider.value = Math.round(p * 100);
          slider.style.flex = '1';

          var valBadge = document.createElement('span');
          valBadge.className = 'household-room-val';
          valBadge.style.minWidth = '65px';
          valBadge.style.textAlign = 'right';
          valBadge.style.fontFamily = 'var(--font-mono)';
          valBadge.style.fontSize = '0.82rem';
          valBadge.style.fontWeight = '600';
          valBadge.style.color = loc.color;
          valBadge.innerText = (p * 100).toFixed(1) + '%';

          var contribBadge = document.createElement('span');
          contribBadge.style.minWidth = '85px';
          contribBadge.style.textAlign = 'right';
          contribBadge.style.fontFamily = 'var(--font-mono)';
          contribBadge.style.fontSize = '0.78rem';
          contribBadge.style.color = 'var(--text-muted)';
          contribBadge.title = 'State contribution: p × S(p)';
          contribBadge.innerText = '+' + contribution.toFixed(3) + ' n';

          slider.addEventListener('input', function () {
            normalize(idx, parseInt(slider.value, 10) / 100);
          });

          row.appendChild(label);
          row.appendChild(slider);
          row.appendChild(valBadge);
          row.appendChild(contribBadge);
          sliderList.appendChild(row);
        })(i);
      }
    }

    function draw() {
      var c = getThemeColors();
      var ret = setupRetinaCanvas(canvas);
      var ctx = ret.ctx, width = ret.width, height = ret.height;
      ctx.clearRect(0, 0, width, height);

      var padLeft = 56;
      var padRight = 32;
      var padTop = 36;
      var padBottom = 54;

      var ox = padLeft;
      var oy = height - padBottom;
      var plotW = width - padLeft - padRight;
      var plotH = height - padTop - padBottom;

      drawGrid(ctx, ox, oy, width, height, 36);

      // Y-axis tick guidelines at 0.0, 0.25, 0.5, 0.75, 1.0
      ctx.strokeStyle = c.gridLine;
      ctx.fillStyle = c.subtleText;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (var pr = 0; pr <= 1.0; pr += 0.25) {
        var yGuideline = oy - pr * plotH;
        ctx.beginPath();
        ctx.moveTo(ox, yGuideline);
        ctx.lineTo(ox + plotW, yGuideline);
        ctx.stroke();
        ctx.fillText((pr * 100).toFixed(0) + '%', ox - 8, yGuideline);
      }

      drawAxes(ctx, ox, oy, width, height, 'States / Locations', 'Probability Pr(X = x)');

      var numBays = locations.length;
      var slotW = plotW / numBays;
      var barW = Math.min(68, slotW * 0.62);

      for (var i = 0; i < numBays; i++) {
        var loc = locations[i];
        var p = loc.p;
        var s = p > 0.00001 ? -Math.log(p) : 0;
        var contribution = p * s;

        var barCenterX = ox + i * slotW + slotW / 2;
        var barLeftX = barCenterX - barW / 2;
        var barHeight = p * plotH;
        var barY = oy - barHeight;

        // Draw Pillar Background track
        ctx.fillStyle = c.isLight ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(barLeftX - 4, padTop, barW + 8, plotH);

        // Draw Probability Bar
        ctx.fillStyle = loc.color;
        ctx.fillRect(barLeftX, barY, barW, barHeight);

        // State Code Indicator above bar
        var badgeY = Math.max(padTop + 14, barY - 14);
        drawLabelPill(ctx, (p * 100).toFixed(1) + '%', barCenterX, badgeY, {
          textColor: loc.color,
          bgColor: c.pillBg,
          borderColor: loc.color,
          font: 'bold 10px "JetBrains Mono", monospace'
        });

        // Location text below axis
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = loc.color;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(loc.code, barCenterX, oy + 8);

        ctx.fillStyle = c.axisLabel;
        ctx.font = '550 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(loc.name, barCenterX, oy + 22);

        // Surprise callouts inside/above bar
        if (barHeight > 42) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S=' + s.toFixed(2) + 'n', barCenterX, barY + 14);
          ctx.fillText('+ ' + contribution.toFixed(3) + 'n', barCenterX, barY + 28);
        } else if (p > 0.001) {
          ctx.fillStyle = c.subtleText;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('+' + contribution.toFixed(2) + 'n', barCenterX, barY - 26);
        }
      }

      // Top banner pill
      var hNats = calcTotalEntropyNats();
      var maxNats = Math.log(4);
      var isPeak = Math.abs(hNats - maxNats) < 0.02;

      var bannerText = 'H(X) = ' + hNats.toFixed(3) + ' nats' + (isPeak ? ' · Uniform maximum (ln 4)' : (hNats < 0.05 ? ' · Certain location (0 nats)' : ''));
      drawLabelPill(ctx, bannerText, width / 2, 16, {
        textColor: isPeak ? c.timeColor : (hNats < 0.05 ? c.emeraldColor || '#0f766e' : c.axisLabel),
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
