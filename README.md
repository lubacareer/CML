# The Case of the Missing Logic

A code-first 2D point-and-click comedy mystery game built with Phaser, TypeScript, and Vite.

## Setup

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm test
npm run test:e2e
```

## Tests

```bash
npm test
npm run test:e2e
```

## Asset placement

Runtime asset copies live here:

- `public/assets/backgrounds/office.png`
- `public/assets/backgrounds/street.png`
- `public/assets/backgrounds/map.png`
- `public/assets/backgrounds/cafe.png`
- `public/assets/backgrounds/police-kiosk.png`
- `public/assets/backgrounds/alley.png`
- `public/assets/characters/npcs/cafe_owner.png`
- `public/assets/characters/npcs/overly_rational_pigeon.png`
- `public/assets/items/cold-coffee.png`
- `public/assets/items/invalid_alibi.png`
- `public/assets/characters/hazel_spritesheet.png`
- `public/assets/characters/hazel-4dir.png`
- `public/assets/ui/icons/*.png`

The original generated PNGs are preserved in the project root. AI-generated source strips are preserved under `source-assets/`.

## Controls

- Left click: walk / interact
- Toolbar icons: choose walk/look/use/talk, exit, map, inventory, or fullscreen
- Space or click: advance dialogue
- Esc: close dialogue/menu
- H: toggle hotspot debug rectangles when `VITE_CML_DEBUG_HOTSPOTS=true`
- F: toggle fullscreen
- I: inventory
- M: open the map after the first case starts
- S: save the current game from office, street, cafe, police kiosk, or map

## Current playable slice

Sprint 9A opens on a title screen. Start Game resets the current run and enters P. Hazel's office. Continue is enabled only when a valid local save exists, and restores saved office, street, cafe, police kiosk, or map progress from `localStorage`.

You can click valid floor space to move Hazel through the office walkable area with directional walk/idle animations. The office floor is constrained by scene navigation polygons, so Hazel routes around the desk instead of walking across the whole screen. Hover/click the five office hotspots to inspect them.

Use the phone to answer the first client call. The branching conversation starts `case001_missing_logic`, sets `case001_started`, and unlocks the map. Before that call, `M` and the toolbar map icon show Hazel's locked-map response instead of leaving the current scene.

Use the coffee machine with the Use action to pick up `cold_coffee`, or visit Daisy's Cafe from the map and take Cold Coffee from the counter. Press `I` or the toolbar inventory icon to open Hazel's suitcase inventory, close it with the `x` button when needed, select Cold Coffee from the icon grid, then use it on the locked drawer for a specific failure response. Other wrong item uses return a generic Hazel fallback line.

Click the office door or toolbar exit icon to reach the street scene. Inspect the suspicious footprints, talk to Daisy inside the cafe for testimony, and use Cold Coffee on the Overly Rational Pigeon to receive `invalid_alibi`. Select the Invalid Alibi in the suitcase, file it at the police kiosk from the map, then use the kiosk paperwork after Daisy's testimony to unlock the narrow alley preview.

After the phone call, press `M` or use the toolbar map icon from office, street, cafe, or kiosk to open the map. Detective Agency Office returns to the office, Daisy's Cafe opens the cafe scene, and the police kiosk opens after `invalid_alibi` has been filed. Oddities museum, boarding house, and docks remain locked with Hazel's placeholder responses until later case progress unlocks them.

Dialogue appears in a DOM overlay and can be advanced with click or Space, or closed with Esc.
Dialogue now uses a skippable typewriter effect: click or Space completes the current line while it is typing, then advances after the line is complete. Users who prefer reduced motion receive instant dialogue lines.

Use the toolbar Save icon or press `S` to save explicit progress. The saved snapshot includes the current scene, flags, inventory, active case, and selected item.

Cafe, police kiosk, alley, cafe owner, overly rational pigeon, Cold Coffee, and invalid alibi art are embedded as runtime assets. Cafe and police kiosk are playable scenes; the alley remains the unlocked preview target for this storyline increment.

## Asset scripts

```bash
npm run build:assets
```

This normalizes the approved `Hazel2.png` character sheet and AI source strips into Phaser-ready runtime assets, including `hazel-normalized.png`, `hazel-4dir.png`, and toolbar icons.

## Static deployment

```bash
npm run build
npm run preview
```

The production build writes static files to `dist/`. Deploy that folder to static hosting with history fallback disabled; the game uses a single `index.html` and relative asset URLs.

## Known limitations

- The alley is still an unlocked preview scene, not a full investigation location.
- Oddities museum, boarding house, and docks remain locked placeholder map destinations.
- Audio cues are generated placeholder WebAudio tones.
- Saves are single-slot local browser saves under `localStorage`, not cloud or multi-profile saves.

## Development style

This project follows short agile sprints. Sprint 0 established the Phaser/Vite/TypeScript shell, tests, docs, and asset layout. Sprint 1 added the first playable office scene. Sprint 2 replaced the temporary marker with Hazel sprite animation. Sprint 3 added branching phone dialogue and case-start map unlocking. Sprint 4 reconciled street scene content and transition coverage. Sprint 5 added inventory pickup, item selection, and item-on-hotspot responses. Sprint 6 made the illustrated map a gated navigation screen. Sprint 7 added the first playable puzzle chain from phone call to alley unlock. Sprint 8 added title-screen start/continue, explicit local saves, skippable typewriter dialogue, scene fades, hover/debug polish, and placeholder audio cues. Sprint 9A turns Daisy's Cafe and the police kiosk into playable story scenes before demo packaging. Sprint 9 packages the demo for static hosting with shareable docs.
