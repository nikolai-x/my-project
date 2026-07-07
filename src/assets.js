// Preloads every sprite once at startup and exposes them by name via ASSETS.
// main.js waits on loadAssets() before starting the game loop, so draw() methods
// can always assume ASSETS.<name> is a fully-loaded Image.

const ASSET_PATHS = {
  player: 'assets/player.png',
  enemyFast: 'assets/enemy_fast.png',
  enemyStrong: 'assets/enemy_strong.png',
  towerBase: 'assets/tower_base.png',
  towerTurret: 'assets/tower_turret.png',
  townCore: 'assets/town_core.png',
  forge: 'assets/forge.png',
  goldCoin: 'assets/gold_coin.png',
  projectilePlayer: 'assets/projectile_player.png',
  projectileTower: 'assets/projectile_tower.png',
  tileGrass: 'assets/tile_grass.png',
  tileStone: 'assets/tile_stone.png',
  propRock: 'assets/prop_rock.png',
  propBush: 'assets/prop_bush.png',
  propTree: 'assets/prop_tree.png',
  propFence: 'assets/prop_fence.png',
};

const ASSETS = {};

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    img.src = path;
  });
}

async function loadAssets() {
  const entries = Object.entries(ASSET_PATHS);
  const images = await Promise.all(entries.map(([, path]) => loadImage(path)));
  entries.forEach(([name], i) => {
    ASSETS[name] = images[i];
  });
  return ASSETS;
}
