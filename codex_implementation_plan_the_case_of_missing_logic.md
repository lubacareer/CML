# Codex Implementation Plan — *The Case of the Missing Logic*

## Purpose

You are Codex working inside VS Code on a code-first 2D point-and-click adventure game.

The game is called **The Case of the Missing Logic**.

The project should be implemented without Unity. Use a browser-based stack:

- **Phaser** for the 2D game runtime.
- **TypeScript** for maintainable game code.
- **Vite** for local development and bundling.
- **Vitest** for unit/integration tests of pure game logic.
- **Playwright** for end-to-end browser tests.

The target development style is **agile**, with small vertical slices per sprint. Each sprint must produce a working, testable increment.

---

## Product Vision

Build a humorous 2D point-and-click adventure game inspired by classic comedy adventure games.

The player controls **P. Hazel**, a clever but slightly overwhelmed female detective who runs a tiny agency that solves impossible and extremely stupid cases.

Opening case:

> A client claims that logic itself has gone missing. People in town can still speak, argue, complain, and accuse each other, but none of their arguments make sense anymore.

Tone:

- Comedy mystery.
- Playful absurdity.
- Light detective noir parody.
- Strong environmental jokes.
- Puzzle logic based on dialogue, objects, inventory, and scene state.

Core player loop:

1. Explore a 2D scene.
2. Click hotspots.
3. Inspect objects.
4. Talk to characters.
5. Collect items.
6. Use items on hotspots or people.
7. Unlock new dialogue, clues, and locations.
8. Solve the current case.

---

## Technical Stack

Use this stack unless the repository already exists with a different compatible setup.

```bash
npm create @phaserjs/game@latest
```

Preferred setup options:

```text
Project type: Web Bundler
Bundler: Vite
Language: TypeScript
Template: Minimal
```

After project creation, install test tools:

```bash
npm install -D vitest @playwright/test
npx playwright install
```

Required npm scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

If ESLint is not installed in the template, either install and configure it or omit the lint script until Sprint 1 cleanup.

---

## High-Level Architecture

The game must be **data-driven** wherever possible.

Avoid hardcoding hotspot coordinates, dialogue text, puzzle flags, and inventory rules directly into Phaser scene classes.

Use Phaser scenes mainly as rendering/input controllers. Put game state and rules in plain TypeScript classes so they can be tested with Vitest.

### Main folders

```text
public/
  assets/
    backgrounds/
      office.png
      street.png
      map.png
    characters/
      hazel_spritesheet.png
    ui/
    audio/

src/
  main.ts
  game/
    config.ts
    constants.ts
    types.ts
  scenes/
    BootScene.ts
    PreloadScene.ts
    OfficeScene.ts
    StreetScene.ts
    MapScene.ts
  systems/
    GameState.ts
    SceneDataLoader.ts
    HotspotSystem.ts
    DialogueSystem.ts
    InventorySystem.ts
    PuzzleSystem.ts
    SaveSystem.ts
    InputModeSystem.ts
  ui/
    DialogueBox.ts
    InventoryBar.ts
    InteractionMenu.ts
    CursorLabel.ts
  data/
    scenes/
      office.json
      street.json
      map.json
    dialogue/
      intro.case.json
      office.dialogue.json
      street.dialogue.json
    puzzles/
      case001.missing-logic.json
  tests/
    inventory.test.ts
    dialogue.test.ts
    hotspots.test.ts
    puzzle-state.test.ts
e2e/
  office.spec.ts
  map.spec.ts
```

---

## Game Design Constraints

### Resolution

Use a fixed logical resolution:

```ts
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
```

Scale responsively in the browser while preserving aspect ratio.

### Art

Initial asset names are placeholders. The user will place generated PNG assets into:

```text
public/assets/backgrounds/office.png
public/assets/backgrounds/street.png
public/assets/backgrounds/map.png
public/assets/characters/hazel_spritesheet.png
```

Do not assume the assets are perfectly sliced yet. Build a first working implementation that can display the whole spritesheet if slicing data is not final. Then add frame definitions in Sprint 2.

### Controls

Required first controls:

- Left-click empty walkable area: Hazel walks there.
- Left-click hotspot: perform default interaction, initially `look`.
- Optional later: verb menu with `Look`, `Talk`, `Use`, `Pick up`.
- `Esc`: close dialogue/menu.
- `I`: toggle inventory.
- `M`: open map scene after unlocked.

