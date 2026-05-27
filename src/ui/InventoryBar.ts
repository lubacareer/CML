import type { InventoryView } from '../game/types';

export class InventoryBar {
    private readonly root: HTMLElement;
    private readonly itemsRoot: HTMLElement;
    private readonly status: HTMLElement;
    private view: InventoryView = { items: [] };

    constructor(
        parent: HTMLElement,
        private readonly onSelectItem: (itemId: string) => void
    ) {
        this.root = document.createElement('section');
        this.root.className = 'inventory-bar';
        this.root.setAttribute('data-testid', 'inventory-bar');
        this.root.setAttribute('aria-label', 'Inventory');
        this.root.hidden = true;

        this.itemsRoot = document.createElement('div');
        this.itemsRoot.className = 'inventory-bar__items';

        this.status = document.createElement('p');
        this.status.className = 'inventory-bar__status';

        this.root.append(this.itemsRoot, this.status);
        parent.append(this.root);
    }

    isOpen() {
        return !this.root.hidden;
    }

    toggle() {
        this.setOpen(!this.isOpen());
    }

    setOpen(open: boolean) {
        this.root.hidden = !open;
    }

    update(view: InventoryView) {
        this.view = view;
        this.render();
    }

    destroy() {
        this.root.remove();
    }

    private render() {
        this.itemsRoot.replaceChildren();

        if (this.view.items.length === 0) {
            this.status.textContent = 'Inventory is empty.';
            return;
        }

        this.view.items.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'inventory-bar__item';
            button.classList.toggle('inventory-bar__item--selected', item.selected);
            button.title = item.description;
            button.setAttribute('aria-label', item.displayName);
            button.setAttribute('aria-pressed', item.selected ? 'true' : 'false');
            button.setAttribute('data-testid', `inventory-item-${item.id}`);
            button.dataset.iconKey = item.iconKey;
            button.addEventListener('click', () => this.onSelectItem(item.id));

            const icon = document.createElement('span');
            icon.className = 'inventory-bar__item-icon';
            icon.textContent = this.getIconLabel(item.displayName);

            const label = document.createElement('span');
            label.className = 'inventory-bar__item-label';
            label.textContent = item.quantity > 1 ? `${item.displayName} x${item.quantity}` : item.displayName;

            button.append(icon, label);
            this.itemsRoot.append(button);
        });

        const selectedItem = this.view.items.find((item) => item.selected);
        this.status.textContent = selectedItem
            ? `Selected: ${selectedItem.displayName}`
            : 'Select an item, then use it on a hotspot.';
    }

    private getIconLabel(displayName: string) {
        return displayName
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }
}
