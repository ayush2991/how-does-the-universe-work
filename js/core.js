/**
 * core.js - Shared Design System & Canvas Utilities
 * How Does The Universe Work? Explorable Physics Series
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
  // Series Article Catalog & Side Navigation Drawer
  // ==========================================================================
  var SERIES_ARTICLES = [
    {
      seriesId: 'relativity',
      seriesName: 'Series 01: Special Relativity',
      part: 1,
      partNumber: '01',
      title: 'Why Motion Through Space Affects Time',
      shortTitle: 'Motion & Time',
      subtitle: 'The cosmic speed limit, velocity trade-off, and why moving clocks tick slower.',
      tag: 'Special Relativity',
      filename: '01-motion-and-time.html',
      readTime: '10 min',
      status: 'live'
    },
    {
      seriesId: 'relativity',
      seriesName: 'Series 01: Special Relativity',
      part: 2,
      partNumber: '02',
      title: 'The Cosmic Light Cone: Mapping Space & Time',
      shortTitle: 'The Light Cone',
      subtitle: 'Coordinate spacetime maps, light cone boundaries, and causal Horizons.',
      tag: 'Spacetime Geometry',
      filename: '02-light-cone.html',
      readTime: '12 min',
      status: 'live'
    },
    {
      seriesId: 'relativity',
      seriesName: 'Series 01: Special Relativity',
      part: 3,
      partNumber: '03',
      title: 'The Spacetime Loaf & Length Contraction',
      shortTitle: 'The Loaf & Length',
      subtitle: 'Relativity of simultaneity, tilted slices of Now, and geometric projection.',
      tag: 'Simultaneity & Length',
      filename: '03-spacetime-loaf.html',
      readTime: '14 min',
      status: 'live'
    },
    {
      seriesId: 'entropy',
      seriesName: 'Series 02: Information and Entropy',
      part: 1,
      partNumber: '01',
      title: 'Thermodynamic vs. Shannon Entropy',
      shortTitle: 'Thermodynamic vs. Shannon',
      subtitle: 'Counting microstates, surprise, and how thermal disorder connects to bits.',
      tag: 'Information & Entropy',
      filename: '#',
      readTime: 'Coming Soon',
      status: 'coming-soon'
    },
    {
      seriesId: 'entropy',
      seriesName: 'Series 02: Information and Entropy',
      part: 2,
      partNumber: '02',
      title: 'Cross-Entropy & Kullback-Leibler Divergence',
      shortTitle: 'Cross-Entropy & KL',
      subtitle: 'Probability geometry, surprise, and why cross-entropy powers modern AI loss functions.',
      tag: 'Information & Entropy',
      filename: '#',
      readTime: 'Coming Soon',
      status: 'coming-soon'
    }
  ];

  function initSeriesNavigation() {
    // Only run on article pages or pages with .wide-reading-container
    var isArticlePage = !!document.querySelector('.wide-reading-container') ||
      window.location.pathname.indexOf('/posts/') !== -1 ||
      window.location.pathname.indexOf('01-') !== -1 ||
      window.location.pathname.indexOf('02-') !== -1 ||
      window.location.pathname.indexOf('03-') !== -1;

    if (!isArticlePage) return;

    // Determine current filename to mark active article
    var currentPath = window.location.pathname;
    var currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || '01-motion-and-time.html';
    // If running in index or edge case, default check
    var isInPostsDir = currentPath.indexOf('/posts/') !== -1 || document.querySelector('link[href="../css/style.css"]');
    var rootPrefix = isInPostsDir ? '../' : './';
    var postPrefix = isInPostsDir ? '' : 'posts/';

    // Create Backdrop
    var backdrop = document.createElement('div');
    backdrop.className = 'article-nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    // Create Left Floating Tab
    var tabBtn = document.createElement('button');
    tabBtn.className = 'article-nav-tab';
    tabBtn.setAttribute('aria-label', 'Open series article navigation');
    tabBtn.setAttribute('title', 'Browse all series and essays');
    tabBtn.innerHTML =
      '<span class="article-nav-tab-icon">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<line x1="3" y1="12" x2="21" y2="12"></line>' +
          '<line x1="3" y1="6" x2="21" y2="6"></line>' +
          '<line x1="3" y1="18" x2="21" y2="18"></line>' +
        '</svg>' +
      '</span>' +
      '<span class="article-nav-tab-label">Series</span>' +
      '<span class="article-nav-tab-badge">3</span>';
    document.body.appendChild(tabBtn);

    // Create Drawer Sidebar
    var drawer = document.createElement('aside');
    drawer.className = 'article-nav-drawer';
    drawer.setAttribute('aria-label', 'Series Navigation');
    drawer.setAttribute('aria-hidden', 'true');

    // Build articles list HTML grouped by series
    var listHtml = '';
    var lastSeries = '';

    for (var i = 0; i < SERIES_ARTICLES.length; i++) {
      var item = SERIES_ARTICLES[i];
      if (item.seriesName !== lastSeries) {
        lastSeries = item.seriesName;
        listHtml += '<li class="drawer-group-divider" style="list-style:none; padding: 0.75rem 0.25rem 0.35rem; font-family:var(--font-mono); font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted);">' + item.seriesName + '</li>';
      }

      var isLive = item.status === 'live';
      var isActive = isLive && ((currentFile === item.filename) || (i === 0 && currentFile === ''));
      var activeClass = isActive ? ' is-active' : (isLive ? '' : ' is-coming-soon');
      var itemHref = isLive ? (postPrefix + item.filename) : '#';

      listHtml +=
        '<li class="drawer-article-item' + activeClass + '" style="' + (isLive ? '' : 'opacity:0.65;') + '">' +
          '<a href="' + itemHref + '" class="drawer-article-link"' + (isActive ? ' aria-current="page"' : '') + (isLive ? '' : ' onclick="return false;"') + '>' +
            '<div class="drawer-article-meta">' +
              '<span class="drawer-part-badge" style="' + (item.seriesId === 'entropy' ? 'color:var(--color-emerald);' : '') + '">Part ' + item.partNumber + '</span>' +
              '<span class="drawer-time-tag">' + item.readTime + '</span>' +
            '</div>' +
            '<h4 class="drawer-article-title">' + item.title + '</h4>' +
            '<p class="drawer-article-sub">' + item.subtitle + '</p>' +
            (isActive ? '<span class="drawer-active-pill">Reading Now</span>' : '') +
          '</a>' +
        '</li>';
    }

    drawer.innerHTML =
      '<div class="drawer-header">' +
        '<div class="drawer-header-brand">' +
          '<a href="' + rootPrefix + 'index.html" class="drawer-brand-link">' +
            '<span class="brand-badge" style="font-size:0.78rem;">IF</span>' +
            '<div>' +
              '<div class="drawer-brand-title">INTUITION FIRST</div>' +
              '<div class="drawer-brand-sub">Explorable Science & Math</div>' +
            '</div>' +
          '</a>' +
        '</div>' +
        '<button class="drawer-close-btn" aria-label="Close navigation" title="Close">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="drawer-scroll-body">' +
        '<div class="drawer-section-heading">' +
          '<span>Table of Contents</span>' +
          '<span class="drawer-count">2 Series</span>' +
        '</div>' +
        '<ol class="drawer-articles-list" style="padding-left:0; list-style:none;">' +
          listHtml +
        '</ol>' +
      '</div>' +
      '<div class="drawer-footer">' +
        '<a href="' + rootPrefix + 'index.html" class="drawer-footer-link">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' +
            '<polyline points="9 22 9 12 15 12 15 22"></polyline>' +
          '</svg>' +
          '<span>All Series & Overview</span>' +
        '</a>' +
      '</div>';

    document.body.appendChild(drawer);

    // Event Handlers for Drawer
    var isOpen = false;

    function openDrawer() {
      isOpen = true;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('is-visible');
      tabBtn.classList.add('is-active');
      document.body.classList.add('drawer-open-lock');
    }

    function closeDrawer() {
      isOpen = false;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('is-visible');
      tabBtn.classList.remove('is-active');
      document.body.classList.remove('drawer-open-lock');
    }

    function toggleDrawer() {
      if (isOpen) closeDrawer();
      else openDrawer();
    }

    tabBtn.addEventListener('click', toggleDrawer);
    backdrop.addEventListener('click', closeDrawer);

    var closeBtn = drawer.querySelector('.drawer-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    // Keyboard navigation (Esc to close)
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    });

    // Also support any element on page with .btn-toggle-articles
    var customToggles = document.querySelectorAll('.btn-toggle-articles');
    for (var k = 0; k < customToggles.length; k++) {
      customToggles[k].addEventListener('click', function (e) {
        e.preventDefault();
        toggleDrawer();
      });
    }
  }

  // Global Registry & Initialization
  window.UniverseSimulations = window.UniverseSimulations || {};
  window.UniverseSimulations.SERIES_ARTICLES = SERIES_ARTICLES;
  window.UniverseSimulations.getThemeColors = getThemeColors;
  window.UniverseSimulations.setupRetinaCanvas = setupRetinaCanvas;
  window.UniverseSimulations.drawLabelPill = drawLabelPill;
  window.UniverseSimulations.drawGrid = drawGrid;
  window.UniverseSimulations.drawAxes = drawAxes;
  window.UniverseSimulations.drawConstraintArc = drawConstraintArc;
  window.UniverseSimulations.drawGlowingDot = drawGlowingDot;
  window.UniverseSimulations.registerDraw = registerDraw;
  window.UniverseSimulations.redrawAll = redrawAll;
  window.UniverseSimulations.initThemeManager = initThemeManager;
  window.UniverseSimulations.initReadingProgress = initReadingProgress;
  window.UniverseSimulations.initSeriesNavigation = initSeriesNavigation;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThemeManager();
      initReadingProgress();
      initSeriesNavigation();
    });
  } else {
    initThemeManager();
    initReadingProgress();
    initSeriesNavigation();
  }
})(window);
