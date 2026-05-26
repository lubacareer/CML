import type { GameStateSnapshot, SceneId } from '../game/types';

const DEFAULT_ACTIVE_CASE_ID = 'case001_missing_logic';

export class GameState {
    private currentScene: SceneId;
    private flags: Record<string, boolean>;
    private inventory: string[];
    private activeCaseId: string;

    constructor(snapshot?: Partial<GameStateSnapshot>) {
        this.currentScene = snapshot?.currentScene ?? 'office';
        this.flags = { ...(snapshot?.flags ?? {}) };
        this.inventory = [...(snapshot?.inventory ?? [])];
        this.activeCaseId = snapshot?.activeCaseId ?? DEFAULT_ACTIVE_CASE_ID;
    }

    setCurrentScene(sceneId: SceneId) {
        this.currentScene = sceneId;
    }

    setFlag(flag: string, value = true) {
        this.flags[flag] = value;
    }

    hasFlag(flag: string) {
        return this.flags[flag] === true;
    }

    addItem(itemId: string) {
        if (!this.inventory.includes(itemId)) {
            this.inventory.push(itemId);
        }
    }

    getFlags() {
        return { ...this.flags };
    }

    getSnapshot(): GameStateSnapshot {
        return {
            currentScene: this.currentScene,
            flags: this.getFlags(),
            inventory: [...this.inventory],
            activeCaseId: this.activeCaseId
        };
    }
}

export const gameState = new GameState();
