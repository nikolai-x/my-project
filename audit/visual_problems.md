# Visual Problems

Each problem lists where it lives in the code and why it hurts the game's perceived quality. Ordered roughly by severity.

## 1. Flat, unshaded fills everywhere (Critical)
**Where:** every `draw()` method in `src/entities.js` (Player, Enemy, Tower, TowerSpot, Forge, TownCore), `drawBackground()` in `src/renderer.js`.
**Problem:** every shape is `ctx.fillStyle = <one flat hex>; ctx.fill()`. No gradient, no shadow, no highlight/shading. This is the single biggest reason the game reads as a prototype — nothing has volume or weight.

## 2. Zero animation or transition anywhere (Critical)
**Where:** `Enemy.takeDamage()` (instant removal on death in `src/game.js` filter step), `Gold.update()` (instant removal on pickup), `TowerSpot.interact()` (instant tower appearance/level change), `main.js` `syncOverlay()` (instant `display` toggle).
**Problem:** every state change is a hard cut. Nothing eases in, scales up, fades, or reacts. Combined with problem #1, the game feels static even while enemies are visibly moving.

## 3. Empty, textureless world (High)
**Where:** `drawBackground()` in `src/renderer.js`.
**Problem:** the entire 1280×720 map is one flat `#3f6b3f` fill plus a single low-opacity dashed circle. No ground texture, no props, no path, no distinction between town and wilderness. Large empty areas (especially outside the 260px town-bounds ring) have nothing to look at.

## 4. Low contrast between key buildings and the ground (High)
**Where:** `CONFIG.CORE` color `#7a6a4a`, `CONFIG.TOWER` color `#4a6b3a` in `src/constants.js`/`src/entities.js`, vs. background `#3f6b3f`.
**Problem:** the town core — the single object the player must protect — and towers sit close in hue/value to the background green. The most important objects on screen are the least visually prominent.

## 5. HUD and tooltip look like debug overlays, not designed UI (High)
**Where:** `drawHud()` and `drawTooltip()` in `src/renderer.js`.
**Problem:** the HUD is plain `fillText` on a flat semi-transparent black bar with no icons, no separators, no card treatment. The tooltip is an unstyled rectangle. Both are functionally clear but visually indistinguishable from a debug readout.

## 6. In-world text reads as placeholder/debug (Medium)
**Where:** `Tower.draw()` (`Lv${this.level}` centered on the tower square), `TownCore.draw()` (`${hp}/${maxHp}` above the core).
**Problem:** bold generic sans-serif numbers stamped directly onto a shape look like debug output rather than a UI element (no background chip, no icon, no stylization).

## 7. Dashed town-bounds circle reads as a leftover debug gizmo (Medium)
**Where:** `drawBackground()`, the `ctx.setLineDash([6,8])` circle at `TOWN_BOUNDS_RADIUS`.
**Problem:** a thin dashed white line at 15% opacity is a classic "temporary visual aid" pattern (hitbox/range indicators, editor guides). It doesn't read as an intentional part of the world (e.g., a wall, hedge, or path boundary).

## 8. No hit feedback on enemies (Medium)
**Where:** `Enemy.takeDamage()` in `src/entities.js`.
**Problem:** the only feedback that an enemy was hit is its HP bar shrinking. There's no flash, no knockback, no impact spark — hits don't feel like they land.

## 9. No feedback when the town core takes damage (Medium)
**Where:** `TownCore.takeDamage()` in `src/entities.js`.
**Problem:** losing core HP — the game's core tension/lose condition — has no visual urgency: no screen flash, no shake, no pulsing warning. A player could take heavy damage without noticing.

## 10. Bullets and pickups are plain flat dots (Low-Medium)
**Where:** `Projectile.draw()`, `Gold.draw()` in `src/entities.js`.
**Problem:** projectiles are small flat-colored circles with no trail, glow, or motion blur; gold pickups are a flat yellow circle with a brown outline. Both are functional but visually inert — for objects that are supposed to feel exciting (shooting, earning currency), they carry no "juice."

## 11. No distinct typography/branding (Low)
**Where:** `style.css` (DOM) uses `'Segoe UI', Arial`; canvas text (`src/renderer.js`, `src/entities.js`) uses generic `sans-serif`.
**Problem:** nothing in the type treatment signals "game" — no display font for the title/HUD numbers, just default system sans-serif everywhere. Low priority since the fonts are at least mutually consistent, but it's a missed opportunity for identity.

## 12. Overlay panels don't reflect game state visually (Low)
**Where:** `.panel` class in `style.css`, shared by start/win/lose overlays.
**Problem:** the win and lose panels use the same neutral dark-gray panel styling as the start screen. A win should feel triumphant (warmer/gold-toned panel, maybe a subtle glow) and a loss should feel bleak (colder/red-toned panel) — right now both just show different text in an identical box.
