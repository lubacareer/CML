import type { GameStateSnapshot, SceneId } from '../game/types';

const DEFAULT_ACTIVE_CASE_ID = 'case001_missing_logic';

const createDefaultSnapshot = (): GameStateSnapshot => ({
    currentScene: 'office',
    flags: {},
    inventory: [],
    activeCaseId: DEFAULT_ACTIVE_CASE_ID
});

export class GameState {
    private currentScene: SceneId;
    private flags: Record<string, boolean>;
    private inventory: string[];
    private activeCaseId: string;
    private selectedItemId?: string;

    constructor(snapshot?: Partial<GameStateSnapshot>) {
        const defaults = createDefaultSnapshot();

        this.currentScene = snapshot?.currentScene ?? defaults.currentScene;
        this.flags = { ...(snapshot?.flags ?? defaults.flags) };
        this.inventory = [...(snapshot?.inventory ?? defaults.inventory)];
        this.activeCaseId = snapshot?.activeCaseId ?? defaults.activeCaseId;
        this.selectedItemId = snapshot?.selectedItemId;
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

    addItem(itemId: string, allowDuplicates = false) {
        if (allowDuplicates || !this.inventory.includes(itemId)) {
            this.inventory.push(itemId);
            return true;
        }

        return false;
    }

    hasItem(itemId: string) {
        return this.inventory.includes(itemId);
    }

    getInventory() {
        return [...this.inventory];
    }

    selectItem(itemId: string) {
        if (!this.hasItem(itemId)) {
            return false;
        }

        this.selectedItemId = itemId;
        return true;
    }

    clearSelectedItem() {
        this.selectedItemId = undefined;
    }

    getSelectedItemId() {
        return this.selectedItemId;
    }

    getFlags() {
        return { ...this.flags };
    }

    reset() {
        this.restore(createDefaultSnapshot());
    }

    restore(snapshot: GameStateSnapshot) {
        this.currentScene = snapshot.currentScene;
        this.flags = { ...snapshot.flags };
        this.inventory = [...snapshot.inventory];
        this.activeCaseId = snapshot.activeCaseId;
        this.selectedItemId = snapshot.selectedItemId;
    }

    getSnapshot(): GameStateSnapshot {
        return {
            currentScene: this.currentScene,
            flags: this.getFlags(),
            inventory: [...this.inventory],
            activeCaseId: this.activeCaseId,
            selectedItemId: this.selectedItemId
        };
    }
}

export const gameState = new GameState();
