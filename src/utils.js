// Small math/format helpers shared across the game.

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function angleTo(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

// Lightens (positive percent) or darkens (negative percent) a '#rrggbb' color.
function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amount = Math.round(2.55 * percent);
  const r = clamp((num >> 16) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0x00ff) + amount, 0, 255);
  const b = clamp((num & 0x0000ff) + amount, 0, 255);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

// Builds a two-stop radial gradient from an inner circle (x0,y0,r0) to an outer
// circle (x1,y1,r1). The shared building block behind radialFill() and any other
// canvas gradient (vignettes, glows) drawn in the game.
function twoStopRadialGradient(ctx, x0, y0, r0, x1, y1, r1, colorStart, colorEnd) {
  const grad = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);
  return grad;
}

// A simple lit-sphere look for any circle/shape: lighter highlight toward the
// upper-left, darker toward the edge, derived from a single base color.
function radialFill(ctx, x, y, r, baseColor) {
  return twoStopRadialGradient(ctx, x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r, shadeColor(baseColor, 30), shadeColor(baseColor, -30));
}

// Soft contact shadow drawn beneath a circular/square entity of the given radius.
function drawShadow(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.55, r * 0.95, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draws `image` centered at (x, y), scaled so its longest edge equals targetSize
// (preserving aspect ratio), optionally rotated by `angle` radians. Used to render
// every sprite-based entity without distorting or hand-computing per-image sizes.
function drawSprite(ctx, image, x, y, targetSize, angle = 0) {
  if (!image || !image.naturalWidth) return;
  const scale = targetSize / Math.max(image.naturalWidth, image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// weights: { key: weight, ... } -> returns a random key proportional to weight
function weightedPick(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    if (r < w) return key;
    r -= w;
  }
  return entries[entries.length - 1][0];
}
