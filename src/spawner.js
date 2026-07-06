// Handles enemy spawn timing, placement, type selection, and difficulty scaling.
class EnemySpawner {
  constructor() {
    this.timeToNextSpawn = CONFIG.SPAWN_INTERVAL_START;
  }

  currentInterval(t) {
    const span = CONFIG.SPAWN_INTERVAL_START - CONFIG.SPAWN_INTERVAL_MIN;
    const rate = span / CONFIG.MATCH_DURATION;
    return Math.max(CONFIG.SPAWN_INTERVAL_MIN, CONFIG.SPAWN_INTERVAL_START - t * rate);
  }

  scaleFor(t) {
    return {
      hp: 1 + t * CONFIG.HP_SCALE_RATE,
      dmg: 1 + t * CONFIG.DMG_SCALE_RATE,
      gold: 1 + t * CONFIG.GOLD_SCALE_RATE,
    };
  }

  spawnPoint() {
    const angle = Math.random() * Math.PI * 2;
    const core = CONFIG.CORE.pos;
    return {
      x: core.x + Math.cos(angle) * CONFIG.SPAWN_RADIUS,
      y: core.y + Math.sin(angle) * CONFIG.SPAWN_RADIUS,
    };
  }

  update(dt, game) {
    this.timeToNextSpawn -= dt;
    if (this.timeToNextSpawn > 0) return;

    this.timeToNextSpawn += this.currentInterval(game.elapsedTime);

    if (game.enemies.length >= CONFIG.MAX_ACTIVE_ENEMIES) return;

    const type = weightedPick(CONFIG.ENEMY_SPAWN_WEIGHTS);
    const pos = this.spawnPoint();
    const scale = this.scaleFor(game.elapsedTime);
    game.enemies.push(new Enemy(type, pos, scale));
  }
}
