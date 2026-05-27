# Sprint Plan

## Completed Sprints

- Sprint 0: Phaser, TypeScript, Vite, Vitest, Playwright, and asset layout.
- Sprint 1: Office vertical slice with data-driven hotspots and dialogue.
- Sprint 2: Hazel sprite animation, four-direction movement, navigation blockers, street/map preview routing.
- Sprint 3: Branching phone dialogue, `answer_phone`, `case001_started`, and `map_unlocked`.
- Sprint 4: Street scene reconciliation, street hotspots, and transition/state coverage.
- Sprint 5: Inventory metadata, suitcase inventory UI, pickup, selection, and item-on-hotspot use.
- Sprint 6: Clickable map navigation, locked destinations, and preview routes.
- Sprint 7: First puzzle chain through footprints, pigeon, Invalid Alibi, police kiosk filing, and alley unlock.
- Sprint 8: Title screen, explicit save/continue, typewriter dialogue, fades, fullscreen, and UI polish.
- Sprint 9A: Playable Daisy's Cafe and police kiosk scenes before packaging.
- Sprint 9: Shareable demo packaging, static preview command, and documentation.

## Current Demo Acceptance

- The game starts from the title screen and can continue from a valid local save.
- The case can be completed from phone call to alley preview unlock.
- Office, street, cafe, police kiosk, map, and alley preview are reachable through normal play.
- `npm run build`, `npm run preview`, `npm test`, and `npm run test:e2e` are the packaging validation commands.

## Next Candidate Sprint

Turn the unlocked narrow alley preview into a real playable investigation scene with new hotspots, a clue pickup, and the next case gate.
