# Changelog

## Unreleased

- Reconciled Sprint 4 street content with agency sign, cafe, suspicious footprints, newspaper box, manhole cover, bicycle, and oddities shop hotspots.
- Added scene-state and browser coverage for preserving case flags through office-to-street transitions.
- Added Sprint 3 branching dialogue progression for the first client phone call.
- Added the `answer_phone` custom action, which starts `case001_missing_logic` and sets `case001_started` plus `map_unlocked`.
- Gated map access behind `map_unlocked` while keeping the existing office, street, and map preview flow.
- Embedded cafe, police kiosk, alley, NPC, and invalid alibi runtime assets as preview-only map destinations for later sprints.
- Added dialogue branching/effects, custom action, asset, and phone-call map unlock coverage.
- Added AI-generated source strips for Hazel front/back movement and point-and-click toolbar icons.
- Added deterministic builders for `hazel-4dir.png` and runtime toolbar icon PNGs.
- Added four-direction Hazel idle/walk animation support and dominant-axis facing updates.
- Added a compact icon toolbar for walk, look, use, talk, exit, map, and inventory.
- Added asset, directional movement, toolbar, map, and exit coverage.

## 0.2.0 - Sprint 2

- Added deterministic Hazel sprite normalization from `Hazel2.png`.
- Added a Phaser spritesheet for Hazel side idle, walk, front idle, think, surprised, and talk frames.
- Replaced the temporary Hazel marker with an animated sprite.
- Added pure path-following movement state through `PlayerController2D`.
- Enlarged Hazel in-scene and added office depth scaling.
- Added office walkable-area navigation so Hazel can move vertically while staying off blocked furniture areas.
- Added a minimal office door exit, street scene, and map preview transitions.
- Added asset, movement, navigation, scene-exit, and browser movement coverage.

## 0.1.0 - Sprint 1

- Added the playable office scene vertical slice.
- Added data-driven office hotspot and dialogue JSON.
- Added scene loading, hotspot detection, dialogue resolution, and game state systems.
- Added DOM dialogue/debug overlays and Phaser hotspot debug rectangles in dev mode.
- Added Vitest coverage for scene data, hotspots, and flags, plus Playwright coverage for office dialogue.

## 0.0.0 - Sprint 0

- Bootstrapped Phaser, TypeScript, and Vite project structure.
- Added Vitest and Playwright smoke test targets.
- Added fixed `1280x720` game constants and core data interfaces for Sprint 1.
- Copied initial root assets into the runtime `public/assets` layout.
- Added placeholder BootScene for the first runnable game shell.
