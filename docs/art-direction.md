# Art Direction

## Visual Style

The Case of the Missing Logic uses cozy hand-painted 2D adventure-game art:

- warm detective-comedy lighting
- expressive inked silhouettes
- readable props and blocker shapes
- dense environmental jokes without cluttering the walkable floor
- fixed 16:9 scene composition for the `1280x720` game canvas

New backgrounds should preserve a clear lower-third walkable lane and avoid placing critical interaction details where the dialogue box covers the bottom of the screen.

## Asset Rules

- Background source generations are preserved under `source-assets/backgrounds/`.
- Runtime background copies live under `public/assets/backgrounds/` and are normalized to `1280x720`.
- Character and object source generations are preserved under `source-assets/characters/` or `source-assets/items/`.
- Runtime NPC/item cutouts live under `public/assets/characters/npcs/` and `public/assets/items/`.
- Character sprites should use transparent PNGs, bottom-aligned framing, and enough padding to avoid cropped hands, feet, feathers, or props.
- Chroma-key source sprites should use a flat removable key color that does not appear in the subject.

## Approved Generated Asset Batch

- `public/assets/backgrounds/cafe.png`: Daisy's Cafe interior.
- `public/assets/backgrounds/police-kiosk.png`: police kiosk / paperwork scene.
- `public/assets/backgrounds/alley.png`: narrow alley investigation scene.
- `public/assets/characters/npcs/cafe_owner.png`: Daisy, static cafe owner NPC.
- `public/assets/characters/npcs/overly_rational_pigeon.png`: static pigeon NPC.
- `public/assets/items/invalid_alibi.png`: inventory/puzzle item prop.

## Prompt Pattern

Use this structure for future scene assets:

```text
Create a 1280x720 2D hand-painted point-and-click adventure background for
The Case of the Missing Logic. Match the cozy detective-comedy style of the
office, street, and map assets. Keep a clear walkable lower-third lane, readable
foreground blockers, no player character, no UI overlay, no watermark, and no
critical details hidden by the bottom dialogue box.
```

Use this structure for future cutout sprites:

```text
Create one isolated 2D hand-painted character/object sprite for The Case of the
Missing Logic, matching Hazel and the existing backgrounds. Use a perfectly flat
chroma-key background that does not appear in the subject, no scenery, no shadow,
no labels, and generous padding around the full silhouette.
```
