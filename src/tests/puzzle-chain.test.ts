import { describe, expect, it } from 'vitest';
import { mapLocations } from '../data/mapLocations';
import type { InteractionResult } from '../game/types';
import { DialogueSystem } from '../systems/DialogueSystem';
import { GameState } from '../systems/GameState';
import { getVisibleHotspots } from '../systems/HotspotSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { resolveMapLocation } from '../systems/MapNavigationSystem';
import { loadSceneData } from '../systems/SceneDataLoader';

const applyInteraction = (
    state: GameState,
    result: InteractionResult | undefined,
    subjectName = 'test hotspot'
) => {
    const dialogueSystem = new DialogueSystem(undefined, state);
    return dialogueSystem.resolveInteractionResult(result, subjectName);
};

const getStreetHotspot = (id: string) => {
    const hotspot = loadSceneData('street').hotspots.find((candidate) => candidate.id === id);

    if (!hotspot) {
        throw new Error(`Missing street hotspot: ${id}`);
    }

    return hotspot;
};

describe('Sprint 9A puzzle chain', () => {
    it('updates investigation flags and awards the invalid alibi in order', () => {
        const state = new GameState({
            flags: {
                case001_started: true,
                map_unlocked: true
            }
        });
        const inventory = new InventorySystem(state);

        const footprints = getStreetHotspot('suspicious_footprints');
        applyInteraction(state, footprints.interactions.look, footprints.name);
        expect(state.hasFlag('footprints_inspected')).toBe(true);

        const cafe = getStreetHotspot('cafe');
        applyInteraction(state, cafe.interactions.look, cafe.name);
        expect(state.hasFlag('cafe_visited')).toBe(true);

        inventory.addItem('cold_coffee');
        inventory.selectItem('cold_coffee');

        const pigeon = getStreetHotspot('overly_rational_pigeon');
        expect(getVisibleHotspots([pigeon], state.getFlags())).toHaveLength(1);

        const itemUse = inventory.useSelectedItemOnHotspot(pigeon);
        applyInteraction(state, itemUse?.result, pigeon.name);

        expect(state.hasFlag('invalid_alibi_found')).toBe(true);
        expect(state.hasItem('invalid_alibi')).toBe(true);
    });

    it('does not unlock the alley before the invalid alibi is selected for the police kiosk', () => {
        const state = new GameState({
            flags: {
                case001_started: true,
                map_unlocked: true
            }
        });
        const inventory = new InventorySystem(state);
        const policeKiosk = mapLocations.find((location) => location.id === 'police_kiosk');
        const alley = mapLocations.find((location) => location.id === 'narrow_alley');

        expect(policeKiosk).toBeDefined();
        expect(alley).toBeDefined();
        expect(inventory.selectItem('invalid_alibi')).toBeUndefined();
        expect(resolveMapLocation(policeKiosk!, state.getFlags(), state.getSelectedItemId())).toMatchObject({
            type: 'locked'
        });
        expect(resolveMapLocation(alley!, state.getFlags())).toMatchObject({
            type: 'locked'
        });
    });

    it('opens the police kiosk without unlocking the alley after filing the invalid alibi', () => {
        const state = new GameState({
            flags: {
                case001_started: true,
                map_unlocked: true,
                invalid_alibi_found: true
            },
            inventory: ['invalid_alibi']
        });
        const inventory = new InventorySystem(state);
        const policeKiosk = mapLocations.find((location) => location.id === 'police_kiosk');
        const alley = mapLocations.find((location) => location.id === 'narrow_alley');

        expect(policeKiosk).toBeDefined();
        expect(alley).toBeDefined();
        inventory.selectItem('invalid_alibi');

        const result = resolveMapLocation(policeKiosk!, state.getFlags(), state.getSelectedItemId());

        expect(result.type).toBe('interaction');
        applyInteraction(state, result.type === 'interaction' ? result.result : undefined, policeKiosk!.name);

        expect(state.hasFlag('police_kiosk_unlocked')).toBe(true);
        expect(state.hasFlag('invalid_alibi_delivered')).toBe(true);
        expect(state.hasFlag('alley_unlocked')).toBe(false);
    });

    it('unlocks the alley from kiosk paperwork after Daisy testimony and invalid alibi delivery', () => {
        const state = new GameState({
            flags: {
                case001_started: true,
                map_unlocked: true,
                invalid_alibi_found: true,
                police_kiosk_unlocked: true,
                invalid_alibi_delivered: true,
                daisy_testimony_recorded: true
            },
            inventory: ['invalid_alibi']
        });
        const paperwork = loadSceneData('police-kiosk').hotspots.find(
            (hotspot) => hotspot.id === 'kiosk_paperwork'
        );
        const alley = mapLocations.find((location) => location.id === 'narrow_alley');

        expect(paperwork).toBeDefined();
        expect(alley).toBeDefined();

        applyInteraction(state, paperwork!.interactions.use, paperwork!.name);

        expect(state.hasFlag('alley_unlocked')).toBe(true);
        expect(resolveMapLocation(alley!, state.getFlags())).toEqual({
            type: 'preview',
            previewId: 'alley'
        });
    });

    it('shows missing testimony paperwork before Daisy gives her statement', () => {
        const state = new GameState({
            flags: {
                police_kiosk_unlocked: true,
                invalid_alibi_delivered: true
            }
        });
        const visibleIds = getVisibleHotspots(loadSceneData('police-kiosk').hotspots, state.getFlags())
            .map((hotspot) => hotspot.id);

        expect(visibleIds).toContain('kiosk_paperwork_missing_testimony');
        expect(visibleIds).not.toContain('kiosk_paperwork');
    });
});
