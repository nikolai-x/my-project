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
    pos: { x: 640, y: 300 },
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
    fast: { hp: 18, speed: 90, damage: 8, attackInterval: 0.8, goldDrop: 4, radius: 10, color: '#e05a2b' },
    strong: { hp: 70, speed: 40, damage: 22, attackInterval: 1.2, goldDrop: 12, radius: 16, color: '#5a2b6e' },
  },
  ENEMY_SPAWN_WEIGHTS: { fast: 0.65, strong: 0.35 },

  SPAWN_RADIUS: 500,
  SPAWN_INTERVAL_START: 3.0,
  SPAWN_INTERVAL_MIN: 0.4,
  HP_SCALE_RATE: 0.003,
  DMG_SCALE_RATE: 0.0015,
  GOLD_SCALE_RATE: 0.001,
  MAX_ACTIVE_ENEMIES: 150,

  GOLD_PICKUP_RADIUS: 30,

  TOWN_BOUNDS_RADIUS: 260,

  FX: {
    hitFlashDuration: 0.08,
    coreDamageFlashDuration: 0.3,
    screenShakeDuration: 0.15,
    screenShakeMagnitude: 6,
  },
};
