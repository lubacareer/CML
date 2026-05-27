import { describe, expect, it } from 'vitest';
import { mapLocations } from '../data/mapLocations';
import { findMapLocationAtPoint, resolveMapLocation } from '../systems/MapNavigationSystem';

describe('MapNavigationSystem', () => {
    it('finds all official Sprint 6 map locations', () => {
        expect(mapLocations.map((location) => location.id)).toEqual([
            'detective_agency',
            'cozy_cafe',
            'police_kiosk',
            'oddities_museum',
            'boarding_house',
            'narrow_alley',
            'docks'
        ]);
    });

    it('returns a locked response for locked locations', () => {
        const policeKiosk = mapLocations.find((location) => location.id === 'police_kiosk');

        expect(policeKiosk).toBeDefined();
        expect(resolveMapLocation(policeKiosk!, {})).toEqual({
            type: 'locked',
            text: 'The police kiosk is locked behind paperwork. Terrifying paperwork.'
        });
    });

    it('returns a scene transition for an initially unlocked location', () => {
        const cafe = mapLocations.find((location) => location.id === 'cozy_cafe');

        expect(cafe).toBeDefined();
        expect(resolveMapLocation(cafe!, {})).toEqual({
            type: 'changeScene',
            sceneId: 'street'
        });
    });

    it('returns a preview route when a future location flag is unlocked', () => {
        const alley = mapLocations.find((location) => location.id === 'narrow_alley');

        expect(alley).toBeDefined();
        expect(resolveMapLocation(alley!, { alley_unlocked: true })).toEqual({
            type: 'preview',
            previewId: 'alley'
        });
    });

    it('finds map locations by rectangular bounds', () => {
        expect(findMapLocationAtPoint(mapLocations, 660, 210)?.id).toBe('cozy_cafe');
        expect(findMapLocationAtPoint(mapLocations, 1260, 25)).toBeUndefined();
    });
});
