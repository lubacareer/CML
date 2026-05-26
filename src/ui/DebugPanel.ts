import type { GameStateSnapshot } from '../game/types';

export class DebugPanel {
    private readonly root: HTMLElement;

    constructor(parent: HTMLElement) {
        this.root = document.createElement('aside');
        this.root.className = 'debug-panel';
        this.root.setAttribute('data-testid', 'debug-panel');
        parent.append(this.root);
    }

    update(snapshot: GameStateSnapshot) {
        const flags = Object.entries(snapshot.flags)
            .filter(([, enabled]) => enabled)
            .map(([flag]) => flag)
            .join(', ') || 'none';
        const inventory = snapshot.inventory.join(', ') || 'empty';

        this.root.textContent = `Scene: ${snapshot.currentScene} | Flags: ${flags} | Inventory: ${inventory}`;
    }

    destroy() {
        this.root.remove();
    }
}
