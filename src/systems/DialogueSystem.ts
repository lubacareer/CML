import officeDialogueData from '../data/dialogue/office.dialogue.json';
import type { DialogueData, DialogueNode, DialogueView, InteractionEffect, InteractionResult } from '../game/types';
import { GameState, gameState } from './GameState';
import { InventorySystem } from './InventorySystem';

export interface DialogueDisplayContent {
    speaker: string;
    lines: string[];
}

export class DialogueSystem {
    private activeNodeId?: string;
    private lineIndex = 0;
    private transientContent?: DialogueDisplayContent;

    constructor(
        private readonly dialogueData: DialogueData = officeDialogueData as DialogueData,
        private readonly state: GameState = gameState,
        private readonly inventorySystem: InventorySystem = new InventorySystem(state)
    ) {}

    getNode(dialogueId: string): DialogueNode | undefined {
        return this.dialogueData[dialogueId];
    }

    startDialogue(dialogueId: string): DialogueView {
        const node = this.getNode(dialogueId);

        if (!node) {
            return this.startText('Hazel', [`The dialogue note "${dialogueId}" has gone missing.`]);
        }

        this.activeNodeId = dialogueId;
        this.lineIndex = 0;
        this.transientContent = undefined;

        return this.getActiveView();
    }

    startText(speaker: string, lines: string[]): DialogueView {
        this.activeNodeId = undefined;
        this.lineIndex = 0;
        this.transientContent = {
            speaker,
            lines: lines.length > 0 ? lines : ['...']
        };

        return this.getActiveView();
    }

    advance(): DialogueView | undefined {
        if (!this.activeNodeId && !this.transientContent) {
            return undefined;
        }

        const activeLines = this.getActiveLines();

        if (this.lineIndex < activeLines.length - 1) {
            this.lineIndex += 1;
            return this.getActiveView();
        }

        if (this.activeNodeId) {
            const node = this.getActiveNode();

            if (node.choices?.length) {
                return this.getActiveView();
            }

            this.applyEffects(node);

            if (node.next) {
                return this.startDialogue(node.next);
            }
        }

        this.clear();
        return undefined;
    }

    choose(choiceIndex: number): DialogueView | undefined {
        if (!this.activeNodeId) {
            return this.getActiveViewOrUndefined();
        }

        const node = this.getActiveNode();
        const choices = node.choices ?? [];
        const choice = choices[choiceIndex];

        if (!choice || this.lineIndex !== node.lines.length - 1) {
            return this.getActiveView();
        }

        this.applyEffects(node);
        return this.startDialogue(choice.next);
    }

    cancel() {
        this.clear();
    }

    resolveInteractionResult(
        result: InteractionResult | undefined,
        subjectName: string
    ): DialogueView {
        if (!result) {
            return this.startText('Hazel', [`I do not have a useful thought about ${subjectName} yet.`]);
        }

        if (result.type === 'dialogue') {
            return this.startDialogue(result.dialogueId);
        }

        if (result.type === 'text') {
            return this.startText('Hazel', [result.text]);
        }

        if (result.type === 'addItem') {
            const addResult = this.inventorySystem.addItem(result.itemId);
            const itemName = addResult.item?.displayName ?? result.itemId;
            const fallbackText = addResult.added
                ? `You acquired ${itemName}.`
                : `${itemName} is already in the inventory. Two would be a cry for help.`;

            return this.startText('Hazel', [result.text ?? fallbackText]);
        }

        if (result.type === 'setFlag') {
            this.state.setFlag(result.flag);
            return this.startText('Hazel', [result.text ?? 'That changes things. Probably.']);
        }

        if (result.type === 'effects') {
            this.applyInteractionEffects(result.effects);
            return this.startText('Hazel', [result.text]);
        }

        return this.startText('Hazel', ['That interaction needs a later sprint before it can make sense.']);
    }

    private getActiveViewOrUndefined(): DialogueView | undefined {
        return this.activeNodeId || this.transientContent ? this.getActiveView() : undefined;
    }

    private getActiveView(): DialogueView {
        const speaker = this.getActiveSpeaker();
        const lines = this.getActiveLines();
        const choices = this.getVisibleChoices();

        return {
            speaker,
            line: lines[this.lineIndex] ?? '',
            lineIndex: this.lineIndex,
            lineCount: lines.length,
            choices
        };
    }

    private getActiveSpeaker() {
        if (this.activeNodeId) {
            return this.getActiveNode().speaker;
        }

        return this.transientContent?.speaker ?? 'Hazel';
    }

    private getActiveLines() {
        if (this.activeNodeId) {
            const lines = this.getActiveNode().lines;
            return lines.length > 0 ? lines : ['...'];
        }

        return this.transientContent?.lines ?? ['...'];
    }

    private getVisibleChoices() {
        if (!this.activeNodeId) {
            return [];
        }

        const node = this.getActiveNode();

        if (!node.choices?.length || this.lineIndex !== node.lines.length - 1) {
            return [];
        }

        return node.choices.map((choice, index) => ({
            text: choice.text,
            index
        }));
    }

    private getActiveNode() {
        const node = this.activeNodeId ? this.getNode(this.activeNodeId) : undefined;

        if (!node) {
            throw new Error('No active dialogue node is available.');
        }

        return node;
    }

    private applyEffects(node: DialogueNode) {
        node.effects?.forEach((effect) => {
            if (effect.type === 'setFlag') {
                this.state.setFlag(effect.flag);
            }
        });
    }

    private applyInteractionEffects(effects: InteractionEffect[]) {
        effects.forEach((effect) => {
            if (effect.type === 'setFlag') {
                this.state.setFlag(effect.flag);
                return;
            }

            this.inventorySystem.addItem(effect.itemId);
        });
    }

    private clear() {
        this.activeNodeId = undefined;
        this.lineIndex = 0;
        this.transientContent = undefined;
    }
}
