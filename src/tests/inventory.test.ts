import { describe, expect, it } from 'vitest';
import type { HotspotData, InventoryItemData } from '../game/types';
import { GameState } from '../systems/GameState';
import { InventorySystem } from '../systems/InventorySystem';

const items: Record<string, InventoryItemData> = {
    cold_coffee: {
        id: 'cold_coffee',
        displayName: 'Cold Coffee',
        description: 'Cold enough to count as evidence.',
        iconKey: 'cold-coffee'
    },
    receipt: {
        id: 'receipt',
        displayName: 'Receipt',
        description: 'There can always be another receipt.',
        iconKey: 'receipt',
        allowDuplicates: true
    }
};

const createLockedDrawer = (): HotspotData => ({
    id: 'locked_drawer',
    name: 'Locked drawer',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    defaultVerb: 'look',
    interactions: {},
    itemInteractions: {
        cold_coffee: {
            type: 'text',
            text: 'The drawer remains locked, but now it is disappointed and damp.'
        }
    }
});

describe('InventorySystem', () => {
    it('adds an item and prevents duplicates by default', () => {
        const state = new GameState();
        const inventory = new InventorySystem(state, items);

        expect(inventory.addItem('cold_coffee')).toMatchObject({ added: true });
        expect(inventory.addItem('cold_coffee')).toMatchObject({ added: false });
        expect(state.getSnapshot().inventory).toEqual(['cold_coffee']);
    });

    it('allows duplicate items when item data opts in', () => {
        const state = new GameState();
        const inventory = new InventorySystem(state, items);

        inventory.addItem('receipt');
        inventory.addItem('receipt');

        expect(state.getSnapshot().inventory).toEqual(['receipt', 'receipt']);
        expect(inventory.getView().items[0]).toMatchObject({
            id: 'receipt',
            quantity: 2
        });
    });

    it('selects an item that exists in inventory', () => {
        const state = new GameState();
        const inventory = new InventorySystem(state, items);

        expect(inventory.selectItem('cold_coffee')).toBeUndefined();

        inventory.addItem('cold_coffee');

        expect(inventory.selectItem('cold_coffee')).toMatchObject({
            id: 'cold_coffee',
            displayName: 'Cold Coffee'
        });
        expect(state.getSnapshot().selectedItemId).toBe('cold_coffee');
        expect(inventory.getView().items[0].selected).toBe(true);
    });

    it('uses the selected item on a compatible hotspot', () => {
        const state = new GameState();
        const inventory = new InventorySystem(state, items);

        inventory.addItem('cold_coffee');
        inventory.selectItem('cold_coffee');

        expect(inventory.useSelectedItemOnHotspot(createLockedDrawer())).toMatchObject({
            matched: true,
            result: {
                type: 'text',
                text: 'The drawer remains locked, but now it is disappointed and damp.'
            }
        });
    });

    it('returns fallback text when the selected item is wrong for a hotspot', () => {
        const state = new GameState();
        const inventory = new InventorySystem(state, items);
        const phone: HotspotData = {
            id: 'phone',
            name: 'Ringing phone',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            defaultVerb: 'look',
            interactions: {}
        };

        inventory.addItem('cold_coffee');
        inventory.selectItem('cold_coffee');

        expect(inventory.useSelectedItemOnHotspot(phone)).toMatchObject({
            matched: false,
            result: {
                type: 'text',
                text: 'Hazel tries using Cold Coffee on Ringing phone. The clue refuses to become that kind of clue.'
            }
        });
    });
});