### Movement

For the MVP, do not implement pathfinding. Use simple horizontal click-to-move within a scene.

For early prototype:

- Hazel moves toward the clicked x-position.
- Hazel stays on a fixed baseline y-position per scene.
- Walking animation plays while moving.
- Idle animation plays after arrival.
- Sprite flips depending on direction.

Later improvement:

- Use walkable polygons or navigation points if needed.

---

## Core Data Models

Create strong TypeScript interfaces.

### Scene data

```ts
export type SceneId = "office" | "street" | "map";

export interface GameSceneData {
  id: SceneId;
  backgroundKey: string;
  playerStart: {
    x: number;
    y: number;
  };
  walkBaselineY: number;
  exits: SceneExitData[];
  hotspots: HotspotData[];
}

export interface SceneExitData {
  id: string;
  targetScene: SceneId;
  x: number;
  y: number;
  width: number;
  height: number;
  requiredFlag?: string;
}

export interface HotspotData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  defaultVerb: InteractionVerb;
  interactions: Partial<Record<InteractionVerb, InteractionResult>>;
  requiredFlag?: string;
  hiddenWhenFlag?: string;
}

export type InteractionVerb = "look" | "talk" | "use" | "pickup";

export type InteractionResult =
  | { type: "dialogue"; dialogueId: string }
  | { type: "text"; text: string }
  | { type: "addItem"; itemId: string; text?: string }
  | { type: "setFlag"; flag: string; text?: string }
  | { type: "changeScene"; sceneId: SceneId }
  | { type: "custom"; actionId: string };
```

### Game state

```ts
export interface GameStateSnapshot {
  currentScene: SceneId;
  flags: Record<string, boolean>;
  inventory: string[];
  activeCaseId: string;
}
```

---

## Initial Scene Data

Create `src/data/scenes/office.json`.

```json
{
  "id": "office",
  "backgroundKey": "office",
  "playerStart": { "x": 300, "y": 610 },
  "walkBaselineY": 610,
  "exits": [
    {
      "id": "office_door",
      "targetScene": "street",
      "x": 1010,
      "y": 250,
      "width": 170,
      "height": 360
    }
  ],
  "hotspots": [
    {
      "id": "phone",
      "name": "Ringing phone",
      "x": 410,
      "y": 410,
      "width": 110,
      "height": 100,
      "defaultVerb": "look",
      "interactions": {
        "look": {
          "type": "dialogue",
          "dialogueId": "office.phone.look"
        },
        "use": {
          "type": "custom",
          "actionId": "answer_phone"
        }
      }
    },
    {
      "id": "strange_package",
      "name": "Very strange package",
      "x": 740,
      "y": 395,
      "width": 180,
      "height": 160,
      "defaultVerb": "look",
      "interactions": {
        "look": {
          "type": "text",
          "text": "The package is labeled 'Do Not Shake', which is exactly the kind of instruction that creates plot."
        }
      }
    },
    {
      "id": "locked_drawer",
      "name": "Locked drawer",
      "x": 720,
      "y": 575,
      "width": 150,
      "height": 100,
      "defaultVerb": "look",
      "interactions": {
        "look": {
          "type": "text",
          "text": "Locked. Which is rude, because this is my drawer."
        },
        "use": {
          "type": "custom",
          "actionId": "use_item_on_locked_drawer"
        }
      }
    },
    {
      "id": "clue_board",
      "name": "Clue board",
      "x": 430,
      "y": 130,
      "width": 400,
      "height": 220,
      "defaultVerb": "look",
      "interactions": {
        "look": {
          "type": "text",
          "text": "A complete map of the case, assuming the case is mostly string and panic."
        }
      }
    },
    {
      "id": "coffee_machine",
      "name": "Coffee machine",
      "x": 1090,
      "y": 500,
      "width": 130,
      "height": 140,
      "defaultVerb": "look",
      "interactions": {
        "look": {
          "type": "text",
          "text": "The coffee machine looks tired. Professionally, I relate."
        },
        "pickup": {
          "type": "addItem",
          "itemId": "cold_coffee",
          "text": "You acquired Cold Coffee. It has seen things."
        }
      }
    }
  ]
}
```

