import { describe, expect, it } from 'vitest';
import { findNavigationPath, pointIsInWalkableArea } from '../systems/NavigationSystem';
import { loadSceneData } from '../systems/SceneDataLoader';

describe('NavigationSystem', () => {
    const office = loadSceneData('office');

    it('treats visible floor as walkable', () => {
        expect(pointIsInWalkableArea({ x: 300, y: 620 }, office.navigation!)).toBe(true);
    });

    it('does not treat the desk as walkable', () => {
        expect(pointIsInWalkableArea({ x: 600, y: 480 }, office.navigation!)).toBe(false);
    });

    it('does not treat the filing cabinet face as walkable', () => {
        expect(pointIsInWalkableArea({ x: 335, y: 430 }, office.navigation!)).toBe(false);
    });

    it('routes around the desk when moving toward the office door', () => {
        const path = findNavigationPath(
            { x: 300, y: 610 },
            { x: 1025, y: 475 },
            office.navigation!
        );

        expect(path).toBeDefined();
        expect(path!.length).toBeGreaterThan(1);
        expect(path![path!.length - 1]).toMatchObject({ x: 1025, y: 475 });
    });
});
