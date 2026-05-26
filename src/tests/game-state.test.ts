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
});
