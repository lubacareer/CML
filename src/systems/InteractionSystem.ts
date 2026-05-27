import type { InteractionResult } from '../game/types';

const customActionDialogue: Record<string, string> = {
    answer_phone: 'case001.phone.answer'
};

export const resolveCustomInteraction = (result: InteractionResult | undefined): InteractionResult | undefined => {
    if (result?.type !== 'custom') {
        return result;
    }

    const dialogueId = customActionDialogue[result.actionId];

    if (dialogueId) {
        return {
            type: 'dialogue',
            dialogueId
        };
    }

    return {
        type: 'text',
        text: 'That interaction needs a later sprint before it can make sense.'
    };
};
