# The Case of the Missing Logic

A code-first 2D point-and-click comedy mystery game built with Phaser, TypeScript, and Vite.

## Setup

```bash
npm install
npm run dev
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
- `public/assets/characters/hazel_spritesheet.png`
- `public/assets/characters/hazel-4dir.png`
- `public/assets/ui/icons/*.png`

The original generated PNGs are preserved in the project root. AI-generated source strips are preserved under `source-assets/`.

## Controls

- Left click: walk / interact
- Toolbar icons: choose walk/look/use/talk, exit, map, or inventory
- Space or click: advance dialogue
- Esc: close dialogue/menu
- H: toggle hotspot debug rectangles in development
- I: inventory
- M: open the map preview after the first case starts

## Current playable slice

Sprint 4 boots directly into P. Hazel's office. You can click valid floor space to move Hazel through the office walkable area with directional walk/idle animations. The office floor is constrained by scene navigation polygons, so Hazel routes around the desk instead of walking across the whole screen. Hover/click the five office hotspots to inspect them.

Use the phone to answer the first client call. The branching conversation starts `case001_missing_logic`, sets `case001_started`, and unlocks the map. Before that call, `M` and the toolbar map icon show Hazel's locked-map response instead of leaving the current scene.

Click the office door or toolbar exit icon to reach the street scene. The street includes agency sign, cafe, suspicious footprints, newspaper box, manhole cover, bicycle, and oddities shop hotspots. After the phone call, press `M` or use the toolbar map icon from office or street to open the map preview. Detective Agency Office returns to the office; Daisy's Cafe, the police kiosk, and the narrow alley open generated-art preview scenes while their gameplay remains locked for later sprints.

Dialogue appears in a DOM overlay and can be advanced with click or Space, or closed with Esc.

Cafe, police kiosk, alley, cafe owner, overly rational pigeon, and invalid alibi art are embedded as preview-only map destinations. These are visual staging screens, not full gameplay scenes yet.

## Asset scripts

```bash
npm run build:assets
```

This normalizes the approved `Hazel2.png` character sheet and AI source strips into Phaser-ready runtime assets, including `hazel-normalized.png`, `hazel-4dir.png`, and toolbar icons.

## Development style

This project follows short agile sprints. Sprint 0 established the Phaser/Vite/TypeScript shell, tests, docs, and asset layout. Sprint 1 added the first playable office scene. Sprint 2 replaced the temporary marker with Hazel sprite animation. Sprint 3 added branching phone dialogue and case-start map unlocking. Sprint 4 reconciled street scene content and transition coverage.
