import { describe, expect, it } from 'vitest';
import { findHotspotAtPoint } from '../systems/HotspotSystem';
import { loadSceneData } from '../systems/SceneDataLoader';

describe('HotspotSystem', () => {
    const office = loadSceneData('office');

    it('finds the phone when the point is inside its rectangle', () => {
        const result = findHotspotAtPoint(office.hotspots, 430, 410);

        expect(result?.id).toBe('phone');
    });

    it('finds the package on the desktop without covering the drawer', () => {
        const result = findHotspotAtPoint(office.hotspots, 760, 420);

        expect(result?.id).toBe('strange_package');
    });

    it('finds the locked drawer above the chair', () => {
        const result = findHotspotAtPoint(office.hotspots, 790, 530);

        expect(result?.id).toBe('locked_drawer');
    });

    it('does not treat the chair area as the locked drawer', () => {
        const result = findHotspotAtPoint(office.hotspots, 790, 620);

        expect(result).toBeUndefined();
    });

    it('returns undefined when no hotspot contains the point', () => {
        const result = findHotspotAtPoint(office.hotspots, 50, 650);

        expect(result).toBeUndefined();
    });
});