Coordinates are approximate. Make hotspot boxes visible in debug mode so they can be adjusted quickly.

---

## Initial Dialogue Data

Create `src/data/dialogue/office.dialogue.json`.

```json
{
  "office.phone.look": {
    "speaker": "Hazel",
    "lines": [
      "A ringing phone.",
      "In detective work, that usually means either a client or a bill collector.",
      "Statistically, both are bad."
    ]
  },
  "case001.phone.answer": {
    "speaker": "Client",
    "lines": [
      "Detective Hazel? I need help.",
      "Something terrible has happened.",
      "My argument disappeared halfway through dinner, and now my family agrees with everyone.",
      "Even the cat."
    ],
    "choices": [
      {
        "text": "That does sound unnatural.",
        "next": "case001.phone.hazel_accepts"
      },
      {
        "text": "Are you sure the cat was involved?",
        "next": "case001.phone.cat"
      }
    ]
  },
  "case001.phone.cat": {
    "speaker": "Client",
    "lines": [
      "The cat had motive, opportunity, and a tiny bow tie.",
      "I know what I saw."
    ],
    "next": "case001.phone.hazel_accepts"
  },
  "case001.phone.hazel_accepts": {
    "speaker": "Hazel",
    "lines": [
      "Fine. I will investigate the disappearance of logic.",
      "But if this turns out to be a metaphor, I charge double."
    ],
    "effects": [
      { "type": "setFlag", "flag": "case001_started" },
      { "type": "setFlag", "flag": "map_unlocked" }
    ]
  }
}
```

---

## Initial Puzzle

Case ID:

```text
case001_missing_logic
```

Core puzzle chain for the MVP:

1. Answer the office phone.
2. Start the case.
3. Unlock street/map navigation.
4. Inspect suspicious footprints outside.
5. Visit cafe.
6. Acquire cold coffee.
7. Use cold coffee on "Overly Rational Pigeon" or similar later NPC.
8. Receive "Invalid Alibi".
9. Bring invalid alibi to police kiosk.
10. Unlock alley.

Only implement steps 1–4 in Sprint 1 and Sprint 2. Leave later puzzle chain as TODO data.

---

## Agile Development Process

Use short sprints. Each sprint should create a playable increment.

### Sprint duration

Assume each sprint is 1–3 working days for a solo developer.

### Definition of Done for every sprint

A sprint is done only when:

- The game runs with `npm run dev`.
- The project builds with `npm run build`.
- Unit tests pass with `npm test`.
- E2E tests pass with `npm run test:e2e`, unless the sprint explicitly marks E2E as not yet available.
- New behavior is documented in `CHANGELOG.md`.
- New implementation decisions are documented briefly in `docs/decisions.md`.

### Branch discipline

Use small commits.

Recommended commit format:

```text
feat(scene): add office hotspots
test(dialogue): cover branching phone dialogue
fix(input): close dialogue on Escape
```

---

# Sprint Plan

## Sprint 0 — Project Bootstrap

### Goal

Create a clean Phaser + TypeScript + Vite project that runs in VS Code and has basic testing infrastructure.

### Tasks

- Create project with Phaser official create-game app.
- Install Vitest.
- Install Playwright.
- Add scripts:
  - `dev`
  - `build`
  - `test`
  - `test:watch`
  - `test:e2e`
  - `typecheck`
- Create folder structure.
- Add placeholder asset files or clear `README_ASSETS.md` instructions.
- Add `docs/decisions.md`.
- Add `CHANGELOG.md`.

### Tests

- Add a simple Vitest smoke test.
- Add a simple Playwright smoke test that loads the game page and checks the canvas exists.

### Acceptance criteria

- `npm run dev` opens the game locally.
- `npm run build` succeeds.
- `npm test` succeeds.
- `npm run test:e2e` succeeds.
- A blank or placeholder Phaser scene appears in the browser.

---

## Sprint 1 — Office Scene Vertical Slice

### Goal

Make the detective office playable as a first point-and-click scene.

### Tasks

- Implement `BootScene`.
- Implement `PreloadScene`.
- Implement `OfficeScene`.
- Load `office.png`.
- Place Hazel as a sprite or temporary placeholder.
- Implement fixed-baseline click-to-move.
- Implement basic hotspot rectangles from `office.json`.
- Implement simple debug overlay for hotspots.
- Implement a basic dialogue box.
- Add interactions for:
  - phone
  - strange package
  - locked drawer
  - clue board
  - coffee machine

