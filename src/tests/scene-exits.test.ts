import { describe, expect, it } from 'vitest';
import { findExitAtPoint } from '../systems/SceneExitSystem';
import { loadSceneData } from '../systems/SceneDataLoader';

describe('SceneExitSystem', () => {
    const office = loadSceneData('office');

    it('finds the office door exit', () => {
        const exit = findExitAtPoint(office.exits, 1050, 430);

        expect(exit?.targetScene).toBe('street');
    });

    it('returns undefined away from exits', () => {
        const exit = findExitAtPoint(office.exits, 300, 650);

        expect(exit).toBeUndefined();
    });
});
