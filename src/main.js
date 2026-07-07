// Bootstraps the canvas, wires DOM overlays, and drives the requestAnimationFrame loop.
(async function () {
  const canvas = document.getElementById('game-canvas');
  canvas.width = CONFIG.CANVAS_WIDTH;
  canvas.height = CONFIG.CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  const input = new InputManager(canvas);
  const game = new Game(input);

  const startOverlay = document.getElementById('start-overlay');
  const winOverlay = document.getElementById('win-overlay');
  const loseOverlay = document.getElementById('lose-overlay');

  const winStats = document.getElementById('win-stats');
  const loseStats = document.getElementById('lose-stats');

  function statsLine() {
    return `Time survived: ${formatTime(game.elapsedTime)} — Gold earned: ${game.stats.goldEarned} — Enemies defeated: ${game.stats.kills}`;
  }

  const overlayForState = {
    [GameState.START]: startOverlay,
    [GameState.WIN]: winOverlay,
    [GameState.LOSE]: loseOverlay,
  };
  const allOverlays = [startOverlay, winOverlay, loseOverlay];

  let shownOverlay = startOverlay;

  function syncOverlay() {
    const desired = overlayForState[game.state] || null;
    if (desired === shownOverlay) return;
    shownOverlay = desired;

    for (const overlay of allOverlays) {
      overlay.classList.toggle('hidden', overlay !== desired);
    }

    if (desired === winOverlay) winStats.textContent = statsLine();
    if (desired === loseOverlay) loseStats.textContent = statsLine();
  }

  startOverlay.addEventListener('click', () => game.start());

  document.getElementById('restart-from-win').addEventListener('click', () => {
    game.reset();
    syncOverlay();
  });
  document.getElementById('restart-from-lose').addEventListener('click', () => {
    game.reset();
    syncOverlay();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
    } else {
      game.resume();
    }
  });

  await loadAssets();

  let lastTimestamp = 0;
  function frame(timestamp) {
    const dtRaw = (timestamp - lastTimestamp) / 1000;
    const dt = Math.min(dtRaw || 0, 0.05);
    lastTimestamp = timestamp;

    game.update(dt);
    game.render(ctx);
    syncOverlay();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
