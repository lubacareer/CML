# Testing

## Local Commands

```bash
npm run typecheck
npm run build
npm test
npm run test:e2e
```

Use `npm run preview` after `npm run build` to inspect the production bundle locally.

## Unit Coverage

Vitest covers:

- scene data loading
- hotspot and exit hit detection
- dialogue branching and effects
- game state reset/restore
- inventory selection and item use
- map navigation and locked-location behavior
- save/load validation
- puzzle-chain state gates
- asset dimensions and transparency expectations

## Browser Coverage

Playwright covers:

- title screen start and continue
- phone call case start and map unlock
- office movement and navigation blockers
- street transition and preserved flags
- inventory opening, item selection, and item use
- cafe testimony and cafe Cold Coffee pickup
- pigeon exchange for Invalid Alibi
- police kiosk filing and paperwork alley unlock
- map locked/unlocked routes
- fullscreen control and smoke boot

## Static Demo Check

1. Run `npm run build`.
2. Run `npm run preview`.
3. Open `http://localhost:4173/`.
4. Confirm the title screen, Start Game, and first office view render without a framework error overlay.

The automated Playwright suite starts its own dev server, so it does not require a manually running preview server.
