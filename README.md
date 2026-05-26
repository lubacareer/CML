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
- M: open the map preview from office or street

## Current playable slice

Sprint 2 boots directly into P. Hazel's office. You can click valid floor space to move Hazel through the office walkable area with directional walk/idle animations. The office floor is constrained by scene navigation polygons, so Hazel routes around the desk instead of walking across the whole screen. Hover/click the five office hotspots to inspect them.

Click the office door or toolbar exit icon to reach the street scene. Press `M` or use the toolbar map icon from office or street to open the map preview, then click Detective Agency Office or Cozy Cafe / Street to transition between the implemented scenes. Locked map locations show placeholder Hazel dialogue.

Dialogue appears in a DOM overlay and can be advanced with click or Space, or closed with Esc.

## Asset scripts

```bash
npm run build:assets
```

This normalizes the approved `Hazel2.png` character sheet and AI source strips into Phaser-ready runtime assets, including `hazel-normalized.png`, `hazel-4dir.png`, and toolbar icons.

## Development style

This project follows short agile sprints. Sprint 0 established the Phaser/Vite/TypeScript shell, tests, docs, and asset layout. Sprint 1 added the first playable office scene. Sprint 2 replaces the temporary marker with Hazel sprite animation.
