import { itemData } from '../data/items';
import type { HotspotData, InteractionResult, InventoryItemData, InventoryView } from '../game/types';
import { GameState, gameState } from './GameState';

export interface InventoryAddResult {
    added: boolean;
    item?: InventoryItemData;
}

export interface InventoryUseResult {
    item: InventoryItemData;
    matched: boolean;
    result: InteractionResult;
}

export class InventorySystem {
    constructor(
        private readonly state: GameState = gameState,
        private readonly items: Record<string, InventoryItemData> = itemData
    ) {}

    getItem(itemId: string) {
        return this.items[itemId];
    }

    addItem(itemId: string): InventoryAddResult {
        const item = this.getItem(itemId);
        const added = this.state.addItem(itemId, item?.allowDuplicates === true);

        return {
            added,
            item
        };
    }

    selectItem(itemId: string) {
        if (!this.state.selectItem(itemId)) {
            return undefined;
        }

        return this.getItem(itemId);
    }

    clearSelection() {
        this.state.clearSelectedItem();
    }

    getSelectedItem() {
        const selectedItemId = this.state.getSelectedItemId();

        return selectedItemId ? this.getItem(selectedItemId) : undefined;
    }

    getView(): InventoryView {
        const selectedItemId = this.state.getSelectedItemId();
        const counts = new Map<string, number>();

        this.state.getInventory().forEach((itemId) => {
            counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
        });

        return {
            selectedItemId,
            items: Array.from(counts.entries())
                .map(([itemId, quantity]) => {
                    const item = this.getItem(itemId);

                    if (!item) {
                        return undefined;
                    }

                    return {
                        ...item,
                        quantity,
                        selected: itemId === selectedItemId
                    };
                })
                .filter((item): item is InventoryView['items'][number] => item !== undefined)
        };
    }

    useSelectedItemOnHotspot(hotspot: HotspotData): InventoryUseResult | undefined {
        const item = this.getSelectedItem();

        if (!item) {
            return undefined;
        }

        const result = hotspot.itemInteractions?.[item.id];

        return {
            item,
            matched: result !== undefined,
            result: result ?? {
                type: 'text',
                text: `Hazel tries using ${item.displayName} on ${hotspot.name}. The clue refuses to become that kind of clue.`
            }
        };
    }
}
