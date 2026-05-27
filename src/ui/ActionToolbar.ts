import type { InteractionVerb } from '../game/types';

export type ToolbarAction = 'walk' | 'look' | 'use' | 'talk' | 'exit' | 'map' | 'inventory';
export type ToolbarInteractionVerb = Extract<InteractionVerb, ToolbarAction>;

const selectableActions = new Set<ToolbarAction>(['walk', 'look', 'use', 'talk']);

const actionLabels: Record<ToolbarAction, string> = {
    walk: 'Walk',
    look: 'Look',
    use: 'Use',
    talk: 'Talk',
    exit: 'Exit',
    map: 'Map',
    inventory: 'Inventory'
};

export const isInteractionVerbAction = (action: ToolbarAction): action is ToolbarInteractionVerb => (
    action === 'look' || action === 'use' || action === 'talk'
);

export class ActionToolbar {
    private readonly root: HTMLElement;
    private readonly buttons = new Map<ToolbarAction, HTMLButtonElement>();
    private activeAction: ToolbarAction = 'look';

    constructor(
        parent: HTMLElement,
        private readonly onAction: (action: ToolbarAction) => void
    ) {
        this.root = document.createElement('nav');
        this.root.className = 'action-toolbar';
        this.root.setAttribute('data-testid', 'action-toolbar');
        this.root.setAttribute('aria-label', 'Point and click actions');

        (Object.keys(actionLabels) as ToolbarAction[]).forEach((action) => {
            const button = document.createElement('button');
            button.className = 'action-toolbar__button';
            button.type = 'button';
            button.title = actionLabels[action];
            button.setAttribute('aria-label', actionLabels[action]);
            button.setAttribute('data-testid', `action-${action}`);
            button.addEventListener('click', () => this.handleAction(action));

            const icon = document.createElement('img');
            icon.className = 'action-toolbar__icon';
            icon.src = `assets/ui/icons/${action}.png`;
            icon.alt = '';
            icon.draggable = false;
            button.append(icon);

            this.buttons.set(action, button);
            this.root.append(button);
        });

        parent.append(this.root);
        this.render();
    }

    getActiveAction() {
        return this.activeAction;
    }

    setActiveAction(action: ToolbarAction) {
        if (!selectableActions.has(action)) {
            return;
        }

        this.activeAction = action;
        this.render();
    }

    setMuted(muted: boolean) {
        this.root.classList.toggle('action-toolbar--muted', muted);
    }

    destroy() {
        this.root.remove();
    }

    private handleAction(action: ToolbarAction) {
        if (selectableActions.has(action)) {
            this.activeAction = action;
            this.render();
        }

        this.onAction(action);
    }

    private render() {
        this.buttons.forEach((button, action) => {
            const active = action === this.activeAction && selectableActions.has(action);
            button.classList.toggle('action-toolbar__button--active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }
}
