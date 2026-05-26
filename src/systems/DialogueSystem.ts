import officeDialogueData from '../data/dialogue/office.dialogue.json';
import type { DialogueData, DialogueNode, InteractionResult } from '../game/types';

export interface DialogueDisplayContent {
    speaker: string;
    lines: string[];
}

export class DialogueSystem {
    constructor(private readonly dialogueData: DialogueData = officeDialogueData as DialogueData) {}

    getNode(dialogueId: string): DialogueNode | undefined {
        return this.dialogueData[dialogueId];
    }

    resolveInteractionResult(
        result: InteractionResult | undefined,
        subjectName: string
    ): DialogueDisplayContent {
        if (!result) {
            return {
                speaker: 'Hazel',
                lines: [`I do not have a useful thought about ${subjectName} yet.`]
            };
        }

        if (result.type === 'dialogue') {
            const node = this.getNode(result.dialogueId);

            return node
                ? { speaker: node.speaker, lines: node.lines }
                : {
                    speaker: 'Hazel',
                    lines: [`The note for ${subjectName} has gone missing.`]
                };
        }

        if (result.type === 'text') {
            return {
                speaker: 'Hazel',
                lines: [result.text]
            };
        }

        if (result.type === 'setFlag') {
            return {
                speaker: 'Hazel',
                lines: [result.text ?? 'That changes things. Probably.']
            };
        }

        return {
            speaker: 'Hazel',
            lines: ['That interaction needs a later sprint before it can make sense.']
        };
    }
}
