# Game Design

## Premise

The Case of the Missing Logic is a cozy comedy mystery about P. Hazel, a detective investigating an argument that vanished so thoroughly that everyone started agreeing with everyone else.

## Current Demo Flow

1. Start a new game from the title screen.
2. Answer the office phone to start `case001_missing_logic` and unlock the map.
3. Visit Daisy's Cafe, speak with Daisy, and collect Cold Coffee.
4. Inspect the suspicious footprints outside the agency.
5. Use Cold Coffee on the Overly Rational Pigeon to receive the Invalid Alibi.
6. File the Invalid Alibi at the police kiosk.
7. Use the kiosk paperwork after Daisy's testimony to unlock the narrow alley preview.

## Design Pillars

- Data-driven scenes: hotspots, exits, flags, and inventory interactions live in scene data where practical.
- Thin Phaser scenes: scenes render, route input, and delegate game rules to systems.
- Comedy feedback: invalid actions should produce visible Hazel dialogue rather than failing silently.
- Accessible dialogue: dialogue is a DOM overlay, supports click and Space advancement, and respects reduced motion.

## Playable Locations

- Detective agency office: case start, office item pickup, and office jokes.
- Street outside the agency: street clues and the Overly Rational Pigeon.
- Daisy's Cafe: Daisy testimony and the plan-aligned Cold Coffee source.
- Police kiosk: paperwork gate that unlocks the alley.
- Map: navigation hub and locked-destination feedback.
- Narrow alley: unlocked preview target for the next story increment.

## Known Story Boundaries

Oddities museum, boarding house, and docks are map placeholders. The alley is unlocked but not yet a full playable investigation scene.