### Tests

Vitest:

- `SceneDataLoader` loads scene JSON.
- `HotspotSystem` detects clicks inside a hotspot.
- `HotspotSystem` returns no hotspot for empty space.
- `GameState` can set and read flags.

Playwright:

- Game loads office scene.
- Clicking the phone hotspot opens dialogue.
- Pressing `Esc` closes dialogue.

### Acceptance criteria

- Player can click around office.
- Player can click at least 5 hotspots.
- Hotspot text/dialogue appears.
- Dialogue can be closed.
- Tests pass.

---

## Sprint 2 — Hazel Sprite Sheet and Animation

### Goal

Replace placeholder Hazel with the imported sprite sheet and basic animations.

### Tasks

- Import `hazel_spritesheet.png`.
- Define frame dimensions or atlas metadata.
- Implement animations:
  - idle
  - walk
  - talk
  - think
  - surprised
- Use walk animation during movement.
- Use idle animation after movement.
- Flip character depending on movement direction.
- Add a `CharacterController2D` or `PlayerController` class.

### Tests

Vitest:

- Movement target is set correctly.
- Character state changes from `idle` to `walking`.
- Character returns to `idle` after reaching target.

Playwright:

- Clicking a walkable point moves Hazel.
- Hazel remains inside expected scene boundaries.

### Acceptance criteria

- Hazel appears in office.
- Hazel walks smoothly with the 8-frame walk cycle.
- Hazel stops and idles.
- Movement direction flips correctly.

---

## Sprint 3 — Dialogue System and Case Start

### Goal

Implement proper dialogue branching and start the first case from the ringing phone.

### Tasks

- Implement `DialogueSystem`.
- Load dialogue JSON.
- Support:
  - speaker name
  - multiple lines
  - choices
  - `next` dialogue node
  - dialogue effects
- Implement custom action:
  - `answer_phone`
- Starting the case should set:
  - `case001_started`
  - `map_unlocked`
- Add first client phone conversation.

### Tests

Vitest:

- Dialogue node loads by ID.
- Dialogue advances line by line.
- Dialogue choices navigate to correct node.
- Dialogue effects set flags.

Playwright:

- Clicking phone and choosing a dialogue option starts the case.
- After phone call, case flag exists in visible debug panel or test-accessible state.

### Acceptance criteria

- Phone call has branching dialogue.
- Case starts after dialogue.
- Game state updates correctly.
- Tests pass.

---

## Sprint 4 — Street Scene and Scene Transitions

### Goal

Allow the player to leave the office and explore the street.

### Tasks

- Implement `StreetScene`.
- Load `street.png`.
- Add office door exit from office to street.
- Add street entrance back into office.
- Add street hotspots:
  - agency sign
  - cafe door
  - suspicious footprints
  - newspaper box
  - manhole cover
  - bicycle
- Implement scene transition system.
- Preserve game state across scenes.

### Tests

Vitest:

- `SceneExit` changes target scene correctly.
- `GameState` persists inventory and flags between scene changes.

Playwright:

- Click office door.
- Street scene loads.
- Click agency sign.
- Dialogue/text appears.

### Acceptance criteria

- Player can move from office to street.
- Player can return from street to office.
- Street hotspots work.
- State persists.

---

## Sprint 5 — Inventory System

### Goal

Add a simple inventory system and item usage.

### Tasks

- Implement `InventorySystem`.
- Add inventory UI bar.
- Add item model:
  - id
  - display name
  - description
  - icon key
- Add `cold_coffee` pickup from coffee machine.
- Allow selecting an inventory item.
- Allow using selected item on hotspot.
- Implement result text for wrong item use.

### Tests

Vitest:

- Add item.
- Prevent duplicate item unless item allows duplicates.
- Select item.
- Use item on compatible hotspot.
- Wrong item returns fallback message.

Playwright:

- Pick up cold coffee.
- Inventory opens.
- Cold coffee appears.
- Using cold coffee on locked drawer gives humorous failure text.

### Acceptance criteria

- Inventory works.
- Item pickup works.
- Selected item can be used.
- Wrong use gives response.
- Tests pass.

---

