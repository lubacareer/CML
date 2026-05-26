# Asset Notes

Initial generated assets are preserved in the root folder and copied into the runtime layout for Phaser:

- `OfficeInterior.png` -> `public/assets/backgrounds/office.png`
- `OfficeExterior.png` -> `public/assets/backgrounds/street.png`
- `GeneralMap.png` -> `public/assets/backgrounds/map.png`
- `Hazel.png` -> `public/assets/characters/hazel_spritesheet.png`
- `Hazel2.png` + `source-assets/characters/hazel-direction-raw.png` -> `public/assets/characters/hazel-4dir.png`
- `source-assets/ui/point-click-icons-raw.png` -> `public/assets/ui/icons/*.png`

The source images are larger than the fixed logical resolution of `1280x720`. Sprint 1 should scale scene backgrounds in Phaser rather than modifying these source files.

Generated source strips use a flat chroma-key background. Runtime assets are rebuilt with:

```bash
npm run build:assets
```
