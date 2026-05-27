# Asset Notes

Initial generated assets are preserved in the root folder and copied into the runtime layout for Phaser:

- `OfficeInterior.png` -> `public/assets/backgrounds/office.png`
- `OfficeExterior.png` -> `public/assets/backgrounds/street.png`
- `GeneralMap.png` -> `public/assets/backgrounds/map.png`
- `Hazel.png` -> `public/assets/characters/hazel_spritesheet.png`
- `Hazel2.png` + `source-assets/characters/hazel-direction-raw.png` -> `public/assets/characters/hazel-4dir.png`
- `source-assets/ui/point-click-icons-raw.png` -> `public/assets/ui/icons/walk.png`, `look.png`, `use.png`, `talk.png`, `exit.png`, `map.png`, and `inventory.png`
- `public/assets/ui/icons/fullscreen.png` and `public/assets/ui/icons/save.png` are compact runtime UI icons for later toolbar controls.
- `source-assets/backgrounds/cafe-interior.png` -> `public/assets/backgrounds/cafe.png`
- `source-assets/backgrounds/police-kiosk.png` -> `public/assets/backgrounds/police-kiosk.png`
- `source-assets/backgrounds/narrow-alley.png` -> `public/assets/backgrounds/alley.png`
- `source-assets/characters/cafe_owner-raw.png` -> `public/assets/characters/npcs/cafe_owner.png`
- `source-assets/characters/overly_rational_pigeon-raw.png` -> `public/assets/characters/npcs/overly_rational_pigeon.png`
- `source-assets/items/cold_coffee-raw.png` -> `public/assets/items/cold-coffee.png`
- `source-assets/items/invalid_alibi-raw.png` -> `public/assets/items/invalid_alibi.png`

The source images are larger than the fixed logical resolution of `1280x720`. Sprint 1 should scale scene backgrounds in Phaser rather than modifying these source files.

Generated source strips use a flat chroma-key background. Runtime assets are rebuilt with:

```bash
npm run build:assets
```

See `docs/art-direction.md` for prompt style, runtime sizing, and the approved asset list.
