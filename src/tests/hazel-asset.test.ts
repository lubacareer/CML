import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import {
    HAZEL_FRAME_COUNT,
    HAZEL_FRAME_HEIGHT,
    HAZEL_FRAME_WIDTH,
    HAZEL_SHEET_COLUMNS,
    HAZEL_SHEET_ROWS
} from '../game/hazelAnimationConfig';

const uiIconNames = ['walk', 'look', 'use', 'talk', 'exit', 'map', 'save', 'inventory', 'fullscreen'];
const newBackgroundAssetNames = ['cafe', 'police-kiosk', 'alley'];
const transparentRuntimeAssets = [
    'public/assets/characters/npcs/cafe_owner.png',
    'public/assets/characters/npcs/overly_rational_pigeon.png',
    'public/assets/items/cold-coffee.png',
    'public/assets/items/invalid_alibi.png'
];

describe('Generated runtime assets', () => {
    it('builds Hazel 4-direction sheet with the expected frame dimensions and count', () => {
        const assetPath = path.resolve('public/assets/characters/hazel-4dir.png');
        const image = PNG.sync.read(fs.readFileSync(assetPath));

        expect(image.width).toBe(HAZEL_FRAME_WIDTH * HAZEL_SHEET_COLUMNS);
        expect(image.height).toBe(HAZEL_FRAME_HEIGHT * HAZEL_SHEET_ROWS);
        expect(HAZEL_SHEET_COLUMNS * HAZEL_SHEET_ROWS).toBe(HAZEL_FRAME_COUNT);
    });

    it('builds all point-and-click UI icons with alpha channels', () => {
        uiIconNames.forEach((iconName) => {
            const assetPath = path.resolve(`public/assets/ui/icons/${iconName}.png`);
            const image = PNG.sync.read(fs.readFileSync(assetPath));
            const transparentPixels = image.data.filter((_, index) => index % 4 === 3 && image.data[index] === 0);

            expect(image.width).toBe(64);
            expect(image.height).toBe(64);
            expect(transparentPixels.length).toBeGreaterThan(0);
        });
    });

    it('includes the Sprint 3 background assets at the fixed game resolution', () => {
        newBackgroundAssetNames.forEach((assetName) => {
            const assetPath = path.resolve(`public/assets/backgrounds/${assetName}.png`);
            const image = PNG.sync.read(fs.readFileSync(assetPath));

            expect(image.width).toBe(1280);
            expect(image.height).toBe(720);
        });
    });

    it('includes transparent NPC and item cutouts', () => {
        transparentRuntimeAssets.forEach((assetPath) => {
            const image = PNG.sync.read(fs.readFileSync(path.resolve(assetPath)));
            const transparentPixels = image.data.filter((_, index) => index % 4 === 3 && image.data[index] === 0);

            expect(transparentPixels.length).toBeGreaterThan(0);
        });
    });
});
