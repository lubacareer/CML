import { describe, expect, it } from 'vitest';
import officeDialogueData from '../data/dialogue/office.dialogue.json';
import type { DialogueData, InteractionResult } from '../game/types';
import { DialogueSystem } from '../systems/DialogueSystem';
import { GameState } from '../systems/GameState';
import { resolveCustomInteraction } from '../systems/InteractionSystem';

const createPhoneDialogue = () => {
    const state = new GameState();
    const dialogueSystem = new DialogueSystem(officeDialogueData as DialogueData, state);

    return {
        state,
        dialogueSystem
    };
};

describe('DialogueSystem', () => {
    it('starts the first case phone dialogue by ID', () => {
        const { dialogueSystem } = createPhoneDialogue();
        const view = dialogueSystem.startDialogue('case001.phone.answer');

        expect(view).toMatchObject({
            speaker: 'Client',
            line: 'Detective Hazel? I need help.',
            lineIndex: 0,
            lineCount: 4,
            choices: []
        });
    });

    it('advances lines and exposes choices on the final phone-answer line', () => {
        const { dialogueSystem } = createPhoneDialogue();

        dialogueSystem.startDialogue('case001.phone.answer');

        expect(dialogueSystem.advance()?.line).toBe('Something terrible has happened.');
        expect(dialogueSystem.advance()?.line).toBe(
            'My argument disappeared halfway through dinner, and now my family agrees with everyone.'
        );

        const finalLine = dialogueSystem.advance();

        expect(finalLine?.line).toBe('Even the cat.');
        expect(finalLine?.choices).toEqual([
            { text: 'That does sound unnatural.', index: 0 },
            { text: 'Are you sure the cat was involved?', index: 1 }
        ]);
    });

    it('routes the cat choice through the follow-up node and then Hazel acceptance', () => {
        const { dialogueSystem } = createPhoneDialogue();

        dialogueSystem.startDialogue('case001.phone.answer');
        dialogueSystem.advance();
        dialogueSystem.advance();
        dialogueSystem.advance();

        const catNode = dialogueSystem.choose(1);

        expect(catNode).toMatchObject({
            speaker: 'Client',
            line: 'The cat had motive, opportunity, and a tiny bow tie.'
        });

        expect(dialogueSystem.advance()?.line).toBe('I know what I saw.');

        const acceptNode = dialogueSystem.advance();

        expect(acceptNode).toMatchObject({
            speaker: 'Hazel',
            line: 'Fine. I will investigate the disappearance of logic.'
        });
    });

    it('applies case-start effects only after completing the acceptance node', () => {
        const { state, dialogueSystem } = createPhoneDialogue();

        dialogueSystem.startDialogue('case001.phone.hazel_accepts');

        expect(dialogueSystem.advance()?.line).toBe(
            'But if this turns out to be a metaphor, I charge double.'
        );
        expect(state.hasFlag('case001_started')).toBe(false);
        expect(state.hasFlag('map_unlocked')).toBe(false);

        expect(dialogueSystem.advance()).toBeUndefined();
        expect(state.hasFlag('case001_started')).toBe(true);
        expect(state.hasFlag('map_unlocked')).toBe(true);
    });
});

describe('InteractionSystem', () => {
    it('resolves answer_phone to the first case phone dialogue', () => {
        const result: InteractionResult = {
            type: 'custom',
            actionId: 'answer_phone'
        };

        expect(resolveCustomInteraction(result)).toEqual({
            type: 'dialogue',
            dialogueId: 'case001.phone.answer'
        });
    });
});
