// All tunable numbers for The Last Village live here.

const CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  MATCH_DURATION: 600, // seconds (10 minutes)

  STARTING_GOLD: 50,

  CORE: {
    pos: { x: 640, y: 360 },
    radius: 32,
    maxHp: 500,
    repairCostRate: 0.5, // gold per missing HP
  },

  PLAYER: {
    radius: 14,
    speed: 220,
    baseDamage: 10,
    baseFireRate: 3, // shots/sec
    damagePerLevel: 4,
    fireRatePerLevel: 0.3,
    maxWeaponLevel: 8,
    bulletSpeed: 900,
    bulletRadius: 4,
    forgeCost(level) {
      // cost to upgrade FROM `level` TO `level+1`
      return 20 + level * 15;
    },
  },

  FORGE: {
    // Below the core, clear of the player's spawn point (which sits just above
    // the core) and clear of the lower tower spots.
    pos: { x: 640, y: 530 },
    radius: 22,
  },

  TOWER: {
    buildCost: 40,
    maxLevel: 5,
    baseDamage: 8,
    baseRange: 140,
    baseFireRate: 1.2,
    damagePerLevel: 5,
    rangePerLevel: 15,
    fireRatePerLevel: 0.2,
    bulletSpeed: 700,
    bulletRadius: 4,
    radius: 20,
    upgradeCost(nextLevel) {
      return 30 + (nextLevel - 1) * 25;
    },
    // Fixed tower spot positions, offsets from core.
    spots: [
      { x: -180, y: -120 },
      { x: 180, y: -120 },
      { x: -220, y: 40 },
      { x: 220, y: 40 },
      { x: -100, y: 180 },
      { x: 100, y: 180 },
    ],
  },

  ENEMY_TYPES: {
    fast: { hp: 18, speed: 90, damage: 8, attackInterval: 0.8, goldDrop: 4, radius: 10, color: '#e05a2b', sprite: 'enemyFast' },
    strong: { hp: 70, speed: 40, damage: 22, attackInterval: 1.2, goldDrop: 12, radius: 16, color: '#5a2b6e', sprite: 'enemyStrong' },
  },
  ENEMY_SPAWN_WEIGHTS: { fast: 0.65, strong: 0.35 },

  SPAWN_RADIUS: 500,
  SPAWN_INTERVAL_START: 3.0,
  SPAWN_INTERVAL_MIN: 0.4,
  HP_SCALE_RATE: 0.003,
  DMG_SCALE_RATE: 0.0015,
  GOLD_SCALE_RATE: 0.001,
  MAX_ACTIVE_ENEMIES: 150,

  GOLD_PICKUP_RADIUS: 70,

  TOWN_BOUNDS_RADIUS: 260,

  FX: {
    hitFlashDuration: 0.08,
    coreDamageFlashDuration: 0.3,
    screenShakeDuration: 0.15,
    screenShakeMagnitude: 6,
  },

  // Target size (longest edge, in px) each sprite is scaled to when drawn, via
  // drawSprite() in utils.js. Chosen independently of gameplay radii so art can
  // read clearly without changing any collision/hit-test math.
  SPRITE_SIZE: {
    player: 60,
    enemyFast: 40,
    enemyStrong: 56,
    towerBase: 64,
    towerTurret: 40,
    townCore: 100,
    forge: 64,
    goldCoin: 22,
    projectilePlayer: 28,
    projectileTower: 30,
    propRock: 46,
    propBush: 46,
    propTree: 60,
    propFence: 56,
  },
};

// Fixed, deterministic decoration layout scattered in the wilderness ring between
// the town bounds and the enemy spawn ring — purely visual, no collision.
function buildDecorations() {
  const types = ['propRock', 'propBush', 'propTree', 'propFence'];
  const count = 14;
  const decorations = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.2;
    const radius = 300 + (i % 3) * 45;
    decorations.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      type: types[i % types.length],
    });
  }
  return decorations;
}
CONFIG.DECORATIONS = buildDecorations();
