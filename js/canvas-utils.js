/**
 * canvas-utils.js
 * High-DPI canvas helpers, grid drawers, vector arrows, and coordinate primitives.
 */

export function setupRetinaCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height, dpr };
}

export function drawGrid(ctx, ox, oy, width, height, step = 35) {
  ctx.strokeStyle = '#121b2d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ox + step; x < width - 15; x += step) {
    ctx.moveTo(x, 15);
    ctx.lineTo(x, oy);
  }
  for (let y = oy - step; y > 15; y -= step) {
    ctx.moveTo(ox, y);
    ctx.lineTo(width - 15, y);
  }
  ctx.stroke();
}

export function drawAxes(ctx, ox, oy, width, height, xLabel, yLabel) {
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;

  // Horizontal Axis
  ctx.beginPath();
  ctx.moveTo(ox - 15, oy);
  ctx.lineTo(width - 25, oy);
  ctx.stroke();

  // Horizontal Arrowhead
  ctx.fillStyle = '#64748b';
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
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(xLabel, width - 85, oy + 18);
  ctx.fillText(yLabel, ox - 35, 18);
}

export function drawConstraintArc(ctx, ox, oy, radius, color = '#27344d') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(ox, oy, radius, -Math.PI / 2, 0, false);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawGlowingDot(ctx, x, y, color, radius = 6) {
  // Outer glow
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Main dot
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Core white highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
  ctx.fill();
}
