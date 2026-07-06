// Entity classes: Player, Enemy, TowerSpot, Tower, Projectile, GoldPickup, TownCore, Forge.
// Each has update(dt, game) and draw(ctx). Draw logic is kept separate from
// update logic so shapes could later be swapped for sprites without touching sim code.
//
// TownCore, Forge, and TowerSpot additionally implement a shared "Interactable"
// contract consumed polymorphically by Game.findTargetAt/handleClick and by
// drawTooltip() in renderer.js:
//   getCost(game) -> number | null   (null means no action available right now)
//   getLabel(game) -> string         (tooltip text)
//   interact(game) -> void           (spend gold and apply the effect)

// Deducts `cost` from game.gold and runs `effect` if affordable; no-ops otherwise.
// Shared by every Interactable's interact() method to avoid repeating the same
// "can't afford / already maxed" guard three times.
function trySpend(game, cost, effect) {
  if (cost === null || game.gold < cost) return;
  game.gold -= cost;
  effect();
}

class Player {
  constructor() {
    this.pos = { x: CONFIG.CORE.pos.x, y: CONFIG.CORE.pos.y - 60 };
    this.radius = CONFIG.PLAYER.radius;
    this.weaponLevel = 1;
    this.fireCooldown = 0;
    this.aimAngle = 0;
  }

  get damage() {
    return CONFIG.PLAYER.baseDamage + (this.weaponLevel - 1) * CONFIG.PLAYER.damagePerLevel;
  }

  get fireRate() {
    return CONFIG.PLAYER.baseFireRate + (this.weaponLevel - 1) * CONFIG.PLAYER.fireRatePerLevel;
  }

  update(dt, game) {
    const move = game.input.getMoveVector();
    this.pos.x = clamp(this.pos.x + move.x * CONFIG.PLAYER.speed * dt, this.radius, CONFIG.CANVAS_WIDTH - this.radius);
    this.pos.y = clamp(this.pos.y + move.y * CONFIG.PLAYER.speed * dt, this.radius, CONFIG.CANVAS_HEIGHT - this.radius);

    this.aimAngle = angleTo(this.pos, game.input.mouse);

    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (game.input.firing && this.fireCooldown <= 0) {
      this.fireCooldown = 1 / this.fireRate;
      game.projectiles.push(new Projectile({
        pos: { x: this.pos.x, y: this.pos.y },
        angle: this.aimAngle,
        speed: CONFIG.PLAYER.bulletSpeed,
        damage: this.damage,
        radius: CONFIG.PLAYER.bulletRadius,
        color: '#ffe066',
      }));
      spawnMuzzleFlash(game, this.pos, this.aimAngle, this.radius + 6, '#fff6c0');
    }
  }

  draw(ctx) {
    ctx.save();
    drawShadow(ctx, this.pos.x, this.pos.y, this.radius);
    ctx.fillStyle = radialFill(ctx, this.pos.x, this.pos.y, this.radius, '#3aa6ff');
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // aim indicator
    ctx.strokeStyle = '#0d3a5c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pos.x + Math.cos(this.aimAngle) * (this.radius + 12), this.pos.y + Math.sin(this.aimAngle) * (this.radius + 12));
    ctx.stroke();
    ctx.restore();
  }
}

class Enemy {
  constructor(type, pos, scale) {
    const cfg = CONFIG.ENEMY_TYPES[type];
    this.type = type;
    this.pos = pos;
    this.radius = cfg.radius;
    this.color = cfg.color;
    this.maxHp = cfg.hp * scale.hp;
    this.hp = this.maxHp;
    this.speed = cfg.speed;
    this.damage = cfg.damage * scale.dmg;
    this.attackInterval = cfg.attackInterval;
    this.goldDrop = cfg.goldDrop * scale.gold;
    this.attackCooldown = 0;
    this.flashTimer = 0;
    this.dead = false;
  }

