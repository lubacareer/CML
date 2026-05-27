import { describe, expect, it } from 'vitest';
import { loadSceneData } from '../systems/SceneDataLoader';

describe('SceneDataLoader', () => {
    it('loads office scene data with five hotspots', () => {
        const office = loadSceneData('office');

        expect(office.id).toBe('office');
        expect(office.backgroundKey).toBe('office');
        expect(office.hotspots).toHaveLength(5);
    });

    it('loads street scene data with an office exit', () => {
        const street = loadSceneData('street');

        expect(street.id).toBe('street');
        expect(street.exits[0]).toMatchObject({
            id: 'agency_door',
            targetScene: 'office'
        });
    });

    it('loads the reconciled Sprint 4 street hotspots', () => {
        const street = loadSceneData('street');
        const hotspotIds = street.hotspots.map((hotspot) => hotspot.id);

        expect(hotspotIds).toEqual(expect.arrayContaining([
            'agency_sign',
            'cafe',
            'suspicious_footprints',
            'newspaper_box',
            'manhole_cover',
            'bicycle'
        ]));
    });
});
