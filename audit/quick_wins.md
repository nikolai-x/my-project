# Quick Wins

All of these are achievable purely with canvas drawing changes and CSS — no new image/audio assets, no build pipeline, no architecture changes. Each is scoped to one or two functions.

## 1. Drop shadows under every entity
**Where:** each `draw()` in `src/entities.js`, before drawing the main shape.
**What:** fill a small semi-transparent dark ellipse (`rgba(0,0,0,0.25)`) offset slightly below/under the player, enemies, gold, tower, forge, and core.
**Why it matters:** this single change gives every object a sense of sitting *on* the ground instead of being pasted onto it — the fastest way to kill the "flat prototype" look.

## 2. Radial gradients instead of flat fills
**Where:** replace `ctx.fillStyle = '<flat hex>'` with a `ctx.createRadialGradient(...)` (lighter center/highlight, darker edge) for the player, enemies, gold, and the core/tower/forge shapes.
**Why it matters:** gradients read as "lit, three-dimensional" even on simple primitives, at near-zero performance or complexity cost.

## 3. Hit-flash on enemies
**Where:** `Enemy.takeDamage()` in `src/entities.js` — set a `this.flashTimer = 0.08` on damage; in `Enemy.draw()`, overlay a white fill at reduced alpha proportional to remaining flash time.
**Why it matters:** makes every successful shot instantly readable and satisfying without any new assets.

## 4. Spawn/build "pop" scale-in
**Where:** `Tower` (on creation in `TowerSpot.interact()`) and `Enemy` (on creation in `spawner.js`) — track an `age` timer and scale the draw size from ~0 to 1 over ~0.15–0.2s (ease-out).
**Why it matters:** removes the "instant snap into existence" feeling for the two most common spawn events in the game.

## 5. Gold pickup pop + "+N" floating text
**Where:** `Gold.update()`/`Gold.draw()` — on collection, instead of instantly deleting, spawn a short-lived floating text ("+4") that rises and fades over ~0.5s; optionally scale the coin up slightly right before it disappears.
**Why it matters:** currency pickup is a core-loop action that happens constantly — right now it's invisible/silent, so the reward loop has no visual payoff.

## 6. Redesign the HUD as pill/card elements with simple icon glyphs
**Where:** `drawHud()` in `src/renderer.js`.
**What:** replace the single flat bar with three rounded-rect "chips" (gold, timer, core HP), each with a small drawn icon (a filled circle for the coin, a clock-face arc for time, a shield/heart shape for core HP) instead of plain text labels.
**Why it matters:** this is the most-looked-at UI element in the whole game (visible every second of play) — upgrading it has outsized visual impact for the effort.

## 7. Rounded, arrowed tooltip
**Where:** `drawTooltip()` in `src/renderer.js`.
**What:** use `ctx.roundRect` (or manual arc corners) instead of a plain rectangle, add a small triangular pointer toward the cursor, and add a tiny colored icon next to the cost matching the HUD gold icon.
**Why it matters:** small, self-contained change that immediately looks more "designed" every time the player hovers a buildable object.

## 8. Core damage screen feedback
**Where:** `TownCore.takeDamage()` — set a `game.coreFlashTimer`; in `Game.render()`, draw a brief red radial vignette (`rgba(200,0,0,alpha)` fading from screen edges) when the timer is active.
**Why it matters:** the town core is the entire lose condition — right now taking damage is nearly silent. A one-line addition makes the stakes visible.

## 9. Fade transitions on overlays
**Where:** `.overlay` in `style.css` (add `transition: opacity 0.25s ease`, toggle an opacity class instead of `display:none` via `main.js` `syncOverlay()`).
**Why it matters:** removes the jarring instant pop of the start/win/lose panels for a two-line CSS change.

## 10. Glow on projectiles and gold
**Where:** `Projectile.draw()` and `Gold.draw()` — set `ctx.shadowColor` + `ctx.shadowBlur` (e.g. 8–10px) matching the fill color before drawing.
**Why it matters:** canvas shadow blur is a one-line addition per shape and makes bullets/currency feel energized rather than flat dots.

## 11. Recolor the core and tower for contrast
**Where:** `CONFIG.CORE`/`CONFIG.TOWER` color values in `src/constants.js` (currently implied via entity fill colors in `src/entities.js`).
**What:** shift the core to a warmer, higher-value color (e.g. a warm stone gray-gold rather than muddy brown) and darken/saturate the tower green so both stand out against the `#3f6b3f` ground.
**Why it matters:** free (just a hex value change) and directly fixes the "most important objects blend into the background" problem.

## 12. Differentiate win/lose panel tone
**Where:** `style.css` — add `.panel.win` (warm gold-tinted border/glow) and `.panel.lose` (cold red-tinted border) variants; toggle the class in `main.js` alongside the existing overlay show/hide logic.
**Why it matters:** small CSS-only change that makes the two ending states feel emotionally distinct instead of reusing one neutral box.