  update(dt, game) {
    if (this.flashTimer > 0) this.flashTimer -= dt;

    const core = game.core;
    const d = distance(this.pos, core.pos);
    const minDist = this.radius + core.radius;
    if (d > minDist) {
      const ang = angleTo(this.pos, core.pos);
      this.pos.x += Math.cos(ang) * this.speed * dt;
      this.pos.y += Math.sin(ang) * this.speed * dt;
    } else {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0) {
        this.attackCooldown = this.attackInterval;
        core.takeDamage(this.damage, game);
      }
    }
  }

  takeDamage(amount, game) {
    this.hp -= amount;
    this.flashTimer = CONFIG.FX.hitFlashDuration;
    spawnFloatingText(game, { x: this.pos.x, y: this.pos.y - this.radius - 6 }, `-${Math.round(amount)}`, '#fff', 12);
    spawnBurst(game, { x: this.pos.x, y: this.pos.y }, this.color, 3, [40, 100], 0.25);
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      game.goldPickups.push(new GoldPickup(this.pos.x, this.pos.y, Math.round(this.goldDrop)));
      game.stats.kills += 1;
      spawnBurst(game, { x: this.pos.x, y: this.pos.y }, this.color, 10, [70, 180], 0.45);
    }
  }

  draw(ctx) {
    ctx.save();
    drawShadow(ctx, this.pos.x, this.pos.y, this.radius);
    ctx.fillStyle = radialFill(ctx, this.pos.x, this.pos.y, this.radius, this.color);
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    if (this.flashTimer > 0) {
      ctx.globalAlpha = this.flashTimer / CONFIG.FX.hitFlashDuration;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // hp bar
    const w = this.radius * 2;
    const h = 4;
    const barX = this.pos.x - this.radius;
    const barY = this.pos.y - this.radius - 10;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY, w, h);
    ctx.fillStyle = '#e0453a';
    ctx.fillRect(barX, barY, w * clamp(this.hp / this.maxHp, 0, 1), h);
    ctx.restore();
  }
}

class Projectile {
  constructor({ pos, angle, speed, damage, radius, color }) {
    this.pos = { x: pos.x, y: pos.y };
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.radius = radius;
    this.color = color;
    this.life = 2; // seconds before auto-despawn
    this.dead = false;
  }

