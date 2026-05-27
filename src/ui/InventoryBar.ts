import type { InventoryView } from '../game/types';

const MIN_SLOT_COUNT = 8;
const GRID_COLUMNS = 4;

export class InventoryBar {
    private readonly root: HTMLElement;
    private readonly title: HTMLElement;
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

        this.title = document.createElement('h2');
        this.title.className = 'inventory-bar__title';
        this.title.textContent = "Hazel's Suitcase";

        this.itemsRoot = document.createElement('div');
        this.itemsRoot.className = 'inventory-bar__items';
        this.itemsRoot.setAttribute('data-testid', 'inventory-grid');

        this.status = document.createElement('p');
        this.status.className = 'inventory-bar__status';

        this.root.append(this.title, this.itemsRoot, this.status);
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

        const slotCount = Math.max(
            MIN_SLOT_COUNT,
            Math.ceil(Math.max(this.view.items.length, 1) / GRID_COLUMNS) * GRID_COLUMNS
        );

        for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
            const item = this.view.items[slotIndex];
            const slot = document.createElement(item ? 'button' : 'div');

            slot.className = 'inventory-bar__slot';
            slot.setAttribute('data-testid', `inventory-slot-${slotIndex}`);

            if (!item) {
                slot.classList.add('inventory-bar__slot--empty');
                this.itemsRoot.append(slot);
                continue;
            }

            const button = slot as HTMLButtonElement;
            button.type = 'button';
            button.classList.add('inventory-bar__item');
            button.classList.toggle('inventory-bar__slot--selected', item.selected);
            button.title = item.description;
            button.setAttribute('aria-label', item.displayName);
            button.setAttribute('aria-pressed', item.selected ? 'true' : 'false');
            button.setAttribute('data-testid', `inventory-item-${item.id}`);
            button.dataset.iconKey = item.iconKey;
            button.addEventListener('click', () => this.onSelectItem(item.id));

            const icon = document.createElement('span');
            icon.className = 'inventory-bar__item-icon';
            this.renderItemIcon(icon, item.displayName, item.iconKey);

            const label = document.createElement('span');
            label.className = 'inventory-bar__item-label';
            label.textContent = item.displayName;

            button.append(icon, label);

            if (item.quantity > 1) {
                const quantity = document.createElement('span');
                quantity.className = 'inventory-bar__quantity';
                quantity.textContent = String(item.quantity);
                button.append(quantity);
            }

            this.itemsRoot.append(button);
        }

        const selectedItem = this.view.items.find((item) => item.selected);
        this.status.textContent = selectedItem
            ? `Selected: ${selectedItem.displayName}`
            : this.view.items.length > 0
                ? 'No item selected.'
                : 'Suitcase is empty.';
    }

    private renderItemIcon(icon: HTMLElement, displayName: string, iconKey: string) {
        const image = document.createElement('img');

        image.className = 'inventory-bar__item-image';
        image.src = `assets/items/${iconKey}.png`;
        image.alt = '';
        image.draggable = false;
        image.addEventListener('error', () => {
            image.remove();
            icon.textContent = this.getIconLabel(displayName);
        }, { once: true });

        icon.append(image);
    }

    private getIconLabel(displayName: string) {
        const trimmed = (displayName || '').trim();

        if (!trimmed) {
            return '';
        }

        return trimmed
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }
}
