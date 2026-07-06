// Owns the game state machine, entity collections, update/render, and click routing.

const GameState = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  WIN: 'WIN',
  LOSE: 'LOSE',
};

class Game {
  constructor(input) {
    this.input = input;
    this.input.onInteract = (x, y) => this.handleClick(x, y);
    this.input.onAnyInput = () => {
      if (this.state === GameState.START) this.start();
    };
    this.reset();
  }

  reset() {
    this.state = GameState.START;
    this.previousState = null;
    this.elapsedTime = 0;
    this.gold = CONFIG.STARTING_GOLD;
    this.player = new Player();
    this.core = new TownCore();
    this.forge = new Forge();
    this.towerSpots = CONFIG.TOWER.spots.map(
      (o) => new TowerSpot(CONFIG.CORE.pos.x + o.x, CONFIG.CORE.pos.y + o.y)
    );
    this.enemies = [];
    this.projectiles = [];
    this.goldPickups = [];
    this.particles = [];
    this.shakeTimer = 0;
    this.coreFlashTimer = 0;
    this.spawner = new EnemySpawner();
    this.stats = { kills: 0, goldEarned: 0 };
    this.hoveredTarget = null;
  }

  start() {
    if (this.state === GameState.START) this.state = GameState.PLAYING;
  }

  pause() {
    if (this.state === GameState.PLAYING) {
      this.previousState = this.state;
      this.state = GameState.PAUSED;
    }
  }

  resume() {
    if (this.state === GameState.PAUSED && this.previousState === GameState.PLAYING) {
      this.state = GameState.PLAYING;
    }
    this.previousState = null;
  }

  getInteractiveTargets() {
    return [this.core, this.forge, ...this.towerSpots];
  }

  findTargetAt(x, y) {
    const point = { x, y };
    for (const target of this.getInteractiveTargets()) {
      if (distance(point, target.pos) <= target.radius) return target;
    }
    return null;
  }

  handleClick(x, y) {
    if (this.state !== GameState.PLAYING) return false;
    const target = this.findTargetAt(x, y);
    if (target) {
      target.interact(this);
      return true;
    }
    return false;
  }

  update(dt) {
    if (this.state !== GameState.PLAYING) return;

    this.elapsedTime += dt;
    this.hoveredTarget = this.findTargetAt(this.input.mouse.x, this.input.mouse.y);

    this.spawner.update(dt, this);
    this.player.update(dt, this);
    for (const spot of this.towerSpots) spot.update(dt, this);
    for (const enemy of this.enemies) enemy.update(dt, this);
    for (const projectile of this.projectiles) projectile.update(dt);
    for (const goldPickup of this.goldPickups) goldPickup.update(dt, this);
    for (const particle of this.particles) particle.update(dt);

    this.handleCollisions();

    this.enemies = this.enemies.filter((enemy) => !enemy.dead);
    this.projectiles = this.projectiles.filter((projectile) => !projectile.dead);
    this.goldPickups = this.goldPickups.filter((goldPickup) => !goldPickup.dead);
    this.particles = this.particles.filter((particle) => !particle.dead);

    this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    this.coreFlashTimer = Math.max(0, this.coreFlashTimer - dt);

    if (this.core.hp <= 0) {
      this.state = GameState.LOSE;
    } else if (this.elapsedTime >= CONFIG.MATCH_DURATION) {
      this.elapsedTime = CONFIG.MATCH_DURATION;
      this.state = GameState.WIN;
    }
  }

  handleCollisions() {
    for (const projectile of this.projectiles) {
      if (projectile.dead) continue;
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        if (distance(projectile.pos, enemy.pos) <= projectile.radius + enemy.radius) {
          enemy.takeDamage(projectile.damage, this);
          projectile.dead = true;
          break;
        }
      }
    }
  }

  render(ctx) {
    ctx.save();
    if (this.shakeTimer > 0) {
      const power = CONFIG.FX.screenShakeMagnitude * (this.shakeTimer / CONFIG.FX.screenShakeDuration);
      ctx.translate(randRange(-power, power), randRange(-power, power));
    }

    drawBackground(ctx);

    this.core.draw(ctx);
    for (const spot of this.towerSpots) spot.draw(ctx);
    this.forge.draw(ctx);
    for (const goldPickup of this.goldPickups) goldPickup.draw(ctx);
    for (const enemy of this.enemies) enemy.draw(ctx);
    for (const projectile of this.projectiles) projectile.draw(ctx);
    this.player.draw(ctx);
    for (const particle of this.particles) particle.draw(ctx);

    ctx.restore();

    if (this.state === GameState.PLAYING) {
      drawHoverHighlight(ctx, this.hoveredTarget);
      drawTooltip(ctx, this.hoveredTarget, this, this.input.mouse);
    }

    drawHud(ctx, this);

    if (this.coreFlashTimer > 0) {
      drawCoreDamageVignette(ctx, this.coreFlashTimer / CONFIG.FX.coreDamageFlashDuration);
    }

    if (this.state === GameState.PAUSED) {
      drawPausedBanner(ctx);
    }
  }
}