  update(dt) {
    this.pos.x += this.vx * dt;
    this.pos.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
    if (this.pos.x < -50 || this.pos.x > CONFIG.CANVAS_WIDTH + 50 || this.pos.y < -50 || this.pos.y > CONFIG.CANVAS_HEIGHT + 50) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class GoldPickup {
  constructor(x, y, value) {
    this.pos = { x, y };
    this.value = value;
    this.radius = 6;
    this.dead = false;
  }

  update(dt, game) {
    if (distance(this.pos, game.player.pos) <= CONFIG.GOLD_PICKUP_RADIUS) {
      game.gold += this.value;
      game.stats.goldEarned += this.value;
      this.dead = true;
      spawnGoldPickupFx(game, { x: this.pos.x, y: this.pos.y }, this.value);
    }
  }

  draw(ctx) {
    ctx.save();
    drawShadow(ctx, this.pos.x, this.pos.y, this.radius);
    ctx.fillStyle = radialFill(ctx, this.pos.x, this.pos.y, this.radius, '#ffd54a');
    ctx.strokeStyle = '#a3790a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

class Tower {
  constructor(pos) {
    this.pos = pos;
    this.level = 1;
    this.fireCooldown = 0;
  }

  get damage() {
    return CONFIG.TOWER.baseDamage + (this.level - 1) * CONFIG.TOWER.damagePerLevel;
  }

  get range() {
    return CONFIG.TOWER.baseRange + (this.level - 1) * CONFIG.TOWER.rangePerLevel;
  }

  get fireRate() {
    return CONFIG.TOWER.baseFireRate + (this.level - 1) * CONFIG.TOWER.fireRatePerLevel;
  }

  update(dt, game) {
    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    let nearest = null;
    let nearestDist = this.range;
    for (const enemy of game.enemies) {
      const d = distance(this.pos, enemy.pos);
      if (d <= nearestDist) {
        nearest = enemy;
        nearestDist = d;
      }
    }

    if (nearest && this.fireCooldown <= 0) {
      this.fireCooldown = 1 / this.fireRate;
      const ang = angleTo(this.pos, nearest.pos);
      game.projectiles.push(new Projectile({
        pos: { x: this.pos.x, y: this.pos.y },
        angle: ang,
        speed: CONFIG.TOWER.bulletSpeed,
        damage: this.damage,
        radius: CONFIG.TOWER.bulletRadius,
        color: '#8be36b',
      }));
      spawnMuzzleFlash(game, this.pos, ang, CONFIG.TOWER.radius, '#c8f0b0');
    }
  }

  draw(ctx) {
    ctx.save();
    const r = CONFIG.TOWER.radius;
    drawShadow(ctx, this.pos.x, this.pos.y, r);
    ctx.fillStyle = radialFill(ctx, this.pos.x, this.pos.y, r, '#7d8b99');
    ctx.strokeStyle = '#3a434c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(this.pos.x - r, this.pos.y - r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(`Lv${this.level}`, this.pos.x, this.pos.y);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Lv${this.level}`, this.pos.x, this.pos.y);
    ctx.restore();
  }
}

class TowerSpot {
  constructor(x, y) {
    this.pos = { x, y };
    this.radius = CONFIG.TOWER.radius + 10; // generous click/hover radius
    this.tower = null;
  }

  getCost() {
    if (!this.tower) return CONFIG.TOWER.buildCost;
    if (this.tower.level >= CONFIG.TOWER.maxLevel) return null;
    return CONFIG.TOWER.upgradeCost(this.tower.level + 1);
  }

  getLabel() {
    if (!this.tower) return 'Build Tower';
    if (this.tower.level >= CONFIG.TOWER.maxLevel) return 'Tower (Max Level)';
    return `Upgrade Tower Lv${this.tower.level + 1}`;
  }

  interact(game) {
    trySpend(game, this.getCost(), () => {
      if (!this.tower) {
        this.tower = new Tower({ x: this.pos.x, y: this.pos.y });
      } else {
        this.tower.level += 1;
      }
    });
  }

  update(dt, game) {
    if (this.tower) this.tower.update(dt, game);
  }

  draw(ctx) {
    if (this.tower) {
      this.tower.draw(ctx);
    } else {
      ctx.save();
      const r = CONFIG.TOWER.radius;
      drawShadow(ctx, this.pos.x, this.pos.y, r * 0.8);
      ctx.fillStyle = twoStopRadialGradient(ctx, this.pos.x, this.pos.y, 1, this.pos.x, this.pos.y, r, 'rgba(220,220,210,0.28)', 'rgba(180,180,170,0.12)');
      ctx.fillRect(this.pos.x - r, this.pos.y - r, r * 2, r * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.strokeRect(this.pos.x - r, this.pos.y - r, r * 2, r * 2);
      ctx.restore();
    }
  }
}

class Forge {
  constructor() {
    this.pos = { ...CONFIG.FORGE.pos };
    this.radius = CONFIG.FORGE.radius + 8;
  }

  getCost(game) {
    const player = game.player;
    if (player.weaponLevel >= CONFIG.PLAYER.maxWeaponLevel) return null;
    return CONFIG.PLAYER.forgeCost(player.weaponLevel);
  }

  getLabel(game) {
    const player = game.player;
    if (player.weaponLevel >= CONFIG.PLAYER.maxWeaponLevel) return 'Weapon (Max Level)';
    return `Upgrade Weapon Lv${player.weaponLevel + 1}`;
  }

  interact(game) {
    trySpend(game, this.getCost(game), () => {
      game.player.weaponLevel += 1;
    });
  }

  draw(ctx) {
    ctx.save();
    const r = CONFIG.FORGE.radius;
    drawShadow(ctx, this.pos.x, this.pos.y, r);
    ctx.fillStyle = twoStopRadialGradient(
      ctx,
      this.pos.x - r * 0.2, this.pos.y - r * 0.3, r * 0.1,
      this.pos.x, this.pos.y, r * 1.3,
      shadeColor('#b05c2e', 30), shadeColor('#b05c2e', -30)
    );
    ctx.strokeStyle = '#5c2c12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y - r);
    ctx.lineTo(this.pos.x + r, this.pos.y + r);
    ctx.lineTo(this.pos.x - r, this.pos.y + r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

class TownCore {
  constructor() {
    this.pos = { ...CONFIG.CORE.pos };
    this.radius = CONFIG.CORE.radius;
    this.maxHp = CONFIG.CORE.maxHp;
    this.hp = this.maxHp;
  }

  getCost() {
    const missing = this.maxHp - this.hp;
    if (missing <= 0) return null;
    return Math.ceil(missing * CONFIG.CORE.repairCostRate);
  }

  getLabel() {
    if (this.hp >= this.maxHp) return 'Town Core (Full HP)';
    return 'Repair Core';
  }

  interact(game) {
    trySpend(game, this.getCost(), () => {
      this.hp = this.maxHp;
    });
  }

  takeDamage(amount, game) {
    this.hp = Math.max(0, this.hp - amount);
    game.shakeTimer = CONFIG.FX.screenShakeDuration;
    game.coreFlashTimer = CONFIG.FX.coreDamageFlashDuration;
    spawnFloatingText(game, { x: this.pos.x, y: this.pos.y - this.radius - 26 }, `-${Math.round(amount)}`, '#ff6b5c', 15);
  }

  draw(ctx) {
    ctx.save();
    const r = this.radius;
    drawShadow(ctx, this.pos.x, this.pos.y, r);
    ctx.fillStyle = radialFill(ctx, this.pos.x, this.pos.y, r * 1.3, '#c9a24d');
    ctx.strokeStyle = '#7a5a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(this.pos.x - r, this.pos.y - r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();

    // world-space HP bar
    const w = r * 2.5;
    const h = 8;
    const barX = this.pos.x - w / 2;
    const barY = this.pos.y - r - 22;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY, w, h);
    ctx.fillStyle = this.hp / this.maxHp > 0.3 ? '#4ac26b' : '#e0453a';
    ctx.fillRect(barX, barY, w * clamp(this.hp / this.maxHp, 0, 1), h);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, w, h);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(this.hp)}/${this.maxHp}`, this.pos.x, barY - 4);
    ctx.restore();
  }
}
