# Visual Summary — The Last Village

Scope: visual quality only (art, color, UI, animation, environment). Gameplay/logic is out of scope and was not touched.

## 1. Overall visual impression

**Verdict: reads as a functional prototype, not a finished product.** Every entity is a flat-filled canvas primitive (circle, rectangle, triangle) in a single solid color with a thin stroke outline. There is no shading, no shadow, no gradient, and no animation anywhere in the world layer. This is exactly what an MVP should look like at this stage — but it currently looks unfinished rather than "intentionally minimal."

**What already looks good:**
- The DOM overlays (`index.html` start/win/lose panels + `style.css`) are the most polished part of the project: rounded panel, consistent accent colors (`#ffd54a` gold headers, `#8be36b` green prompts), reasonable padding/line-height, and a real button hover state. This is a good baseline to extend the rest of the UI toward.
- Shape language is at least *legible*: circles = mobile units (player/enemies/gold), squares = buildings (core/tower), triangle = forge. Silhouette differentiation works even without color.
- The color palette, while drab, is at least consistent — no clashing hues.

**What makes it feel cheap:**
- Flat single-color fills everywhere with zero shading (`src/entities.js` — every `draw()` method is `ctx.fillStyle = <flat hex>; ctx.fill()`).
- No drop shadows, so nothing visually sits "on top of" the ground — everything looks pasted onto the same flat plane.
- No animation or transition of any kind — entities pop into and out of existence instantly (built tower, dead enemy, collected gold, overlay swap).
- The world background is a single flat-filled rectangle (`drawBackground()` in `src/renderer.js`) with one dashed circle — reads as a debug/wireframe layer rather than a designed environment.
- In-world text (tower level, core HP) is plain bold sans-serif `fillText`, identical in weight/style to a debugging overlay.

**What to improve first:** see [visual_priority_plan.md](visual_priority_plan.md) — in short, add shadows/gradients to existing shapes and a hit/death/pickup animation pass before touching anything else. Those two changes alone would change the game's perceived quality more than any other single investment.

## 2. Art style

There isn't yet a deliberate art *style* — there's a shape/color convention, but nothing that says "medieval siege village" beyond the green background and brown core square. A player dropped into this game with no labels would read it as an abstract top-down arena shooter, not a village defense game.

- **Consistency:** assets don't clash (nothing is mismatched or stretched — there are no bitmap assets at all yet, so there's nothing to be *blurry*), but nothing reinforces the theme either. The core is a plain brown square, the tower is a plain green square, the forge is an orange triangle — none of these silhouettes reads as "keep," "turret," or "forge" without the HUD tooltip text telling you.
- **Recommended direction:** stay in pure canvas-vector territory (no art pipeline needed) but move from "flat geometric primitive" to "simple stylized icon": a tower with a distinguishable barrel/roof, a core with a keep silhouette + banner, a forge with a flame/anvil silhouette, enemies with a directional facing (a notch or eye toward their movement direction) instead of a plain dot. This is achievable with layered canvas shapes and gradients — no new asset pipeline required, matching the project's zero-build-step constraint.

## 3. Color and lighting

- **Palette:** background `#3f6b3f` (dull olive green), core `#7a6a4a` (muddy brown), tower `#4a6b3a` (dark green), forge `#b05c22` (burnt orange), player `#3aa6ff` (bright blue), enemies `#e05a2b` / `#5a2b6e`. The palette is desaturated and low-contrast — core and tower colors sit close in value/hue to the background, so buildings don't visually "pop."
- **Contrast:** the player (bright blue) and gold (bright yellow) read fine against the green ground. The core, tower, and town-bounds indicator are all low-contrast against the same green — the most important object in the game (the thing you lose if it dies) currently blends in the most.
- **Lighting:** none. No gradients, no shadows, no glow, no ambient light/vignette. Everything is uniformly lit flat color, which is the single biggest reason the game reads as "unfinished."
- **Separation from background:** weak for buildings, fine for mobile units. A simple drop shadow + slight background darkening would fix most of this in one pass.

## 4. UI quality

- **HUD** (`drawHud()` in `src/renderer.js`): a flat black 40%-opacity bar with three unstyled `fillText` calls (Gold / Time / Core). No icons, no card backgrounds, no separators — functionally correct, visually a debug readout.
- **Tooltip** (`drawTooltip()`): a plain dark rectangle with a white border, no rounded corners, no icon, no pointer/arrow. Works, looks like a native browser tooltip rather than a designed game UI element.
- **DOM overlays** (start/win/lose): the best-looking UI in the project already — rounded corners, consistent accent colors, real hover states.
- **Fonts:** DOM uses `'Segoe UI', Arial` (fine, consistent). Canvas text uses generic `sans-serif` bold — on most systems this resolves close to the DOM font, so it isn't clashing, but there's no distinct display/heading typeface anywhere to give the game a visual identity.
- **Spacing:** DOM panel spacing is fine. Canvas HUD is cramped onto a single 44px bar with no breathing room between the three stats.
- **What to redesign first:** the HUD bar and the tooltip — both are quick, self-contained changes (see [quick_wins.md](quick_wins.md)).

## 5. Animation and visual feedback

This is the largest gap in the project. Currently:
- Enemies die and vanish in the same frame with no death effect.
- Gold pops in at the death position and vanishes instantly on pickup with no motion toward the player or "+N" feedback.
- Towers/upgrades appear/change instantly with no build/level-up flourish.
- Enemies show no reaction to being hit (no flash, no knockback) beyond their HP bar shrinking.
- The town core shows no feedback when it takes damage beyond the HP bar and HUD number ticking down.
- Overlay transitions (`main.js` `syncOverlay()`) are instant `display:none`/`flex` toggles — no fade.

None of this is a logic problem — it's a pure rendering/juice gap, and it's the fastest lever to make the game feel "alive" rather than "simulated."

## 6. Backgrounds and environment

- The entire playable map is one flat-filled rectangle. The only environmental marking is a single dashed circle at `TOWN_BOUNDS_RADIUS` (260px) around the core, drawn in low-opacity white — this currently reads as a debug gizmo, not world geography.
- There is no path/road, no scattered props (rocks, bushes, fences), no ground texture/variation, and no visual distinction between "inside the town" and "the wilderness enemies walk in from." The ~450px of space between the town bounds and the spawn ring (500px) is completely empty flat green.
- Enemies spawn and walk in from off the visible canvas edge in many cases, so the player rarely even sees the "wilderness" — but when they do, it's visually inert.
- Biggest single environment win: differentiate the town interior from the wilderness with a filled ground-color change (not just a dashed outline) plus a handful of static decorative props scattered outside the town ring.

## Where to look next

- [visual_problems.md](visual_problems.md) — full problem list with severity.
- [quick_wins.md](quick_wins.md) — low-effort / high-visibility fixes, no new assets needed.
- [high_impact_upgrades.md](high_impact_upgrades.md) — bigger investments worth planning for.
- [visual_priority_plan.md](visual_priority_plan.md) — recommended order of operations.
