# High-Impact Upgrades

These take more effort than the quick wins but move the game from "polished prototype" to "feels like a real product." None require leaving the current zero-build-step vanilla-canvas architecture — they're bigger in scope, not in tooling.

## 1. A real environment layer
**Where:** `drawBackground()` in `src/renderer.js`, plus a new pass that runs once (or is cached to an off-screen canvas) rather than every frame.
**What:**
- Fill the town interior (inside `TOWN_BOUNDS_RADIUS`) with a visually distinct ground tone (e.g. packed dirt/cobblestone color) vs. the wilderness beyond it, instead of one flat color everywhere.
- Replace the dashed debug-style boundary circle with something diegetic: a low fence/hedge ring, or simply a soft gradient blend between the two ground tones.
- Scatter a fixed set of static decorative props (rocks, bushes, dead trees, fence posts) between the town ring and the spawn ring, generated once at game start with a seeded random layout so it's not flat emptiness.
- Add a faint tileable texture/noise to the ground fill instead of a pure solid color, so large flat areas don't look like a placeholder rectangle.
**Why it matters:** this is the biggest "does the world feel designed" lever in the project. Right now roughly 2/3 of the visible map is unused flat color.

## 2. A lightweight particle system
**Where:** new `src/particles.js` (or a `Particle` class alongside the others in `src/entities.js`), driven from `Game.update()`/`Game.render()` like the other entity arrays.
**What:** a generic short-lived particle (position, velocity, life, color, size-over-life) reused for:
- Enemy death burst (handful of particles scattering from the enemy's color on death).
- Impact sparks where a projectile hits an enemy.
- Muzzle flash at the player/tower barrel on fire.
- A trailing sparkle on gold as it's collected.
- Embers/dust when the core takes damage.
**Why it matters:** this is the single highest-leverage "feels premium" investment listed anywhere in this audit — one reusable system pays off across five different moments the player experiences constantly.

## 3. Damage numbers and core-damage screen feedback
**Where:** extends the "hit-flash" quick win into a full floating-combat-text system; extends the "core damage flash" quick win into a fuller effect.
**What:**
- Floating "-N" damage numbers rising and fading above enemies/the core on every hit (reuse the same lightweight text-particle approach as the gold "+N" quick win).
- A brief, capped screen-shake (translate the canvas render by a few pixels for ~0.1s) when the core takes a hit, in addition to the red vignette flash from the quick-wins list.
- A persistent low-HP warning state on the core (pulsing red glow/outline) once it drops below ~30%, separate from the one-off damage flash.
**Why it matters:** turns numeric feedback (HP bars ticking) into readable, felt feedback — players should be able to tell how the fight is going without reading numbers.

## 4. A cohesive "designed icon" pass on every entity silhouette
**Where:** every `draw()` method in `src/entities.js`.
**What:** without adding external art assets, redraw each shape as a slightly more detailed layered-vector icon instead of a single primitive:
- Core: a small keep/tower silhouette with a roof and a flag that could wave slightly.
- Tower: a turret shape with a barrel that visibly rotates to track its current target (`Tower.update()` already computes the target angle — just use it to orient a drawn barrel instead of only firing invisibly).
- Forge: an anvil/flame silhouette instead of a plain triangle.
- Enemies: a directional notch, simple "eye," or shoulder shape indicating facing (their movement angle is already computed in `Enemy.update()` and currently thrown away visually).
- Player: a simple humanoid/vehicle silhouette instead of a plain circle, still oriented by the existing `aimAngle`.
**Why it matters:** this is what actually gives the project a *style* rather than a shape convention — right now none of the silhouettes reads as its theme without a label.

## 5. Lighting and atmosphere pass
**Where:** `Game.render()` in `src/game.js` (add draw calls before/after the existing entity loop), plus `drawBackground()`.
**What:**
- A soft vignette darkening the screen edges to focus attention toward the center of play.
- A subtle warm glow/radial highlight around the town core (reinforces it as the "safe zone"/objective).
- A slow color-grade shift as `elapsedTime` increases (e.g. the ambient light cools/dims slightly as difficulty ramps toward the 10-minute mark) to reinforce escalating tension — purely a global overlay tint tied to `game.elapsedTime / CONFIG.MATCH_DURATION`, no new assets needed.
**Why it matters:** ties the visual presentation to the game's actual difficulty curve, so the world *feels* like it's getting harder, not just the numbers.
