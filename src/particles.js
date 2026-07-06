// Lightweight, reusable particle system: powers hit sparks, death bursts, muzzle
// flashes, and floating damage/gold text. Particles live in game.particles and are
// driven by Game.update()/Game.render() the same way any other entity array is.

class Particle {
  constructor({ pos, vx = 0, vy = 0, life, color = '#fff', radius = 3, text = null, fontSize = 14, gravity = 0, drag = 0 }) {
    this.pos = { x: pos.x, y: pos.y };
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.radius = radius;
    this.text = text;
    this.fontSize = fontSize;
    this.gravity = gravity;
    this.drag = drag;
    this.dead = false;
  }

  update(dt) {
    this.vy += this.gravity * dt;
    if (this.drag) {
      const f = Math.max(0, 1 - this.drag * dt);
      this.vx *= f;
      this.vy *= f;
    }
    this.pos.x += this.vx * dt;
    this.pos.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    const t = clamp(this.life / this.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = t;
    if (this.text) {
      ctx.fillStyle = this.color;
      ctx.font = `bold ${this.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, this.pos.x, this.pos.y);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, Math.max(0.5, this.radius * t), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// A scattering burst of small colored dots (impact sparks, death bursts, sparkle).
function spawnBurst(game, pos, color, count, speedRange = [60, 160], life = 0.4) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randRange(speedRange[0], speedRange[1]);
    game.particles.push(new Particle({
      pos,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: life * randRange(0.7, 1.2),
      color,
      radius: randRange(2, 4),
      drag: 2.5,
    }));
  }
}

// A brief directional flash at a gun barrel/turret tip, `radius` px from `origin`
// along `angle` (the shooter's center and aim direction).
function spawnMuzzleFlash(game, origin, angle, radius, color) {
  const tip = { x: origin.x + Math.cos(angle) * radius, y: origin.y + Math.sin(angle) * radius };
  for (let i = 0; i < 3; i++) {
    const spread = angle + randRange(-0.3, 0.3);
    const speed = randRange(120, 220);
    game.particles.push(new Particle({
      pos: tip,
      vx: Math.cos(spread) * speed,
      vy: Math.sin(spread) * speed,
      life: 0.1,
      color,
      radius: randRange(2, 3),
      drag: 6,
    }));
  }
}

// Text that rises and fades — used for damage numbers and "+gold" pickups.
function spawnFloatingText(game, pos, text, color, fontSize = 14) {
  game.particles.push(new Particle({
    pos: { x: pos.x + randRange(-4, 4), y: pos.y },
    vx: randRange(-8, 8),
    vy: -34,
    life: 0.7,
    color,
    text,
    fontSize,
  }));
}

function spawnGoldPickupFx(game, pos, value) {
  spawnFloatingText(game, { x: pos.x, y: pos.y - 10 }, `+${value}`, '#ffd54a', 13);
  spawnBurst(game, pos, '#ffe066', 4, [30, 70], 0.3);
}
