import { describe, expect, it } from 'vitest';
import { GameState } from '../systems/GameState';

describe('GameState', () => {
    it('sets flags and exposes an immutable snapshot copy', () => {
        const state = new GameState();

        state.setFlag('case001_started');
        const snapshot = state.getSnapshot();
        snapshot.flags.case001_started = false;

        expect(state.hasFlag('case001_started')).toBe(true);
        expect(state.getSnapshot().flags.case001_started).toBe(true);
    });

    it('preserves case flags and inventory across scene changes', () => {
        const state = new GameState();

        state.setFlag('case001_started');
        state.setFlag('map_unlocked');
        state.addItem('cold_coffee');
        state.selectItem('cold_coffee');
        state.setCurrentScene('street');
        state.setCurrentScene('office');

        expect(state.getSnapshot()).toMatchObject({
            currentScene: 'office',
            flags: {
                case001_started: true,
                map_unlocked: true
            },
            inventory: ['cold_coffee'],
            selectedItemId: 'cold_coffee'
        });
    });
});
