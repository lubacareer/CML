# Decisions

## Sprint 0

- Use Phaser with TypeScript and Vite for the browser runtime.
- Keep the game at a fixed logical resolution of `1280x720` and let Phaser scale responsively.
- Preserve original generated PNGs in the project root and copy runtime versions into `public/assets`.
- Keep game rules and data models in plain TypeScript so Sprint 1 logic can be covered by Vitest.
- Use DOM-accessible test anchors around the Phaser canvas so Playwright tests do not need to inspect canvas pixels for smoke coverage.

## Sprint 1

- Route Phaser through `BootScene` -> `PreloadScene` -> `OfficeScene` so asset loading stays separate from office rendering.
- Keep scene content in JSON and route all hotspot hit detection through `HotspotSystem`.
- Use a temporary Phaser marker for P. Hazel until Sprint 2 defines sprite sheet frames and animation states.
- Render dialogue and debug status with DOM overlays so text remains readable and Playwright can assert UI state reliably.
- Keep unsupported verbs and custom actions as visible fallback dialogue instead of silently failing.
- Use Phaser's canvas renderer for the first 2D slice to avoid unnecessary WebGL context churn in headless tests.
- Keep hotspot debug rectangles hidden by default in development and expose them with `H`; hover labels identify clickable objects without covering the art.

## Sprint 2

- Use `Hazel2.png` as the approved character source instead of generating new artwork.
- Normalize Hazel into fixed `192x360` transparent Phaser frames with a deterministic Node script.
- Keep original source art unchanged and write runtime output to `public/assets/characters/hazel-normalized.png`.
- Move player state into `PlayerController2D` so walk/idle/facing behavior can be tested outside Phaser.
- Constrain office movement with explicit walkable polygons and navigation nodes rather than allowing arbitrary screen clicks.
- Route across multiple waypoints when a direct line would leave the walkable floor, which keeps Hazel from crossing the desk.
- Keep the first map/street navigation slice intentionally small: office door exits to street, `M` opens the map preview, and unimplemented map locations return placeholder dialogue.

## Directional Asset Pass

- Use built-in image generation with chroma-key source sheets, then commit only project-bound source strips and deterministic runtime outputs.
- Keep approved `Hazel2.png` side movement as the source of truth for side animations; use generated art only for missing front/back movement.
- Store generated raw sheets in `source-assets/` and regenerate runtime PNGs with `npm run build:assets`.
- Keep point-and-click controls as DOM UI so toolbar buttons are accessible and Playwright-addressable.

## Sprint 3

- Keep the first case start in the existing office phone flow instead of opening new cafe, police, or alley gameplay yet.
- Treat dialogue progression as gameplay state owned by `DialogueSystem`; Phaser scenes only pass input to the system and render the returned view.
- Apply dialogue effects when a node completes, so `case001_started` and `map_unlocked` are set only after Hazel finishes accepting the case.
- Gate map access behind `map_unlocked`; pre-case map commands return Hazel dialogue and keep the current scene active.
- Embed the newly generated cafe, police kiosk, alley, NPC, and invalid alibi assets as preview-only map destinations with stable keys while preserving the source assets unchanged.

## Sprint 4

- Treat Sprint 4 as a reconciliation sprint because street rendering, office/street transitions, and map preview routing already existed.
- Keep street content data-driven in `street.json` and add only look responses for missing official street hotspots.
- Preserve case flags and inventory in `GameState` across scene changes instead of introducing a separate transition state store.
- Defer inventory effects, cafe gameplay, and puzzle-chain unlocks to later sprints.
