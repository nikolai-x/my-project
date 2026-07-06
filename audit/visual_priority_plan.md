# Visual Priority Plan

## Top 5 visual problems
1. Flat, unshaded fills everywhere — no volume, no depth (`src/entities.js`, all `draw()` methods).
2. Zero animation or transition anywhere — every state change is an instant cut.
3. Empty, textureless world — one flat-color rectangle for the whole map (`drawBackground()`).
4. Low contrast between the core/towers and the background — the most important objects blend in the most.
5. HUD and tooltip look like debug overlays rather than designed UI (`drawHud()`, `drawTooltip()`).

## Top 5 quick wins
1. Drop shadows under every entity.
2. Radial gradient fills instead of flat colors.
3. Hit-flash on enemies + core damage flash/vignette.
4. Recolor the core/tower for contrast against the ground.
5. Redesign the HUD into icon "chips" instead of plain `fillText` on a bar.

(Full list with implementation notes in [quick_wins.md](quick_wins.md) — 12 items total, all CSS/canvas-only, no new assets.)

## Top 5 high-impact upgrades
1. A real environment layer: town-vs-wilderness ground distinction, props, texture.
2. A lightweight particle system (death bursts, impact sparks, muzzle flash, gold sparkle).
3. Damage numbers + fuller core-damage feedback (screen shake, persistent low-HP glow).
4. A cohesive "designed icon" pass on every entity silhouette (turret barrel rotation, directional enemies, keep-shaped core, anvil-shaped forge).
5. A lighting/atmosphere pass (vignette, core glow, difficulty-tied color grade).

(Full detail in [high_impact_upgrades.md](high_impact_upgrades.md).)

## Recommended order of operations

**Phase 1 — do first (1 focused pass, no new assets):**
All 12 items in [quick_wins.md](quick_wins.md). These are individually small (most are a few lines inside an existing `draw()`/`update()` method or a CSS rule) but compound heavily — shadows + gradients + hit-flash + a redesigned HUD alone would resolve 4 of the 5 "top problems" above. This is the highest ratio of visual improvement to effort in the entire audit, and every later phase builds visually on top of it (e.g. the particle system in Phase 2 looks better once shapes already have gradients/shadows).

**Phase 2 — do next (bigger but still self-contained):**
Particle system (#2 in high-impact) and damage numbers/core feedback (#3). These directly extend the Phase 1 hit-flash/pickup-pop work into fuller effects and are the biggest remaining "does this feel alive" gap once flat shading is fixed.

**Phase 3 — plan for later:**
Environment layer (#1) and the designed-icon silhouette pass (#4) are the most valuable remaining upgrades but are also the largest scope items (new static-layout generation, redrawing every entity's shape rather than tweaking its fill). Good candidates for a dedicated pass once the moment-to-moment feedback (Phases 1–2) is already solid, since a nicer environment matters more once the player is actually looking around rather than head-down watching flat HP bars.

**Phase 4 — nice to have, no urgency:**
Full lighting/atmosphere pass (#5 in high-impact) and cosmetic touches like distinct win/lose panel tinting, custom display typography. These add final polish but don't fix any of the "looks unfinished" problems on their own — save them for after Phases 1–3 land.

## What NOT to do yet
Don't invest in a bitmap/sprite art pipeline or external asset loading yet — every recommendation above is achievable in pure canvas drawing code within the existing zero-build-step architecture. Introducing image assets is a legitimate future direction, but it's a bigger architectural change (asset loading/preloading, sprite sheets) than anything needed to fix the problems identified here.
