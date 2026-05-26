import { describe, expect, it } from 'vitest';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

describe('game constants', () => {
    it('uses the planned fixed logical resolution', () => {
        expect(GAME_WIDTH).toBe(1280);
        expect(GAME_HEIGHT).toBe(720);
    });
});
