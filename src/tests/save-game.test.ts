import { describe, expect, it } from 'vitest';
import type { GameStateSnapshot } from '../game/types';
import { SaveGameSystem, SAVE_GAME_STORAGE_KEY, type StorageLike } from '../systems/SaveGameSystem';

class MemoryStorage implements StorageLike {
    private readonly data = new Map<string, string>();

    getItem(key: string) {
        return this.data.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.data.set(key, value);
    }

    removeItem(key: string) {
        this.data.delete(key);
    }
}

const snapshot: GameStateSnapshot = {
    currentScene: 'street',
    flags: {
        case001_started: true,
        map_unlocked: true
    },
    inventory: ['cold_coffee'],
    activeCaseId: 'case001_missing_logic',
    selectedItemId: 'cold_coffee'
};

describe('SaveGameSystem', () => {
    it('serializes and restores a game snapshot', () => {
        const storage = new MemoryStorage();
        const saveGame = new SaveGameSystem(storage);

        const record = saveGame.save(snapshot);

        expect(record).toMatchObject({
            version: 1,
            snapshot
        });
        expect(storage.getItem(SAVE_GAME_STORAGE_KEY)).toContain('"version":1');
        expect(saveGame.load()).toEqual(snapshot);
        expect(saveGame.hasSave()).toBe(true);
    });

    it('returns undefined for missing, corrupted, or version-mismatched saves', () => {
        const storage = new MemoryStorage();
        const saveGame = new SaveGameSystem(storage);

        expect(saveGame.load()).toBeUndefined();

        storage.setItem(SAVE_GAME_STORAGE_KEY, 'not json');
        expect(saveGame.load()).toBeUndefined();

        storage.setItem(SAVE_GAME_STORAGE_KEY, JSON.stringify({
            version: 2,
            savedAt: new Date().toISOString(),
            snapshot
        }));
        expect(saveGame.load()).toBeUndefined();
    });

    it('rejects non-resumable saved scenes', () => {
        const storage = new MemoryStorage();
        const saveGame = new SaveGameSystem(storage);

        storage.setItem(SAVE_GAME_STORAGE_KEY, JSON.stringify({
            version: 1,
            savedAt: new Date().toISOString(),
            snapshot: {
                ...snapshot,
                currentScene: 'asset-preview'
            }
        }));

        expect(saveGame.load()).toBeUndefined();
    });

    it('restores cafe and police kiosk scene snapshots', () => {
        const storage = new MemoryStorage();
        const saveGame = new SaveGameSystem(storage);

        const cafeSnapshot = {
            ...snapshot,
            currentScene: 'cafe'
        } as unknown as GameStateSnapshot;
        const kioskSnapshot = {
            ...snapshot,
            currentScene: 'police-kiosk'
        } as unknown as GameStateSnapshot;

        saveGame.save(cafeSnapshot);
        expect(saveGame.load()).toEqual(cafeSnapshot);

        saveGame.save(kioskSnapshot);
        expect(saveGame.load()).toEqual(kioskSnapshot);
    });
});