## Sprint 6 — Map Navigation

### Goal

Use the illustrated map as a clickable navigation screen.

### Tasks

- Implement `MapScene`.
- Load `map.png`.
- Add clickable locations:
  - detective agency
  - cafe
  - police kiosk
  - oddities museum
  - boarding house
  - narrow alley
  - docks
- Initially unlock only:
  - detective agency
  - street/cafe exterior
- Locked locations should show humorous locked text.
- `M` opens map only when `map_unlocked` is true.

### Tests

Vitest:

- Locked location returns locked response.
- Unlocked location returns scene transition result.

Playwright:

- Start case.
- Press `M`.
- Map opens.
- Click locked location.
- Locked message appears.

### Acceptance criteria

- Map is usable.
- Locked and unlocked locations behave correctly.
- Tests pass.

---

## Sprint 7 — First Real Puzzle Chain

### Goal

Implement the first complete puzzle sequence.

### Tasks

Implement this chain:

1. Start case from phone.
2. Inspect suspicious footprints outside agency.
3. Visit cafe exterior or cafe placeholder scene.
4. Acquire cold coffee.
5. Use cold coffee on a new street hotspot:
   - "Overly Rational Pigeon"
6. Pigeon drops `invalid_alibi`.
7. Use `invalid_alibi` at police kiosk.
8. Unlock narrow alley.

### Tests

Vitest:

- Puzzle flags update in correct order.
- Cannot unlock alley before invalid alibi.
- Can unlock alley after using invalid alibi.

Playwright:

- Complete full puzzle chain from office phone to alley unlock.

### Acceptance criteria

- First puzzle chain is playable from start to completion.
- Player receives clear feedback at each step.
- Alley unlocks only after correct actions.
- Tests pass.

---

## Sprint 8 — Polish Pass

### Goal

Make the prototype feel like a real point-and-click demo.

### Tasks

- Add cursor labels on hotspot hover.
- Add subtle hotspot highlight in debug/dev mode.
- Add transition fade between scenes.
- Add nicer dialogue box styling.
- Add typewriter text effect, but make it skippable.
- Add basic sound hooks, even if sounds are placeholders.
- Add title screen:
  - The Case of the Missing Logic
  - Start Game
  - Continue if save exists
- Add save/load using localStorage.

### Tests

Vitest:

- Save serializes state.
- Load restores state.
- Corrupted save falls back safely.

Playwright:

- Start game.
- Trigger save.
- Reload page.
- Continue restores scene/state.

### Acceptance criteria

- Demo has a title screen.
- Demo can save/load.
- Dialogue and transitions feel polished.
- Tests pass.

---

## Sprint 9 — Demo Packaging

### Goal

Prepare a clean shareable web demo.

### Tasks

- Add production build.
- Add `README.md` with:
  - setup
  - commands
  - asset placement
  - controls
  - testing
  - known limitations
- Add `docs/game-design.md`.
- Add `docs/sprint-plan.md`.
- Add `docs/testing.md`.
- Verify deployment readiness for static hosting.

### Tests

- `npm run build`
- `npm run preview`
- `npm test`
- `npm run test:e2e`

### Acceptance criteria

- Project can be cloned and run from README instructions.
- Build works.
- Tests pass.
- Demo is ready for static deployment.

---

## Test-Driven Development Rules

When implementing a system that has pure logic, write tests before or alongside implementation.

Use Vitest for:

- inventory logic
- dialogue branching
- game state flags
- scene data loading
- hotspot hit detection
- puzzle state transitions
- save/load serialization

Use Playwright for:

- game boots
- canvas renders
- clicking hotspot opens dialogue
- choosing dialogue starts case
- moving between scenes
- inventory item appears
- puzzle chain works end-to-end

### Required first Vitest examples

Create `src/tests/hotspots.test.ts`.

```ts
import { describe, expect, it } from "vitest";
import { findHotspotAtPoint } from "../systems/HotspotSystem";

describe("HotspotSystem", () => {
  it("finds a hotspot when the point is inside its rectangle", () => {
    const hotspots = [
      {
        id: "phone",
        name: "Ringing phone",
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        defaultVerb: "look" as const,
        interactions: {}
      }
    ];

    const result = findHotspotAtPoint(hotspots, 50, 50);

    expect(result?.id).toBe("phone");
  });

  it("returns undefined when no hotspot contains the point", () => {
    const hotspots = [
      {
        id: "phone",
        name: "Ringing phone",
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        defaultVerb: "look" as const,
        interactions: {}
      }
    ];

    const result = findHotspotAtPoint(hotspots, 500, 500);

    expect(result).toBeUndefined();
  });
});
```

