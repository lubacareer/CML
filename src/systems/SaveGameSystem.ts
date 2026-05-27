import type { GameStateSnapshot, SceneId } from '../game/types';

export const SAVE_GAME_STORAGE_KEY = 'cml.save.v1';
const SAVE_GAME_VERSION = 1;
const resumableScenes = new Set<SceneId>(['office', 'street', 'map']);

export interface SaveGameRecord {
    version: 1;
    savedAt: string;
    snapshot: GameStateSnapshot;
}

export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem?(key: string): void;
}

const getDefaultStorage = (): StorageLike | undefined => {
    try {
        return globalThis.localStorage;
    } catch {
        return undefined;
    }
};

const isRecordOfBooleans = (value: unknown): value is Record<string, boolean> => (
    typeof value === 'object'
    && value !== null
    && Object.values(value).every((entry) => typeof entry === 'boolean')
);

const isStringArray = (value: unknown): value is string[] => (
    Array.isArray(value) && value.every((entry) => typeof entry === 'string')
);

export const isValidGameStateSnapshot = (value: unknown): value is GameStateSnapshot => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const snapshot = value as Partial<GameStateSnapshot>;

    return typeof snapshot.currentScene === 'string'
        && resumableScenes.has(snapshot.currentScene as SceneId)
        && isRecordOfBooleans(snapshot.flags)
        && isStringArray(snapshot.inventory)
        && typeof snapshot.activeCaseId === 'string'
        && (
            snapshot.selectedItemId === undefined
            || typeof snapshot.selectedItemId === 'string'
        );
};

const isValidSaveGameRecord = (value: unknown): value is SaveGameRecord => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const record = value as Partial<SaveGameRecord>;

    return record.version === SAVE_GAME_VERSION
        && typeof record.savedAt === 'string'
        && isValidGameStateSnapshot(record.snapshot);
};

export class SaveGameSystem {
    constructor(private readonly storage: StorageLike | undefined = getDefaultStorage()) {}

    save(snapshot: GameStateSnapshot): SaveGameRecord | undefined {
        if (!this.storage) {
            return undefined;
        }

        const record: SaveGameRecord = {
            version: SAVE_GAME_VERSION,
            savedAt: new Date().toISOString(),
            snapshot
        };

        try {
            this.storage.setItem(SAVE_GAME_STORAGE_KEY, JSON.stringify(record));
            return record;
        } catch {
            return undefined;
        }
    }

    load(): GameStateSnapshot | undefined {
        if (!this.storage) {
            return undefined;
        }

        try {
            const raw = this.storage.getItem(SAVE_GAME_STORAGE_KEY);

            if (!raw) {
                return undefined;
            }

            const parsed = JSON.parse(raw) as unknown;

            return isValidSaveGameRecord(parsed) ? parsed.snapshot : undefined;
        } catch {
            return undefined;
        }
    }

    hasSave() {
        return this.load() !== undefined;
    }

    clear() {
        try {
            this.storage?.removeItem?.(SAVE_GAME_STORAGE_KEY);
        } catch {
            // Ignore storage failures; saves should never break the game flow.
        }
    }
}
