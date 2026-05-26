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

const uiIconNames = ['walk', 'look', 'use', 'talk', 'exit', 'map', 'inventory'];

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
});