### Required first Playwright example

Create `e2e/office.spec.ts`.

```ts
import { expect, test } from "@playwright/test";

test("office scene loads and contains a game canvas", async ({ page }) => {
  await page.goto("/");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
});

test("clicking the phone hotspot opens dialogue", async ({ page }) => {
  await page.goto("/");

  // Coordinates will need adjustment after the office asset is positioned.
  await page.mouse.click(460, 460);

  await expect(page.getByTestId("dialogue-box")).toBeVisible();
});
```

If Phaser UI is rendered only inside canvas, expose a small test-only DOM overlay for dialogue state in development/test mode. That makes Playwright tests more reliable.

---

## Codex Working Rules

When working on this repository, follow these rules:

1. Prefer small, safe increments.
2. Do not rewrite unrelated systems.
3. Keep scene content data-driven.
4. Keep Phaser-specific rendering separate from pure game logic.
5. Every feature with logic needs tests.
6. Every sprint must leave the game runnable.
7. If asset dimensions are unknown, implement placeholders and document what needs adjustment.
8. Use TypeScript interfaces instead of `any`.
9. Avoid global mutable state except through `GameState`.
10. Add comments only for tricky logic, not obvious code.
11. Do not introduce a large framework such as React unless explicitly requested.
12. Keep the project browser-playable.
13. Preserve the game title: **The Case of the Missing Logic**.
14. Preserve protagonist identity: **P. Hazel**, female detective.

---

## Development Commands

Expected commands:

```bash
npm install
npm run dev
npm run build
npm test
npm run test:e2e
npm run typecheck
```

If a command fails, fix the underlying issue before moving to the next sprint.

---

## Debug Mode Requirements

Add a debug mode flag:

```ts
const DEBUG_HOTSPOTS = import.meta.env.DEV;
```

In debug mode:

- Draw hotspot rectangles.
- Show hotspot IDs.
- Show current scene ID.
- Show current flags.
- Show inventory item IDs.

In production mode:

- Hide debug overlay.
- Keep the actual interaction behavior unchanged.

---

## Accessibility and Usability

Include:

- readable dialogue text
- skip/advance dialogue with click or Space
- close menus with Escape
- visible hover labels for hotspots
- fallback text for invalid actions
- no puzzle action should fail silently

---

## Naming Conventions

Files:

```text
PascalCase.ts for classes/components
camelCase.ts for utilities
kebab-case.json for data files
```

IDs:

```text
scene ids: office, street, map
hotspot ids: phone, locked_drawer, clue_board
flag ids: case001_started, map_unlocked, alley_unlocked
item ids: cold_coffee, invalid_alibi
dialogue ids: office.phone.look, case001.phone.answer
```

---

## Initial README Content

Create or update `README.md` with this content. Adjust nested markdown fences if needed.

```md
# The Case of the Missing Logic

A code-first 2D point-and-click comedy mystery game built with Phaser, TypeScript, and Vite.

## Setup

npm install
npm run dev

## Tests

npm test
npm run test:e2e

## Asset placement

Place generated assets here:

- `public/assets/backgrounds/office.png`
- `public/assets/backgrounds/street.png`
- `public/assets/backgrounds/map.png`
- `public/assets/characters/hazel_spritesheet.png`

## Controls

- Left click: walk / interact
- Space or click: advance dialogue
- Esc: close dialogue/menu
- I: inventory
- M: map after unlocked

## Development style

This project follows short agile sprints. See `docs/sprint-plan.md`.
```

---

## First Codex Task

Start with Sprint 0 only.

Do not implement all sprints at once.

Sprint 0 request:

> Create a Phaser + TypeScript + Vite project for *The Case of the Missing Logic*. Add Vitest and Playwright. Create the planned folder structure, docs, and smoke tests. Ensure `npm run dev`, `npm run build`, `npm test`, and `npm run test:e2e` work. Use placeholder assets if real assets are not present.

After Sprint 0 passes, proceed to Sprint 1.

