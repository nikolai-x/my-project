// HUD, hover highlight/tooltip, and background rendering (cross-cutting concerns
// that aren't owned by a single entity).

let stonePattern = null;

function drawBackground(ctx) {
  if (!stonePattern) stonePattern = ctx.createPattern(ASSETS.tileStone, 'repeat');

  // tile_grass.png is a bordered "tile card," not a seamless texture, so it's
  // used once per prop area rather than repeated (which would show a grid on
  // open grassland). tile_stone.png reads fine tiled since a paved town square
  // is expected to show tile seams.
  ctx.fillStyle = '#3f6b3f';
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

  // static wilderness props, drawn before the town floor so they read as background
  for (const decoration of CONFIG.DECORATIONS) {
    const x = CONFIG.CORE.pos.x + decoration.x;
    const y = CONFIG.CORE.pos.y + decoration.y;
    drawSprite(ctx, ASSETS[decoration.type], x, y, CONFIG.SPRITE_SIZE[decoration.type]);
  }

  // town interior floor
  ctx.save();
  ctx.beginPath();
  ctx.arc(CONFIG.CORE.pos.x, CONFIG.CORE.pos.y, CONFIG.TOWN_BOUNDS_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = stonePattern;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawHoverHighlight(ctx, target) {
  if (!target) return;
  const pulse = 3 + Math.sin(Date.now() / 150) * 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 230, 90, 0.9)';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(255, 230, 90, 0.8)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(target.pos.x, target.pos.y, target.radius + 6 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTooltip(ctx, target, game, mouse) {
  if (!target) return;
  const label = target.getLabel(game);
  const cost = target.getCost(game);
  const costText = cost === null ? '' : `${cost}`;
  const affordable = cost === null || game.gold >= cost;

  ctx.save();
  ctx.font = 'bold 14px sans-serif';
  const labelWidth = ctx.measureText(label).width;
  ctx.font = 'bold 15px sans-serif';
  const costWidth = cost === null ? 0 : ctx.measureText(costText).width;
  const boxWidth = Math.max(labelWidth, costWidth + 24) + 24;
  const boxHeight = cost === null ? 32 : 56;
  const x = clamp(mouse.x + 18, 6, CONFIG.CANVAS_WIDTH - boxWidth - 6);
  const y = clamp(mouse.y + 18, 6, CONFIG.CANVAS_HEIGHT - boxHeight - 6);

  ctx.fillStyle = 'rgba(15,15,18,0.92)';
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.stroke();

  // small pointer notch toward the cursor
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x - 6, y - 7);
  ctx.lineTo(x + 16, y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(15,15,18,0.92)';
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(label, x + 12, y + 8);

  if (cost !== null) {
    const iconY = y + boxHeight - 16;
    const iconX = x + 20;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 7, 0, Math.PI * 2);
    ctx.fillStyle = radialFill(ctx, iconX, iconY, 7, '#ffd54a');
    ctx.fill();
    ctx.strokeStyle = '#a3790a';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = affordable ? '#8be36b' : '#e0453a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(costText, iconX + 12, iconY + 1);
  }
  ctx.restore();
}

function drawChipBackground(ctx, x, y, w, h, borderColor) {
  drawRoundedRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(20,20,22,0.6)';
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGoldChip(ctx, x, y, h, gold) {
  ctx.save();
  ctx.font = 'bold 16px sans-serif';
  const label = `${gold}`;
  const iconR = h / 2 - 4;
  const w = h + 10 + ctx.measureText(label).width + 14;

  drawChipBackground(ctx, x, y, w, h, 'rgba(255,213,74,0.35)');

  const iconX = x + h / 2;
  const iconY = y + h / 2;
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
  ctx.fillStyle = radialFill(ctx, iconX, iconY, iconR, '#ffd54a');
  ctx.fill();
  ctx.strokeStyle = '#a3790a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + h + 6, iconY + 1);
  ctx.restore();
}

function drawTimeChip(ctx, centerX, y, h, remainingSeconds) {
  ctx.save();
  const label = formatTime(remainingSeconds);
  ctx.font = 'bold 16px sans-serif';
  const iconR = h / 2 - 4;
  const w = h + 10 + ctx.measureText(label).width + 14;
  const x = centerX - w / 2;

  drawChipBackground(ctx, x, y, w, h, 'rgba(255,255,255,0.2)');

  const iconX = x + h / 2;
  const iconY = y + h / 2;
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
  ctx.fillStyle = '#dfe6ee';
  ctx.fill();
  ctx.strokeStyle = '#8a95a3';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(iconX, iconY);
  ctx.lineTo(iconX, iconY - iconR * 0.6);
  ctx.moveTo(iconX, iconY);
  ctx.lineTo(iconX + iconR * 0.4, iconY);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, iconX + iconR + 8, iconY + 1);
  ctx.restore();
}

function drawCoreChip(ctx, rightX, y, h, core) {
  ctx.save();
  const label = `${Math.ceil(core.hp)}/${core.maxHp}`;
  ctx.font = 'bold 16px sans-serif';
  const iconR = h / 2 - 4;
  const w = h + 10 + ctx.measureText(label).width + 14;
  const x = rightX - w;
  const healthy = core.hp / core.maxHp > 0.3;

  drawChipBackground(ctx, x, y, w, h, healthy ? 'rgba(139,227,107,0.35)' : 'rgba(224,69,58,0.5)');

  const iconX = x + h / 2;
  const iconY = y + h / 2;
  ctx.beginPath();
  ctx.moveTo(iconX, iconY - iconR);
  ctx.lineTo(iconX + iconR * 0.8, iconY - iconR * 0.4);
  ctx.lineTo(iconX + iconR * 0.6, iconY + iconR * 0.7);
  ctx.lineTo(iconX, iconY + iconR);
  ctx.lineTo(iconX - iconR * 0.6, iconY + iconR * 0.7);
  ctx.lineTo(iconX - iconR * 0.8, iconY - iconR * 0.4);
  ctx.closePath();
  ctx.fillStyle = healthy ? '#4ac26b' : '#e0453a';
  ctx.fill();

  ctx.fillStyle = healthy ? '#c8f7d2' : '#ffd1cc';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, iconX + iconR + 8, iconY + 1);
  ctx.restore();
}

function drawHud(ctx, game) {
  const y = 14;
  const h = 34;
  drawGoldChip(ctx, 16, y, h, game.gold);
  drawTimeChip(ctx, CONFIG.CANVAS_WIDTH / 2, y, h, CONFIG.MATCH_DURATION - game.elapsedTime);
  drawCoreChip(ctx, CONFIG.CANVAS_WIDTH - 16, y, h, game.core);
}

function drawCoreDamageVignette(ctx, intensity) {
  ctx.save();
  const cx = CONFIG.CANVAS_WIDTH / 2;
  const cy = CONFIG.CANVAS_HEIGHT / 2;
  ctx.fillStyle = twoStopRadialGradient(
    ctx,
    cx, cy, CONFIG.CANVAS_HEIGHT * 0.3,
    cx, cy, CONFIG.CANVAS_HEIGHT * 0.75,
    'rgba(200,0,0,0)', `rgba(200,0,0,${0.45 * intensity})`
  );
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  ctx.restore();
}

function drawPausedBanner(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Paused', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
  ctx.restore();
}
