import type { InventoryItemData } from '../game/types';

export const itemData = {
    cold_coffee: {
        id: 'cold_coffee',
        displayName: 'Cold Coffee',
        description: 'A paper cup of office coffee that has achieved room-temperature pessimism.',
        iconKey: 'cold-coffee'
    },
    invalid_alibi: {
        id: 'invalid_alibi',
        displayName: 'Invalid Alibi',
        description: 'A suspiciously formatted excuse. Technically evidence, emotionally a typo.',
        iconKey: 'invalid-alibi'
    }
} satisfies Record<string, InventoryItemData>;
