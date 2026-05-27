import type { DialogueView } from '../game/types';

interface DialogueBoxCallbacks {
    onAdvance: () => void;
    onChoice: (choiceIndex: number) => void;
    onClose: () => void;
}

export class DialogueBox {
    private readonly root: HTMLElement;
    private readonly speakerElement: HTMLElement;
    private readonly lineElement: HTMLElement;
    private readonly choicesElement: HTMLElement;
    private readonly progressElement: HTMLElement;
    private view?: DialogueView;

    constructor(
        parent: HTMLElement,
        private readonly callbacks: DialogueBoxCallbacks
    ) {
        this.root = document.createElement('section');
        this.root.className = 'dialogue-box';
        this.root.setAttribute('data-testid', 'dialogue-box');
        this.root.setAttribute('aria-live', 'polite');
        this.root.hidden = true;

        this.speakerElement = document.createElement('div');
        this.speakerElement.className = 'dialogue-box__speaker';

        this.lineElement = document.createElement('p');
        this.lineElement.className = 'dialogue-box__line';

        this.choicesElement = document.createElement('div');
        this.choicesElement.className = 'dialogue-box__choices';

        this.progressElement = document.createElement('div');
        this.progressElement.className = 'dialogue-box__progress';

        this.root.append(this.speakerElement, this.lineElement, this.choicesElement, this.progressElement);
        this.root.addEventListener('click', this.handleClick);
        parent.append(this.root);
    }

    show(view: DialogueView) {
        this.view = view;
        this.root.hidden = false;
        this.render();
    }

    advance() {
        if (!this.view || this.root.hidden) {
            return;
        }

        this.callbacks.onAdvance();
    }

    close() {
        this.root.hidden = true;
        this.view = undefined;
        this.clearChoices();
        this.callbacks.onClose();
    }

    isOpen() {
        return !this.root.hidden;
    }

    destroy() {
        this.root.removeEventListener('click', this.handleClick);
        this.root.remove();
    }

    private render() {
        if (!this.view) {
            return;
        }

        this.speakerElement.textContent = this.view.speaker;
        this.lineElement.textContent = this.view.line;
        this.progressElement.textContent = `${this.view.lineIndex + 1}/${this.view.lineCount}`;
        this.renderChoices();
    }

    private renderChoices() {
        this.clearChoices();

        this.view?.choices.forEach((choice) => {
            const button = document.createElement('button');
            button.className = 'dialogue-box__choice';
            button.type = 'button';
            button.textContent = choice.text;
            button.setAttribute('data-testid', `dialogue-choice-${choice.index}`);
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                this.callbacks.onChoice(choice.index);
            });

            this.choicesElement.append(button);
        });
    }

    private clearChoices() {
        this.choicesElement.replaceChildren();
    }

    private handleClick = () => {
        this.advance();
    };
}
